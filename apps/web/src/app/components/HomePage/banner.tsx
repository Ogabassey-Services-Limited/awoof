"use client";

import React from "react";
import Applestore from "./applestore";
import Googleplaystore from "./googleplaystore";
import { motion } from "framer-motion";
import SplitText from "@/components/ui/SplitText";

export default function Banner() {
  return (
    <div className="absolute top-[13vh]">
      <div className="text-white max-w-[50%] mx-16 my-16 flex flex-col items-center">
        <div className="font-extrabold text-7xl leading-[95%] tracking-[0.1px] text-center font-inter justify-self-center">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            {" "}
            Your Student ID Just Got More Powerful{" "}
          </motion.div>
        </div>
        <div className="m-6 font-bold text-[20px] leading-[147%] tracking-[0.1px] text-center font-inter w-md justify-self-center">
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
        <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 2 }} className="flex justify-center space-x-4 max-w-md">
          <Googleplaystore />
          <Applestore />
        </motion.div>
      </div>
    </div>
  );
}
