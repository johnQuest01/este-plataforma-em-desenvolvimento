'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useTransform, animate, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  Package,
  BadgeCheck,
  RefreshCw,
  HelpCircle,
  Box,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockComponentProps } from '@/types/builder';
import { InfiniteCircularFooterDataSchema, CircularFooterButton } from '@/types/footer';
import { registerFooterUsageAction } from '@/app/actions/footer-actions';

const NavigationFooterBase = ({ config }: BlockComponentProps): React.JSX.Element => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const [itemWidth, setItemWidth] = useState<number>(72);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const validationResult = InfiniteCircularFooterDataSchema.safeParse(config.data);
  const validatedFooterData = validationResult.success ? validationResult.data : null;

  const fluidConfig = useMemo(
    () => ({
      stiffness: 300,
      damping: 30,
      dragResistance: 0.007,
    }),
    []
  );

  useEffect(() => {
    const calculateDimensions = (): void => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setContainerWidth(containerRect.width);
      const gap = 16;
      const buttonSize = 56;
      setItemWidth(buttonSize + gap);
      setIsInitialized(true);
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    const timeoutId = setTimeout(calculateDimensions, 100);

    return () => {
      window.removeEventListener('resize', calculateDimensions);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!validatedFooterData) {
    const validationIssueMessage = validationResult.error?.issues[0]?.message;
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 font-mono text-[10px] text-red-400">
        [LEGO_ERR]: {typeof validationIssueMessage === 'string' ? validationIssueMessage : 'Erro de validação'}
      </div>
    );
  }

  const {
    buttons,
    backgroundColor,
    centerScale,
    edgeScale,
    centerOpacity,
    edgeOpacity,
  } = validatedFooterData;

  const iconMap: Record<string, LucideIcon> = {
    cart: ShoppingCart,
    heart: Heart,
    sync: RefreshCw,
    verified: BadgeCheck,
    'package-check': Package,
    inventory: Box,
    default: HelpCircle,
  };

  const renderIcon = (iconName: string, buttonColor?: string): React.JSX.Element => {
    const IconComponent = iconMap[iconName] ?? iconMap.default;
    const color = buttonColor ?? '#5874f6';
    return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
  };

  const ButtonItem: React.FC<{
    button: CircularFooterButton;
    index: number;
  }> = ({ button, index }) => {
    const targetRoute = button.route || '#';
    const isActive = targetRoute === pathname;

    const restPosition = useMemo(() => {
      if (containerWidth === 0) return 0;
      const centerOffset = containerWidth / 2;
      const buttonOffset = (index - (buttons.length - 1) / 2) * itemWidth;
      return centerOffset + buttonOffset;
    }, [index, containerWidth, itemWidth, buttons.length]);

    const x = useMotionValue(restPosition);
    const xSpring = useSpring(x, { stiffness: fluidConfig.stiffness, damping: fluidConfig.damping });

    useEffect(() => {
      if (containerWidth > 0 && restPosition > 0) {
        x.set(restPosition);
      }
    }, [restPosition, x, containerWidth]);

    const buttonScale = useTransform(xSpring, (latestX) => {
      if (containerWidth === 0) return centerScale;
      const centerX = containerWidth / 2;
      const distanceFromCenter = Math.abs(latestX - centerX);
      const maxDistance = containerWidth / 2;
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
      const calculatedScale = centerScale - normalizedDistance * (centerScale - edgeScale);
      return Math.max(edgeScale, Math.min(centerScale, calculatedScale));
    });

    const buttonOpacity = useTransform(xSpring, (latestX) => {
      if (containerWidth === 0) return centerOpacity;
      const centerX = containerWidth / 2;
      const distanceFromCenter = Math.abs(latestX - centerX);
      const maxDistance = containerWidth / 2;
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
      const calculatedOpacity = centerOpacity - normalizedDistance * (centerOpacity - edgeOpacity);
      return Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity));
    });

    const buttonContent = (
      <motion.div
        drag="x"
        dragElastic={0.3}
        dragMomentum={true}
        dragTransition={{
          bounceStiffness: fluidConfig.stiffness,
          bounceDamping: fluidConfig.damping,
        }}
        onDrag={(_, info) => {
          const currentX = x.get();
          const rawDelta = info.delta.x;
          const resistanceFactor = 1 - 1 / (1 + Math.abs(rawDelta) * fluidConfig.dragResistance * 10);
          x.set(currentX + rawDelta * resistanceFactor);
        }}
        onDragEnd={(_, info) => {
          const velocity = info.velocity.x;
          if (Math.abs(velocity) > 50) {
            const currentX = x.get();
            const targetX = currentX + velocity * 0.1 * fluidConfig.dragResistance;
            animate(x, targetX, {
              type: 'spring',
              stiffness: fluidConfig.stiffness,
              damping: fluidConfig.damping,
              velocity,
            });
          } else {
            animate(x, restPosition, {
              type: 'spring',
              stiffness: fluidConfig.stiffness,
              damping: fluidConfig.damping,
            });
          }
        }}
        style={{
          x: xSpring,
          scale: buttonScale,
          opacity: buttonOpacity,
        }}
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 shadow-xl backdrop-blur-md transition-colors duration-200 touch-manipulation',
          isActive
            ? 'border-[#5874f6] bg-[#5874f6]/90 ring-4 ring-[#5874f6]/20'
            : 'border-gray-200/50 bg-white/80',
          'cursor-grab active:cursor-grabbing'
        )}
      >
        {renderIcon(button.icon, button.color)}
      </motion.div>
    );

    if (button.route) {
      return (
        <Link
          href={targetRoute}
          prefetch={true}
          className="shrink-0"
          style={{ touchAction: 'manipulation' }}
          onClick={async () => {
            await registerFooterUsageAction({
              buttonId: button.id,
              buttonLabel: button.label,
              route: targetRoute,
              interactionType: 'click',
            });
          }}
        >
          {buttonContent}
        </Link>
      );
    }

    return (
      <div className="shrink-0" style={{ touchAction: 'manipulation' }}>
        {buttonContent}
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="flex h-[80px] w-full items-center justify-center">
        <div className="text-sm text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none relative flex h-[80px] w-full items-end overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        className={cn(
          'pointer-events-auto absolute bottom-0 left-0 z-0 h-[60px] w-full',
          'bg-linear-to-t from-[#5874f6]/40 to-[#5874f6]/20 backdrop-blur-xl',
          'border-t border-white/20 shadow-[0_-4px_20px_rgba(88,116,246,0.3)]'
        )}
        style={{ backgroundColor: backgroundColor ? `${backgroundColor}40` : undefined }}
      />

      <div className="relative z-10 flex h-full items-end gap-4 px-4 select-none pointer-events-auto">
        {buttons.map((button, index) => (
          <ButtonItem key={button.id} button={button} index={index} />
        ))}
      </div>
    </div>
  );
};

export const NavigationFooter = NavigationFooterBase;
