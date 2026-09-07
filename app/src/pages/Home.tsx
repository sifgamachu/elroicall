import { useEffect } from "react";
import Aurora from "@/components/Aurora";
import Cosmos from "@/components/Cosmos";
import FloatingCall from "@/components/FloatingCall";
import Encounter from "@/components/Encounter";
import Presence from "@/components/Presence";
import CloudOfWitnesses from "@/components/CloudOfWitnesses";
import Nav from "@/sections/Nav";
import Hero from "@/sections/Hero";
import TwoAM from "@/sections/TwoAM";
import HowItWorks from "@/sections/HowItWorks";
import Well from "@/sections/Well";
import Faq from "@/sections/Faq";
import Gift from "@/sections/Gift";
import Membership from "@/sections/Membership";
import Footer from "@/sections/Footer";

export default function Home() {
  useEffect(() => {
    try {
      localStorage.setItem("elroi-visited", "1");
    } catch {
      /* private mode — no memory */
    }
  }, []);

  return (
    <div className="grain relative min-h-screen bg-ink text-parchment">
      <Cosmos />
      <Aurora />

      <Nav />
      <main>
        {/* Connect first: visitor → need → biblical story. */}
        <Hero />
        <Encounter />

        {/* Emotional proof that the product understands the moment. */}
        <TwoAM />
        <CloudOfWitnesses />

        {/* Explain only after the visitor has felt the idea. */}
        <HowItWorks />
        <Presence />
        <Well />

        {/* Conversion and trust. */}
        <Gift />
        <Membership />
        <Faq />
        <Footer />
      </main>

      <FloatingCall />
    </div>
  );
}
