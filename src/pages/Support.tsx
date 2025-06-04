
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Support: React.FC = () => {
  const supportOptions = [
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials to help you get started.',
      action: 'Browse Docs'
    },
    {
      icon: '🎥',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all major features.',
      action: 'Watch Videos'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: '24/7 support chat with our technical team.',
      action: 'Start Chat'
    },
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Send us your questions and get detailed responses.',
      action: 'Send Email'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with EduSync?',
      answer: 'Simply sign up for a free account, choose your role (student, teacher, or admin), and follow our onboarding guide.'
    },
    {
      question: 'Can I integrate EduSync with other systems?',
      answer: 'Yes, EduSync offers APIs and integrations with popular educational tools and student information systems.'
    },
    {
      question: 'Is my data secure on EduSync?',
      answer: 'Absolutely. We use enterprise-grade security measures including encryption, secure data centers, and regular security audits.'
    },
    {
      question: 'What support is available for technical issues?',
      answer: 'We offer 24/7 live chat support, email support, comprehensive documentation, and video tutorials.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins font-bold text-4xl lg:text-5xl mb-6">
              Support Center
            </h1>
            <p className="font-inter text-xl text-primary-100 leading-relaxed">
              Get the help you need to make the most of EduSync. Our support team is here 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
              How Can We Help You?
            </h2>
            <p className="font-inter text-lg text-gray-600">
              Choose the support option that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <CardTitle className="font-poppins text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-inter text-gray-600 mb-6">
                    {option.description}
                  </p>
                  <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors">
                    {option.action}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-inter text-lg text-gray-600">
              Quick answers to common questions about EduSync.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="font-inter text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Support;
