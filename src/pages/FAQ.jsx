import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';


const SweetyFAQ = () => {
  const [activeCategory, setActiveCategory] = useState('sizing');
  const [openItems, setOpenItems] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  
  const leftColumnRef = useRef(null);
  const categoryRefs = useRef({});
  const questionRefs = useRef({});


  const categories = [
    {
      id: 'sizing',
      title: 'Sizing & Fit',
      description: 'Find the perfect fit with our comprehensive sizing guide and measurement tips for all body types.',
      questions: [
        {
          question: 'How do I find my correct bra size?',
          answer: 'Measure around your ribcage just under your bust for the band size, and around the fullest part of your bust for the cup size. The difference between these measurements determines your cup size. We recommend getting professionally fitted for the most accurate results.'
        },
        {
          question: 'What if I\'m between sizes?',
          answer: 'If you\'re between sizes, we recommend sizing up for comfort. Our products are designed with slight stretch for a comfortable fit. Check the specific product\'s size guide for detailed measurements.'
        },
        {
          question: 'Do your sizes run true to size?',
          answer: 'Yes, our products generally run true to size. However, we provide detailed measurements for each product to help you make the best choice. Customer reviews often include fit feedback that can be helpful.'
        },
        {
          question: 'Can I exchange for a different size?',
          answer: 'Absolutely! We offer easy size exchanges within 3 days of delivery. The product must be unworn, unwashed, and in original packaging with all tags attached.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Materials',
      description: 'Learn about our premium fabrics, quality standards, and what makes Sweety Intimates special.',
      questions: [
        {
          question: 'What materials are your products made from?',
          answer: 'We use premium quality materials including cotton, microfiber, lace, and breathable synthetic blends. Each product listing includes specific fabric composition details. All materials are tested for comfort and durability.'
        },
        {
          question: 'Are your products suitable for sensitive skin?',
          answer: 'Yes! We prioritize skin-friendly materials. Our cotton range is especially suitable for sensitive skin. All products are hypoallergenic and free from harmful chemicals.'
        },
        {
          question: 'How do I care for my intimate wear?',
          answer: 'Hand wash in cold water with mild detergent is recommended. For machine washing, use a lingerie bag on gentle cycle. Avoid bleach and fabric softeners. Air dry flat or hang to maintain shape and elasticity.'
        },
        {
          question: 'Do you offer wireless/non-padded options?',
          answer: 'Yes! We offer a variety of styles including wireless, lightly padded, heavily padded, and non-padded options. Use our filters to find your preferred style.'
        },
        {
          question: 'What is your quality guarantee?',
          answer: 'We stand behind our products with a quality guarantee. If you receive a defective item, we\'ll replace it free of charge within 3 days of delivery. Please contact our customer service with photos of the defect.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Shipping',
      description: 'Everything about placing orders, tracking shipments, and delivery timelines.',
      questions: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard delivery takes 5-7 business days. Express delivery (available in select cities) takes 2-3 business days. You\'ll receive a tracking number once your order ships.'
        },
        {
          question: 'Do you offer Cash on Delivery (COD)?',
          answer: 'Yes, we offer COD for orders across India. A nominal COD charge may apply. Prepaid orders often qualify for additional discounts.'
        },
        {
          question: 'Can I modify my order after placing it?',
          answer: 'Orders can be modified within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact customer service immediately if you need to make changes.'
        },
        {
          question: 'What if my order is delayed?',
          answer: 'While we strive for timely delivery, delays can occur due to unforeseen circumstances. Track your order using the tracking number provided. If your order is significantly delayed, contact our customer service for assistance.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Currently, we only ship within India. We\'re working on expanding to international shipping soon. Sign up for our newsletter to be notified when international shipping becomes available.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Exchange',
      description: 'Our exchange process to ensure you get the perfect fit and complete satisfaction.',
      questions: [
        {
          question: 'What is your exchange policy?',
          answer: 'We accept exchanges within 3 days of delivery for hygiene reasons. Products must be unworn, unwashed, and in original packaging with all tags attached. Intimate wear cannot be exchanged once worn for hygiene purposes.'
        },
        {
          question: 'How do I initiate an exchange?',
          answer: 'Log into your account, go to Orders, and select the item you wish to exchange. Follow the exchange instructions and select your preferred replacement. You can also contact our customer service for assistance with the exchange process.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We do not offer refunds on intimate wear due to hygiene reasons. However, we provide easy exchanges for different sizes or styles. In case of damaged or defective products, we will replace the item free of charge within 3 days of delivery.'
        },
        {
          question: 'Are there any items that cannot be exchanged?',
          answer: 'For hygiene reasons, we cannot accept exchanges on worn intimate wear, sale items marked as final sale, or customized products. Please check product pages for specific exchange eligibility.'
        },
        {
          question: 'Who pays for exchange shipping?',
          answer: 'For size exchanges and defective products, we provide free return pickup and delivery of the exchanged item. Standard exchange shipping is complimentary to ensure you get the perfect fit.'
        },
        {
          question: 'How long does an exchange take?',
          answer: 'Once we receive your returned item and verify its condition, we will ship the replacement within 2-3 business days. The entire exchange process typically takes 7-10 business days depending on your location.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Privacy',
      description: 'Managing your account, privacy settings, and keeping your information secure.',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Sign In" button and select "Create Account". You can register using your email or phone number. Creating an account helps you track orders, save addresses, and enjoy member benefits.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard encryption to protect your personal and payment information. We never share your data with third parties without your consent. Read our Privacy Policy for complete details.'
        },
        {
          question: 'Can I shop without creating an account?',
          answer: 'Yes, you can checkout as a guest. However, creating an account lets you track orders, save multiple addresses, access your wishlist, and receive exclusive member benefits.'
        },
        {
          question: 'How do I update my account information?',
          answer: 'Log into your account and go to Profile Settings. Here you can update your personal information, delivery addresses, and communication preferences.'
        },
        {
          question: 'What are the benefits of creating an account?',
          answer: 'Account holders get early access to sales, exclusive discounts, faster checkout, order tracking, wishlist functionality, and personalized recommendations based on your preferences.'
        }
      ]
    }
  ];


  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      setIsLoaded(true);
      animateInitialLoad();
      setupScrollTrigger();
    };
    document.head.appendChild(script);


    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);


  const animateInitialLoad = () => {
    if (!window.gsap) return;


    window.gsap.fromTo('.main-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );


    window.gsap.fromTo(leftColumnRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
    );


    categories.forEach((category, categoryIndex) => {
      category.questions.forEach((_, questionIndex) => {
        const questionId = `${category.id}-${questionIndex}`;
        const element = questionRefs.current[questionId];
        if (element) {
          window.gsap.fromTo(element,
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6, 
              delay: 0.4 + (categoryIndex * 0.1) + (questionIndex * 0.05),
              ease: 'power2.out'
            }
          );
        }
      });
    });
  };


  const setupScrollTrigger = () => {
    if (!window.gsap) return;


    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const triggerPoint = scrollY + windowHeight * 0.4;
      
      let newActiveCategory = categories[0].id;
      
      for (let i = categories.length - 1; i >= 0; i--) {
        const category = categories[i];
        const element = categoryRefs.current[category.id];
        
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          
          if (triggerPoint >= elementTop) {
            newActiveCategory = category.id;
            break;
          }
        }
      }


      if (newActiveCategory !== activeCategory) {
        updateActiveCategory(newActiveCategory);
      }
    };


    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  };


  const updateActiveCategory = (newCategory) => {
    if (!window.gsap || !leftColumnRef.current || newCategory === activeCategory) return;


    const leftColumn = leftColumnRef.current;
    
    window.gsap.to(leftColumn, {
      opacity: 0.3,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        setActiveCategory(newCategory);
        
        window.gsap.to(leftColumn, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  };


  const toggleQuestion = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    const isOpening = !openItems[key];
    
    setOpenItems(prev => ({
      ...prev,
      [key]: isOpening
    }));


    if (window.gsap && isOpening) {
      const answerElement = document.querySelector(`#answer-${key}`);
      if (answerElement) {
        window.gsap.fromTo(answerElement,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    }
  };


  const currentCategory = categories.find(cat => cat.id === activeCategory);


  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="bg-white " >
        <div className="max-w-5xl mx-auto px-6 py-20 text-center" >
          <h1 className="main-header text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight opacity-0" style={{ fontFamily: "Montaga, serif" }}>
            Have Questions?
          </h1>
          <h2 className="main-header text-5xl md:text-6xl font-bold bg-pink-300 bg-clip-text text-transparent mb-8 tracking-tight opacity-0" style={{ fontFamily: "Montaga, serif" }}>
            We're Here to Help.
          </h2>
          <p className="main-header text-gray-600 text-lg max-w-2xl mx-auto opacity-0">
            Find answers to common questions about sizing, products, shipping, and more.
          </p>
        </div>
      </div>


      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          
          {/* Left Column - Category Info */}
          <div className="lg:col-span-2 lg:sticky lg:top-1/2 lg:transform lg:-translate-y-1/2 lg:h-fit">
            <div ref={leftColumnRef} className="min-h-[200px]">
              {currentCategory && (
                <>
                  <h2 className="text-4xl font-semibold text-gray-900 mb-6">
                    {currentCategory.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    {currentCategory.description}
                  </p>
                </>
              )}
            </div>
          </div>


          {/* Right Column - Questions */}
          <div className="lg:col-span-3">
            <div className="space-y-16">
              {categories.map((category) => (
                <div
                  key={category.id}
                  ref={(el) => categoryRefs.current[category.id] = el}
                  className="space-y-0"
                >
                  {/* Mobile Category Header */}
                  <div className="lg:hidden mb-8 pb-4 border-b-2 border-pink-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {category.description}
                    </p>
                  </div>


                  {/* Questions */}
                  <div className="space-y-0">
                    {category.questions.map((item, questionIndex) => {
                      const questionKey = `${category.id}-${questionIndex}`;
                      const isOpen = openItems[questionKey];
                      
                      return (
                        <div
                          key={questionKey}
                          ref={(el) => questionRefs.current[questionKey] = el}
                          className="border-b border-pink-100 last:border-b-0 opacity-0"
                        >
                          <button
                            onClick={() => toggleQuestion(category.id, questionIndex)}
                            className="w-full px-0 py-6 text-left flex items-center justify-between hover:bg-pink-50 transition-colors duration-200 group"
                          >
                            <span className="font-medium text-gray-900 text-lg pr-4 group-hover:text-pink-600">
                              {item.question}
                            </span>
                            <div 
                              className="flex-shrink-0 transition-transform duration-300" 
                              style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                            >
                              <Plus className="w-6 h-6 text-pink-500 group-hover:text-pink-600" />
                            </div>
                          </button>
                          
                          {isOpen && (
                            <div 
                              id={`answer-${questionKey}`}
                              className="pb-6 -mt-2"
                            >
                              <p className="text-gray-600 leading-relaxed text-base max-w-3xl">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};


export default SweetyFAQ;
