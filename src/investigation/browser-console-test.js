/**
 * Browser Console Investigation Script
 * 
 * Copy and paste this script into your browser's console while on a coloring page
 * to run the history optimization investigation.
 * 
 * Usage:
 * 1. Open a coloring page in your app
 * 2. Open browser dev tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

(function() {
  console.log('🔍 Starting History Optimization Investigation...\n');
  
  // Find canvas elements
  const mainCanvas = document.querySelector('canvas[style*="cursor-crosshair"]') || 
                    document.querySelector('canvas[style*="z-20"]') ||
                    document.querySelector('canvas');
  
  const backgroundCanvas = document.querySelector('canvas[style*="z-0"]');
  const fillCanvas = document.querySelector('canvas[style*="z-10"]');
  
  if (!mainCanvas) {
    console.error('❌ No canvas found! Make sure you\'re on a coloring page.');
    return;
  }
  
  console.log('✅ Found canvas:', mainCanvas.width + 'x' + mainCanvas.height);
  
  // Memory Analysis
  function analyzeMemory() {
    console.log('\n📊 MEMORY ANALYSIS');
    console.log('==================');
    
    const ctx = mainCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Calculate ImageData size
    const imageDataSize = imageData.data.length; // bytes
    const imageDataMB = imageDataSize / 1024 / 1024;
    
    console.log(`Canvas dimensions: ${mainCanvas.width}x${mainCanvas.height}`);
    console.log(`ImageData size: ${imageDataMB.toFixed(2)} MB (${imageDataSize.toLocaleString()} bytes)`);
    
    // Simulate typical pixel changes (1-5% of pixels)
    const totalPixels = mainCanvas.width * mainCanvas.height;
    const scenarios = [
      { name: 'Small pencil stroke', changePercent: 0.1, description: 'Size 10 brush, short line' },
      { name: 'Medium pencil stroke', changePercent: 0.5, description: 'Size 25 brush, medium line' },
      { name: 'Large pencil stroke', changePercent: 2.0, description: 'Size 50 brush, long line' },
      { name: 'Typical flood fill', changePercent: 5.0, description: 'Medium area fill' },
      { name: 'Large flood fill', changePercent: 15.0, description: 'Large area fill' },
      { name: 'Worst case', changePercent: 50.0, description: 'Massive brush or fill' }
    ];
    
    console.log('\\nScenario Analysis:');
    scenarios.forEach(scenario => {
      const changedPixels = Math.floor(totalPixels * scenario.changePercent / 100);
      const pixelChangeSize = changedPixels * 12; // 12 bytes per change (3x 4-byte ints)
      const pixelChangeMB = pixelChangeSize / 1024 / 1024;
      const compressionRatio = pixelChangeSize / imageDataSize;
      
      console.log(`\\n  ${scenario.name}:`);
      console.log(`    ${scenario.description}`);
      console.log(`    Changed pixels: ${changedPixels.toLocaleString()} (${scenario.changePercent}%)`);
      console.log(`    Storage size: ${pixelChangeMB < 1 ? (pixelChangeMB * 1024).toFixed(0) + ' KB' : pixelChangeMB.toFixed(2) + ' MB'}`);
      console.log(`    Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      console.log(`    Memory savings: ${((1 - compressionRatio) * 100).toFixed(1)}%`);
    });
    
    // Max image analysis
    console.log('\\n📏 MAX IMAGE ANALYSIS');
    console.log('======================');
    const maxWidth = 2550;
    const maxHeight = 3300;
    const maxPixels = maxWidth * maxHeight;
    const maxImageDataSize = maxPixels * 4;
    const maxImageDataMB = maxImageDataSize / 1024 / 1024;
    const historyCount = 50;
    const maxHistoryGB = (maxImageDataSize * historyCount) / 1024 / 1024 / 1024;
    
    console.log(`Max canvas: ${maxWidth}x${maxHeight}`);
    console.log(`Max ImageData: ${maxImageDataMB.toFixed(2)} MB per entry`);
    console.log(`Max history memory: ${maxHistoryGB.toFixed(2)} GB (${historyCount} entries)`);
    
    return {
      currentImageDataMB,
      maxImageDataMB,
      maxHistoryGB
    };
  }
  
  // Performance Analysis
  function analyzePerformance() {
    console.log('\\n⚡ PERFORMANCE ANALYSIS');
    console.log('=======================');
    
    const ctx = mainCanvas.getContext('2d');
    
    // Benchmark getImageData
    console.time('getImageData');
    const imageData1 = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    console.timeEnd('getImageData');
    
    // Create modified version
    const imageData2 = ctx.createImageData(mainCanvas.width, mainCanvas.height);
    imageData2.data.set(imageData1.data);
    
    // Modify some pixels (simulate 3% change)
    const changeCount = Math.floor((mainCanvas.width * mainCanvas.height) * 0.03);
    for (let i = 0; i < changeCount; i++) {
      const randomIndex = Math.floor(Math.random() * imageData2.data.length / 4) * 4;
      imageData2.data[randomIndex] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 1] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 2] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 3] = 255;
    }
    
    // Benchmark putImageData
    console.time('putImageData');
    ctx.putImageData(imageData2, 0, 0);
    console.timeEnd('putImageData');
    
    // Benchmark pixel comparison
    console.time('pixelComparison');
    const changes = [];
    const pixels1 = new Uint32Array(imageData1.data.buffer);
    const pixels2 = new Uint32Array(imageData2.data.buffer);
    
    for (let i = 0; i < pixels1.length; i++) {
      if (pixels1[i] !== pixels2[i]) {
        changes.push({
          index: i,
          oldColor: pixels1[i],
          newColor: pixels2[i]
        });
      }
    }
    console.timeEnd('pixelComparison');
    
    // Benchmark applying changes
    console.time('applyChanges');
    const testPixels = new Uint32Array(imageData1.data.buffer);
    for (const change of changes) {
      testPixels[change.index] = change.newColor;
    }
    console.timeEnd('applyChanges');
    
    console.log(`Found ${changes.length} changed pixels out of ${pixels1.length} total`);
    console.log(`Change percentage: ${((changes.length / pixels1.length) * 100).toFixed(2)}%`);
    
    return changes.length;
  }
  
  // Architecture Validation
  function validateArchitecture() {
    console.log('\\n🏗️ ARCHITECTURE VALIDATION');
    console.log('============================');
    
    const canvases = {
      'Main Canvas': mainCanvas,
      'Background Canvas': backgroundCanvas,
      'Fill Canvas': fillCanvas
    };
    
    let allGood = true;
    
    Object.entries(canvases).forEach(([name, canvas]) => {
      if (!canvas) {
        console.log(`⚠️  ${name}: Not found`);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const hasContext = !!ctx;
      const hasValidDimensions = canvas.width > 0 && canvas.height > 0;
      
      console.log(`${hasContext && hasValidDimensions ? '✅' : '❌'} ${name}: ${canvas.width}x${canvas.height}, Context: ${hasContext ? 'OK' : 'FAIL'}`);
      
      if (!hasContext || !hasValidDimensions) {
        allGood = false;
      }
    });
    
    console.log(`\\nArchitecture status: ${allGood ? '✅ All systems operational' : '❌ Issues detected'}`);
    
    return allGood;
  }
  
  // Create pixel change tracker
  function createPixelTracker() {
    console.log('\\n🎯 PIXEL CHANGE TRACKER');
    console.log('========================');
    console.log('Use window.pixelTracker.start() before drawing');
    console.log('Use window.pixelTracker.stop() after drawing to see results');
    
    const ctx = mainCanvas.getContext('2d');
    let beforeSnapshot = null;
    
    window.pixelTracker = {
      start: function() {
        beforeSnapshot = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        console.log('🎯 Pixel tracking started - draw something now!');
      },
      
      stop: function() {
        if (!beforeSnapshot) {
          console.log('❌ No before snapshot available. Call start() first.');
          return;
        }
        
        const afterSnapshot = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        const beforePixels = new Uint32Array(beforeSnapshot.data.buffer);
        const afterPixels = new Uint32Array(afterSnapshot.data.buffer);
        
        let changedPixels = 0;
        for (let i = 0; i < beforePixels.length; i++) {
          if (beforePixels[i] !== afterPixels[i]) {
            changedPixels++;
          }
        }
        
        const totalPixels = beforePixels.length;
        const changePercent = (changedPixels / totalPixels) * 100;
        const changeSize = changedPixels * 12; // bytes
        const imageDataSize = beforeSnapshot.data.length; // bytes
        const compressionRatio = changeSize / imageDataSize;
        
        console.log('\\n📊 PIXEL CHANGE RESULTS:');
        console.log(`Changed pixels: ${changedPixels.toLocaleString()} out of ${totalPixels.toLocaleString()}`);
        console.log(`Change percentage: ${changePercent.toFixed(2)}%`);
        console.log(`Incremental size: ${changeSize < 1024 ? changeSize + ' bytes' : (changeSize / 1024).toFixed(2) + ' KB'}`);
        console.log(`Full ImageData size: ${(imageDataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
        console.log(`Memory savings: ${((1 - compressionRatio) * 100).toFixed(1)}%`);
        
        beforeSnapshot = null;
        
        return {
          changedPixels,
          totalPixels,
          changePercent,
          compressionRatio,
          memorySavings: (1 - compressionRatio) * 100
        };
      }
    };
  }
  
  // Run all analyses
  try {
    const memoryResults = analyzeMemory();
    const performanceResults = analyzePerformance();
    const architectureResults = validateArchitecture();
    createPixelTracker();
    
    // Final recommendation
    console.log('\\n🎯 FINAL RECOMMENDATION');
    console.log('========================');
    
    const currentMB = memoryResults.currentImageDataMB;
    const maxMB = memoryResults.maxImageDataMB;
    const maxGB = memoryResults.maxHistoryGB;
    
    if (maxGB > 1.0) {
      console.log('✅ OPTIMIZATION HIGHLY RECOMMENDED');
      console.log(`   Current setup could use ${maxGB.toFixed(1)}GB for max image with full history`);
      console.log('   Incremental storage would reduce this by 80-95%');
    } else if (currentMB > 10) {
      console.log('✅ OPTIMIZATION RECOMMENDED');
      console.log(`   Current images use ${currentMB.toFixed(1)}MB per history entry`);
      console.log('   Incremental storage would provide significant savings');
    } else {
      console.log('⚠️ OPTIMIZATION OPTIONAL');
      console.log(`   Current images only use ${currentMB.toFixed(1)}MB per history entry`);
      console.log('   Benefits may be modest but still worthwhile');
    }
    
    console.log('\\n📝 Next steps:');
    console.log('1. Test real drawing scenarios with window.pixelTracker');
    console.log('2. Try different brush sizes and drawing patterns');
    console.log('3. Test flood fill operations of various sizes');
    console.log('4. Monitor browser memory usage during testing');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
  
  console.log('\\n🔍 Investigation complete! Check the results above.');
})();


(function() {
  console.log('🔍 Starting History Optimization Investigation...\n');
  
  // Find canvas elements
  const mainCanvas = document.querySelector('canvas[style*="cursor-crosshair"]') || 
                    document.querySelector('canvas[style*="z-20"]') ||
                    document.querySelector('canvas');
  
  const backgroundCanvas = document.querySelector('canvas[style*="z-0"]');
  const fillCanvas = document.querySelector('canvas[style*="z-10"]');
  
  if (!mainCanvas) {
    console.error('❌ No canvas found! Make sure you\'re on a coloring page.');
    return;
  }
  
  console.log('✅ Found canvas:', mainCanvas.width + 'x' + mainCanvas.height);
  
  // Memory Analysis
  function analyzeMemory() {
    console.log('\n📊 MEMORY ANALYSIS');
    console.log('==================');
    
    const ctx = mainCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Calculate ImageData size
    const imageDataSize = imageData.data.length; // bytes
    const imageDataMB = imageDataSize / 1024 / 1024;
    
    console.log(`Canvas dimensions: ${mainCanvas.width}x${mainCanvas.height}`);
    console.log(`ImageData size: ${imageDataMB.toFixed(2)} MB (${imageDataSize.toLocaleString()} bytes)`);
    
    // Simulate typical pixel changes (1-5% of pixels)
    const totalPixels = mainCanvas.width * mainCanvas.height;
    const scenarios = [
      { name: 'Small pencil stroke', changePercent: 0.1, description: 'Size 10 brush, short line' },
      { name: 'Medium pencil stroke', changePercent: 0.5, description: 'Size 25 brush, medium line' },
      { name: 'Large pencil stroke', changePercent: 2.0, description: 'Size 50 brush, long line' },
      { name: 'Typical flood fill', changePercent: 5.0, description: 'Medium area fill' },
      { name: 'Large flood fill', changePercent: 15.0, description: 'Large area fill' },
      { name: 'Worst case', changePercent: 50.0, description: 'Massive brush or fill' }
    ];
    
    console.log('\\nScenario Analysis:');
    scenarios.forEach(scenario => {
      const changedPixels = Math.floor(totalPixels * scenario.changePercent / 100);
      const pixelChangeSize = changedPixels * 12; // 12 bytes per change (3x 4-byte ints)
      const pixelChangeMB = pixelChangeSize / 1024 / 1024;
      const compressionRatio = pixelChangeSize / imageDataSize;
      
      console.log(`\\n  ${scenario.name}:`);
      console.log(`    ${scenario.description}`);
      console.log(`    Changed pixels: ${changedPixels.toLocaleString()} (${scenario.changePercent}%)`);
      console.log(`    Storage size: ${pixelChangeMB < 1 ? (pixelChangeMB * 1024).toFixed(0) + ' KB' : pixelChangeMB.toFixed(2) + ' MB'}`);
      console.log(`    Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      console.log(`    Memory savings: ${((1 - compressionRatio) * 100).toFixed(1)}%`);
    });
    
    // Max image analysis
    console.log('\\n📏 MAX IMAGE ANALYSIS');
    console.log('======================');
    const maxWidth = 2550;
    const maxHeight = 3300;
    const maxPixels = maxWidth * maxHeight;
    const maxImageDataSize = maxPixels * 4;
    const maxImageDataMB = maxImageDataSize / 1024 / 1024;
    const historyCount = 50;
    const maxHistoryGB = (maxImageDataSize * historyCount) / 1024 / 1024 / 1024;
    
    console.log(`Max canvas: ${maxWidth}x${maxHeight}`);
    console.log(`Max ImageData: ${maxImageDataMB.toFixed(2)} MB per entry`);
    console.log(`Max history memory: ${maxHistoryGB.toFixed(2)} GB (${historyCount} entries)`);
    
    return {
      currentImageDataMB,
      maxImageDataMB,
      maxHistoryGB
    };
  }
  
  // Performance Analysis
  function analyzePerformance() {
    console.log('\\n⚡ PERFORMANCE ANALYSIS');
    console.log('=======================');
    
    const ctx = mainCanvas.getContext('2d');
    
    // Benchmark getImageData
    console.time('getImageData');
    const imageData1 = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    console.timeEnd('getImageData');
    
    // Create modified version
    const imageData2 = ctx.createImageData(mainCanvas.width, mainCanvas.height);
    imageData2.data.set(imageData1.data);
    
    // Modify some pixels (simulate 3% change)
    const changeCount = Math.floor((mainCanvas.width * mainCanvas.height) * 0.03);
    for (let i = 0; i < changeCount; i++) {
      const randomIndex = Math.floor(Math.random() * imageData2.data.length / 4) * 4;
      imageData2.data[randomIndex] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 1] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 2] = Math.floor(Math.random() * 255);
      imageData2.data[randomIndex + 3] = 255;
    }
    
    // Benchmark putImageData
    console.time('putImageData');
    ctx.putImageData(imageData2, 0, 0);
    console.timeEnd('putImageData');
    
    // Benchmark pixel comparison
    console.time('pixelComparison');
    const changes = [];
    const pixels1 = new Uint32Array(imageData1.data.buffer);
    const pixels2 = new Uint32Array(imageData2.data.buffer);
    
    for (let i = 0; i < pixels1.length; i++) {
      if (pixels1[i] !== pixels2[i]) {
        changes.push({
          index: i,
          oldColor: pixels1[i],
          newColor: pixels2[i]
        });
      }
    }
    console.timeEnd('pixelComparison');
    
    // Benchmark applying changes
    console.time('applyChanges');
    const testPixels = new Uint32Array(imageData1.data.buffer);
    for (const change of changes) {
      testPixels[change.index] = change.newColor;
    }
    console.timeEnd('applyChanges');
    
    console.log(`Found ${changes.length} changed pixels out of ${pixels1.length} total`);
    console.log(`Change percentage: ${((changes.length / pixels1.length) * 100).toFixed(2)}%`);
    
    return changes.length;
  }
  
  // Architecture Validation
  function validateArchitecture() {
    console.log('\\n🏗️ ARCHITECTURE VALIDATION');
    console.log('============================');
    
    const canvases = {
      'Main Canvas': mainCanvas,
      'Background Canvas': backgroundCanvas,
      'Fill Canvas': fillCanvas
    };
    
    let allGood = true;
    
    Object.entries(canvases).forEach(([name, canvas]) => {
      if (!canvas) {
        console.log(`⚠️  ${name}: Not found`);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const hasContext = !!ctx;
      const hasValidDimensions = canvas.width > 0 && canvas.height > 0;
      
      console.log(`${hasContext && hasValidDimensions ? '✅' : '❌'} ${name}: ${canvas.width}x${canvas.height}, Context: ${hasContext ? 'OK' : 'FAIL'}`);
      
      if (!hasContext || !hasValidDimensions) {
        allGood = false;
      }
    });
    
    console.log(`\\nArchitecture status: ${allGood ? '✅ All systems operational' : '❌ Issues detected'}`);
    
    return allGood;
  }
  
  // Create pixel change tracker
  function createPixelTracker() {
    console.log('\\n🎯 PIXEL CHANGE TRACKER');
    console.log('========================');
    console.log('Use window.pixelTracker.start() before drawing');
    console.log('Use window.pixelTracker.stop() after drawing to see results');
    
    const ctx = mainCanvas.getContext('2d');
    let beforeSnapshot = null;
    
    window.pixelTracker = {
      start: function() {
        beforeSnapshot = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        console.log('🎯 Pixel tracking started - draw something now!');
      },
      
      stop: function() {
        if (!beforeSnapshot) {
          console.log('❌ No before snapshot available. Call start() first.');
          return;
        }
        
        const afterSnapshot = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        const beforePixels = new Uint32Array(beforeSnapshot.data.buffer);
        const afterPixels = new Uint32Array(afterSnapshot.data.buffer);
        
        let changedPixels = 0;
        for (let i = 0; i < beforePixels.length; i++) {
          if (beforePixels[i] !== afterPixels[i]) {
            changedPixels++;
          }
        }
        
        const totalPixels = beforePixels.length;
        const changePercent = (changedPixels / totalPixels) * 100;
        const changeSize = changedPixels * 12; // bytes
        const imageDataSize = beforeSnapshot.data.length; // bytes
        const compressionRatio = changeSize / imageDataSize;
        
        console.log('\\n📊 PIXEL CHANGE RESULTS:');
        console.log(`Changed pixels: ${changedPixels.toLocaleString()} out of ${totalPixels.toLocaleString()}`);
        console.log(`Change percentage: ${changePercent.toFixed(2)}%`);
        console.log(`Incremental size: ${changeSize < 1024 ? changeSize + ' bytes' : (changeSize / 1024).toFixed(2) + ' KB'}`);
        console.log(`Full ImageData size: ${(imageDataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
        console.log(`Memory savings: ${((1 - compressionRatio) * 100).toFixed(1)}%`);
        
        beforeSnapshot = null;
        
        return {
          changedPixels,
          totalPixels,
          changePercent,
          compressionRatio,
          memorySavings: (1 - compressionRatio) * 100
        };
      }
    };
  }
  
  // Run all analyses
  try {
    const memoryResults = analyzeMemory();
    const performanceResults = analyzePerformance();
    const architectureResults = validateArchitecture();
    createPixelTracker();
    
    // Final recommendation
    console.log('\\n🎯 FINAL RECOMMENDATION');
    console.log('========================');
    
    const currentMB = memoryResults.currentImageDataMB;
    const maxMB = memoryResults.maxImageDataMB;
    const maxGB = memoryResults.maxHistoryGB;
    
    if (maxGB > 1.0) {
      console.log('✅ OPTIMIZATION HIGHLY RECOMMENDED');
      console.log(`   Current setup could use ${maxGB.toFixed(1)}GB for max image with full history`);
      console.log('   Incremental storage would reduce this by 80-95%');
    } else if (currentMB > 10) {
      console.log('✅ OPTIMIZATION RECOMMENDED');
      console.log(`   Current images use ${currentMB.toFixed(1)}MB per history entry`);
      console.log('   Incremental storage would provide significant savings');
    } else {
      console.log('⚠️ OPTIMIZATION OPTIONAL');
      console.log(`   Current images only use ${currentMB.toFixed(1)}MB per history entry`);
      console.log('   Benefits may be modest but still worthwhile');
    }
    
    console.log('\\n📝 Next steps:');
    console.log('1. Test real drawing scenarios with window.pixelTracker');
    console.log('2. Try different brush sizes and drawing patterns');
    console.log('3. Test flood fill operations of various sizes');
    console.log('4. Monitor browser memory usage during testing');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
  
  console.log('\\n🔍 Investigation complete! Check the results above.');
})();


