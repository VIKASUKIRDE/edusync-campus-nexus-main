
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { to, name, loginId, password, type } = await req.json()

    console.log('Sending welcome email to:', to, 'for type:', type)

    const subject = type === 'student' 
      ? 'Welcome to College Management System - Student Account Created'
      : 'Welcome to College Management System - Teacher Account Created'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to College Management System</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 40px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .credentials { background: #f1f5f9; padding: 24px; border-left: 4px solid #3b82f6; margin: 24px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 24px; color: #64748b; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 12px; }
            .highlight { background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Learn Me</div>
              <h1>Welcome to Our College Management System</h1>
              <p>Your account has been successfully created!</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We're excited to welcome you to our College Management System. Your ${type} account has been successfully created and you're now ready to access all the features available to you.</p>
              
              <div class="credentials">
                <h3>🔑 Your Login Credentials</h3>
                <p><strong>${type === 'student' ? 'Student ID' : 'Employee ID'}:</strong> <span class="highlight">${loginId}</span></p>
                <p><strong>Password:</strong> <span class="highlight">${password}</span></p>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p><strong>🔐 Important Security Notice:</strong></p>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>Please keep these credentials secure and confidential</li>
                  <li>Change your password after your first login</li>
                  <li>Never share your login details with anyone</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="https://64d31c92-2856-49ee-af98-e1cc85a91aaf.lovableproject.com/login" class="button">
                  🚀 Access Your Dashboard
                </a>
              </div>
              
              <p>If you have any questions or need assistance getting started, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 32px;">Welcome aboard! 🎉</p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              <p style="font-size: 14px; color: #64748b;">
                <strong>What's Next?</strong><br>
                • Log in to your dashboard<br>
                • Complete your profile<br>
                • Explore the available features<br>
                • Join your classes and connect with peers
              </p>
            </div>
            <div class="footer">
              <p>© 2024 College Management System. All rights reserved.</p>
              <p style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the send-smtp-email function directly
    const { data, error } = await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        to,
        subject,
        html: htmlContent,
        type: 'welcome'
      }
    })

    if (error) {
      console.error('Email sending error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    if (!data?.success) {
      console.error('Email function returned error:', data)
      throw new Error(`Failed to send email: ${data?.error || 'Unknown error'}`)
    }

    console.log('Email sent successfully:', data)

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: `Welcome email sent successfully to ${to} via ${data.method?.toUpperCase() || 'email service'}`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
