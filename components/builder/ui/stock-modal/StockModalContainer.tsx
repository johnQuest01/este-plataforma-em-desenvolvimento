'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const modalVariants: Variants = {
  hidden: { scale: 0.96, opacity: 0, y: 15 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", damping: 30, stiffness: 400 } },
  exit: { scale: 0.98, opacity: 0, y: 10, transition: { duration: 0.15 } }
};

interface StockModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const StockModalContainer = ({ isOpen, onClose, children }: StockModalContainerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden" animate="visible" exit="exit"
            className={cn(
              "relative bg-[#eeeeee] w-full max-w-[360px]",
              "h-[85%] max-h-[85%] flex flex-col",
              "rounded-3xl shadow-2xl overflow-hidden border border-gray-200",
              "will-change-transform"
            )}
          >
            <div className="flex-1 relative overflow-hidden bg-[#eeeeee] w-full h-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};