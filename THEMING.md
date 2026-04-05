# Theming & Layout Guide

## Overview

The journal app uses a CSS custom property (CSS variable) based theme system. Switching themes applies a single class to `<html>`, which swaps all `--j-*` tokens simultaneously. The sidebar is responsive across all screen sizes.

---

## Theme System

### How it works

1. Each theme is a CSS class on `<html>` (e.g. `theme-kuromi`)
2. That class defines all `--j-*` tokens in [global.css](frontend/src/styles/global.css)
3. All components read colors from those tokens via `style={{ color: "var(--j-text-primary)" }}` or Tailwind utilities like `bg-j-bg-surface`
4. [ThemeProvider.tsx](frontend/src/theme/ThemeProvider.tsx) manages the active theme and persists it to `localStorage` under the key `journal-theme`
5. [ThemeSwitcher.tsx](frontend/src/components/ThemeSwitcher.tsx) in the Navbar renders all themes from [themes.ts](frontend/src/theme/themes.ts) automatically

---

### Available themes

| ID | Class | Icon | Description |
|----|-------|------|-------------|
| `light` | `theme-light` | ☀️ | Default light mode |
| `dark` | `theme-dark` | 🌙 | Dark mode |
| `kuromi` | `theme-kuromi` | 🖤 | Kawaii goth — deep purple/black + fuchsia |
| `cinnamoroll` | `theme-cinnamoroll` | ☁️ | Soft baby blue + lavender |
| `badtzbadtzmaru` | `theme-badtzbadtzmaru` | 🐧 | Bold black/white + electric yellow |

---

### CSS tokens

Every theme must define all of these in [global.css](frontend/src/styles/global.css):

| Token | Purpose |
|-------|---------|
| `--j-bg-base` | Page background |
| `--j-bg-surface` | Card / panel background |
| `--j-bg-elevated` | Hover rows, selected state |
| `--j-sidebar-bg` | Sidebar background |
| `--j-sidebar-border` | Sidebar right border |
| `--j-text-primary` | Headings, body text |
| `--j-text-secondary` | Labels, sub-text |
| `--j-text-muted` | Placeholders, timestamps, hints |
| `--j-border` | All borders and dividers |
| `--j-accent` | Buttons, links, active states |
| `--j-accent-hover` | Button hover |
| `--j-accent-text` | Text on top of accent background |
| `--j-ring` | Focus ring |

---

### Adding a new theme

**Step 1** — Add the CSS token block to [frontend/src/styles/global.css](frontend/src/styles/global.css):

```css
.theme-myname {
  --j-bg-base:        #ffffff;
  --j-bg-surface:     #f8f8f8;
  --j-bg-elevated:    #eeeeee;
  --j-sidebar-bg:     #f0f0f0;
  --j-sidebar-border: #dddddd;
  --j-text-primary:   #111111;
  --j-text-secondary: #333333;
  --j-text-muted:     #888888;
  --j-border:         #dddddd;
  --j-accent:         #e91e8c;
  --j-accent-hover:   #c2186e;
  --j-accent-text:    #ffffff;
  --j-ring:           #f472b6;
}
```

**Step 2** — Add a `Theme` entry to [frontend/src/theme/themes.ts](frontend/src/theme/themes.ts):

```ts
{
  id: "myname",
  label: "My Theme",
  htmlClass: "theme-myname",
  swatches: ["#ffffff", "#e91e8c", "#111111"],  // bg, accent, text
  icon: "🌸",
}
```

That's it. The `ThemeSwitcher` picks it up automatically — no other files need changing.

---

### Markdown editor color mode

The `MarkdownEditor` component (`@uiw/react-md-editor`) uses a `data-color-mode` attribute. Themes with dark backgrounds are listed in a set inside [MarkdownEditor.tsx](frontend/src/components/MarkdownEditor.tsx):

```ts
const DARK_THEME_IDS = new Set(["dark", "kuromi", "badtzbadtzmaru"])
```

If you add a dark theme, add its `id` to this set so the editor renders with the dark palette.

---

## Layout

### Structure

```
<ThemeProvider>               ← applies theme class, exposes useTheme()
  <App>
    <Layout sidebar={...}>    ← flex column, Navbar + body row
      <Navbar>                ← hamburger (mobile) + ThemeSwitcher + nav links
      <aside>                 ← sidebar column (see responsive rules below)
      <main>                  ← flex-1, spans remaining width
```

### Responsive sidebar

| Breakpoint | Behavior |
|------------|----------|
| Mobile `< 768px` | Hidden by default. Hamburger in Navbar toggles it as a fixed overlay drawer with dark backdrop. Close via ✕ button or backdrop click. |
| Tablet / Desktop `≥ 768px` | Always visible as a static 256px column. Hamburger hidden. |

The sidebar receives content via the `sidebar` prop on `<Layout>`. If no `sidebar` prop is passed, the aside is not rendered at all (used on Entry, Form, and 404 pages).

### Adding a sidebar to a page

```tsx
<Layout
  sidebar={
    <MyFilterPanel ... />
  }
>
  {/* main content */}
</Layout>
```

---

## Files reference

| File | Role |
|------|------|
| [frontend/src/styles/global.css](frontend/src/styles/global.css) | All theme token definitions + base component styles |
| [frontend/tailwind.config.js](frontend/tailwind.config.js) | Exposes `--j-*` vars as Tailwind utilities |
| [frontend/src/theme/themes.ts](frontend/src/theme/themes.ts) | Theme registry (id, label, class, swatches, icon) |
| [frontend/src/theme/ThemeContext.tsx](frontend/src/theme/ThemeContext.tsx) | Context type + `useTheme()` hook |
| [frontend/src/theme/ThemeProvider.tsx](frontend/src/theme/ThemeProvider.tsx) | Applies class to `<html>`, persists to localStorage |
| [frontend/src/components/ThemeSwitcher.tsx](frontend/src/components/ThemeSwitcher.tsx) | Navbar dropdown with swatches |
| [frontend/src/components/Layout.tsx](frontend/src/components/Layout.tsx) | Full-width layout with responsive sidebar |
| [frontend/src/components/Navbar.tsx](frontend/src/components/Navbar.tsx) | Top bar with hamburger + ThemeSwitcher |
| [frontend/src/components/MarkdownEditor.tsx](frontend/src/components/MarkdownEditor.tsx) | MD editor wired to dark theme IDs |

---

## Conventions

- **Never use `dark:` Tailwind prefix.** All dark/light variants are handled by theme tokens.
- **Never hardcode colors** in components (`text-gray-900`, `bg-white`, etc.). Always use a `--j-*` token.
- **Inline style for token values:** `style={{ color: "var(--j-text-primary)" }}`
- **Tailwind utility for token values:** `className="bg-j-bg-surface text-j-text-muted"` (only where the token name maps cleanly)
- **Transitions:** The `body` tag has `transition: background-color 0.2s ease, color 0.2s ease` — theme switches animate automatically.
