"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileCode, Eye, CheckCircle } from "lucide-react";

export default function SecuritySection() {
  const securityFeatures = [
    {
      title: "Secure GitHub Authentication",
      description:
        "We use OAuth to authenticate with GitHub, ensuring we never store your credentials.",
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: "Data Encryption",
      description:
        "All data transferred between your browser and our servers is encrypted using TLS/SSL.",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Limited Repository Access",
      description:
        "We only request the permissions necessary to provide our service - nothing more.",
      icon: <FileCode className="w-6 h-6" />,
    },
    {
      title: "No Code Storage",
      description:
        "We don't store your repository code on our servers - all analysis is done in real-time.",
      icon: <Eye className="w-6 h-6" />,
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
      id="security"
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Decorative glows */}
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform translate-x-1/2"></div>
      <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl transform -translate-x-1/2"></div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block bg-blue-500/10 text-blue-400 rounded-full px-4 py-1.5 text-sm font-medium mb-3"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Security & Privacy
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your Data, Protected
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            We take the security and privacy of your GitHub repositories
            seriously
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-900/80 backdrop-blur-sm p-5 rounded-xl border border-gray-800/50 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.div
                    className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.h3
              className="text-xl font-semibold text-white mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              Our Security Commitment
            </motion.h3>

            <motion.div
              className="space-y-4"
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
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-4 rounded-lg"
              >
                <h4 className="text-lg font-medium text-white mb-1 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Regular Security Audits
                </h4>
                <p className="text-gray-400 ml-7">
                  Our systems undergo regular security assessments and
                  penetration testing by independent security experts.
                </p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-4 rounded-lg"
              >
                <h4 className="text-lg font-medium text-white mb-1 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Compliance with Standards
                </h4>
                <p className="text-gray-400 ml-7">
                  We follow industry best practices and comply with relevant
                  data protection regulations.
                </p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-4 rounded-lg"
              >
                <h4 className="text-lg font-medium text-white mb-1 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Transparent Privacy Policy
                </h4>
                <p className="text-gray-400 ml-7">
                  Our privacy policy clearly explains how we handle your data,
                  with no hidden surprises.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
