"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FolderGit,
  Github,
  Edit,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface StepData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepItem: React.FC<{
  step: StepData;
  index: number;
  totalSteps: number;
}> = ({ step, index, totalSteps }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative flex flex-1 flex-col items-center"
    >
      {/* Step number and icon container */}
      <motion.div
        whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
        className="w-14 h-14 rounded-xl bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-blue-400 flex items-center justify-center mb-4 
                   shadow-lg transition-all duration-300 relative z-10 group"
      >
        <div className="absolute -top-3 -right-3 text-xs font-semibold text-blue-400 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-700">
          {index + 1}
        </div>
        <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
          {step.icon}
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-medium text-white mb-2 text-center">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 text-center max-w-[200px]">
        {step.description}
      </p>

      {/* Connector (don't show after the last step) */}
      {index < totalSteps - 1 && (
        <>
          {/* Desktop connector (horizontal) */}
          <div className="hidden md:block absolute top-7 left-[calc(50%+30px)] w-[calc(100%-60px)] h-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20"></div>

          {/* Mobile connector (vertical) */}
          <div className="md:hidden absolute top-14 left-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-500/20 to-indigo-500/20 -z-10"></div>
        </>
      )}
    </motion.div>
  );
};

export default function HowItWorksSection() {
  const steps: StepData[] = [
    {
      id: 1,
      title: "Connect GitHub",
      description: "Link your GitHub account securely with OAuth",
      icon: <Github className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Select Repository",
      description: "Choose the project you want to enhance with a README",
      icon: <FolderGit className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Generate README",
      description: "AI analyzes your code and creates a professional README",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Customize Content",
      description: "Edit and refine your README with our intuitive editor",
      icon: <Edit className="w-6 h-6" />,
    },
    {
      id: 5,
      title: "Commit Changes",
      description: "Push your polished README directly to your repository",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative bg-gray-950 py-24 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl transform translate-x-1/2"></div>
      <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transform -translate-x-1/2"></div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="flex items-center rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-sm font-medium text-gray-300">
              <span className="text-blue-400">Process</span>
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transform your repository with a professional README in just five
            simple steps
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="#generate"
            className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 transform hover:-translate-y-1"
          >
            Start Generating READMEs
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm text-gray-500">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
