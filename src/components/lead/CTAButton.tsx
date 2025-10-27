'use client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CTAButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  enablePulse?: boolean; // Controls pulse animation
  className?: string; // Allow additional classes
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Configurable CTA Button for Lead Popups
 *
 * Features:
 * - Optional pulse animation (configurable per campaign)
 * - Loading state with spinner
 * - Disabled state
 * - Maintains brand colors and styling
 */
export function CTAButton({
  text,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  enablePulse = false,
  className = '',
}: CTAButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex-1 inline-flex justify-center items-center rounded-lg
        border border-transparent shadow-lg
        px-8 py-4
        bg-[#FF6F59] text-lg font-bold text-black
        hover:bg-[#e55a43] hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F59]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${enablePulse ? 'animate-pulse-subtle' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="animate-spin h-5 w-5 border-t-2 border-black rounded-full mr-2" />
          Sender...
        </>
      ) : (
        text
      )}
    </button>
  );
}
