"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Script from 'next/script';

/**
 * Cloudflare Turnstile Widget Component
 *
 * A reusable React component for integrating Cloudflare Turnstile CAPTCHA.
 * Follows official Cloudflare implementation guidelines.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/
 */

interface TurnstileWidgetProps {
  /** Callback function called when verification is successful */
  onVerify?: (token: string) => void;
  /** Callback function called when verification expires */
  onExpire?: () => void;
  /** Callback function called when verification fails */
  onError?: () => void;
  /** Additional CSS classes for styling */
  className?: string;
  /** Turnstile theme: 'light', 'dark', or 'auto' */
  theme?: 'light' | 'dark' | 'auto';
  /** Turnstile size: 'normal', 'compact', or 'flexible' */
  size?: 'normal' | 'compact' | 'flexible';
}

export interface TurnstileWidgetRef {
  /** Reset the widget (e.g., after form submission error) */
  reset: () => void;
}

// Extend Window interface to include Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget(
    {
      onVerify,
      onExpire,
      onError,
      className = '',
      theme = 'light',
      size = 'normal',
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Expose reset method to parent via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (error) {
            console.error('Error resetting Turnstile widget:', error);
          }
        }
      },
    }));

  useEffect(() => {
    // Render widget when Turnstile script is loaded
    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) {
        return;
      }

      const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

      if (!siteKey) {
        console.error('NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is not configured');
        return;
      }

      try {
        // Remove existing widget if present
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }

        // Render new widget
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (onVerify) {
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (onExpire) {
              onExpire();
            }
          },
          'error-callback': () => {
            if (onError) {
              onError();
            }
          },
          theme,
          size,
        });
      } catch (error) {
        console.error('Error rendering Turnstile widget:', error);
      }
    };

    // Wait for Turnstile to be available
    if (window.turnstile) {
      renderWidget();
    } else {
      // If not loaded yet, wait for script load event
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderWidget();
        }
      }, 100);

      return () => clearInterval(checkTurnstile);
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
    };
  }, [onVerify, onExpire, onError, theme, size]);

    return (
      <>
        {/* Load Cloudflare Turnstile script */}
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />

        {/* Widget container */}
        <div
          ref={containerRef}
          className={`cf-turnstile ${className}`}
          data-sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
        />
      </>
    );
  }
);

export default TurnstileWidget;
