
import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '📚',
      title: 'Assignment Management',
      description: 'Create, distribute, and grade assignments with advanced tracking and deadline management.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎥',
      title: 'Live Classes',
      description: 'Conduct interactive live sessions with screen sharing, recording, and real-time collaboration.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📊',
      title: 'Quiz & Assessments',
      description: 'Build comprehensive quizzes with multiple question types and automatic grading.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📈',
      title: 'Grade Management',
      description: 'Track student progress with detailed analytics and customizable gradebook features.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '💬',
      title: 'Communication Hub',
      description: 'Seamless messaging system for announcements, discussions, and direct communication.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '📋',
      title: 'Notice Board',
      description: 'Centralized platform for important announcements, deadlines, and institutional updates.',
      color: 'from-teal-500 to-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Powerful Features for
            <span className="block bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">
              Modern Education
            </span>
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your educational institution effectively, 
            from assignments to live classes and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="font-inter text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
