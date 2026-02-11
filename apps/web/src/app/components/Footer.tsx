import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Section */}
        <div className="order-1">
          <div className="flex items-center gap-1 mb-4">
            <Logo color="blue" />
          </div>
          <p className="font-normal text-base sm:text-lg md:text-[20px] leading-[147%] tracking-[0.1px] font-inter">
            Unlock exclusive discounts on food, tech, and travel only for
            verified students.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10  flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="order-3 md:order-2 flex justify-start md:justify-center">
          <div>
            <h3 className="font-bold text-xl mb-6">Quick Links</h3>
            <ul className="flex flex-row flex-wrap gap-x-4 gap-y-2 list-none pl-0 md:flex-col md:space-y-4 md:gap-0">
              <li>
                <Link
                  href="/#hero"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/#deals"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Top Deals
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Card */}
        <div className="order-2 md:order-3 bg-[#1D4ED8] rounded-2xl p-8 text-white">
          <h3 className="font-bold text-2xl mb-3">
            Don&apos;t Miss the Next Big Awoof
          </h3>
          <p className="text-sm mb-6 text-blue-100">
            Enter your student email to get early deals.
          </p>
          <div className="flex rounded-full bg-white ">
            <input
              type="email"
              placeholder="Student email"
              className="flex-1 px-4 py-3 font-inter font-medium text-[12px] leading-none tracking-normal text-gray-900 placeholder:text-black border-none focus:outline-none focus:ring-0"
            />
            <button className="bg-[#1D4ED8] font-inter font-bold text-[11px] leading-none tracking-normal text-white m-1 p-3 rounded-full hover:bg-white hover:text-[#1D4ED8] transition-colors flex items-center gap-2">
              Submit
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
