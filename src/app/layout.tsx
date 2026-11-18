import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picksy – Student Second-Hand Marketplace",
  description: "Buy, sell, and exchange second-hand products, textbooks, and gear for college students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090711] text-[#F8FAFC] min-h-screen antialiased selection:bg-[#A855F7]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
