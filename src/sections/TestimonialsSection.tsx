"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section
      id="testimonials"
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute left-0 top-0 -translate-x-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute right-0 bottom-0 translate-x-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full opacity-20 blur-3xl"></div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="flex items-center rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-sm font-medium text-gray-300">
              <span className="text-blue-400">Testimonials</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Join thousands of developers who are saving time and creating better
            documentation
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                y: -8,
                boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.5)",
              }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-500 to-indigo-600 blur-sm transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mr-3">
                    <motion.div
                      className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden flex items-center justify-center text-gray-400 shadow border border-gray-700"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
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
                    </motion.div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      {testimonial.author}
                    </h3>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
              </div>
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
          <div className="relative rounded-xl shadow-2xl overflow-hidden">
            <div className="absolute -inset-px rounded-xl opacity-30 bg-gradient-to-r from-blue-500 to-indigo-600 blur-sm"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800">
              <div className="px-8 py-12 text-center">
                <motion.h3
                  className="text-2xl font-semibold mb-3 text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  Ready to create professional README files?
                </motion.h3>
                <motion.p
                  className="mb-8 max-w-2xl mx-auto text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  Join 10,000+ developers who are using our tool to save time
                  and improve their project documentation.
                </motion.p>
                <motion.div
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href="#generate"
                    className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 transform hover:-translate-y-1"
                  >
                    Start Generating READMEs
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
