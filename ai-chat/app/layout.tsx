import type { Metadata } from "next";
import "./globals.css";
import AIAssistant from "@/components/AIAssistant";

export const metadata: Metadata = {
  title: "Indigo Hub AI",
  description: "AI-powered documentation assistant for the Indigo Protocol education docs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
        {/* Floating AI assistant — present on every page */}
        <AIAssistant />
      </body>
    </html>
  );
}
