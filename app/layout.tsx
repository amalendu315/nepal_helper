import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { VoucherProvider } from "@/context/VoucherContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nepal Invoice Helper",
  description: "Voucher Processing helper for particular nepal vouchers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VoucherProvider>
          <AuthProvider>
            <Header />
            {children}
            <Footer />
            <Toaster position="top-center" />
          </AuthProvider>
        </VoucherProvider>
      </body>
    </html>
  );
}
