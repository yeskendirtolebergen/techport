/**
 * Authentication middleware for Next.js App Router
 * Protects routes and enforces role-based access control
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Get session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If no session and accessing protected routes, redirect to login
    if (!session && (
        request.nextUrl.pathname.startsWith('/teacher') ||
        request.nextUrl.pathname.startsWith('/admin')
    )) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If authenticated and accessing admin routes, check role
    if (session && request.nextUrl.pathname.startsWith('/admin')) {
        const { data: teacher } = await supabase
            .from('teachers')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (teacher?.role !== 'admin') {
            return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
        }
    }

    // Redirect to dashboard if already logged in and accessing login page
    if (session && request.nextUrl.pathname === '/login') {
        const { data: teacher } = await supabase
            .from('teachers')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (teacher?.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
        }
    }

    return response;
}
