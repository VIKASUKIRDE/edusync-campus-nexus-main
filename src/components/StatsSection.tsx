
import React from 'react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      number: '5,000+',
      label: 'Students Managed',
      description: 'Active student accounts'
    },
    {
      number: '10K+',
      label: 'Assignments',
      description: 'Successfully completed and graded'
    },
    {
      number: '99.9%',
      label: 'System Uptime',
      description: 'Reliable platform performance'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-4">
            Proven College Management Solution
          </h2>
          <p className="font-inter text-lg text-primary-100 max-w-2xl mx-auto">
            Empowering educational excellence with comprehensive management tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="font-poppins font-bold text-4xl lg:text-5xl mb-2 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="font-poppins font-semibold text-xl mb-2">
                {stat.label}
              </div>
              <div className="font-inter text-primary-200 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
