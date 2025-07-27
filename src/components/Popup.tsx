import { ReactNode, useEffect, useState } from "react";

enum AnimationType {
  FADE = "FADE",
  SLIDE = "SLIDE",
  CLOSE = "CLOSE"
}

interface PopupProps {
  name?: string;
  title?: string;
  content: string | ReactNode;
  closePopup: () => void;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  animationType: AnimationType;
  animationDuration?: number; // Optional duration for the animation
}

export default function Popup({ 
  name, 
  title, 
  content, 
  closePopup, 
  width = "w-80", 
  height = "h-auto", 
  showCloseButton = true,
  animationType,
  animationDuration = 300, // Default duration for animations
}: PopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Start the entrance animation
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 50);

    if (animationType === AnimationType.FADE || animationType === AnimationType.SLIDE) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(closePopup, animationDuration); // Wait for exit animation
      }, animationDuration + 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(enterTimer);
      };
    }

    return () => clearTimeout(enterTimer);
  }, [animationType, closePopup]);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    
    if (isEntering) {
      return `${baseClasses} transform scale-75 opacity-0`;
    }
    
    if (!isVisible) {
      return `${baseClasses} ${animationType === AnimationType.FADE ? 'opacity-0 transform scale-95' : 'transform translate-x-full opacity-0'}`;
    }

    switch (animationType) {
      case AnimationType.FADE:
        return `${baseClasses} opacity-100 transform scale-100`;
      case AnimationType.SLIDE:
        return `${baseClasses} transform translate-x-0 opacity-100 scale-100`;
      default:
        return `${baseClasses} transform scale-100`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`bg-base-200 ${width} ${height} rounded-lg shadow-xl border border-gray-600 max-w-sm ${getAnimationClasses()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-600">
          <h3 className="text-sm font-semibold text-gray-100">
            {title || name || "Notification"}
          </h3>
          {(showCloseButton && animationType === AnimationType.CLOSE) && (
            <button
              className="text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full p-1 transition-colors ml-2"
              onClick={closePopup}
              aria-label="Close popup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-3">
          {typeof content === 'string' ? (
            <p className="text-gray-300 text-sm">{content}</p>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}

// Export the enum for use in other components
export { AnimationType };