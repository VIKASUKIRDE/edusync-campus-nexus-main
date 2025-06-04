import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { User, Lock, Camera, Save, Mail, Eye, EyeOff, Shield, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmailTestSection from './EmailTestSection';

const Settings: React.FC = () => {
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailSettings, setEmailSettings] = useState({
    resendApiKey: '',
    fromEmail: 'imashish1332@gmail.com',
    fromName: 'College Management System',
    useSmtp: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    smtp: false
  });
  const { toast } = useToast();

  // Load admin profile and email settings on component mount
  useEffect(() => {
    loadAdminProfile();
    loadEmailSettings();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error loading admin profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          profilePicture: data.profile_picture_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const loadEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading email settings:', error);
        return;
      }

      if (data) {
        setEmailSettings(prev => ({
          ...prev,
          resendApiKey: data.resend_api_key || '',
          fromEmail: data.from_email || 'imashish1332@gmail.com',
          fromName: data.from_name || 'College Management System',
          useSmtp: data.use_smtp || false,
          smtpHost: data.smtp_host || 'smtp.gmail.com',
          smtpPort: data.smtp_port || 587,
          smtpUser: data.smtp_user || '',
          smtpPassword: data.smtp_password || ''
        }));
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      let profilePictureUrl = profileData.profilePicture;
      
      // Upload profile picture if a new one was selected
      if (profilePictureFile) {
        const fileExt = profilePictureFile.name.split('.').pop();
        const fileName = `admin-profile-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, profilePictureFile);
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          // Continue without profile picture update
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(fileName);
            
          profilePictureUrl = publicUrl;
        }
      }

      // Update admin profile in database using the loaded ID
      const { error } = await supabase
        .from('admin_users')
        .update({
          name: profileData.name,
          email: profileData.email,
          profile_picture_url: profilePictureUrl
        })
        .eq('id', profileData.id);

      if (error) throw error;

      setProfileData(prev => ({ ...prev, profilePicture: profilePictureUrl }));
      setProfilePictureFile(null);
      
      // Reload the profile to confirm changes
      await loadAdminProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Hash the new password
      const { data: hashedPassword } = await supabase.rpc('hash_password', { 
        password: passwordData.newPassword 
      });

      // Update password using the loaded admin ID
      const { error } = await supabase
        .from('admin_users')
        .update({ password_hash: hashedPassword })
        .eq('id', profileData.id);

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSettingsUpdate = async () => {
    setLoading(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      const updateData = {
        resend_api_key: emailSettings.resendApiKey,
        from_email: emailSettings.fromEmail,
        from_name: emailSettings.fromName,
        use_smtp: emailSettings.useSmtp,
        smtp_host: emailSettings.smtpHost,
        smtp_port: emailSettings.smtpPort,
        smtp_user: emailSettings.smtpUser,
        smtp_password: emailSettings.smtpPassword,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('email_settings')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('email_settings')
          .insert(updateData);

        if (error) throw error;
      }

      toast({
        title: "Email Settings Updated",
        description: "Email settings have been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-primary-100">Manage your account settings and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 ring-4 ring-primary-100">
                <AvatarImage src={profileData.profilePicture} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-picture"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('profile-picture')?.click()}
                  className="bg-slate-50 hover:bg-slate-100"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Picture
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={handlePasswordUpdate} disabled={loading} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <span>Email Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Method Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Use SMTP (Gmail) - Recommended</p>
                  <p className="text-sm text-slate-600">More reliable delivery with Gmail App Password</p>
                </div>
              </div>
              <Switch
                checked={emailSettings.useSmtp}
                onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, useSmtp: checked }))}
              />
            </div>

            {emailSettings.useSmtp ? (
              /* SMTP Configuration */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-blue-900 mb-2">Gmail SMTP Configuration</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Use your Gmail account with an App Password for secure email sending.
                    <a 
                      href="https://support.google.com/accounts/answer/185833" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1 inline-flex items-center"
                    >
                      Learn how to create an App Password <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>

                <div>
                  <Label htmlFor="smtp-user" className="text-sm font-medium text-slate-700">Gmail Address</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-password" className="text-sm font-medium text-slate-700">Gmail App Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="smtp-password"
                      type={showPassword.smtp ? "text" : "password"}
                      placeholder="16-character app password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => ({ ...prev, smtp: !prev.smtp }))}
                    >
                      {showPassword.smtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="from-email" className="text-sm font-medium text-slate-700">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="from-name" className="text-sm font-medium text-slate-700">From Name</Label>
                  <Input
                    id="from-name"
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              /* Resend API Configuration */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="md:col-span-3">
                  <h3 className="font-semibold text-purple-900 mb-2">Resend API Configuration</h3>
                  <p className="text-sm text-purple-700 mb-4">
                    Alternative email service using Resend API.
                    <a 
                      href="https://resend.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline ml-1 inline-flex items-center"
                    >
                      Get your API key from resend.com <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>

                <div>
                  <Label htmlFor="resend-api-key" className="text-sm font-medium text-slate-700">Resend API Key</Label>
                  <Input
                    id="resend-api-key"
                    type="password"
                    placeholder="re_xxxxxxxxx"
                    value={emailSettings.resendApiKey}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, resendApiKey: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="from-email-resend" className="text-sm font-medium text-slate-700">From Email</Label>
                  <Input
                    id="from-email-resend"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="from-name-resend" className="text-sm font-medium text-slate-700">From Name</Label>
                  <Input
                    id="from-name-resend"
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleEmailSettingsUpdate} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Email Settings
            </Button>
          </CardContent>
        </Card>

        {/* Test Email Section */}
        <div className="lg:col-span-2">
          <EmailTestSection />
        </div>
      </div>
    </div>
  );
};

export default Settings;
