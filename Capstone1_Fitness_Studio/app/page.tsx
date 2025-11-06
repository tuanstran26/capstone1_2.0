"use client"; // nhớ thêm dòng này ở đầu file vì bạn sẽ dùng useEffect, useState

import { useEffect, useState } from "react";

import About from "@/components/About";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import Classes from "@/components/Classes";
import Hero from "@/components/Hero";
import Membership from "@/components/Membership";
import Team from "@/components/Team";
import Testimonials from "@/components/Testimonials";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBox from "@/components/ChatBox";
import ClientOnly from "@/components/ClientOnly";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import QuickContact from "@/components/QuickContact";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuickContact />
        <About />
        <WhyChooseUs />
        <Classes />
        <Team />
        <Membership />
        <CTA />
        <Testimonials />
        <FAQ />
        <Blog />
        <Brands />
      </main>
      <Footer />

      <ScrollToTop />

      {/* chỉ hiện ChatBox khi có user */}
      {user && (
        <ClientOnly>
          <ChatBox />
        </ClientOnly>
      )}
    </>
  );
}
