# Required Dependencies for Article Editor & Analytics Dashboard

## Core Rich Text Editor Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-highlight @tiptap/extension-typography @tiptap/extension-placeholder
```

## Charts and Data Visualization

```bash
npm install recharts
```

## Form Handling and Validation

```bash
npm install react-hook-form @hookform/resolvers zod
```

## UI Components (if not already installed)

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-alert-dialog @radix-ui/react-separator @radix-ui/react-progress
```

## Icons

```bash
npm install lucide-react
```

## State Management and API

```bash
npm install @tanstack/react-query axios
```

## Notifications

```bash
npm install sonner
```

## Utilities

```bash
npm install clsx tailwind-merge
```

## Development Dependencies

```bash
npm install -D @types/react @types/react-dom typescript
```

## Package.json Dependencies Section

Add these to your package.json:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toggle": "^1.0.3",
    "@tanstack/react-query": "^5.8.4",
    "@tiptap/extension-highlight": "^2.1.13",
    "@tiptap/extension-image": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-placeholder": "^2.1.13",
    "@tiptap/extension-text-align": "^2.1.13",
    "@tiptap/extension-typography": "^2.1.13",
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "axios": "^1.6.2",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-router-dom": "^6.20.1",
    "recharts": "^2.8.0",
    "sonner": "^1.2.4",
    "tailwind-merge": "^2.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "typescript": "^5.2.2"
  }
}
```

## TailwindCSS Configuration

Make sure your tailwind.config.js includes the prose plugin for rich text styling:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

Install the typography plugin:

```bash
npm install -D @tailwindcss/typography
```

## CSS Imports

Add these to your main CSS file:

```css
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Custom prose styles for better article display */
.prose {
  max-width: none;
}

.prose img {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
```
