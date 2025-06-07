/**
 * This is a manual test file for the useOptimizedLazyLoading hook.
 * 
 * It's not meant to be run as an automated test, but rather to be used
 * as a reference for how to use the hook in a component.
 * 
 * You can copy this code to a test component to verify the hook is working.
 */

import React from 'react';
import { useOptimizedLazyLoading } from '../useOptimizedLazyLoading';

export function TestLazyLoadingComponent() {
  const { targetRef, isIntersecting, hasIntersected } = useOptimizedLazyLoading({
    rootMargin: '200px 0px',
  });

  return (
    <div>
      <div style={{ height: '100vh' }}>
        <h1>Scroll down to see the lazy loaded content</h1>
      </div>
      
      <div ref={targetRef as React.RefObject<HTMLDivElement>}>
        {isIntersecting ? (
          <div>
            <h2>This content is now visible!</h2>
            <p>The element is currently intersecting: {isIntersecting ? 'Yes' : 'No'}</p>
            <p>The element has been intersected before: {hasIntersected ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

/**
 * Example usage with disabled option for priority content
 */
export function PriorityContent() {
  const { targetRef, isIntersecting } = useOptimizedLazyLoading({
    disabled: true, // Always show, regardless of viewport position
  });

  return (
    <div ref={targetRef as React.RefObject<HTMLDivElement>}>
      <h2>This is priority content that loads immediately</h2>
      <p>isIntersecting will always be true: {isIntersecting ? 'Yes' : 'No'}</p>
    </div>
  );
}

/**
 * Example usage with a different rootMargin
 */
export function CustomRootMarginExample() {
  const { targetRef, isIntersecting } = useOptimizedLazyLoading({
    rootMargin: '400px 0px', // Start loading 400px before element enters viewport
  });

  return (
    <div ref={targetRef as React.RefObject<HTMLDivElement>}>
      {isIntersecting && (
        <div>
          <h2>Content with large rootMargin</h2>
          <p>This content starts loading 400px before it enters the viewport</p>
        </div>
      )}
    </div>
  );
} 