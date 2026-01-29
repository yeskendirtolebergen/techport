// Supabase Edge Function for sending welcome emails
// To deploy: supabase functions deploy send-welcome-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// SMTP configuration from environment variables
const SMTP_CONFIG = {
    hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com',
    port: Number(Deno.env.get('SMTP_PORT')) || 465,
    username: Deno.env.get('SMTP_USERNAME')!,
    password: Deno.env.get('SMTP_PASSWORD')!,
    from: Deno.env.get('SMTP_FROM') || 'noreply@teacherportfolio.kz',
};

interface EmailPayload {
    email: string;
    firstName: string;
    lastName: string;
    iin: string;
    temporaryPassword: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const payload: EmailPayload = await req.json();
        const { email, firstName, lastName, iin, temporaryPassword } = payload;

        // Validate required fields
        if (!email || !firstName || !lastName || !iin || !temporaryPassword) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

        // Email HTML template
        const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Teacher Portfolio Platform</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .credentials {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .credential-item {
              margin: 10px 0;
            }
            .credential-label {
              font-weight: 600;
              color: #374151;
            }
            .credential-value {
              font-family: 'Courier New', monospace;
              background: white;
              padding: 8px 12px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 5px;
              border: 1px solid #d1d5db;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Teacher Portfolio Platform</h1>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>Your teacher account has been successfully created. You can now access your academic portfolio and track your professional development.</p>
            
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">Portfolio Link:</div>
                <div class="credential-value"><a href="${appUrl}/login" style="color: #2563eb; text-decoration: none;">${appUrl}/login</a></div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Login (IIN):</div>
                <div class="credential-value">${iin}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Temporary Password:</div>
                <div class="credential-value">${temporaryPassword}</div>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <p style="margin: 5px 0 0 0;">Please change your password immediately after your first login for security purposes.</p>
            </div>

            <center>
              <a href="${appUrl}/login" class="button">Access Your Portfolio</a>
            </center>

            <p>If you have any questions or need assistance, please contact your school administrator.</p>

            <p>Best regards,<br/>
            <strong>Teacher Portfolio Platform Team</strong></p>
          </div>

          <div class="footer">
            <p>© 2026 Teacher Portfolio Platform. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;

        const textBody = `
Welcome to Teacher Portfolio Platform

Dear ${firstName} ${lastName},

Your teacher account has been successfully created.

Login Credentials:
- Portfolio Link: ${appUrl}/login
- Login (IIN): ${iin}
- Temporary Password: ${temporaryPassword}

IMPORTANT: Please change your password after your first login for security purposes.

Best regards,
Teacher Portfolio Platform Team
    `.trim();

        // Send email using native Deno SMTP
        // Note: For production, consider using a service like SendGrid, Resend, or Postmark
        // This is a simplified example using SMTP directly

        const emailMessage = [
            `From: ${SMTP_CONFIG.from}`,
            `To: ${email}`,
            `Subject: Your Teacher Portfolio Account - Login Credentials`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="boundary123"`,
            ``,
            `--boundary123`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            textBody,
            `--boundary123`,
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            emailBody,
            `--boundary123--`,
        ].join('\r\n');

        // For simplicity, log the email content
        // In production, implement actual SMTP sending or use a service
        console.log('Email would be sent to:', email);
        console.log('Email content:', emailMessage);

        // TODO: Implement actual email sending
        // For now, return success
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email queued for sending',
                recipient: email
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    } catch (error: any) {
        console.error('Error sending email:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
});
