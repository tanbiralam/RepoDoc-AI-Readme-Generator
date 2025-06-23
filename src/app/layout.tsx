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
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  const handleClarityLoad = () => {
    console.log("Clarity script loaded successfully");
  };

  const handleClarityError = () => {
    console.log(
      "Clarity script failed to load - possibly blocked by an ad blocker"
    );
  };

  return (
    <html lang="en">
      <head>
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link rel="icon" href="/window.svg" />
        {clarityProjectId && (
          <>
            <Script
              id="clarity-script"
              strategy="afterInteractive"
              onLoad={handleClarityLoad}
              onError={handleClarityError}
            >
              {`
                try {
                  (function(c,l,a,r,i,t,y){
                    if(c[a])return;
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "${clarityProjectId}");
                } catch (e) {
                  console.log('Failed to load Clarity:', e);
                }
              `}
            </Script>
            <noscript>
              <img
                src={`https://www.clarity.ms/tag/${clarityProjectId}/noscript`}
                alt=""
                style={{ display: "none" }}
              />
            </noscript>
          </>
        )}
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
