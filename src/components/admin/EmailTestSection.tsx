
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle, AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailTestSection: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Sending test email to:', testEmail);

      const testEmailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email - College Management System</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { padding: 40px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .footer { text-align: center; padding: 24px; color: #64748b; }
              .logo { font-size: 28px; font-weight: bold; margin-bottom: 12px; }
              .success-badge { background: #dcfce7; color: #16a34a; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎓 EduSync</div>
                <h1>Email Configuration Test</h1>
                <p>This is a test email to verify your email settings</p>
              </div>
              <div class="content">
                <div class="success-badge">
                  ✅ Email System Working Properly!
                </div>
                <h2>Congratulations!</h2>
                <p>Your email configuration is working correctly. This test email was sent successfully using your configured email settings.</p>
                
                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>Sent at: ${new Date().toLocaleString()}</li>
                  <li>Recipient: ${testEmail}</li>
                  <li>System: College Management System</li>
                </ul>
                
                <p>You can now confidently send welcome emails, notifications, and other system emails to your users.</p>
              </div>
              <div class="footer">
                <p>© 2024 College Management System. All rights reserved.</p>
                <p style="font-size: 12px;">This is a test email from your College Management System.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const { data, error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: testEmail,
          subject: '✅ Test Email - College Management System',
          html: testEmailContent,
          type: 'test'
        }
      });

      console.log('Test email response:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Test Email Sent Successfully! ✅",
          description: `Test email sent to ${testEmail} using ${data.method?.toUpperCase() || 'email service'}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      
      let errorMessage = error.message;
      let helpText = '';
      
      if (errorMessage.includes('domain is not verified') || errorMessage.includes('testing emails')) {
        helpText = 'For Resend: Use a verified domain or configure Gmail SMTP with App Password instead.';
      } else if (errorMessage.includes('SMTP') || errorMessage.includes('Gmail')) {
        helpText = 'Check your Gmail App Password and ensure 2FA is enabled on your Google account.';
      } else if (errorMessage.includes('No email service configured')) {
        helpText = 'Please configure email settings in the admin panel first.';
      }
      
      toast({
        title: "Test Email Failed",
        description: `${errorMessage}${helpText ? ` ${helpText}` : ''}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-green-100 rounded-lg">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <span>Test Email Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Gmail SMTP Setup Instructions</h3>
              <div className="text-sm text-blue-700 mt-2 space-y-2">
                <div className="space-y-1">
                  <p><strong>Step 1:</strong> Enable 2-Factor Authentication on your Gmail account</p>
                  <p><strong>Step 2:</strong> Go to Google Account settings → Security → 2-Step Verification</p>
                  <p><strong>Step 3:</strong> Click "App passwords" and create a new app password</p>
                  <p><strong>Step 4:</strong> Use your Gmail address as SMTP User</p>
                  <p><strong>Step 5:</strong> Use the generated App Password (not your regular password)</p>
                </div>
                <div className="mt-3 p-3 bg-blue-100 rounded">
                  <p className="font-medium">Required Settings:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• SMTP Host: smtp.gmail.com</li>
                    <li>• SMTP Port: 587 (TLS) or 465 (SSL)</li>
                    <li>• SMTP User: your-email@gmail.com</li>
                    <li>• SMTP Password: 16-character App Password</li>
                  </ul>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Gmail App Password
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Alternative: Resend Setup</h3>
              <div className="text-sm text-amber-700 mt-1 space-y-2">
                <p><strong>For Resend:</strong> You need a verified domain (not gmail.com). Get a free domain or use a subdomain.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://resend.com/domains', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify Domain on Resend
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="test-email" className="text-sm font-medium text-slate-700">
              Test Email Address
            </Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email to test (e.g., your-email@gmail.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={sendTestEmail} 
              disabled={loading || !testEmail}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending Test Email...' : 'Send Test Email'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/admin/settings'}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Email Settings
            </Button>
          </div>
        </div>

        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <p><strong>Troubleshooting:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Make sure 2FA is enabled on your Google account</li>
            <li>Use the 16-character App Password, not your regular password</li>
            <li>Check that email settings are saved in the admin panel</li>
            <li>Verify the "From Email" matches your Gmail address</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestSection;
