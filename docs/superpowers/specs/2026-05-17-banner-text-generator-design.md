# Banner Text Generator — Design Spec

## Overview

A browser-based ASCII art text banner generator, similar to TAAG (patorjk.com/software/taag/). Converts plain text into large ASCII art using FIGlet fonts.

## Tech Stack

- **Library**: `figlet` npm package (MIT, maintained by patorjk — same author as TAAG)
- **Rendering**: `figlet.textSync()` for synchronous, real-time output
- **Fonts**: 20–30 classic `.flf` fonts imported from `figlet/importable-fonts/<FontName>`
- **Client-side only**: Next.js `dynamic` import with `ssr: false`

## Features

### Core
| Feature | Details |
|---------|---------|
| Text input | `<textarea>` with placeholder |
| Font selector | Dropdown, each option previews the font name in its own style |
| Real-time preview | Debounced (300ms) auto-render on text input or font change |
| Manual refresh button | For immediate re-render |
| Copy to clipboard | `navigator.clipboard.writeText()` in the output panel |
| Width control | Number input controlling max character width per line (default 80) |

### Font selection (20–30 fonts)
Classic FIGlet fonts: Standard, Big, Slant, Small, Banner, Banner3-D, Doom, Bloody, Shadow, Bulbhead, Calvin S, Crawford, Delta Corps Priest, Electronic, Elite, Epic, Fraktur, Graffiti, JS Bracket Letters, Larry 3D, Nancyj, Ogre, Rectangles, Soft, Speed, Univers, Varsity, Weird

(Exact font list determined at implementation time based on what figlet's importable-fonts provides; target ~25 fonts.)

### Stretch (if time allows)
- Download output as `.txt`

## Architecture

```
pages/tools/banner/index.js   ← single-file tool page (follows project pattern)
```

### Component structure

```
<Head> page title/meta
<header> title + description
<main>
  Input section
    <textarea>                    ← user types here
  Controls bar
    <FontDropdown>                ← figlet font picker
    <input type="number">         ← width
    <Button> Refresh              ← manual re-render trigger
  Output panel                    ← same pattern as all other tools
    <div> header bar
      <h3> Result
      <Button> Copy
    <pre> {output}
```

### State

```
input        string   ← textarea value
font         string   ← selected font name (default: "Standard")
width        number   ← max width (default: 80)
output       string   ← rendered ASCII art
error        string   ← error message if rendering fails
```

### Data flow

```
[input changes] → debounce 300ms → figlet.textSync(input, { font, width }) → setOutput
[font changes]  → immediate      → figlet.textSync(input, { font, width }) → setOutput
[width changes] → immediate      → figlet.textSync(input, { font, width }) → setOutput
[Refresh click] → immediate      → figlet.textSync(input, { font, width }) → setOutput
[Copy click]    → navigator.clipboard.writeText(output)
```

## Integration

Follows existing tool registration pattern:
1. Create `pages/tools/banner/index.js`
2. Add `{ id: 'banner', name: 'Banner Text', icon: 'Aa' }` to `components/SidebarLayout.js`
3. Add `{ id: 'banner', name: 'Banner Text', desc: 'Generate ASCII art text banners', icon: 'Aa' }` to `pages/index.js`
4. Install `figlet` npm package

## Edge Cases

- **Empty input**: Show placeholder output with "Standard" font rendering "Hello" or similar example
- **Very long text**: Width control prevents overflow; `pre` element handles wrapping
- **Special characters**: FIGlet handles most ASCII; non-ASCII chars rendered as-is or as `?`
- **Font import failure**: Graceful fallback to "Standard" font with error message

## Constraints

- Runs entirely client-side (no server/API needed)
- No external font downloads at runtime — all fonts bundled at build time
- Must not break with Next.js SSR (use `dynamic` + `ssr: false`)
