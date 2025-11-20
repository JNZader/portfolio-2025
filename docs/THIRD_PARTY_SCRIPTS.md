# Third-Party Scripts Configuration Guide

## Overview

This project uses Next.js `<Script>` component for optimal loading of third-party scripts with proper loading strategies and GDPR compliance.

## Current Implementation

### Google Analytics

**File**: `components/analytics/GoogleAnalytics.tsx`

**Features**:
- ✅ GDPR compliant - only loads if user consents
- ✅ Uses `afterInteractive` strategy for optimal performance
- ✅ IP anonymization enabled
- ✅ Secure cookie flags
- ✅ Conditional loading based on environment variables

### Configuration

**1. Environment Variables**

Add to `.env.local`:

```bash
# Enable analytics globally
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Google Analytics Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**2. Get GA Measurement ID**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use existing one
3. Click "Data Streams" → "Web" → "Add stream"
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

## Loading Strategies

### `afterInteractive` (Recommended for Analytics)
- Loads after page becomes interactive
- Doesn't block initial page load
- Good for analytics, ads, chat widgets

### `beforeInteractive` (Use Sparingly)
- Loads before page becomes interactive
- Blocks rendering
- Use only for critical scripts (bot detection, consent management)

### `lazyOnload` (Use for Non-Critical Scripts)
- Loads during idle time
- Best for social media widgets, non-critical tools
- Doesn't affect performance metrics

## GDPR Compliance

The implementation follows GDPR requirements:

1. **Consent Check**: Scripts only load if user has given consent via CookieConsent component
2. **Cookie Preferences**: Stored in `cookie-consent` cookie
3. **IP Anonymization**: Enabled in GA config (`anonymize_ip: true`)
4. **Secure Cookies**: Uses `SameSite=None;Secure` flags

## Adding More Services

### Example: Microsoft Clarity

```tsx
// components/analytics/MicrosoftClarity.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export function MicrosoftClarity() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (consent) {
      const prefs = JSON.parse(consent);
      setHasConsent(prefs.analytics);
    }
  }, []);

  if (!CLARITY_ID || !hasConsent) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
```

Then add to `ThirdPartyScripts.tsx`:

```tsx
import { MicrosoftClarity } from './MicrosoftClarity';

export function ThirdPartyScripts() {
  return (
    <>
      <GoogleAnalytics />
      <MicrosoftClarity />
    </>
  );
}
```

## Performance Impact

### Before Optimization
- Scripts loaded synchronously
- Blocked page rendering
- Poor Lighthouse scores

### After Optimization
- Scripts load asynchronously with proper strategy
- No blocking of critical rendering path
- Improved Core Web Vitals:
  - **FCP**: Faster (no blocking scripts)
  - **LCP**: Improved (critical content loads first)
  - **TBT**: Reduced (scripts load after interactive)

### Monitoring

Use Web Vitals tracking (already implemented) to monitor impact:

```javascript
// In browser console (development)
// Web Vitals will be logged automatically
```

## Best Practices

1. **Always use `<Script>` component** instead of regular `<script>` tags
2. **Choose appropriate strategy**:
   - `afterInteractive`: Most analytics, ads, chat
   - `lazyOnload`: Social widgets, non-critical
   - `beforeInteractive`: Only for critical scripts
3. **Check consent** before loading analytics/marketing scripts
4. **Test performance** with Lighthouse after adding scripts
5. **Monitor bundle size** - scripts add to page weight

## Testing

### Development

```bash
npm run dev
```

1. Open browser console
2. Check for script loading logs
3. Open "Sources" tab → see loaded scripts
4. Verify timing with Network tab

### Production

```bash
npm run build
npm start
```

Test with:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- Browser DevTools → Lighthouse

## Troubleshooting

### Scripts not loading

1. Check environment variables are set
2. Verify `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
3. Check cookie consent is given
4. Look for console errors

### Performance issues

1. Review loading strategy (use `lazyOnload` for non-critical)
2. Check bundle size with `npm run analyze`
3. Consider removing unused scripts
4. Verify scripts are compressed/minified

## References

- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Script Loading Strategies](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [GDPR Compliance](https://gdpr.eu/)
- [Google Analytics Setup](https://support.google.com/analytics/answer/9304153)
