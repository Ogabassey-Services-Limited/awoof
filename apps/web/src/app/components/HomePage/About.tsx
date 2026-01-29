import React from "react";
import AboutSteps from "./about/About-steps";
import AboutScreenshot from "./about/About-screenshot";

function About() {
  return (
    <div>
      <div className="absolute -z-0 pt-9">
        <p className="inline-block bg-gradient-to-b from-[#CAD5F6] to-[#FFFFFF] bg-clip-text text-transparent font-black text-[10.85vw] leading-tight">
          How Awoof Works
        </p>
      </div>
      <div className="relative flex justify-center items-center gap-14 z-10 pt-[12vw] px-8">
        <AboutSteps/>
        <AboutScreenshot/>
      </div>
    </div>
  );
}

export default About;
