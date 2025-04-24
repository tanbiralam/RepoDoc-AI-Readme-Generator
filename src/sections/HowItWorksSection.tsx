"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, FolderGit, Github, Edit, CheckCircle } from "lucide-react";

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
        whileHover={{ scale: 1.05 }}
        className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 
                   shadow-sm transition-all duration-300 relative z-10"
      >
        <div className="absolute -top-6 text-xs font-semibold text-blue-600">
          Step {step.id}
        </div>
        <div className="text-blue-600">{step.icon}</div>
      </motion.div>

      {/* Title */}
      <h3 className="text-base font-medium text-gray-900 mb-3 text-center">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center max-w-[180px]">
        {step.description}
      </p>

      {/* Connector (don't show after the last step) */}
      {index < totalSteps - 1 && (
        <>
          {/* Desktop connector (horizontal) */}
          <div className="hidden md:block absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-0.5 bg-gradient-to-r from-blue-200 to-blue-100"></div>

          {/* Mobile connector (vertical) */}
          <div className="md:hidden absolute top-14 left-1/2 w-0.5 h-10 bg-blue-100 -z-10"></div>
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
      description: "Link your GitHub account securely with a single click",
      icon: <Github className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Select Repo",
      description: "Choose the repository you want to enhance with a README",
      icon: <FolderGit className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Generate README",
      description: "AI analyzes your repo and creates a professional README",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Edit Content",
      description: "Customize and perfect your README to your liking",
      icon: <Edit className="w-6 h-6" />,
    },
    {
      id: 5,
      title: "Commit Changes",
      description: "Save your polished README directly to your repository",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section
        id="how-it-works"
        className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </a>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
