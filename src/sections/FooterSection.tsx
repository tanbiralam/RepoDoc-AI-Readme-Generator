"use client";

import { motion } from "framer-motion";

export default function FooterSection() {
  const navigation = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Security", href: "#security" },
      { name: "FAQ", href: "#faq" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Jobs", href: "/jobs" },
      { name: "Press", href: "/press" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookie Policy", href: "/cookie-policy" },
    ],
    social: [
      {
        name: "GitHub",
        href: "https://github.com",
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Twitter",
        href: "https://twitter.com",
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        ),
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com",
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        ),
      },
    ],
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <footer
      className="relative bg-gradient-to-b from-gray-900 to-gray-950"
      aria-labelledby="footer-heading"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900 rounded-full opacity-5 blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900 rounded-full opacity-5 blur-3xl transform translate-y-1/2"></div>
      </div>

      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container relative z-10 mx-auto px-4 py-10 lg:py-12">
        <motion.div
          className="xl:grid xl:grid-cols-3 xl:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6 xl:col-span-1">
            <div>
              <motion.h3
                className="text-xl font-semibold text-white"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                GitHub README Generator
              </motion.h3>
              <motion.p
                className="mt-2 text-base text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Create beautiful README files for your GitHub repositories in
                seconds.
              </motion.p>
            </div>
            <motion.div
              className="flex space-x-5"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {navigation.social.map((socialItem) => (
                <motion.a
                  key={socialItem.name}
                  href={socialItem.href}
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  variants={item}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="sr-only">{socialItem.name}</span>
                  {socialItem.icon}
                </motion.a>
              ))}
            </motion.div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Product
                </h3>
                <ul role="list" className="mt-3 space-y-3">
                  {navigation.product.map((navItem) => (
                    <motion.li key={navItem.name} variants={item}>
                      <a
                        href={navItem.href}
                        className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                      >
                        {navItem.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="mt-10 md:mt-0"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-3 space-y-3">
                  {navigation.company.map((navItem) => (
                    <motion.li key={navItem.name} variants={item}>
                      <a
                        href={navItem.href}
                        className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                      >
                        {navItem.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-3 space-y-3">
                  {navigation.legal.map((navItem) => (
                    <motion.li key={navItem.name} variants={item}>
                      <a
                        href={navItem.href}
                        className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                      >
                        {navItem.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="mt-10 md:mt-0"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Support
                </h3>
                <ul role="list" className="mt-3 space-y-3">
                  <motion.li variants={item}>
                    <a
                      href="/contact"
                      className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    >
                      Contact Us
                    </a>
                  </motion.li>
                  <motion.li variants={item}>
                    <a
                      href="/support"
                      className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    >
                      Help Center
                    </a>
                  </motion.li>
                  <motion.li variants={item}>
                    <a
                      href="/status"
                      className="text-base text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    >
                      Status
                    </a>
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="mt-10 border-t border-gray-800 pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-base text-gray-500 xl:text-center">
            &copy; {new Date().getFullYear()} GitHub README Generator. All
            rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
