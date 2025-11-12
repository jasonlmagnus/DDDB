# Assets Folder

Place your logo file here.

## Supported Formats
- `.svg` (recommended for scalability)
- `.png` (with transparent background recommended)
- `.jpg` / `.jpeg`
- `.webp`

## Usage

1. Add your logo file to this folder (e.g., `logo.svg` or `logo.png`)
2. In `src/dig.tsx`, uncomment the logo import at the top:
   ```typescript
   import logo from './assets/logo.svg'; // or your filename
   ```
3. Uncomment the logo image tag in the header section

## Example

If your logo is named `logo.svg`:
- Place it here: `src/assets/logo.svg`
- Import it: `import logo from './assets/logo.svg';`
- Use it: `<img src={logo} alt="Logo" className="h-16 mx-auto mb-6" />`

