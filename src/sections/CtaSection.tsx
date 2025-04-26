"use client";

import { motion } from "framer-motion";
import { Code, Github, Zap } from "lucide-react";

export default function CtaSection() {
  return (
    <section id="cta" className="relative bg-gray-950 py-20">
      {/* Gradient border at top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>

      {/* Background decorative elements */}
      <div className="absolute top-40 left-40 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-40 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/70 border border-gray-800 p-10 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="grid md:grid-cols-[2fr,1.5fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="flex items-center mb-4 space-x-2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">
                    Supercharge Your GitHub Projects
                  </span>
                </motion.div>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Create professional READMEs in seconds
                </motion.h2>
                <motion.p
                  className="text-gray-400 text-lg mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Elevate your GitHub projects with AI-powered README files that
                  highlight your work&apos;s best features and make your
                  repositories stand out from the crowd.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <a
                    href="#generate"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate README
                  </a>
                  <a
                    href="#github"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all duration-300 transform hover:-translate-y-1 border border-gray-700"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Connect Repository
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative overflow-hidden rounded-lg border border-gray-800 shadow-2xl bg-gray-900">
                  <div className="flex items-center justify-start gap-1.5 px-4 py-3 bg-gray-950 border-b border-gray-800">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    <div className="ml-3 text-xs text-gray-400">README.md</div>
                  </div>
                  <div className="p-5 font-mono text-sm text-gray-300 overflow-hidden">
                    <div className="flex items-center text-blue-400 mb-3">
                      <Code className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Your Project Name</span>
                    </div>
                    <div className="h-2 w-3/4 bg-gray-700 rounded mb-3 animate-pulse"></div>
                    <div className="h-2 w-2/3 bg-gray-700 rounded mb-3"></div>
                    <div className="h-2 w-5/6 bg-gray-700 rounded mb-5"></div>

                    <div className="font-semibold text-white mt-4 mb-2">
                      ## Features
                    </div>
                    <div className="flex items-start mb-2">
                      <div className="text-green-400 mr-2">•</div>
                      <div className="h-2 flex-1 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-start mb-2">
                      <div className="text-green-400 mr-2">•</div>
                      <div className="h-2 flex-1 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="text-green-400 mr-2">•</div>
                      <div className="h-2 flex-1 bg-gray-700 rounded"></div>
                    </div>

                    <div className="font-semibold text-white mt-4 mb-2">
                      ## Installation
                    </div>
                    <div className="bg-gray-950 p-2 rounded border border-gray-800 mb-4">
                      <div className="h-2 w-full bg-gray-700 rounded"></div>
                    </div>

                    <div className="h-2 w-2/5 bg-gray-700 rounded mt-4"></div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-10 -z-10"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
