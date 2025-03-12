"use client";

import { useState, useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";

export function SkipToContent() {
  const { settings } = useAccessibility();
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle keyboard focus to show/hide the skip link
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);
  
  // Handle the click event to skip to main content
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Find the main content element
    const mainContent = document.querySelector("#main-content");
    
    if (mainContent) {
      // Set focus to the main content
      (mainContent as HTMLElement).focus();
      
      // Scroll to the main content
      mainContent.scrollIntoView({ behavior: settings.reducedMotion ? "auto" : "smooth" });
    }
  };
  
  return (
    <a
      href="#main-content"
      className={`
        skip-link
        fixed top-0 left-0 z-50
        bg-primary text-primary-foreground
        px-4 py-3 
        transition-transform
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${settings.largeText ? "text-lg" : "text-base"}
        focus:outline-none focus:ring-2 focus:ring-primary
      `}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
} 