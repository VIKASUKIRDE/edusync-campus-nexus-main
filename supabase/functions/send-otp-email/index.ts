
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
    const { to, otp } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get email settings from database
    const { data: emailSettings, error: settingsError } = await supabaseClient
      .from('email_settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching email settings:', settingsError)
      throw new Error('Failed to fetch email settings')
    }

    const RESEND_API_KEY = emailSettings?.resend_api_key || Deno.env.get('RESEND_API_KEY')
    const fromEmail = emailSettings?.from_email || 'imashish1332@gmail.com'
    const fromName = emailSettings?.from_name || 'College Management System'

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e5e7eb; margin-top: 20px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Learn Me</div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>
              
              <div class="otp-box">
                <h3>Your OTP Code</h3>
                <div class="otp-code">${otp}</div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is still secure.
              </div>
              
              <p>Enter this code in the password reset form to continue with creating your new password.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${fromName}. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: 'Password Reset OTP - College Management System',
        html: htmlContent,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      })
    } else {
      const errorText = await res.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Failed to send email: ${errorText}`)
    }
  } catch (error) {
    console.error('Error in send-otp-email function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})
