import { Package, MapPin, Truck } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Header Section */}
      <div className="bg-pink-300 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-12 h-12 mr-2" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Montaga, serif' }}
          >
            Shipping & Delivery Policy
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            We ensure your orders reach you safely, securely, and on time — with complete transparency in our process.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Key Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Discreet Packaging */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Discreet Packaging</h3>
            <p className="text-gray-600 text-sm">
              Plain, unmarked boxes to protect your privacy and ensure a safe delivery.
            </p>
          </div>

          {/* Pan-India Delivery */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Pan-India Delivery</h3>
            <p className="text-gray-600 text-sm">
              Fast, reliable, and trackable delivery services across India.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-pink-100">
          <p className="text-sm text-gray-500 mb-8">Last updated on Oct 8th 2025</p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            For International buyers, orders are shipped and delivered through registered international courier companies
            and/or International speed post only. For domestic buyers, orders are shipped through registered domestic
            courier companies and/or speed post only. Orders are shipped within 8-14 days or as per the delivery date agreed
            at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <span className="font-semibold text-gray-900">SNEAKY APPARELS PRIVATE LIMITED</span> is not liable for any delay
            in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the
            courier company or postal authorities within 8-14 days from the date of the order and payment or as per the
            delivery date agreed at the time of order confirmation.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed
            on your mail ID as specified during registration. For any issues in utilizing our services you may contact our
            helpdesk on <span className="font-medium text-pink-600">8088636488</span> or{" "}
            <span className="font-medium text-pink-600">sneakyapparels@gmail.com</span>.
          </p>

          {/* Disclaimer */}
          <p className="italic text-gray-600 text-sm border-t border-gray-200 mt-10 pt-4 leading-relaxed">
            <strong>Disclaimer:</strong> The above content is created at{" "}
            <span className="font-semibold">SNEAKY APPARELS PRIVATE LIMITED’s</span> sole discretion. Razorpay shall not be
            liable for any content provided here and shall not be responsible for any claims and liability that may arise
            due to merchant’s non-adherence to it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
