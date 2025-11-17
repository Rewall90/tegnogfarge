/**
 * Comprehensive SEO Audit Script for Multilingual Website
 * Validates Google SEO best practices for Norwegian/Swedish site
 *
 * Tests:
 * - HTML lang attribute
 * - Hreflang tags (self-reference, bidirectional, x-default)
 * - Canonical URLs
 * - OpenGraph locale tags
 * - URL structure
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Test pages configuration
const testPages = [
  {
    name: 'Norwegian Homepage',
    url: '/',
    locale: 'no',
    expectedCanonical: 'https://tegnogfarge.no/',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/',
      'sv': 'https://tegnogfarge.no/sv/',
      'x-default': 'https://tegnogfarge.no/'
    },
    expectedOgLocale: 'nb_NO',
    expectedOgAlternate: 'sv_SE'
  },
  {
    name: 'Swedish Homepage',
    url: '/sv/',
    locale: 'sv',
    expectedCanonical: 'https://tegnogfarge.no/sv/',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/',
      'sv': 'https://tegnogfarge.no/sv/',
      'x-default': 'https://tegnogfarge.no/'
    },
    expectedOgLocale: 'sv_SE',
    expectedOgAlternate: 'nb_NO'
  },
  {
    name: 'Norwegian Category Page (dyr)',
    url: '/dyr/',
    locale: 'no',
    expectedCanonical: 'https://tegnogfarge.no/dyr/',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/dyr/',
      'sv': 'https://tegnogfarge.no/sv/dyr/',
      'x-default': 'https://tegnogfarge.no/dyr/'
    },
    expectedOgLocale: 'nb_NO',
    expectedOgAlternate: 'sv_SE'
  },
  {
    name: 'Swedish Category Page (djur)',
    url: '/sv/djur/',
    locale: 'sv',
    expectedCanonical: 'https://tegnogfarge.no/sv/djur/',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/djur/',
      'sv': 'https://tegnogfarge.no/sv/djur/',
      'x-default': 'https://tegnogfarge.no/djur/'
    },
    expectedOgLocale: 'sv_SE',
    expectedOgAlternate: 'nb_NO'
  },
  {
    name: 'Norwegian Drawing Page',
    url: '/dyr/fargelegge-bjorn/bamse-sover-trygt-i-hulen',
    locale: 'no',
    expectedCanonical: 'https://tegnogfarge.no/dyr/fargelegge-bjorn/bamse-sover-trygt-i-hulen',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/dyr/fargelegge-bjorn/bamse-sover-trygt-i-hulen',
      'sv': 'https://tegnogfarge.no/sv/dyr/fargelegge-bjorn/bamse-sover-trygt-i-hulen',
      'x-default': 'https://tegnogfarge.no/dyr/fargelegge-bjorn/bamse-sover-trygt-i-hulen'
    },
    expectedOgLocale: 'nb_NO',
    expectedOgAlternate: 'sv_SE'
  },
  {
    name: 'Swedish Drawing Page',
    url: '/sv/djur/mala-bjorn/bamse-sover-tryggt-i-sin-grotta',
    locale: 'sv',
    expectedCanonical: 'https://tegnogfarge.no/sv/djur/mala-bjorn/bamse-sover-tryggt-i-sin-grotta',
    expectedHreflang: {
      'no': 'https://tegnogfarge.no/djur/mala-bjorn/bamse-sover-tryggt-i-sin-grotta',
      'sv': 'https://tegnogfarge.no/sv/djur/mala-bjorn/bamse-sover-tryggt-i-sin-grotta',
      'x-default': 'https://tegnogfarge.no/djur/mala-bjorn/bamse-sover-tryggt-i-sin-grotta'
    },
    expectedOgLocale: 'sv_SE',
    expectedOgAlternate: 'nb_NO'
  }
];

// Utility function to fetch HTML
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${url}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse HTML for specific tags
function parseHtmlLang(html) {
  const match = html.match(/<html[^>]*lang="([^"]+)"/i);
  return match ? match[1] : null;
}

function parseCanonical(html) {
  const match = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
  return match ? match[1] : null;
}

function parseHreflangTags(html) {
  const hreflangTags = {};
  const regex = /<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    hreflangTags[match[1]] = match[2];
  }
  return hreflangTags;
}

function parseOgLocale(html) {
  const match = html.match(/<meta[^>]*property="og:locale"[^>]*content="([^"]+)"/i);
  return match ? match[1] : null;
}

function parseOgLocaleAlternate(html) {
  const alternates = [];
  const regex = /<meta[^>]*property="og:locale:alternate"[^>]*content="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    alternates.push(match[1]);
  }
  return alternates;
}

function parseRobotsMeta(html) {
  const match = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/i);
  return match ? match[1] : null;
}

// Validation functions
function validateLangAttribute(actual, expected) {
  return {
    test: 'HTML lang attribute',
    expected,
    actual,
    pass: actual === expected,
    critical: true
  };
}

function validateCanonical(actual, expected) {
  return {
    test: 'Canonical URL',
    expected,
    actual,
    pass: actual === expected,
    critical: true
  };
}

function validateHreflang(actual, expected, testPage) {
  const results = [];

  // Check for all expected hreflang tags
  for (const [lang, url] of Object.entries(expected)) {
    const hasTag = actual[lang] === url;
    results.push({
      test: `Hreflang tag for "${lang}"`,
      expected: url,
      actual: actual[lang] || 'MISSING',
      pass: hasTag,
      critical: true
    });
  }

  // Check for self-referencing hreflang
  const selfRef = actual[testPage.locale] === testPage.expectedCanonical;
  results.push({
    test: 'Self-referencing hreflang',
    expected: `${testPage.locale}: ${testPage.expectedCanonical}`,
    actual: actual[testPage.locale] || 'MISSING',
    pass: selfRef,
    critical: true
  });

  // Check for x-default
  const hasXDefault = 'x-default' in actual;
  results.push({
    test: 'x-default hreflang',
    expected: expected['x-default'],
    actual: actual['x-default'] || 'MISSING',
    pass: hasXDefault && actual['x-default'] === expected['x-default'],
    critical: true
  });

  // Check that all hreflang URLs are fully-qualified
  const allFullyQualified = Object.values(actual).every(url => url.startsWith('https://'));
  results.push({
    test: 'All hreflang URLs fully-qualified',
    expected: 'All URLs start with https://',
    actual: allFullyQualified ? 'PASS' : 'Some URLs are relative',
    pass: allFullyQualified,
    critical: true
  });

  return results;
}

function validateOgLocale(actualLocale, actualAlternates, expectedLocale, expectedAlternate) {
  const results = [];

  results.push({
    test: 'OpenGraph locale',
    expected: expectedLocale,
    actual: actualLocale || 'MISSING',
    pass: actualLocale === expectedLocale,
    critical: true
  });

  results.push({
    test: 'OpenGraph locale:alternate',
    expected: expectedAlternate,
    actual: actualAlternates.length > 0 ? actualAlternates.join(', ') : 'MISSING',
    pass: actualAlternates.includes(expectedAlternate),
    critical: true
  });

  return results;
}

function validateRobots(actual) {
  const isIndexable = !actual || !actual.includes('noindex');
  return {
    test: 'Robots meta (indexable)',
    expected: 'Indexable (no noindex)',
    actual: actual || 'Not set (indexable)',
    pass: isIndexable,
    critical: true
  };
}

// Main audit function
async function runAudit() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE MULTILINGUAL SEO AUDIT');
  console.log('Google SEO Best Practices Verification');
  console.log('='.repeat(80));
  console.log('');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failedCritical = [];

  for (const testPage of testPages) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`PAGE: ${testPage.name}`);
    console.log(`URL: ${testPage.url}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      const html = await fetchPage(testPage.url);

      // Parse all SEO elements
      const htmlLang = parseHtmlLang(html);
      const canonical = parseCanonical(html);
      const hreflangTags = parseHreflangTags(html);
      const ogLocale = parseOgLocale(html);
      const ogLocaleAlternates = parseOgLocaleAlternate(html);
      const robotsMeta = parseRobotsMeta(html);

      // Run validations
      const allResults = [
        validateLangAttribute(htmlLang, testPage.locale),
        validateCanonical(canonical, testPage.expectedCanonical),
        ...validateHreflang(hreflangTags, testPage.expectedHreflang, testPage),
        ...validateOgLocale(ogLocale, ogLocaleAlternates, testPage.expectedOgLocale, testPage.expectedOgAlternate),
        validateRobots(robotsMeta)
      ];

      // Display results
      for (const result of allResults) {
        totalTests++;
        const status = result.pass ? '✅ PASS' : '❌ FAIL';

        console.log(`${status} | ${result.test}`);
        console.log(`   Expected: ${result.expected}`);
        console.log(`   Actual:   ${result.actual}`);
        console.log('');

        if (result.pass) {
          passedTests++;
        } else {
          failedTests++;
          if (result.critical) {
            failedCritical.push({
              page: testPage.name,
              test: result.test,
              expected: result.expected,
              actual: result.actual
            });
          }
        }
      }

      // Anti-pattern checks
      console.log(`--- ANTI-PATTERN CHECKS ---\n`);

      // Check: Swedish canonical should NOT point to Norwegian
      if (testPage.locale === 'sv') {
        const canonicalPointsToWrongLocale = canonical && !canonical.includes('/sv/');
        const antiPattern1 = {
          test: 'Swedish canonical pointing to Norwegian (ANTI-PATTERN)',
          pass: !canonicalPointsToWrongLocale,
          actual: canonical || 'MISSING'
        };
        totalTests++;
        if (antiPattern1.pass) {
          console.log(`✅ PASS | ${antiPattern1.test}`);
          passedTests++;
        } else {
          console.log(`❌ FAIL | ${antiPattern1.test}`);
          console.log(`   Canonical: ${antiPattern1.actual}`);
          failedTests++;
          failedCritical.push({
            page: testPage.name,
            test: antiPattern1.test,
            expected: 'Should include /sv/',
            actual: antiPattern1.actual
          });
        }
        console.log('');
      }

      // Check: Missing hreflang self-reference
      const hasSelfReference = hreflangTags[testPage.locale];
      const antiPattern2 = {
        test: 'Missing hreflang self-reference (ANTI-PATTERN)',
        pass: !!hasSelfReference
      };
      totalTests++;
      if (antiPattern2.pass) {
        console.log(`✅ PASS | ${antiPattern2.test}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL | ${antiPattern2.test}`);
        failedTests++;
        failedCritical.push({
          page: testPage.name,
          test: antiPattern2.test,
          expected: `Hreflang tag for ${testPage.locale}`,
          actual: 'MISSING'
        });
      }
      console.log('');

      // Check: Bidirectional linking
      const otherLocale = testPage.locale === 'no' ? 'sv' : 'no';
      const hasBidirectional = hreflangTags[otherLocale];
      const antiPattern3 = {
        test: 'Bidirectional hreflang linking',
        pass: !!hasBidirectional
      };
      totalTests++;
      if (antiPattern3.pass) {
        console.log(`✅ PASS | ${antiPattern3.test}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL | ${antiPattern3.test}`);
        console.log(`   Missing hreflang for: ${otherLocale}`);
        failedTests++;
        failedCritical.push({
          page: testPage.name,
          test: antiPattern3.test,
          expected: `Hreflang tag for ${otherLocale}`,
          actual: 'MISSING'
        });
      }
      console.log('');

    } catch (error) {
      console.error(`❌ ERROR fetching page: ${error.message}\n`);
      failedTests++;
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(80));

  if (failedCritical.length > 0) {
    console.log('\n❌ CRITICAL FAILURES:');
    console.log('='.repeat(80));
    for (const failure of failedCritical) {
      console.log(`\nPage: ${failure.page}`);
      console.log(`Test: ${failure.test}`);
      console.log(`Expected: ${failure.expected}`);
      console.log(`Actual: ${failure.actual}`);
    }
    console.log('='.repeat(80));
  } else {
    console.log('\n✅ All critical SEO requirements passed!');
    console.log('Site is ready for multilingual indexing.');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the audit
runAudit().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
