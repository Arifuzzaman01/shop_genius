import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import QueryProvider from "../providers/queryProvider";
import Footer from "@/components/footer/Footer";
import AuthSessionProvider from "../providers/sessionProvider";
import { Toaster } from "react-hot-toast";
// import { CartProvider } from "@/contexts/CartContext";
import ReduxProvider from "../providers/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopGenius",
  description: "Your intelligent shopping companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ReduxProvider>
            <Header />
            <main>
              <QueryProvider>{children}</QueryProvider>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </ReduxProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}