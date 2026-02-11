import React from "react";
import AboutSteps from "./about/About-steps";
import AboutScreenshot from "./about/About-screenshot";

function About() {
  return (
    <div id="how-it-works" className="relative overflow-x-hidden scroll-mt-20">
      <div className="absolute -z-0 pt-6 sm:pt-9 left-0 right-0 text-center sm:text-left">
        <p className="inline-block bg-gradient-to-b from-[#CAD5F6] to-[#FFFFFF] bg-clip-text text-transparent font-black text-[8vw] sm:text-[10.85vw] leading-tight">
          How Awoof Works
        </p>
      </div>
      <div className="relative flex flex-col lg:flex-row justify-center items-center gap-8 sm:gap-10 lg:gap-14 z-10 pt-[14vw] sm:pt-[12vw] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AboutSteps />
        <AboutScreenshot />
      </div>
    </div>
  );
}

export default About;
