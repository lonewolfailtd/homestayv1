'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addMonths, startOfDay, isBefore, isAfter, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Menu, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface InteractiveCalendarProps {
  selectedDates: {
    checkIn: string;
    checkOut: string;
  };
  onDateChange: (dates: { checkIn: string; checkOut: string }) => void;
}


// Peak periods with 20% surcharge - exact dates from business requirements
const peakPeriods = [
  { start: new Date('2024-12-28'), end: new Date('2025-01-05'), name: 'New Year Period', days: 9 },
  { start: new Date('2025-01-25'), end: new Date('2025-01-27'), name: 'Auckland Anniversary', days: 3 },
  { start: new Date('2025-02-07'), end: new Date('2025-02-09'), name: 'Waitangi Day', days: 3 },
  { start: new Date('2025-04-18'), end: new Date('2025-04-21'), name: 'Easter Weekend', days: 4 },
  { start: new Date('2025-04-25'), end: new Date('2025-04-27'), name: 'ANZAC Day', days: 3 },
  { start: new Date('2025-05-31'), end: new Date('2025-06-02'), name: "King's Birthday", days: 3 },
  { start: new Date('2025-06-20'), end: new Date('2025-06-22'), name: 'Matariki', days: 3 },
  { start: new Date('2025-10-25'), end: new Date('2025-10-27'), name: 'Labour Day', days: 3 },
  { start: new Date('2025-12-20'), end: new Date('2025-12-28'), name: 'Christmas/Boxing Day', days: 9 },
];

export default function InteractiveCalendar({ selectedDates, onDateChange }: InteractiveCalendarProps) {
  const [mode, setMode] = useState<'single' | 'range'>('range');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const today = startOfDay(new Date());
  const minDate = today;

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert string dates to Date objects
  const checkInDate = selectedDates.checkIn ? new Date(selectedDates.checkIn) : undefined;
  const checkOutDate = selectedDates.checkOut ? new Date(selectedDates.checkOut) : undefined;

  const isPeakPeriod = (date: Date) => {
    return peakPeriods.some(period => 
      date >= startOfDay(period.start) && date <= startOfDay(period.end)
    );
  };

  const isUnavailable = (date: Date) => {
    // Mock unavailable dates - in production, this would check actual availability
    return false;
  };

  const handleDayClick = (date: Date | undefined) => {
    if (!date || isBefore(date, minDate)) return;

    if (mode === 'single' || !checkInDate || (checkInDate && checkOutDate)) {
      // Start new selection
      onDateChange({
        checkIn: format(date, 'yyyy-MM-dd'),
        checkOut: '',
      });
      setIsSelectingCheckOut(true);
    } else if (checkInDate && !checkOutDate) {
      // Select check-out date
      if (isBefore(date, checkInDate)) {
        // If selected date is before check-in, start over
        onDateChange({
          checkIn: format(date, 'yyyy-MM-dd'),
          checkOut: '',
        });
      } else {
        onDateChange({
          checkIn: selectedDates.checkIn,
          checkOut: format(date, 'yyyy-MM-dd'),
        });
        setIsSelectingCheckOut(false);
      }
    }
  };


  const clearSelection = () => {
    onDateChange({ checkIn: '', checkOut: '' });
    setIsSelectingCheckOut(false);
  };

  // Custom day modifiers
  const modifiers = {
    selected: checkInDate ? [checkInDate] : [],
    range_start: checkInDate ? [checkInDate] : [],
    range_end: checkOutDate ? [checkOutDate] : [],
    range_middle: checkInDate && checkOutDate ? 
      { from: checkInDate, to: checkOutDate } : undefined,
    peak: (date: Date) => isPeakPeriod(date),
    unavailable: (date: Date) => isUnavailable(date),
    disabled: (date: Date) => isBefore(date, minDate),
  };

  const modifiersStyles = {
    selected: {
      backgroundColor: '#000000', // Black for selected dates - highest priority
      color: 'white',
      borderRadius: '8px',
      fontWeight: 'bold',
      zIndex: 10,
    },
    range_start: {
      backgroundColor: '#000000',
      color: 'white',
      borderRadius: '8px 0 0 8px',
      fontWeight: 'bold',
      zIndex: 10,
    },
    range_end: {
      backgroundColor: '#000000',
      color: 'white',
      borderRadius: '0 8px 8px 0',
      fontWeight: 'bold',
      zIndex: 10,
    },
    range_middle: {
      backgroundColor: '#f3f4f6', // Light gray for range middle
      color: '#000000',
      fontWeight: 'normal',
      border: '1px solid #d1d5db',
    },
    peak: {
      backgroundColor: '#cffafe', // Light cyan for peak periods - lower priority than selections
      color: '#0891b2',
      fontWeight: 'normal',
      border: '1px solid #22d3ee',
      borderRadius: '4px',
    },
    unavailable: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
      textDecoration: 'line-through',
    },
    disabled: {
      color: '#D1D5DB',
      cursor: 'not-allowed',
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap">
          <div className="mb-2 md:mb-0">
            <h3 className="font-button font-semibold text-black">Select Your Dates</h3>
            <p className="text-sm text-gray-600 font-body">
              {mode === 'range' ? 'Choose check-in and check-out dates' : 'Choose a single date'}
            </p>
            <p className="text-xs text-cyan-600 font-body mt-1">
              💡 We charge by day rates (total days of stay)
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-1 rounded-lg text-sm font-button transition-colors ${
                mode === 'single' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Single Date
            </button>
            <button
              onClick={() => setMode('range')}
              className={`px-3 py-1 rounded-lg text-sm font-button transition-colors ${
                mode === 'range' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Date Range
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Legend - moved to top as compact bar */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-xs font-body">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-black rounded mr-2"></div>
              <span>Selected Dates</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-200 border border-cyan-400 rounded mr-2"></div>
              <span className="font-medium">Peak Period (+20%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
              <span>Past Dates</span>
            </div>
            {/* Show clear button if dates selected */}
            {(checkInDate || checkOutDate) && (
              <button
                onClick={clearSelection}
                className="ml-auto text-gray-600 hover:text-black font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className={`w-full flex justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
          <style jsx global>{`
            .rdp {
              --rdp-cell-size: 64px;
              --rdp-accent-color: #000000;
              --rdp-background-color: #000000;
              margin: 0 auto;
              width: 100%;
              max-width: 600px;
              min-width: 320px;
            }
            .rdp-months {
              display: flex;
              justify-content: center;
              gap: 2rem;
            }
            .rdp-month {
              width: 100%;
            }
            .rdp-table {
              margin: 0;
              width: 100%;
              table-layout: fixed;
            }
            .rdp-head_cell {
              font-size: 1rem;
              font-weight: 600;
              color: #6B7280;
              padding: 0.75rem;
            }
            .rdp-cell {
              text-align: center;
              position: relative;
            }
            .rdp-button {
              width: var(--rdp-cell-size);
              height: var(--rdp-cell-size);
              border-radius: 0.5rem;
              border: none;
              background: transparent;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              font-family: var(--font-button);
            }
            .rdp-button:hover {
              background-color: #F3F4F6;
            }
            .rdp-button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
            .rdp-day_today {
              font-weight: 600;
              color: #000000;
              border: 2px solid #000000;
              border-radius: 6px;
            }
            .rdp-caption {
              display: flex;
              align-items: center;
              justify-content: between;
              padding: 0 0 1rem 0;
              margin: 0;
            }
            .rdp-caption_label {
              font-size: 1.25rem;
              font-weight: 700;
              color: #111827;
              margin: 0 auto;
              font-family: var(--font-heading);
            }
            .rdp-nav {
              display: flex;
              gap: 0.5rem;
            }
            .rdp-nav_button {
              width: 2rem;
              height: 2rem;
              border-radius: 0.5rem;
              border: 1px solid #D1D5DB;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            .rdp-nav_button:hover {
              background-color: #F3F4F6;
            }
            
            /* Mobile-specific styles */
            @media (max-width: 768px) {
              .rdp {
                --rdp-cell-size: 48px;
              }
              .rdp-months {
                flex-direction: column;
                gap: 1rem;
              }
              .rdp-button {
                width: var(--rdp-cell-size);
                height: var(--rdp-cell-size);
                font-size: 1rem;
              }
              .rdp-nav_button {
                width: 2.5rem;
                height: 2.5rem;
              }
              .rdp-caption_label {
                font-size: 1rem;
              }
              .rdp-head_cell {
                font-size: 0.75rem;
                padding: 0.25rem;
              }
            }
            
            /* Touch-friendly interactions */
            @media (hover: none) and (pointer: coarse) {
              .rdp-button:hover {
                background-color: transparent;
              }
              .rdp-button:active {
                background-color: #F3F4F6;
                transform: scale(0.95);
              }
              .rdp-nav_button:hover {
                background-color: white;
              }
              .rdp-nav_button:active {
                background-color: #F3F4F6;
                transform: scale(0.95);
              }
            }
          `}</style>
          
          <DayPicker
            mode="single"
            required={false}
            selected={checkInDate}
            onSelect={handleDayClick}
            numberOfMonths={1}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            fromDate={minDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            showOutsideDays
            fixedWeeks
            className={isMobile ? 'rdp-mobile' : ''}
          />
        </div>
      </div>

      {/* Selection Summary */}
      {(checkInDate || checkOutDate) && (
        <div className={`bg-white ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-t border-gray-100`}>
          <div className={`${isMobile ? 'block space-y-3' : 'flex items-center justify-between'}`}>
            <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'flex items-center space-x-6'}`}>
              {checkInDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-black mr-2" />
                  <div>
                    <div className="text-xs font-body text-gray-600">Check-in</div>
                    <div className="font-button font-medium text-black">
                      {format(checkInDate, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              )}
              
              {checkOutDate && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-black mr-2" />
                  <div>
                    <div className="text-xs font-body text-gray-600">Check-out</div>
                    <div className="font-button font-medium text-black">
                      {format(checkOutDate, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              )}
              
              {checkInDate && checkOutDate && (
                <div className="text-sm font-body text-gray-600">
                  {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                </div>
              )}
            </div>
            
            {isSelectingCheckOut && (
              <div className="text-sm font-body text-black">
                Select your check-out date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}