
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 bg-hero-pattern">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              🎓 College Management Platform
            </div>
            
            <h1 className="font-poppins font-bold text-4xl lg:text-6xl text-gray-900 leading-tight mb-6">
              Transform Your
              <span className="block bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">
                College Management
              </span>
            </h1>
            
            <p className="font-inter text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              EduSync is the comprehensive Learning Management System that empowers colleges with 
              advanced tools for assignments, live classes, quizzes, grades, and complete 
              academic administration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto font-inter font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 px-8 py-3">
                  Start Managing Now
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-inter font-semibold px-8 py-3">
                  Explore Features
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="font-poppins font-bold text-2xl text-primary-600">5K+</div>
                <div className="font-inter text-sm text-gray-600">Students Managed</div>
              </div>
              <div>
                <div className="font-poppins font-bold text-2xl text-primary-600">50+</div>
                <div className="font-inter text-sm text-gray-600">Colleges</div>
              </div>
              <div>
                <div className="font-poppins font-bold text-2xl text-primary-600">99%</div>
                <div className="font-inter text-sm text-gray-600">Efficiency</div>
              </div>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative animate-fade-in">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-4 bg-primary-200 rounded"></div>
                  <div className="w-8 h-8 bg-primary-600 rounded-full"></div>
                </div>
                <div className="h-32 bg-gradient-to-br from-primary-100 to-accent/20 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-primary-600 rounded"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
