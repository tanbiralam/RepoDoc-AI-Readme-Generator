"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote:
        "This tool saved me hours of work. I used to spend so much time creating READMEs for my projects, but now it's just a few clicks and I'm done!",
      author: "Sarah Chen",
      role: "Full Stack Developer",
      avatar: "/avatars/user1.jpg",
    },
    {
      id: 2,
      quote:
        "The AI-generated content is surprisingly accurate. It understood my project's structure and created a README that perfectly reflected its purpose and functionality.",
      author: "Michael Rodriguez",
      role: "Open Source Contributor",
      avatar: "/avatars/user2.jpg",
    },
    {
      id: 3,
      quote:
        "As someone who maintains multiple repositories, this tool has become essential to my workflow. The templates are professional and the customization options are excellent.",
      author: "Emma Johnson",
      role: "Software Engineer at TechCorp",
      avatar: "/avatars/user3.jpg",
    },
    {
      id: 4,
      quote:
        "I'm not great at writing documentation, so this tool is a lifesaver. It creates clear, well-structured READMEs that make my projects look professional.",
      author: "David Williams",
      role: "Frontend Developer",
      avatar: "/avatars/user4.jpg",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers who are saving time and creating better
            documentation
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={item}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm transition-all duration-300"
            >
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-600">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      testimonial.author.charAt(0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {testimonial.author}
                  </h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;{testimonial.quote}&quot;
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md overflow-hidden">
            <div className="px-8 py-12 text-center text-white">
              <h3 className="text-2xl font-semibold mb-4">
                Ready to create professional README files?
              </h3>
              <p className="mb-8 max-w-2xl mx-auto">
                Join 10,000+ developers who are using our tool to save time and
                improve their project documentation.
              </p>
              <motion.button
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium transition-colors duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Generating READMEs
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
