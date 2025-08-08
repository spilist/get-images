"use client";

import { useState, useEffect } from 'react';
import { hasUserApiKey } from '@/lib/api-key-storage';

const DEMO_NOTICE_KEY = 'demo-notice-closed-timestamp';
const SHOW_AGAIN_AFTER_HOURS = 24;

export function useDemoNotice() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // If a user API key is configured, never show the demo notice
    if (hasUserApiKey()) {
      setIsVisible(false);
      setIsLoaded(true);
      return;
    }

    const closedTimestamp = localStorage.getItem(DEMO_NOTICE_KEY);
    
    if (closedTimestamp) {
      const closedTime = parseInt(closedTimestamp, 10);
      const currentTime = Date.now();
      const hoursElapsed = (currentTime - closedTime) / (1000 * 60 * 60);
      
      // Show again if more than 24 hours have passed
      if (hoursElapsed >= SHOW_AGAIN_AFTER_HOURS) {
        // Remove the old timestamp since it's expired
        localStorage.removeItem(DEMO_NOTICE_KEY);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(true);
    }
    
    setIsLoaded(true);
  }, []);

  const closeDemoNotice = () => {
    if (typeof window === 'undefined') return;
    
    // Store current timestamp
    localStorage.setItem(DEMO_NOTICE_KEY, Date.now().toString());
    setIsVisible(false);
  };

  return {
    isVisible: isLoaded && isVisible,
    closeDemoNotice,
    isLoaded
  };
}