'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  mode?: 'single' | 'multiple' | 'range';
  disabled?: boolean;
}

export function Calendar({
  selected,
  onSelect,
  className,
  mode = 'single',
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  );

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate calendar days
  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const handleDateClick = (date: Date) => {
    if (disabled) return;
    onSelect?.(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(
      new Date(year, month + (direction === 'next' ? 1 : -1), 1)
    );
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className={cn('p-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded"
          disabled={disabled}
        >
          ←
        </button>
        <div className="font-semibold">
          {monthNames[month]} {year}
        </div>
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded"
          disabled={disabled}
        >
          →
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2" />;
          }

          const isSelected = selected && 
            date.getTime() === selected.getTime();
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={date.getTime()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={cn(
                'p-2 text-sm rounded hover:bg-gray-100 disabled:opacity-50',
                isSelected && 'bg-blue-500 text-white hover:bg-blue-600',
                isToday && !isSelected && 'bg-gray-200 font-bold'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
