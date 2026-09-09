"use client";
/**
 * src/components/Site.jsx — THE PUBLIC PAGE SHELL (was src/App.jsx).
 *
 * Stacks the eight sections in order, with the fixed 3D backdrop behind
 * them. To reorder or remove a section, edit the list inside <div className="relative z-10">.
 * Section ids (used by the navbar) are set inside each component.
 */
import useScrollSpy from "@/hooks/useScrollSpy.js";
import Navbar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Work from "./Work.jsx";
import Experience from "./Experience.jsx";
import Skills from "./Skills.jsx";
import Services from "./Services.jsx";
import Reviews from "./Reviews.jsx";
import Contact from "./Contact.jsx";
import Footer from "./Footer.jsx";
import ScrollTop from "./ScrollTop.jsx";
import SiteBackdrop from "./three/SiteBackdrop.jsx";

export default function Site() {
  const { scrolled, active } = useScrollSpy();

  return (
    <div className="min-h-screen bg-bg text-body font-sans antialiased">
      {/* Fixed 3D layer; everything else stacks above it. Sections keep
          translucent backgrounds so the orb reads through them. */}
      <SiteBackdrop />
      <div className="relative z-10">
        <Navbar scrolled={scrolled} active={active} />
        <Hero />
        <About />
        <Work />
        <Experience />
        <Skills />
        <Services />
        <Reviews />
        <Contact />
        <Footer />
        <ScrollTop show={scrolled} />
      </div>
    </div>
  );
}
