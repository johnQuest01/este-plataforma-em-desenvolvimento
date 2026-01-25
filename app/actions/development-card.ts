'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { UpdateDevelopmentCardPercentageSchema } from '@/schemas/development-card-schema';

const DEVELOPMENT_CARD_ID = 'development-card-single-record';

// Helper function to calculate percentage from date (fallback)
const calculatePercentageFromDate = (): number => {
  const startDate = new Date('2026-01-01').getTime();
  const now = new Date().getTime();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const increment = Math.floor(diffDays / 2);
  return Math.min(69 + increment, 100);
};

// Helper function to check if a day has passed
const hasDayPassed = (date: Date): boolean => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 1;
};

export interface DevelopmentCardPercentageResponse {
  percentage: number;
  isManual: boolean;
  lastManualUpdate: Date | null;
  lastAutoUpdate: Date;
}

export async function getDevelopmentCardPercentage(): Promise<DevelopmentCardPercentageResponse> {
  try {
    let record = await prisma.developmentCardPercentage.findUnique({
      where: { id: DEVELOPMENT_CARD_ID },
    });

    // If no record exists, create one with calculated value
    if (!record) {
      const calculatedPercentage = calculatePercentageFromDate();
      record = await prisma.developmentCardPercentage.create({
        data: {
          id: DEVELOPMENT_CARD_ID,
          percentage: calculatedPercentage,
          isManual: false,
          lastAutoUpdate: new Date(),
        },
      });
      return {
        percentage: record.percentage,
        isManual: record.isManual,
        lastManualUpdate: record.lastManualUpdate,
        lastAutoUpdate: record.lastAutoUpdate,
      };
    }

    // Check if we need to auto-increment
    const now = new Date();
    let shouldAutoIncrement = false;
    let newPercentage = record.percentage;

    if (!record.isManual) {
      // Not manual - always increment if day passed since lastAutoUpdate
      if (hasDayPassed(record.lastAutoUpdate)) {
        shouldAutoIncrement = true;
      }
    } else if (record.lastManualUpdate) {
      // Manual but check if 1 day passed since last manual update
      if (hasDayPassed(record.lastManualUpdate)) {
        shouldAutoIncrement = true;
      }
    }

    if (shouldAutoIncrement && newPercentage < 100) {
      newPercentage = Math.min(newPercentage + 1, 100);
      
      // Update in database
      // When auto-incrementing after manual change, set isManual to false
      // so it continues incrementing daily until user changes it again
      record = await prisma.developmentCardPercentage.update({
        where: { id: DEVELOPMENT_CARD_ID },
        data: {
          percentage: newPercentage,
          isManual: false, // Reset to auto mode so it continues incrementing daily
          lastAutoUpdate: now,
          // Keep lastManualUpdate to track when it was last manually changed
        },
      });
    }

    return {
      percentage: record.percentage,
      isManual: record.isManual,
      lastManualUpdate: record.lastManualUpdate,
      lastAutoUpdate: record.lastAutoUpdate,
    };
  } catch (error) {
    console.error('Error getting development card percentage:', error);
    // Fallback to calculated value
    const calculatedPercentage = calculatePercentageFromDate();
    return {
      percentage: calculatedPercentage,
      isManual: false,
      lastManualUpdate: null,
      lastAutoUpdate: new Date(),
    };
  }
}

export async function updateDevelopmentCardPercentage(
  input: unknown
): Promise<{ success: boolean; percentage: number }> {
  try {
    const validatedInput = UpdateDevelopmentCardPercentageSchema.parse(input);
    
    const now = new Date();
    
    const record = await prisma.$transaction(async (tx) => {
      const existing = await tx.developmentCardPercentage.findUnique({
        where: { id: DEVELOPMENT_CARD_ID },
      });

      if (existing) {
        return await tx.developmentCardPercentage.update({
          where: { id: DEVELOPMENT_CARD_ID },
          data: {
            percentage: validatedInput.percentage,
            isManual: true,
            lastManualUpdate: now,
            lastAutoUpdate: now,
          },
        });
      }

      return await tx.developmentCardPercentage.create({
        data: {
          id: DEVELOPMENT_CARD_ID,
          percentage: validatedInput.percentage,
          isManual: true,
          lastManualUpdate: now,
          lastAutoUpdate: now,
        },
      });
    });

    revalidatePath('/product/jeans');
    
    return {
      success: true,
      percentage: record.percentage,
    };
  } catch (error) {
    console.error('Error updating development card percentage:', error);
    return {
      success: false,
      percentage: 69,
    };
  }
}
