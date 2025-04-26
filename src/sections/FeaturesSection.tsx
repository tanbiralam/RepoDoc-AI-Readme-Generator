"use client";

import { motion } from "framer-motion";
import { Code, FileCode, Zap, Layout, BarChart3, Award } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      id: 1,
      title: "AI-Powered Generation",
      description:
        "Advanced AI algorithms analyze your repository to create tailored README content.",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "Live Editor",
      description:
        "Edit and preview your README in real-time with our intuitive markdown editor.",
      icon: <Code className="w-5 h-5" />,
    },
    {
      id: 3,
      title: "One-Click Commit",
      description:
        "Push your new README directly to GitHub with a single click.",
      icon: <FileCode className="w-5 h-5" />,
    },
    {
      id: 4,
      title: "Multiple Templates",
      description:
        "Choose from a variety of professional templates to match your project style.",
      icon: <Layout className="w-5 h-5" />,
    },
    {
      id: 5,
      title: "Smart Analysis",
      description:
        "Our tool automatically detects languages, frameworks, and features in your repository.",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 6,
      title: "Badge Integration",
      description:
        "Automatically add relevant badges to showcase your project's status and compatibility.",
      icon: <Award className="w-5 h-5" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"></div>

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
              <span className="text-blue-400">Features</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything You Need
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Powerful tools to create professional README files that make your
            projects stand out
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.7)",
              }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500 to-indigo-600 blur-sm group-hover:blur transition-all duration-300" />
              <div className="relative z-10">
                <motion.div
                  className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-800 overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-500 to-indigo-600 blur-sm transition-all duration-300" />
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative z-10">
              <motion.span
                className="text-blue-400 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Enhanced Features
              </motion.span>
              <motion.h3
                className="text-2xl font-bold text-white mt-2 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Beautifully Designed Templates
              </motion.h3>
              <motion.p
                className="text-gray-400 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Choose from a wide range of professionally designed templates
                that match your project&apos;s style and purpose. Each template
                is optimized for readability and visual appeal.
              </motion.p>
              <motion.ul
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {[
                  "Project Showcase",
                  "Documentation-focused",
                  "Developer Portfolio",
                  "Open Source Project",
                  "API Documentation",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                  >
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-blue-400 mt-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">{item} Template</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex items-center justify-center">
              <motion.div
                className="grid grid-cols-2 gap-4 w-full max-w-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="aspect-[4/3] rounded-lg overflow-hidden"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5 },
                      },
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-gray-700 p-3 flex flex-col">
                      <div className="w-1/2 h-2 bg-blue-500/30 rounded mb-2"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-1.5 bg-gray-700 rounded"></div>
                        <div className="w-3/4 h-1.5 bg-gray-700 rounded"></div>
                        <div className="w-5/6 h-1.5 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
