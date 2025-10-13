import React from "react";
import { ScrollText } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Header Section */}
      <div className="bg-pink-300 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <ScrollText className="w-12 h-12" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Montaga, serif" }}
          >
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            Please read our terms carefully before using our website or purchasing from us.
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm text-gray-500 text-center mb-12">
          Last updated on Oct 8th 2025
        </p>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-pink-100">
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            For the purpose of these Terms and Conditions, The term “we”, “us”,
            “our” used anywhere on this page shall mean{" "}
            <span className="font-semibold">
              SNEAKY APPARELS PRIVATE LIMITED
            </span>
            , whose registered/operational office is 53, 1st Main Road,
            Vijayanagar, Bangalore, North Karnataka, India 560040. “you”,
            “your”, “user”, “visitor” shall mean any natural or legal person who
            is visiting our website and/or agreed to purchase from us.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Your use of the website and/or purchase from us are governed by the
            following Terms and Conditions:
          </h2>

          <ul className="space-y-4 text-gray-700 leading-relaxed text-lg list-disc pl-6 mb-8">
            <li>
              The content of the pages of this website is subject to change
              without notice.
            </li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee
              as to the accuracy, timeliness, performance, completeness or
              suitability of the information and materials found or offered on
              this website for any particular purpose. You acknowledge that such
              information and materials may contain inaccuracies or errors and
              we expressly exclude liability for any such inaccuracies or errors
              to the fullest extent permitted by law.
            </li>
            <li>
              Your use of any information or materials on our website and/or
              product pages is entirely at your own risk, for which we shall not
              be liable. It shall be your own responsibility to ensure that any
              products, services or information available through our website
              and/or product pages meet your specific requirements.
            </li>
            <li>
              Our website contains material which is owned by or licensed to us.
              This material includes, but is not limited to, the design, layout,
              look, appearance and graphics. Reproduction is prohibited other
              than in accordance with the copyright notice, which forms part of
              these terms and conditions.
            </li>
            <li>
              All trademarks reproduced in our website which are not the
              property of, or licensed to, the operator are acknowledged on the
              website.
            </li>
            <li>
              Unauthorized use of information provided by us shall give rise to
              a claim for damages and/or be a criminal offense.
            </li>
            <li>
              From time to time our website may also include links to other
              websites. These links are provided for your convenience to provide
              further information.
            </li>
            <li>
              You may not create a link to our website from another website or
              document without{" "}
              <span className="font-semibold">
                SNEAKY APPARELS PRIVATE LIMITED’s
              </span>{" "}
              prior written consent.
            </li>
            <li>
              Any dispute arising out of use of our website and/or purchase with
              us and/or any engagement with us is subject to the laws of India.
            </li>
            <li>
              We shall be under no liability whatsoever in respect of any loss
              or damage arising directly or indirectly out of the decline of
              authorization for any transaction, on account of the cardholder
              having exceeded the preset limit mutually agreed by us with our
              acquiring bank from time to time.
            </li>
          </ul>

          {/* Disclaimer */}
          <p className="italic text-gray-600 text-sm border-t border-gray-200 pt-4 leading-relaxed">
            <strong>Disclaimer:</strong> The above content is created at{" "}
            <span className="font-semibold">
              SNEAKY APPARELS PRIVATE LIMITED’s
            </span>{" "}
            sole discretion. Razorpay shall not be liable for any content
            provided here and shall not be responsible for any claims and
            liability that may arise due to merchant’s non-adherence to it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
