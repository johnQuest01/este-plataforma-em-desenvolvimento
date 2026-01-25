'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getDevelopmentCardPercentage, updateDevelopmentCardPercentage } from '@/app/actions/development-card';

// --- Sub-component for Animated Dots (Zero Layout Shift) ---
const LoadingDots = () => {
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <span className="inline-flex ml-0.5 w-3.5 md:w-4 justify-start">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
          variants={dotVariants}
          className="text-sm md:text-base"
        >
          .
        </motion.span>
      ))}
    </span>
  );
};

const SYNC_INTERVAL = 5000; // Sync every 5 seconds
const SAVE_DEBOUNCE = 500; // Save 500ms after user stops changing

export const DevelopmentCard = () => {
  const [percentage, setPercentage] = useState<number>(69);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const pressTimerRef = useRef<number | null>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Load initial percentage from database
  useEffect(() => {
    const loadPercentage = async () => {
      try {
        const data = await getDevelopmentCardPercentage();
        setPercentage(data.percentage);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading percentage:', error);
        setIsInitialized(true);
      }
    };

    loadPercentage();
  }, []);

  // Sync with database periodically
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const syncPercentage = async () => {
      try {
        const data = await getDevelopmentCardPercentage();
        setPercentage((prev) => {
          // Only update if different to avoid unnecessary re-renders
          if (prev !== data.percentage) {
            return data.percentage;
          }
          return prev;
        });
      } catch (error) {
        console.error('Error syncing percentage:', error);
      }
    };

    // Initial sync
    syncPercentage();

    // Set up periodic sync
    syncIntervalRef.current = window.setInterval(syncPercentage, SYNC_INTERVAL);

    return () => {
      if (syncIntervalRef.current !== null) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [isInitialized]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (syncIntervalRef.current !== null) {
        window.clearInterval(syncIntervalRef.current);
      }
      if (pressTimerRef.current !== null) {
        window.clearTimeout(pressTimerRef.current);
      }
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Save function with debounce - saves 500ms after user stops changing
  const savePercentage = useCallback(async (valueToSave: number) => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    pendingValueRef.current = valueToSave;

    saveTimerRef.current = window.setTimeout(async () => {
      if (pendingValueRef.current === null) {
        return;
      }

      setIsUpdating(true);
      try {
        await updateDevelopmentCardPercentage({ percentage: pendingValueRef.current });
        pendingValueRef.current = null;
      } catch (error) {
        console.error('Error updating percentage:', error);
        // Revert on error
        const data = await getDevelopmentCardPercentage();
        setPercentage(data.percentage);
        pendingValueRef.current = null;
      } finally {
        setIsUpdating(false);
      }
    }, SAVE_DEBOUNCE);
  }, []);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(percentage + 1, 100);
    setPercentage(newValue);
    savePercentage(newValue);
  }, [percentage, savePercentage]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(percentage - 1, 0);
    setPercentage(newValue);
    savePercentage(newValue);
  }, [percentage, savePercentage]);

  const handleClickIncrement = useCallback(() => {
    if (!isLongPressRef.current) {
      handleIncrement();
    }
    isLongPressRef.current = false;
  }, [handleIncrement]);

  const handleClickDecrement = useCallback(() => {
    if (!isLongPressRef.current) {
      handleDecrement();
    }
    isLongPressRef.current = false;
  }, [handleDecrement]);

  const startIncrement = useCallback(() => {
    isLongPressRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      if (intervalRef.current !== null) {
        return;
      }
      intervalRef.current = window.setInterval(() => {
        handleIncrement();
      }, 100);
    }, 200);
  }, [handleIncrement]);

  const startDecrement = useCallback(() => {
    isLongPressRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      if (intervalRef.current !== null) {
        return;
      }
      intervalRef.current = window.setInterval(() => {
        handleDecrement();
      }, 100);
    }, 200);
  }, [handleDecrement]);

  const stopInterval = useCallback(() => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[360px] md:max-w-[420px] aspect-square flex items-center justify-center shrink-0"
    >
      {/* 1. BACKGROUND: card-bg-blue.svg */}
      <Image
        src="/card-bg-blue.svg"
        alt="Background"
        fill
        priority
        className="object-contain z-0 drop-shadow-2xl"
        sizes="(max-width: 768px) 360px, 420px"
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full p-8 md:p-10 py-10 md:py-12">
        
        {/* Top Text */}
        <h3 className="text-3xl md:text-4xl font-black text-black tracking-tight mt-1">
          Plataforma
        </h3>

        {/* 2. BANNER + TEXT */}
        <div className="relative w-full flex items-center justify-center py-1 h-14 md:h-16">
          {/* Banner Red */}
          <Image
            src="/card-banner-red.svg"
            alt="Banner Red"
            width={300}
            height={100}
            className="absolute w-[95%] h-auto object-contain z-0 transform -rotate-1"
          />
          {/* Maryland Text */}
          <Image
            src="/text-maryland-outline.svg"
            alt="Maryland"
            width={300}
            height={100}
            className="relative z-10 w-[75%] h-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* 3. PROGRESS BAR: Strictly Contained Architecture */}
        <div className="w-full relative h-14 md:h-16 flex items-center justify-center mt-1">
          
          {/* A. Outer Frame (SVG) - The "Shell" */}
          <Image
            src="/ui-progress-container.svg"
            alt="Progress Container"
            fill
            className="object-contain z-10 pointer-events-none"
            sizes="(max-width: 768px) 360px, 420px"
          />

          {/* B. Inner Content Area - The "Pill Interior" */}
          <div className="absolute inset-[5px] md:inset-[6px] z-20 rounded-full overflow-hidden bg-white">
            
            {/* C. Green Fill (Clean, No Border) */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-[#4ade80] rounded-l-full"
            />

            {/* D. Text Overlay (Centered absolutely over the fill) */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex items-center text-sm md:text-base font-black text-black uppercase tracking-wide"
              >
                <span className="whitespace-nowrap">Em Desenvolvimento</span>
                <LoadingDots />
                <span className="ml-1">{percentage}%</span>
              </motion.div>
            </div>
          </div>

          {/* E. Development Controls (Only visible in development) */}
          {isDevelopment && (
            <div className="absolute -right-12 md:-right-14 flex flex-col gap-2 md:gap-2.5 z-40">
              <button
                type="button"
                onClick={handleClickIncrement}
                onMouseDown={startIncrement}
                onMouseUp={stopInterval}
                onMouseLeave={stopInterval}
                onTouchStart={startIncrement}
                onTouchEnd={stopInterval}
                disabled={isUpdating || percentage >= 100}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black text-white rounded-full text-base md:text-lg font-bold hover:bg-gray-800 active:bg-gray-700 transition-colors select-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Aumentar carregamento"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleClickDecrement}
                onMouseDown={startDecrement}
                onMouseUp={stopInterval}
                onMouseLeave={stopInterval}
                onTouchStart={startDecrement}
                onTouchEnd={stopInterval}
                disabled={isUpdating || percentage <= 0}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black text-white rounded-full text-base md:text-lg font-bold hover:bg-gray-800 active:bg-gray-700 transition-colors select-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Diminuir carregamento"
              >
                −
              </button>
            </div>
          )}
        </div>

        {/* Bottom Text */}
        <p className="text-xl md:text-2xl font-bold text-black mb-0 leading-tight">
          Lançaremos em Breve
        </p>
      </div>
    </motion.div>
  );
};
