'use client';

import React from 'react';
import { Progress as HeroUIProgress } from '@heroui/react';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValueLabel?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
}

export function Progress({
  value,
  max = 100,
  className,
  color = 'primary',
  size = 'md',
  label,
  showValueLabel = false,
  formatOptions,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <HeroUIProgress
      value={percentage}
      color={color}
      size={size}
      className={className}
      label={label}
      showValueLabel={showValueLabel}
      formatOptions={formatOptions}
    />
  );
}

export default Progress;
