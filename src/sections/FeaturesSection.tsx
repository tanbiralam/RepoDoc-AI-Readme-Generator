"use client";

import { motion } from "framer-motion";
import { Terminal, Code, FileCode, BarChart3, Sparkles } from "lucide-react";

// Updated features without template feature
const features = [
  {
    id: 1,
    title: "AI-Powered Generation",
    description:
      "Generate comprehensive README files instantly with intelligent analysis of your codebase and project structure.",
    size: "large",
  },
  {
    id: 2,
    title: "Live Preview Editor",
    description:
      "Real-time markdown editing with instant preview. See your changes as you type with syntax highlighting.",
    size: "normal",
  },
  {
    id: 3,
    title: "One-Click Export",
    description:
      "Export your README in multiple formats or commit directly to your repository with a single click.",
    size: "normal",
  },
  {
    id: 4,
    title: "Smart Code Analysis",
    description:
      "Automatically detects technologies, dependencies, and project structure to generate relevant documentation sections.",
    size: "large",
  },
];

type Feature = (typeof features)[0];

export default function FeaturesSection() {
  // Enhanced icon mapping with better visual consistency
  const getFeatureIcon = (feature: Feature) => {
    const iconMap = {
      1: <Sparkles className="w-6 h-6" />, // AI-Powered Generation
      2: <Code className="w-6 h-6" />, // Live Preview Editor
      3: <FileCode className="w-6 h-6" />, // One-Click Export
      4: <BarChart3 className="w-6 h-6" />, // Smart Code Analysis
    };

    return (
      iconMap[feature.id as keyof typeof iconMap] || (
        <Terminal className="w-6 h-6" />
      )
    );
  };

  return (
    <section
      id="features"
      className="relative bg-gray-950 py-24 overflow-hidden"
    >
      {/* Background decorative elements - matching the theme */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform translate-x-1/2"></div>
      <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform -translate-x-1/2"></div>

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
          <h2 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4 pb-2">
            Everything You Need
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful tools designed to create professional README files that
            make your projects stand out and attract contributors
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{
                y: -4,
                boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.2)",
              }}
              className={`group relative overflow-hidden flex flex-col bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300
                ${feature.size === "large" ? "lg:col-span-2 p-8" : "p-6"}`}
            >
              {/* Subtle hover background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/5 transition-all duration-300" />

              <div className="relative z-10 flex flex-col h-full">
                <motion.div
                  className="w-12 h-12 bg-gray-800 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {getFeatureIcon(feature)}
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
