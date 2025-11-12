# STOP → DIG → BUILD

A 5-minute framework for understanding what you're really being asked to do.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Adding Your Logo

1. Place your logo file in `src/assets/` folder
   - Supported formats: `.svg` (recommended), `.png`, `.jpg`, `.webp`
   - Example: `src/assets/logo.svg`

2. In `src/dig.tsx`, uncomment the logo import:
   ```typescript
   import logo from './assets/logo.svg'; // Update filename as needed
   ```

3. Uncomment the logo image tag in the header section (around line 147)

The logo will appear above the "STOP → DIG → BUILD" heading.

## Styles & Theme

The project uses Tailwind CSS with a custom theme configuration:
- Theme values are defined in `src/styles/theme.ts`
- Colors, spacing, typography, and effects are centralized there
- All styles use Tailwind utility classes for consistency

## AI Scenario Generation

The workbench includes AI-powered scenario generation using OpenAI API:

1. Create a `.env.local` file in the root directory:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

2. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. Click "Generate Scenario" in the request step to create a realistic scenario for your selected discipline

**Note:** The AI feature is optional. Users can still paste their own requests without an API key.

