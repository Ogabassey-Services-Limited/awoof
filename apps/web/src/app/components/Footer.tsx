import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Section */}
        <div>
          <div className="flex items-center gap-1 mb-4">
            <Logo color="blue" />
          </div>
          <p className="ont-normal text-[20px] leading-[147%] tracking-[0.1px] font-inter">
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
        <div className="flex justify-center">
          <div className="">
            <h3 className="font-bold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Top Deals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Card */}
        <div className="bg-[#1D4ED8] rounded-2xl p-8 text-white">
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
            <button className="bg-[#1D4ED8] font-inter font-bold text-[11px] leading-none tracking-normal text-white m-1 p-3 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2">
              Submit
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
