import { useEffect, useRef } from "react";
import { Facebook, Instagram, Mail } from "lucide-react"; // ✅ replaced Youtube with Mail
import gsap from "gsap";
import Logo from '/LOGO.png'

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current.querySelectorAll(".footer-col"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <footer className="bg-[#F9E2E7] mt-8 md:mt-12">
      <div
        ref={footerRef}
        className="container mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-10 md:py-12"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Logo Section */}
          <div className="footer-col lg:col-span-3 flex flex-col justify-center items-center lg:items-start">
            <img
              src={Logo}
              alt="Sweety Intimates"
              className="h-16 w-auto sm:h-20 lg:h-32 object-contain"
            />
          </div>

          {/* Links Section */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Company Column */}
            <div className="footer-col">
              <h3 className="font-semibold text-black mb-3 sm:mb-4 tracking-wide uppercase text-xs sm:text-sm">
                COMPANY
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/blogs" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    Blogs
                  </a>
                </li>
              </ul>
            </div>

            {/* Policies Column */}
            <div className="footer-col">
              <h3 className="font-semibold text-black mb-3 sm:mb-4 tracking-wide uppercase text-xs sm:text-sm">
                POLICIES
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/return-refund-policy" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    Return & Exchange Policy
                  </a>
                </li>
                <li>
                  <a href="/shipping-policy" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-pink-600 text-sm transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="footer-col lg:col-span-3 flex flex-col justify-center items-center lg:items-end">
            <h3 className="font-semibold text-black mb-4 tracking-wide uppercase text-xs sm:text-sm">
              FOLLOW US
            </h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1DH1BBbq6s/" className="p-2 rounded-full bg-white hover:bg-pink-100 transition-all duration-200 hover:scale-110 shadow-sm">
                <Facebook className="w-5 h-5 text-gray-700 hover:text-pink-600 transition-colors" />
              </a>
              <a href="https://www.instagram.com/sweety_intimates?igsh=MW54aGl1azl3dDl3dw==" className="p-2 rounded-full bg-white hover:bg-pink-100 transition-all duration-200 hover:scale-110 shadow-sm">
                <Instagram className="w-5 h-5 text-gray-700 hover:text-pink-600 transition-colors" />
              </a>
              <a href="mailto:sneakyapparels@gmail.com" className="p-2 rounded-full bg-white hover:bg-pink-100 transition-all duration-200 hover:scale-110 shadow-sm">
                <Mail className="w-5 h-5 text-gray-700 hover:text-pink-600 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-16 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          © 2025 Sweety Intimates. All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
