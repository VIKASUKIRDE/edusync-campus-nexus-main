
import React from 'react';

const About: React.FC = () => {
  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      description: 'Former Dean of Technology with 15+ years in educational innovation.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      description: 'Tech visionary with expertise in scalable educational platforms.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
      description: 'UX expert passionate about creating intuitive learning experiences.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins font-bold text-4xl lg:text-5xl mb-6">
              About Learn_Me
            </h1>
            <p className="font-inter text-xl text-primary-100 leading-relaxed">
              We're revolutionizing education through innovative technology, 
              making learning more accessible, engaging, and effective for institutions worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="font-inter text-lg text-gray-600 mb-6 leading-relaxed">
                To empower educational institutions with cutting-edge technology that transforms 
                the way students learn and teachers teach. We believe in creating seamless, 
                intuitive platforms that enhance the educational experience for everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-2">Innovation</h3>
                  <p className="font-inter text-sm text-gray-600">
                    Pushing boundaries with latest educational technology trends.
                  </p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-2">Accessibility</h3>
                  <p className="font-inter text-sm text-gray-600">
                    Making quality education accessible to all students everywhere.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students collaborating"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate educators and technologists working together to transform education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-primary-600 font-inter font-medium mb-4">
                  {member.role}
                </div>
                <p className="font-inter text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl text-gray-900 mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎯', title: 'Excellence', description: 'Striving for the highest quality in everything we do.' },
              { icon: '🤝', title: 'Collaboration', description: 'Working together to achieve common educational goals.' },
              { icon: '💡', title: 'Innovation', description: 'Continuously improving and adapting to new challenges.' },
              { icon: '🌟', title: 'Impact', description: 'Making a meaningful difference in education worldwide.' }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="font-inter text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
