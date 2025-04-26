"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50 backdrop-blur-sm relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <div className="absolute -inset-px rounded-lg opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-500 to-indigo-600 blur-sm transition-all duration-300" />
      <button
        className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none relative z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-blue-400 flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-gray-400">
              <p>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the AI README generator work?",
      answer:
        "Our AI analyzes your GitHub repository to understand its structure, code, and purpose. It then generates a professionally formatted README tailored to your project, highlighting key features, installation steps, and usage examples.",
    },
    {
      question: "Do I need technical knowledge to use this tool?",
      answer:
        "No technical expertise is required. Our user-friendly interface guides you through the process, and the AI handles the technical aspects of creating the README content based on your repository.",
    },
    {
      question: "Can I edit the generated README?",
      answer:
        "Absolutely! After generation, you can fully edit the README using our built-in markdown editor. You can add, remove, or modify content as needed before committing it to your repository.",
    },
    {
      question: "Is my repository data secure?",
      answer:
        "We prioritize your data security. We only access the repository information you explicitly authorize, and we don't store your code or sensitive data. All connections are secured with industry-standard encryption.",
    },
    {
      question: "Can I use custom templates?",
      answer:
        "Yes, we offer a variety of built-in templates, and premium users can create and save custom templates that match their project's style and branding requirements.",
    },
    {
      question: "How do I push changes to my GitHub repository?",
      answer:
        "After creating or editing your README, you can commit it directly to your repository with a single click. Our tool handles the GitHub authentication and commit process seamlessly.",
    },
  ];

  return (
    <section id="faq" className="relative bg-gray-950 py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
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
              <span className="text-blue-400">FAQ</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Everything you need to know about our GitHub README generator
          </motion.p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-400 mb-6">
            Still have questions? We&apos;re here to help!
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 transform hover:-translate-y-1"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
