import React from 'react';

const Features: React.FC = () => {
  const featureCategories = [
    {
      title: 'Academic Management',
      features: [
        {
          icon: '📚',
          name: 'Assignment Management',
          description: 'Create, distribute, and track assignments with advanced deadline management and submission tracking.',
          benefits: ['Automated deadline reminders', 'Bulk assignment creation', 'Plagiarism detection', 'Grade analytics']
        },
        {
          icon: '📊',
          name: 'Grade Management',
          description: 'Comprehensive gradebook with customizable grading scales and detailed progress tracking.',
          benefits: ['Weighted grade calculations', 'Progress reports', 'Parent notifications', 'Export capabilities']
        },
        {
          icon: '📋',
          name: 'Attendance Tracking',
          description: 'Digital attendance system with automated reports and notifications for absenteeism.',
          benefits: ['QR code check-in', 'Attendance analytics', 'Parent notifications', 'Integration with grades']
        }
      ]
    },
    {
      title: 'Interactive Learning',
      features: [
        {
          icon: '🎥',
          name: 'Live Classes',
          description: 'High-quality video conferencing with screen sharing, recording, and interactive tools.',
          benefits: ['HD video quality', 'Recording capabilities', 'Breakout rooms', 'Interactive whiteboard']
        },
        {
          icon: '❓',
          name: 'Quiz System',
          description: 'Advanced quiz builder with multiple question types and automatic grading.',
          benefits: ['Timed quizzes', 'Question banks', 'Anti-cheating measures', 'Instant feedback']
        },
        {
          icon: '💬',
          name: 'Discussion Forums',
          description: 'Engaging discussion platforms for course-related conversations and peer learning.',
          benefits: ['Threaded discussions', 'Moderation tools', 'File sharing', 'Mobile responsive']
        }
      ]
    },
    {
      title: 'Communication & Collaboration',
      features: [
        {
          icon: '📢',
          name: 'Notice Board',
          description: 'Centralized announcement system with priority levels and targeted messaging.',
          benefits: ['Priority notifications', 'Read receipts', 'Scheduled announcements', 'Multi-channel delivery']
        },
        {
          icon: '✉️',
          name: 'Messaging System',
          description: 'Secure internal messaging with file sharing and group communication capabilities.',
          benefits: ['End-to-end encryption', 'File attachments', 'Group chats', 'Message archiving']
        },
        {
          icon: '📅',
          name: 'Calendar Integration',
          description: 'Unified calendar system for classes, assignments, exams, and institutional events.',
          benefits: ['Sync with external calendars', 'Reminder notifications', 'Event sharing', 'Recurring events']
        }
      ]
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins font-bold text-4xl lg:text-5xl mb-6">
              Comprehensive LMS Features
            </h1>
            <p className="font-inter text-xl text-primary-100 leading-relaxed">
              Everything you need to manage your educational institution effectively, 
              from basic administration to advanced learning analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Features by Category */}
      {featureCategories.map((category, categoryIndex) => (
        <section key={categoryIndex} className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
                {category.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {category.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-4">
                    {feature.name}
                  </h3>
                  <p className="font-inter text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div>
                    <h4 className="font-poppins font-medium text-sm text-gray-900 mb-3 uppercase tracking-wide">
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center font-inter text-sm text-gray-600">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-3xl mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="font-inter text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of institutions already using EduSync to enhance their educational experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-inter font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-inter font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
