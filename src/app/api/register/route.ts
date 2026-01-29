import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { generatePassword } from '@/lib/utils/password';
import { validateIIN, validateEmail } from '@/lib/utils/validation';
import type { RegistrationData } from '@/types';

/**
 * Google Form Registration API Endpoint
 * This endpoint should be called by a Google Apps Script webhook
 * when a new teacher registration form is submitted
 */
export async function POST(request: Request) {
    try {
        const formData: RegistrationData = await request.json();

        // Validate required fields
        if (!formData.iin || !formData.email || !formData.firstName || !formData.lastName) {
            return NextResponse.json(
                { error: 'Missing required fields: iin, email, firstName, lastName' },
                { status: 400 }
            );
        }

        // Validate IIN format
        if (!validateIIN(formData.iin)) {
            return NextResponse.json(
                { error: 'Invalid IIN format. Must be 12 digits.' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(formData.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Use service role client to bypass RLS
        const supabase = createServiceRoleClient();

        // Check if teacher already exists
        const { data: existingTeacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('iin', formData.iin)
            .single();

        if (existingTeacher) {
            return NextResponse.json(
                { error: 'Teacher with this IIN already exists' },
                { status: 409 }
            );
        }

        // Generate temporary password
        const temporaryPassword = generatePassword(12);

        // 1. Create teacher record in database
        const { data: teacher, error: dbError } = await supabase
            .from('teachers')
            .insert({
                iin: formData.iin,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                date_of_birth: formData.dateOfBirth,
                graduated_school: formData.graduatedSchool,
                total_experience_years: formData.totalExperience,
                current_workplace: formData.currentWorkplace,
                current_school_experience: formData.currentSchoolExperience,
                subject: formData.subject,
                category: formData.category,
                category_expiration: formData.categoryExpiration,
                is_homeroom_teacher: formData.isHomeroomTeacher || false,
                advanced_degree: formData.advancedDegree,
                role: 'teacher',
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to create teacher record', details: dbError.message },
                { status: 500 }
            );
        }

        // 2. Create Supabase Auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: {
                iin: formData.iin,
                role: 'teacher',
                first_name: formData.firstName,
                last_name: formData.lastName,
            },
        });

        if (authError) {
            console.error('Auth error:', authError);
            // Rollback: delete teacher record if auth creation fails
            await supabase.from('teachers').delete().eq('id', teacher.id);
            return NextResponse.json(
                { error: 'Failed to create authentication account', details: authError.message },
                { status: 500 }
            );
        }

        // 3. Create certifications record
        if (formData.tat2026 || formData.tat2025 || formData.tat2024 ||
            formData.ieltsScore || formData.toeflScore || formData.tesol ||
            formData.celta || formData.ibCertificate || formData.apCertificate) {
            await supabase.from('certifications').insert({
                teacher_id: teacher.id,
                tat_2026: formData.tat2026,
                tat_2025: formData.tat2025,
                tat_2024: formData.tat2024,
                tor_score: formData.torScore,
                ielts_score: formData.ieltsScore,
                toefl_score: formData.toeflScore,
                tesol: formData.tesol || false,
                celta: formData.celta || false,
                ib_certificate: formData.ibCertificate || false,
                ap_certificate: formData.apCertificate || false,
            });
        }

        // 4. Create student results if provided
        const resultTypes = ['BTS', 'KBO', 'RegionalOlympiad', 'NationalOlympiad', 'LabWork'];
        const currentYear = new Date().getFullYear();

        for (const type of resultTypes) {
            if (formData[type as keyof RegistrationData]) {
                await supabase.from('student_results').insert({
                    teacher_id: teacher.id,
                    result_type: type,
                    year: currentYear,
                    data: formData[type as keyof RegistrationData],
                });
            }
        }

        // 5. Trigger welcome email via Edge Function
        try {
            const emailPayload = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                iin: formData.iin,
                temporaryPassword,
            };

            const emailResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-welcome-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify(emailPayload),
                }
            );

            if (!emailResponse.ok) {
                console.error('Failed to send welcome email');
                // Don't fail the registration if email fails
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the registration if email fails
        }

        return NextResponse.json({
            success: true,
            teacherId: teacher.id,
            message: 'Teacher registration completed successfully',
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
