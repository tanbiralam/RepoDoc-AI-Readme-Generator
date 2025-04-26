"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  ArrowRight,
  Eye,
  ArrowUpRight,
  Award,
  Zap,
  Code,
  FileCode,
  Layout,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { features, templates, Feature, Template } from "@/utils/constants";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";

export default function FeaturesSection() {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    template: Template | null;
  }>({
    isOpen: false,
    template: null,
  });

  // Map to associate icons with each feature based on ID
  const getFeatureIcon = (feature: Feature) => {
    const iconMap = {
      1: <Zap className="w-5 h-5" />, // AI-Powered Generation
      2: <Code className="w-5 h-5" />, // Live Editor
      3: <FileCode className="w-5 h-5" />, // One-Click Commit
      4: <Layout className="w-5 h-5" />, // Multiple Templates
      5: <BarChart3 className="w-5 h-5" />, // Smart Analysis
    };

    return (
      iconMap[feature.id as keyof typeof iconMap] || (
        <Terminal className="w-5 h-5" />
      )
    );
  };

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

  const handleOpenPreview = (template: Template | null) => {
    setPreviewModal({
      isOpen: true,
      template,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      template: null,
    });
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gray-950 py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
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
            <div className="flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-white">
              <span className="text-blue-400">Features</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything You Need
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Powerful tools to create professional README files that make your
            projects stand out
          </motion.p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
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
                boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.15)",
              }}
              transition={{ duration: 0.3 }}
              className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 transition-all duration-300 group relative overflow-hidden flex flex-col
                ${
                  feature.size === "large"
                    ? "lg:col-span-2 md:row-span-1 p-8"
                    : "p-6"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 via-blue-500/5 to-blue-500/5 transition-all duration-500" />

              <div className="relative z-10">
                <motion.div
                  className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {getFeatureIcon(feature)}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Templates Section */}
        <motion.div
          className="mt-20 bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800/50 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
              <div>
                <motion.span
                  className="text-blue-400 font-medium"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Premium Templates
                </motion.span>
                <motion.h3
                  className="text-2xl font-bold text-white mt-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Beautiful README Templates
                </motion.h3>
                <motion.p
                  className="text-gray-300 mt-2 md:max-w-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Choose from professionally designed templates that match your
                  project&apos;s style and purpose. Each template is optimized
                  for readability and visual appeal.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 md:mt-0"
              >
                <Link
                  href="#templates"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200"
                >
                  Browse All Templates
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  className="relative group rounded-xl overflow-hidden bg-gray-800/50 border border-gray-800/40 h-80 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * template.id }}
                  whileHover={{ y: -5 }}
                >
                  {/* Preview Image */}
                  <div className="p-2 pt-3 h-44 overflow-hidden relative">
                    <div className="absolute top-2 right-2 z-20 flex gap-1.5">
                      {template.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900/80 border border-gray-700/50 relative flex items-center justify-center">
                      {/* Placeholder for template image */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Terminal className="w-10 h-10 text-gray-700" />
                      </div>

                      {/* When you have real template images, use this: */}
                      {/* <Image 
                        src={template.image}
                        alt={template.name}
                        fill
                        className="object-cover"
                      /> */}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-white font-medium text-lg">
                      {template.name}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1 flex-1">
                      {template.description}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <button
                        onClick={() => handleOpenPreview(template)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <Link
                        href="#use-template"
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors duration-200"
                      >
                        Use Template
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Customization Note */}
            <motion.div
              className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="rounded-full bg-blue-500/20 p-1.5 mt-0.5">
                <Award className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-100">
                  <span className="font-medium">Pro tip:</span> All templates
                  are fully customizable. You can easily modify colors,
                  sections, and layouts to match your project&apos;s branding
                  and requirements.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        template={previewModal.template}
      />
    </section>
  );
}
