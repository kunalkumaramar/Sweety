import {
  Package,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const ReturnRefundPolicy = () => {
  const eligibilityCriteria = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      title: "Eligible Exchanges",
      items: [
        "Product must be unworn, unwashed, and unused",
        "Original tags and packaging must be intact",
        "Hygiene seal must be unbroken",
        "Exchange initiated within 3 days of delivery",
        "Product must be in original saleable condition",
      ],
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      title: "Non-Exchangeable Items",
      items: [
        "Products with broken hygiene seals",
        "Worn, washed, or used products",
        "Items without original tags or packaging",
        "Sale items marked as 'Final Sale'",
        "Customized or personalized products",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-pink-300 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-12 h-12 mr-4" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            style={{ fontFamily: "Montaga, serif" }}
          >
            Exchange Policy
          </h1>
          <p className="text-lg md:text-xl text-center opacity-90 max-w-3xl mx-auto">
            Your satisfaction is our priority. We've made exchanges simple and
            hassle-free.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-12 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Important: Hygiene & Safety Policy
              </h3>
              <p className="text-gray-700">
                Due to the intimate nature of our products, we maintain strict
                hygiene standards. All products must be returned in their
                original condition with hygiene seals intact and tags attached.
                Products that have been worn, washed, or have broken seals
                cannot be accepted for exchanges to ensure the safety and
                hygiene of all our customers.
              </p>
            </div>
          </div>
        </div>

        {/* Exchange Window */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 mb-12">
          <div className="flex items-center mb-6">
            <Clock className="w-8 h-8 text-pink-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              3-Day Exchange Window
            </h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            You have{" "}
            <span className="font-semibold text-pink-600">
              3 days from the date of delivery
            </span>{" "}
            to initiate an exchange. Requests made after this period will not be
            accepted. Please ensure you inspect your order immediately upon
            delivery.
          </p>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Pro Tip:</strong> Take photos/videos while unboxing to
              document the product condition. This helps expedite the exchange
              process if needed.
            </p>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Exchange Eligibility
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {eligibilityCriteria.map((criteria, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100"
              >
                <div className="flex items-center mb-6">
                  {criteria.icon}
                  <h3 className="text-xl font-bold text-gray-900 ml-3">
                    {criteria.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {criteria.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-pink-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation & Refund Policy */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Cancellation & Refund Policy
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Last updated on Oct 8th 2025
          </p>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            <span className="font-semibold text-gray-900">
              SNEAKY APPARELS PRIVATE LIMITED
            </span>{" "}
            believes in helping its customers as far as possible and has
            therefore adopted a liberal cancellation policy.
          </p>

          <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
            <li>
              Cancellations will be considered only if the request is made
              within{" "}
              <span className="font-medium text-pink-600">
                a reasonable time of placing the order
              </span>
              . However, the cancellation request may not be entertained if the
              orders have been communicated to the vendors/merchants and they
              have initiated the process of shipping them.
            </li>

            <li>
              <span className="font-semibold">
                SNEAKY APPARELS PRIVATE LIMITED
              </span>{" "}
              does not accept cancellation requests for perishable items like
              flowers, eatables, etc. However, refund/replacement can be made if
              the customer establishes that the quality of product delivered is
              not good.
            </li>

            <li>
              In case of receipt of damaged or defective items, please report
              the same to our Customer Service team. The request will, however,
              be entertained once the merchant has checked and determined the
              same at their own end. This should be reported within{" "}
              <span className="font-medium text-pink-600">
                a reasonable time of receipt
              </span>{" "}
              of the products.
            </li>

            <li>
              If you feel that the product received is not as shown on the site
              or not as per your expectations, you must bring it to the notice
              of our Customer Service within{" "}
              <span className="font-medium text-pink-600">
                a reasonable time of receiving
              </span>{" "}
              the product. The team will look into your complaint and take an
              appropriate decision.
            </li>

            <li>
              For complaints regarding products that come with a warranty from
              manufacturers, please refer the issue to them directly.
            </li>

            <li>
              In case of any refunds approved by{" "}
              <span className="font-semibold">
                SNEAKY APPARELS PRIVATE LIMITED
              </span>
              , it’ll take
              <span className="font-medium text-pink-600">
                {" "}
                a reasonable time{" "}
              </span>
              for the refund to be processed to the end customer.
            </li>
          </ul>

          <p className="italic text-gray-600 text-sm border-t border-gray-200 mt-10 pt-4 leading-relaxed">
            <strong>Disclaimer:</strong> The above content is created at{" "}
            <span className="font-semibold">
              SNEAKY APPARELS PRIVATE LIMITED’s
            </span>{" "}
            sole discretion. Razorpay shall not be liable for any content
            provided here and shall not be responsible for any claims and
            liability that may arise due to the merchant’s non-adherence to it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
