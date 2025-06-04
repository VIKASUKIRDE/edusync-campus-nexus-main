
import React from 'react';
import Layout from '@/components/Layout';

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-poppins font-bold text-4xl text-gray-900 mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-inter text-gray-600 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Information We Collect
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed mb-4">
                At EduSync, we collect information that you provide directly to us, such as when you create an account, 
                participate in courses, or contact us for support. This may include your name, email address, 
                educational institution, and learning preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <ul className="font-inter text-gray-600 space-y-2">
                <li>• To provide and improve our educational services</li>
                <li>• To communicate with you about your account and courses</li>
                <li>• To analyze usage patterns and improve user experience</li>
                <li>• To ensure the security of our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                secure data centers, and regular security audits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@edusync.com 
                or through our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
