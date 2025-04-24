"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-gray-200 py-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        className="flex w-full justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <motion.span
          className="ml-6 flex-shrink-0 text-blue-600"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-4 pr-12"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the README generator work?",
      answer:
        "Our README generator uses AI to analyze your GitHub repository, including its code, structure, and dependencies. Based on this analysis, it creates a tailored README that highlights your project's key features, installation instructions, usage examples, and more. You can then edit and customize this README before committing it to your repository.",
    },
    {
      question: "Do I need to provide any information manually?",
      answer:
        "While our AI can extract most information automatically, you might want to manually add specific details that are important for your project. Our editor makes it easy to customize any part of the generated README.",
    },
    {
      question: "What programming languages and frameworks are supported?",
      answer:
        "Our tool supports all major programming languages and frameworks, including JavaScript, TypeScript, Python, Java, C#, Ruby, Go, PHP, and many more. It can also identify and document common frameworks like React, Angular, Vue, Django, Flask, Spring, and others.",
    },
    {
      question: "Can I use custom templates?",
      answer:
        "Yes! We offer a variety of built-in templates, and Pro and Enterprise users can create and save their own custom templates for repeated use across multiple repositories.",
    },
    {
      question: "How do I commit changes to my GitHub repository?",
      answer:
        "Once you're satisfied with your README, you can use the 'Commit to GitHub' button to push the changes directly to your repository. You'll need to authorize our app with the appropriate GitHub permissions first.",
    },
    {
      question: "Is my code safe?",
      answer:
        "Absolutely. We only analyze your code temporarily to generate the README and never store your source code on our servers. We use secure OAuth authentication with GitHub and only request the permissions necessary to perform the requested actions.",
    },
    {
      question: "Can I generate READMEs for private repositories?",
      answer:
        "Yes, Pro and Enterprise plans support generating READMEs for private repositories. The same security guarantees apply to both public and private repositories.",
    },
    {
      question: "What if I'm not satisfied with the generated README?",
      answer:
        "You can edit any part of the generated README using our intuitive editor. If you're still not satisfied, our Pro and Enterprise plans come with priority support to help address any specific issues.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our README generator
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-600">
              Still have questions? Feel free to{" "}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                contact us
              </a>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
