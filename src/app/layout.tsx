import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub README Generator",
  description: "Generate professional READMEs for your GitHub repositories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <SubscriptionProvider>
            <ToastProvider>
              {children}
              <Toaster position="top-center" />
            </ToastProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
