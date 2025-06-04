
import React from 'react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-accent text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-poppins font-bold text-3xl mb-6 text-white">
          Ready to Transform Your College Management?
        </h2>
        <p className="font-inter text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of educators who are already using EduSync to streamline their academic 
          processes and enhance student engagement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-inter font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Now
            </button>
          </Link>
          <Link to="/features">
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-inter font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Explore Features
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
