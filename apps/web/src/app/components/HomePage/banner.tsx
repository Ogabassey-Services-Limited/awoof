"use client";

import React from "react";
import Applestore from "./applestore";
import Googleplaystore from "./googleplaystore";
import { motion } from "framer-motion";
import SplitText from "@/components/ui/SplitText";

export default function Banner() {
  return (
    <div className="absolute inset-0 flex justify-center items-center px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="text-white w-full max-w-[90%] sm:max-w-[75%] lg:max-w-[50%] mx-auto flex flex-col items-center justify-center text-center pointer-events-auto">
        <div className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-[0.1px] font-inter">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Your Student ID Just Got More Powerful
          </motion.div>
        </div>
        <div className="mt-4 sm:mt-6 font-bold text-base sm:text-lg lg:text-[20px] leading-[147%] tracking-[0.1px] font-inter max-w-md">
          <SplitText
            text="Unlock exclusive discounts on food, tech, and travel only for verified students."
            delay={15}
            startDelay={1.4}
            duration={1}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </div>
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-md"
        >
          <Googleplaystore />
          <Applestore />
        </motion.div>
      </div>
    </div>
  );
}
