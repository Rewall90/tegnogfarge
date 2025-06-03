/**
 * Utility for measuring performance of fill operations
 */

// Interface for performance test results
export interface PerformanceResult {
  operationName: string;
  executionTime: number; // in milliseconds
  memoryUsage?: number; // in MB (if available)
}

/**
 * Measure the performance of a function
 * @param operation - Function to measure
 * @param operationName - Name of the operation for reporting
 * @returns Performance result with execution time
 */
export async function measurePerformance<T>(
  operation: () => T | Promise<T>,
  operationName: string
): Promise<PerformanceResult> {
  // Try to get memory usage before (only works in some browsers)
  const memoryBefore = (window.performance as any).memory?.usedJSHeapSize;
  
  // Measure time
  const startTime = performance.now();
  
  // Execute the operation
  const result = operation();
  
  // If it's a promise, await it
  if (result instanceof Promise) {
    await result;
  }
  
  // Calculate execution time
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  // Try to get memory usage after
  const memoryAfter = (window.performance as any).memory?.usedJSHeapSize;
  
  // Calculate memory usage if available
  let memoryUsage: number | undefined;
  if (memoryBefore !== undefined && memoryAfter !== undefined) {
    memoryUsage = (memoryAfter - memoryBefore) / (1024 * 1024); // Convert to MB
  }
  
  return {
    operationName,
    executionTime,
    memoryUsage
  };
}

/**
 * Run a sequence of flood fill operations to test performance
 * @param fillFunction - The flood fill function to test
 * @param numberOfOperations - Number of consecutive fill operations to perform
 * @param delay - Delay between operations in ms (to simulate user clicks)
 * @returns Array of performance results for each operation
 */
export async function testFloodFillPerformance(
  fillFunction: () => void,
  numberOfOperations: number = 5,
  delay: number = 100
): Promise<PerformanceResult[]> {
  const results: PerformanceResult[] = [];
  
  for (let i = 0; i < numberOfOperations; i++) {
    // Add a small delay to simulate user interaction
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Measure the performance of this fill operation
    const result = await measurePerformance(
      fillFunction,
      `Flood Fill Operation ${i + 1}`
    );
    
    results.push(result);
    
    // Log the result
    console.log(`Operation ${i + 1}: ${result.executionTime.toFixed(2)}ms${
      result.memoryUsage !== undefined ? `, Memory: ${result.memoryUsage.toFixed(2)}MB` : ''
    }`);
  }
  
  // Calculate and log average performance
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
  console.log(`Average execution time: ${avgTime.toFixed(2)}ms`);
  
  const memoryResults = results.filter(r => r.memoryUsage !== undefined);
  if (memoryResults.length > 0) {
    const avgMemory = memoryResults.reduce((sum, r) => sum + (r.memoryUsage || 0), 0) / memoryResults.length;
    console.log(`Average memory usage: ${avgMemory.toFixed(2)}MB`);
  }
  
  return results;
}

/**
 * Add a button to the UI for performance testing
 * This can be used in development to test performance
 * @param container - DOM element to append the button to
 * @param fillFunction - Function that performs a flood fill operation
 */
export function addPerformanceTestButton(
  container: HTMLElement,
  fillFunction: () => void
): void {
  // Create and append button
  const button = document.createElement('button');
  button.textContent = 'Test Performance (5x Fill)';
  button.className = 'px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  
  // Add click handler
  button.addEventListener('click', async () => {
    console.log('Starting performance test...');
    await testFloodFillPerformance(fillFunction, 5, 100);
    console.log('Performance test complete');
  });
  
  // Append to container
  container.appendChild(button);
} 