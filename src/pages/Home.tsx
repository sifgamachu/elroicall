import { useEffect } from "react";
import Aurora from "@/components/Aurora";
import Cosmos from "@/components/Cosmos";
import FloatingCall from "@/components/FloatingCall";
import Encounter from "@/components/Encounter";
import Presence from "@/components/Presence";
import CloudOfWitnesses from "@/components/CloudOfWitnesses";
import Majesty from "@/components/Majesty";
import Nav from "@/sections/Nav";
import Hero from "@/sections/Hero";
import TwoAM from "@/sections/TwoAM";
import Ancient from "@/sections/Ancient";
import HowItWorks from "@/sections/HowItWorks";
import Science from "@/sections/Science";
import Stats from "@/sections/Stats";
import Well from "@/sections/Well";
import Manifesto from "@/sections/Manifesto";
import Faq from "@/sections/Faq";
import Gift from "@/sections/Gift";
import Membership from "@/sections/Membership";
import Footer from "@/sections/Footer";

export default function Home() {
  // mark a visit so a return is greeted differently (local only)
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
        <Hero />
        <Majesty
          quote="The heavens declare the glory of God; the skies proclaim the work of His hands."
          reference="Psalm 19:1"
        />
        <Encounter />
        <TwoAM />
        <CloudOfWitnesses />
        <Stats />
        <Majesty
          quote="He determines the number of the stars and calls them each by name. Great is our Lord and mighty in power."
          reference="Psalm 147:4–5"
        />
        <Ancient />
        <HowItWorks />
        <Presence />
        <Science />
        <Well />
        <Manifesto />
        <Faq />
        <Gift />
        <Membership />
        <Footer />
      </main>

      <FloatingCall />
    </div>
  );
}
