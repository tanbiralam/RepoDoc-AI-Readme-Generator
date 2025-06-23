import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ToastProvider } from "@/context/ToastContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RepoDoc",
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
        <Script
          defer
          data-domain="repodoc.vercel.app"
          src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-setup" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments) 
            }
          `}
        </Script>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link rel="icon" href="/window.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <SubscriptionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
