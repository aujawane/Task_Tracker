'use client';

import { useState, useEffect, useRef } from 'react';

interface ClockWheelProps {
  value: string; // HH:MM format
  onChange: (value: string) => void;
  showLabel?: boolean;
  className?: string;
}

export default function ClockWheel({ value, onChange, showLabel = true, className = "" }: ClockWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(23);
  const [minutes, setMinutes] = useState(59);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHours(h);
        setMinutes(m);
      }
    }
  }, [value]);

  const handleScroll = (type: 'hour' | 'minute', e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const itemHeight = 44; // h-11 = 44px
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);

    if (type === 'hour') {
      const hour = Math.max(0, Math.min(23, index));
      if (hour !== hours) {
        setHours(hour);
        onChange(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    } else {
      const minute = Math.max(0, Math.min(59, index));
      if (minute !== minutes) {
        setMinutes(minute);
        onChange(`${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
  };

  // Scroll to current value when opening
  useEffect(() => {
    if (isOpen && hourListRef.current) {
      hourListRef.current.scrollTop = hours * 44;
    }
    if (isOpen && minuteListRef.current) {
      minuteListRef.current.scrollTop = minutes * 44;
    }
  }, [isOpen, hours, minutes]);

  const formatHour = (h: number) => h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {showLabel && <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Due Time</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors flex items-center justify-between gap-2 ${!showLabel ? 'text-xs py-1' : 'py-2.5'}`}
      >
        <span className="truncate">{formatHour(hours)} : {minutes.toString().padStart(2, '0')}</span>
        <svg className={`${showLabel ? 'w-5 h-5' : 'w-3.5 h-3.5'} text-[var(--text-secondary)] flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 left-0 right-0 min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-center py-2 border-b border-[var(--border)] bg-[var(--background)]/50">
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {formatHour(hours)} : {minutes.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex h-40 overflow-hidden bg-[var(--surface)]">
            {/* Hours */}
            <div
              ref={hourListRef}
              onScroll={(e) => handleScroll('hour', e)}
              className="flex-1 overflow-y-auto scrollbar-hide py-16"
              style={{ scrollSnapType: 'y mandatory' }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className={`h-11 flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    hours === i ? 'text-[var(--primary)] font-bold bg-[var(--primary)]/5' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                  onClick={() => {
                    setHours(i);
                    onChange(`${i.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                  }}
                >
                  {formatHour(i)}
                </div>
              ))}
            </div>

            {/* Minutes */}
            <div
              ref={minuteListRef}
              onScroll={(e) => handleScroll('minute', e)}
              className="flex-1 overflow-y-auto scrollbar-hide py-16 border-l border-[var(--border)]"
              style={{ scrollSnapType: 'y mandatory' }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className={`h-11 flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    minutes === i ? 'text-[var(--primary)] font-bold bg-[var(--primary)]/5' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                  onClick={() => {
                    setMinutes(i);
                    onChange(`${hours.toString().padStart(2, '0')}:${i.toString().padStart(2, '0')}`);
                  }}
                >
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 p-2 border-t border-[var(--border)] bg-[var(--background)]/50">
            <button
              type="button"
              onClick={() => {
                setHours(23);
                setMinutes(59);
                onChange('23:59');
              }}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
            >
              End Day
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-bold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}