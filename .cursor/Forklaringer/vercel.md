Managing Usage & Costs
Measuring usage
This document describes usage for the default pricing option. For Pro and Enterprise teams created before February 18th, 2025 you will be given the choice to opt-in to this pricing plan or stay on the legacy source images-based pricing plan.

Your Image Optimization usage over time is displayed under the Image Optimization section of the Usage tab on your dashboard.

You can also view detailed information in the Image Optimization section of the Observability tab on your dashboard.

Reducing usage
To help you minimize Image Optimization usage costs, consider implementing the following suggestions:

Cache Max Age: If your images do not change in less than a month, set max-age=2678400 (31 days) in the Cache-Control header or set images.minimumCacheTTL to minimumCacheTTL:2678400 to reduce the number of transformations and cache writes. Using static imports can also help as they set the Cache-Control header to 1 year.

Formats: Check if your Next.js configuration is using images.formats with multiple values and consider removing one. For example, change ['image/avif', 'image/web'] to ['image/webp'] to reduce the number of transformations.

Remote and local patterns: Configure images.remotePatterns and images.localPatterns allowlist which images should be optimized so that you can limit unnecessary transformations and cache writes.

Qualities: Configure the images.qualities allowlist to reduce possible transformations. Lowering the quality will make the transformed image smaller resulting in fewer cache reads, cache writes, and fast data transfer.

Image sizes: Configure the images.imageSizes and images.deviceSizes allowlists to match your audience and reduce the number of transformations and cache writes.

Unoptimized: For source images that do not benefit from optimization such as small images (under 10 KB), vector images (SVG) and animated images (GIF), use the unoptimized property on the Image component to avoid transformations, cache reads, and cache writes. Use sparingly since unoptimized on every image could increase fast data transfer cost.