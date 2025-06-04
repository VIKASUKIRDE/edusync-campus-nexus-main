
import React from 'react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Learn_Me has revolutionized how we manage our college. The assignment system and grade tracking make everything so much easier.",
      author: "Dr. Sarah Johnson",
      role: "Dean of Academic Affairs",
      institution: "Tech University"
    },
    {
      quote: "As a teacher, I love how simple it is to create quizzes and track student progress. The live class feature is fantastic!",
      author: "Prof. Michael Chen",
      role: "Computer Science Professor",
      institution: "Innovation College"
    },
    {
      quote: "The student interface is intuitive and makes accessing assignments and grades effortless. Great platform!",
      author: "Emily Rodriguez",
      role: "Student",
      institution: "State College"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from educators and students who are transforming their academic experience with Learn_Me.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-primary-600 text-4xl mb-4">"</div>
              <p className="font-inter text-gray-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-poppins font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="font-inter text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="font-inter text-xs text-gray-500">
                    {testimonial.institution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
