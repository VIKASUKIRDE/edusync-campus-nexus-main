
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Us',
      details: 'support@edusync.com',
      description: 'Get in touch via email'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      icon: '🏢',
      title: 'Visit Us',
      details: '123 Education St, Tech City',
      description: 'Our main office location'
    },
    {
      icon: '⏰',
      title: 'Office Hours',
      details: '9AM - 6PM EST',
      description: 'Monday to Friday'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins font-bold text-4xl lg:text-5xl mb-6">
              Get in Touch
            </h1>
            <p className="font-inter text-xl text-primary-100 leading-relaxed">
              Have questions about EduSync? We're here to help you with your college management needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{info.icon}</div>
                <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-2">
                  {info.title}
                </h3>
                <div className="font-inter font-medium text-primary-600 mb-2">
                  {info.details}
                </div>
                <p className="font-inter text-sm text-gray-600">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Office Info */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div>
              <Card className="shadow-2xl border-0">
                <CardHeader>
                  <CardTitle className="font-poppins text-2xl text-gray-900">
                    Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Demo Google Map */}
                  <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093046!2d144.95373631531892!3d-37.81627997975195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sau!4v1629879185570!5m2!1sen!2sau"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="EduSync Office Location"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Office Details */}
            <div>
              <div className="bg-white rounded-2xl shadow-2xl p-8 h-full">
                <h3 className="font-poppins font-bold text-2xl text-gray-900 mb-6">
                  Office Information
                </h3>
                
                {/* Office Locations */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-poppins font-semibold text-lg text-gray-900 mb-2">
                      Headquarters
                    </h4>
                    <p className="font-inter text-gray-600">
                      123 Education Street<br />
                      Tech City, TC 12345<br />
                      United States
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-poppins font-semibold text-lg text-gray-900 mb-2">
                      Regional Office
                    </h4>
                    <p className="font-inter text-gray-600">
                      456 Learning Avenue<br />
                      Innovation Hub, IH 67890<br />
                      Canada
                    </p>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h4 className="font-poppins font-semibold text-lg text-gray-900 mb-2">
                      Business Hours
                    </h4>
                    <p className="font-inter text-sm text-gray-600 mb-1">
                      Monday - Friday: 9:00 AM - 6:00 PM EST
                    </p>
                    <p className="font-inter text-sm text-gray-600">
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
