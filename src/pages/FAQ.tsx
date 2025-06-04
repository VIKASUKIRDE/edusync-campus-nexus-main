
import React from 'react';
import Layout from '@/components/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is EduSync?",
      answer: "EduSync is a comprehensive Learning Management System designed specifically for colleges. It provides tools for assignment management, live classes, quizzes, grade tracking, communication, and complete academic administration."
    },
    {
      question: "How do I access my courses and assignments?",
      answer: "Once logged in as a student, you can access all your enrolled courses from the dashboard. Each course contains assignments, materials, announcements, and grade information. Simply click on any course to view its contents."
    },
    {
      question: "Can teachers create and manage multiple classes?",
      answer: "Yes, teachers can create and manage multiple classes, create assignments with deadlines, conduct live sessions, create quizzes with various question types, and track student progress through detailed analytics."
    },
    {
      question: "How does the grading system work?",
      answer: "EduSync features an automated grading system for quizzes and manual grading options for assignments. Teachers can set grading rubrics, provide feedback, and students can view their grades and progress in real-time."
    },
    {
      question: "Is there a mobile app available?",
      answer: "EduSync is web-based and fully responsive, meaning it works seamlessly on all devices including smartphones and tablets through your web browser. A dedicated mobile app is planned for future release."
    },
    {
      question: "How secure is my data on EduSync?",
      answer: "We take data security seriously. EduSync uses industry-standard encryption, secure authentication, and regular backups to ensure your academic data is protected and always available when you need it."
    },
    {
      question: "Can I integrate EduSync with other educational tools?",
      answer: "EduSync is designed to work with popular educational tools and platforms. We support various integrations and are continuously adding new ones based on user feedback and requirements."
    },
    {
      question: "What kind of support is available?",
      answer: "We provide comprehensive support including email support, documentation, video tutorials, and technical assistance. Our support team is available during business hours to help with any questions or issues."
    },
    {
      question: "How can I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password. If you don't receive the email, check your spam folder or contact support."
    },
    {
      question: "Can administrators manage multiple departments?",
      answer: "Yes, administrators have full access to manage multiple departments, create user accounts, monitor system usage, generate reports, and configure system settings according to institutional requirements."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins font-bold text-4xl lg:text-5xl mb-6">
              Frequently Asked Questions
            </h1>
            <p className="font-inter text-xl text-primary-100 leading-relaxed">
              Find answers to common questions about EduSync and how to make the most of our platform.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="font-poppins font-semibold text-left hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-inter text-gray-600 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="font-inter text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@edusync.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-inter font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                📧 Email Support
              </a>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-inter font-medium rounded-lg hover:bg-primary-50 transition-colors"
              >
                📞 Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
