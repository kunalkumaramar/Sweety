import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ReviewsSection = () => {
  const scrollRef = useRef(null);

  const reviews = [
    {
      id: 1,
      name: "Aanya Kapoor",
      isVerified: true,
      rating: 5,
      gender: "female",
      review:
        "I've tried many brands before, but this one truly stands out. The fabric is soft on the skin, provides great support, and feels comfortable even after long hours of wear. The fit is perfect and true to size, with no digging or slipping. Definitely my new go-to brand for everyday wear!",
      product: "Bright bra | Blue",
      price: "₹. 999.00",
    },
    {
      id: 2,
      name: "Diya Sharma",
      isVerified: true,
      rating: 4,
      gender: "female",
      review:
        "The comfort level is unmatched. The straps don’t slip, and the band feels secure without being tight. The colors are beautiful too!",
      product: "Comfort bra | Red",
      price: "₹. 699.00",
    },
    {
      id: 3,
      name: "Kavya Mehta",
      isVerified: false,
      rating: 5,
      gender: "female",
      review:
        "Superb quality and fit! I was skeptical at first, but this exceeded expectations. Worth every penny.",
      product: "Everyday bra | Black",
      price: "₹. 849.00",
    },
    {
      id: 4,
      name: "Mira Joshi",
      isVerified: true,
      rating: 5,
      gender: "female",
      review:
        "I love how breathable the fabric is. Perfect for daily wear, and the stitching is top-notch. Definitely recommending to friends!",
      product: "Soft Touch | Nude",
      price: "₹. 649.00",
    },
    {
      id: 5,
      name: "Harish Reddy",
      isVerified: true,
      rating: 4,
      gender: "male",
      review:
        "Gifted it to my wife, and she absolutely loves it. Great fit, nice material, and stylish look!",
      product: "Style bra | White",
      price: "₹. 1249.00",
    },
    {
      id: 6,
      name: "Isha Jain",
      isVerified: true,
      rating: 5,
      gender: "female",
      review:
        "Hands down the best I’ve tried so far. The padding is just right, not too much, not too little. Perfect for all-day comfort.",
      product: "Perfect Fit | Pink",
      price: "₹. 949.00",
    },
    {
      id: 7,
      name: "Ananya Gupta",
      isVerified: false,
      rating: 5,
      gender: "female",
      review:
        "Fantastic product! I wasn’t sure initially, but after trying it I’m ordering more. Fits beautifully and looks premium.",
      product: "Classic bra | Green",
      price: "₹. 549.00",
    },
  ];

  // Choose gender-specific image
  const getProfileImage = (gender, id) => {
    if (gender === "male") {
      return `https://randomuser.me/api/portraits/men/${id + 10}.jpg`; // Indian-looking man
    } else {
      return `https://randomuser.me/api/portraits/women/${id + 20}.jpg`; // Indian-looking woman
    }
  };

  // Duplicate for infinite scroll
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    if (scrollContainer) {
      gsap.set(scrollContainer, { x: 0 });

      const scrollWidth = scrollContainer.scrollWidth / 3; // 3 sets

      gsap.to(scrollContainer, {
        x: -scrollWidth,
        duration: 60,
        ease: "linear",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % scrollWidth),
        },
      });
    }
  }, []);

  const StarRating = ({ rating }) => (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#FF8A00" : "#E5E7EB"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-lg px-6 py-8 border border-none w-[350px] mx-6 flex-shrink-0 flex flex-col justify-between">
      {/* Top section */}
      <div>
        <StarRating rating={review.rating} />

        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-black">{review.name}</h3>
          {review.isVerified && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-400">Verified Buyer</span>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed whitespace-normal break-words">
          {review.review}
        </p>
      </div>

      {/* Bottom section pinned */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={getProfileImage(review.gender, review.id)}
              alt={review.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-black mb-1">{review.product}</p>
            <p className="text-lg font-bold text-black">{review.price}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-16 bg-white">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-6xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Montage" }}
          >
            Customer Say!
          </h2>
          <p
            className="text-base font-bold text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Oswald" }}
          >
            Discover What Our Customers Are Raving About and Why They Love Our
            Products!
          </p>
        </div>

        {/* Infinite Scroll Row */}
        <div className="overflow-hidden">
          <div ref={scrollRef} className="flex w-fit">
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
