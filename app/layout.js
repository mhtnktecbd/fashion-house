import { Inter } from "next/font/google";
import "./globals.css";
import { FeatureProvider } from "./providers";
import { getFeatures } from "@/lib/features";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AuthenticBazar",
  description: "Premium Fashion E-commerce",
};

import Navbar from "@/components/Navbar";

export default async function RootLayout({ children }) {
  const features = await getFeatures();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <FeatureProvider features={features}>
          <Navbar />
          <main className="site-main">
            {children}
          </main>
        </FeatureProvider>
      </body>
    </html>
  );
}
