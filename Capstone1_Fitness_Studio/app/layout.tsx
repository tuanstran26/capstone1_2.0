import { Oswald, Roboto } from "next/font/google";
import "./globals.css";
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from "next";
import { CartProvider } from "@/lib/CartContext";
import { NotificationProvider } from "@/lib/NotificationContext";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: "--font-oswald",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: 'Fitness Studio',
  description: 'Fitness Studio - Nơi rèn luyện sức khỏe tốt nhất',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-200">
      <body
        className={`${oswald.variable} ${roboto.variable} ${geistSans.variable} ${geistMono.variable} w-full max-w-[1920px] 
        mx-auto bg-white`}
      >
        <CartProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartProvider>
      </body>
    </html>
  );
}

