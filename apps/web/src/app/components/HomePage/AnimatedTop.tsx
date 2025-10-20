"use client";

import React from "react";
import Image from "next/image";
import PhoneImage from "../../../../public/images/iPhone 13 Pro.svg";
import GraduationCap from "../../../../public/images/noto_graduation-large-cap.svg";
import BestDeals from "../../../../public/images/BestDealsIcon.svg";
import New from "../../../../public/images/NewIcon.svg";
import { motion } from "motion/react";

function AnimatedTop() {
  return (
    <div className="absolute bottom-0 right-0">
      <div className="absolute right-[250px] bottom-[480px] z-10">
        <motion.div
          initial={{ y: -100, scale: 1, opacity: 0 }}
          animate={{ y: -50, scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image src={GraduationCap} alt="Graduation Cap" />
        </motion.div>
      </div>

      <motion.div className="absolute right-[420px] bottom-[150px] z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 2.4, }}>
      <Image
        src={BestDeals}
        alt="Best Deals"
      />
      </motion.div>
      <motion.div className="absolute right-[40px] bottom-[600px] z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 2.7, }}>
      <Image
        src={New}
        alt="New"
      />
      </motion.div>
      <div className="relative bottom-0 right-0 z-5">
        <motion.div initial={{ x:200, opacity:0 }} animate={{ x: 0, opacity: 1}} transition={{ duration: 0.7, ease: "easeOut"}}>
          <Image src={PhoneImage} alt="Phone" />
        </motion.div>
      </div>
    </div>
  );
}

export default AnimatedTop;
