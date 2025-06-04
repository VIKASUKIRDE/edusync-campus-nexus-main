
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Don't show header/footer on dashboard routes and login page
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/teacher') || 
                          location.pathname.startsWith('/student') ||
                          location.pathname === '/login';

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
