// Notification.jsx
import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const Notification = ({ message, type = 'success', onClose }) => {
  const notificationRef = React.useRef(null);

  useEffect(() => {
    // Animate in
    gsap.fromTo(notificationRef.current, 
      { x: 300, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      gsap.to(notificationRef.current, {
        x: 300,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-pink-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
        return 'ℹ';
      default:
        return '!';
    }
  };

  return (
    <div 
      ref={notificationRef}
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationStyles()} min-w-64 max-w-80`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button 
          onClick={() => {
            gsap.to(notificationRef.current, {
              x: 300,
              opacity: 0,
              duration: 0.3,
              ease: "power2.in",
              onComplete: onClose
            });
          }} 
          className="ml-2 text-white hover:text-gray-200 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;