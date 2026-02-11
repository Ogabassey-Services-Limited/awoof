// import { headers } from "next/headers";
// import LandingPage from "./(desktop)/page";

import Header from "./components/Header";
import ScrollToHash from "./components/ScrollToHash";
import Banner from "./components/HomePage/banner";
import Cloud from "../../public/images/Cloud.svg";
import Image from "next/image";
import About from "./components/HomePage/About";
import TopDeals from "./components/HomePage/TopDeals";
import FAQ from "./components/HomePage/FAQ";
import Partner from "./components/HomePage/Partner";
import Footer from "./components/Footer";
import AnimatedTop from "./components/HomePage/AnimatedTop";

export default async function Home() {
  // const headersList = await headers(); //as unknown as Awaited<ReturnType<typeof headers>>;
  // const ua = headersList.get("user-agent") || "";
  // const isMobile = /mobile/i.test(ua);

  return (
    <main className="bg-[#F8F8F8] w-full min-w-0 overflow-x-hidden">
      <ScrollToHash />
      <div id="hero" className="bg-gradient-to-b from-[#1D4ED8] to-[#FFFFFF] min-h-screen relative">
        {/* Header in its own layer so it's always clickable */}
        <div className="relative z-50 w-full">
          <div className="container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Header />
          </div>
        </div>

        {/* Hero content and banner */}
        <div className="flex justify-center relative z-30 min-h-[inherit] -mt-[72px] pt-[72px]">
          <div className="container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Banner />
          </div>
        </div>

        {/* background phone */}
        <AnimatedTop />

        <Image
          className="absolute bottom-0 left-0 z-0"
          src={Cloud}
          alt=""
        />
      </div>
      <About />
      <TopDeals />
      <FAQ />
      <Partner />
      <Footer />
    </main>
  );
}
