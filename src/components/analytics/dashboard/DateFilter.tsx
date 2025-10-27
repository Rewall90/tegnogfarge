'use client';

import { useState } from 'react';

export type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'alltime' | 'custom';

export interface DateRange {
  preset: DatePreset;
  startDate: string | null; // ISO date string (YYYY-MM-DD)
  endDate: string | null;   // ISO date string (YYYY-MM-DD)
}

interface DateFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

/**
 * DateFilter - Global date range filter for analytics dashboard
 *
 * Presets: Today | Yesterday | Last 7 Days | Last 30 Days | All Time | Custom
 * Default: Last 7 Days
 */
export function DateFilter({ value, onChange }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper function to format date in local timezone as YYYY-MM-DD
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate date ranges for presets
  const getDateRange = (preset: DatePreset): DateRange => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'today': {
        const dateStr = formatLocalDate(today);
        return { preset, startDate: dateStr, endDate: dateStr };
      }
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = formatLocalDate(yesterday);
        return { preset, startDate: dateStr, endDate: dateStr };
      }
      case 'last7days': {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return {
          preset,
          startDate: formatLocalDate(sevenDaysAgo),
          endDate: formatLocalDate(today),
        };
      }
      case 'last30days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return {
          preset,
          startDate: formatLocalDate(thirtyDaysAgo),
          endDate: formatLocalDate(today),
        };
      }
      case 'alltime':
        return { preset, startDate: null, endDate: null };
      case 'custom':
        return { preset, startDate: customStartDate || null, endDate: customEndDate || null };
      default:
        return { preset: 'last7days', startDate: null, endDate: null };
    }
  };

  const handlePresetClick = (preset: DatePreset) => {
    if (preset === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    onChange(getDateRange(preset));
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onChange({
        preset: 'custom',
        startDate: customStartDate,
        endDate: customEndDate,
      });
      setShowCustom(false);
    }
  };

  const presets: { key: DatePreset; label: string; emoji: string }[] = [
    { key: 'today', label: 'I dag', emoji: '📅' },
    { key: 'yesterday', label: 'I går', emoji: '📆' },
    { key: 'last7days', label: 'Siste 7 dager', emoji: '📊' },
    { key: 'last30days', label: 'Siste 30 dager', emoji: '📈' },
    { key: 'alltime', label: 'All tid', emoji: '🕐' },
    { key: 'custom', label: 'Egendefinert', emoji: '🗓️' },
  ];

  // Get display label for current selection
  const getDisplayLabel = () => {
    if (value.preset === 'custom' && value.startDate && value.endDate) {
      return `${value.startDate} til ${value.endDate}`;
    }
    const preset = presets.find(p => p.key === value.preset);
    return preset ? `${preset.emoji} ${preset.label}` : '📊 Siste 7 dager';
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Periode:</span>
          <span className="text-sm font-semibold text-gray-900">{getDisplayLabel()}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePresetClick(preset.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                value.preset === preset.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustom && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Fra dato
              </label>
              <input
                type="date"
                id="start-date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                Til dato
              </label>
              <input
                type="date"
                id="end-date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleCustomApply}
              disabled={!customStartDate || !customEndDate}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Bruk
            </button>

            <button
              onClick={() => setShowCustom(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
