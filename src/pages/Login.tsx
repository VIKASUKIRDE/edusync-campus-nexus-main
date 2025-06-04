import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type UserType = 'admin' | 'student' | 'teacher';

interface FormData {
  loginId: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    loginId: '',
    password: ''
  });
  const [userType, setUserType] = useState<UserType>('admin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const verifyPassword = async (inputPassword: string, storedHash: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('hash_password', { password: inputPassword });
      if (error) {
        console.error('Error hashing password:', error);
        return false;
      }
      return data === storedHash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userType === 'admin') {
        // Admin authentication
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id, name, email, password_hash')
          .eq('email', formData.loginId)
          .maybeSingle();

        if (adminError) {
          throw new Error('Database error occurred');
        }

        if (!adminData) {
          throw new Error('Admin not found. Please check your email address.');
        }

        // Verify password against hash
        const isValidPassword = await verifyPassword(formData.password, adminData.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid password. Please check your credentials.');
        }

        // Store user data in localStorage for the session
        localStorage.setItem('currentUser', JSON.stringify({
          id: adminData.id,
          name: adminData.name,
          email: adminData.email,
          userType: 'admin'
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${adminData.name || 'Admin'}!`,
        });
        navigate('/admin');
      } else if (userType === 'student') {
        // Student login
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('login_id', formData.loginId)
          .maybeSingle();

        if (studentError) {
          throw new Error('Database error occurred');
        }

        if (!studentData) {
          throw new Error('Invalid credentials');
        }

        // Verify password against hash
        const isValidPassword = await verifyPassword(formData.password, studentData.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        // Store user data in localStorage for the session
        localStorage.setItem('currentUser', JSON.stringify({
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          login_id: studentData.login_id,
          userType: 'student'
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${studentData.name}!`,
        });
        navigate('/student');
      } else {
        // Teacher login
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('employee_id', formData.loginId)
          .maybeSingle();

        if (teacherError) {
          throw new Error('Database error occurred');
        }

        if (!teacherData) {
          throw new Error('Invalid credentials. Please check your Employee ID.');
        }

        // Verify password against hash
        const isValidPassword = await verifyPassword(formData.password, teacherData.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials. Please check your password.');
        }

        // Store user data in localStorage for the session
        localStorage.setItem('currentUser', JSON.stringify({
          id: teacherData.id,
          name: teacherData.name,
          email: teacherData.email,
          employee_id: teacherData.employee_id,
          userType: 'teacher'
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${teacherData.name}!`,
        });
        navigate('/teacher');
      }
    } catch (error: any) {
      const message = error?.message || 'Login failed';
      setError(message);
      console.error('Login error:', message);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = (): string => {
    switch (userType) {
      case 'admin':
        return 'admin@example.com';
      case 'student':
        return 'STU001';
      case 'teacher':
        return 'TCH001';
      default:
        return 'Enter your login ID';
    }
  };

  const getLoginIdLabel = (): string => {
    switch (userType) {
      case 'admin':
        return 'Email Address';
      case 'student':
        return 'Student ID';
      case 'teacher':
        return 'Employee ID';
      default:
        return 'Login ID';
    }
  };

  const userTypes: UserType[] = ['admin', 'student', 'teacher'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            {userTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setUserType(type);
                  setFormData({ loginId: '', password: '' });
                  setError('');
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  userType === type
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {userType === 'admin' ? 'Admin Login' : 
                 userType === 'student' ? 'Student Login' : 'Teacher Login'}
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="loginId">{getLoginIdLabel()}</Label>
                  <Input
                    id="loginId"
                    name="loginId"
                    type="text"
                    value={formData.loginId}
                    onChange={handleInputChange}
                    placeholder={getPlaceholder()}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Demo Credentials */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Admin:</strong> admin@example.com / admin123</p>
                <p><strong>Student:</strong> STU001 / John1234@</p>
                <p><strong>Teacher:</strong> TCH001 / Sarah9876@</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
