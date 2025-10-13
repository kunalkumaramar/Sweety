import { Shield, User } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Header Section */}
      <div className="bg-pink-300 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 mr-2" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Montaga, serif' }}
          >
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            Your privacy is our priority. We are committed to protecting your personal information and ensuring transparency in how we handle your data.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Key Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Data Security */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Data Security</h3>
            <p className="text-gray-600 text-sm">
              We implement robust measures to safeguard your information against unauthorized access.
            </p>
          </div>

          {/* User Control */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Control Your Info</h3>
            <p className="text-gray-600 text-sm">
              You have full control over your personal data, including options to opt-out and request corrections.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-pink-100">
          <p className="text-sm text-gray-500 mb-8">Last updated on Oct 13th 2025</p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            This privacy policy sets out how <span className="font-semibold text-gray-900">SNEAKY APPARELS PRIVATE LIMITED</span> uses and protects any information that you give <span className="font-semibold text-gray-900">SNEAKY APPARELS PRIVATE LIMITED</span> when you visit their website and/or agree to purchase from them.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <span className="font-semibold text-gray-900">SNEAKY APPARELS PRIVATE LIMITED</span> is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <span className="font-semibold text-gray-900">SNEAKY APPARELS PRIVATE LIMITED</span> may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            We may collect the following information:
          </p>

          <ul className="list-disc list-inside text-gray-700 leading-relaxed text-lg mb-6 ml-4">
            <li>Name</li>
            <li>Contact information including email address</li>
            <li>Demographic information such as postcode, preferences and interests, if required</li>
            <li>Other information relevant to customer surveys and/or offers</li>
          </ul>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <strong>What we do with the information we gather</strong><br />
            We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
          </p>

          <ul className="list-disc list-inside text-gray-700 leading-relaxed text-lg mb-6 ml-4">
            <li>Internal record keeping.</li>
            <li>We may use the information to improve our products and services.</li>
            <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
            <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.</li>
          </ul>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <strong>How we use cookies</strong><br />
            A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <strong>Controlling your personal information</strong><br />
            You may choose to restrict the collection or use of your personal information in the following ways:
          </p>

          <ul className="list-disc list-inside text-gray-700 leading-relaxed text-lg mb-6 ml-4">
            <li>whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes</li>
            <li>if you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <span className="font-medium text-pink-600">sneakyapparels@gmail.com</span></li>
          </ul>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
          </p>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            If you believe that any information we are holding on you is incorrect or incomplete, please write to 53, 1st Main Road, Vijayanagar, Bengaluru, Karnataka 560040 or contact us at <span className="font-medium text-pink-600">8088636488</span> or <span className="font-medium text-pink-600">sneakyapparels@gmail.com</span> as soon as possible. We will promptly correct any information found to be incorrect.
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

export default PrivacyPolicy;