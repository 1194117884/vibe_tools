# Vibe Tools

Personal toolkit with common utility tools.

## Features

- JSON Formatter & Validator
- Base64 Encode/Decode
- URL Encode/Decode
- Hash Generator (SHA-256, SHA-1)
- AES Encryption
- RSA Key Pair Generator
- Image Converter (PNG/JPG/WebP)
- JWT Decoder
- Cron Generator
- Color Converter (HEX/RGB/HSL)
- Binary ↔ ASCII Converter
- Multi-Base Converter (Hex, Decimal, Binary, ASCII)
- Timestamp Converter
- Markdown → PDF

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Turborepo

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev
```

## Troubleshooting

If you encounter module resolution issues:

1. Ensure you have Node.js 18+ installed
2. Clean installation if needed:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. The project uses module aliases for monorepo packages:
   - `@vibe-tools/ui` -> `packages/ui`
   - `@vibe-tools/utils` -> `packages/utils`

## Deployment

Deploy to Vercel with Turborepo:
```bash
npm run build
```