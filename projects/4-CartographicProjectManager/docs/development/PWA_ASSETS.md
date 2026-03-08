# PWA / Icon Assets

The Vite `public/` directory is copied into the built output and is publicly served as-is.

## Generating icons
- Use https://realfavicongenerator.net/
- Or run: `npx pwa-asset-generator <source-image> public --manifest manifest.json`

## Common expected files
- `pwa-192x192.png`
- `pwa-512x512.png`
- `favicon.ico`
- `apple-touch-icon.png`
