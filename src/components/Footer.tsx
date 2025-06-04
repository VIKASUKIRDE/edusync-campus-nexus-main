
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { label: 'Features', path: '/features' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'FAQ', path: '/faq' }
      ]
    },
    {
      title: 'Access',
      links: [
        { label: 'Student Login', path: '/login' },
        { label: 'Teacher Login', path: '/login' },
        { label: 'Admin Login', path: '/login' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Support', path: '/support' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div>
            <Logo size="lg" className="mb-6" />
            <p className="text-gray-300 font-inter text-sm leading-relaxed mb-6 max-w-sm">
              EduSync is a comprehensive Learning Management System designed to revolutionize 
              college administration with modern tools for assignments, live classes, quizzes, 
              and seamless academic management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                <span className="text-sm font-bold">t</span>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                <span className="text-sm font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-poppins font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-accent font-inter text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 font-inter text-sm">
              © {currentYear} EduSync. All rights reserved.
            </div>
            
            <div className="text-gray-400 font-inter text-sm">
              Developed by{' '}
              <span className="text-accent font-semibold">WHELT TECHNOLOGY LTD</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-accent font-inter text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-accent font-inter text-sm transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
