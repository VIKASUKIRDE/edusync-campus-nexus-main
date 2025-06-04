
import React from 'react';
import Layout from '@/components/Layout';

const Terms: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-poppins font-bold text-4xl text-gray-900 mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-inter text-gray-600 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Acceptance of Terms
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed mb-4">
                By accessing and using EduSync's services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Use License
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily access EduSync for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="font-inter text-gray-600 space-y-2">
                <li>• Modify or copy the materials</li>
                <li>• Use the materials for any commercial purpose or for any public display</li>
                <li>• Attempt to reverse engineer any software contained on the platform</li>
                <li>• Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                User Responsibilities
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                Users are responsible for maintaining the confidentiality of their account information and 
                for all activities that occur under their account. Users must notify EduSync immediately 
                of any unauthorized use of their account or any other breach of security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-poppins font-semibold text-2xl text-gray-900 mb-4">
                Limitations
              </h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                In no event shall EduSync or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or 
                inability to use the materials on EduSync's platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
