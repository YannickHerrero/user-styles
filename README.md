# Stylus - Custom Userstyles

Custom browser userstyles using the **Rose of Dune** color scheme. A soft rose-gold theme with warm brown accents, inspired by the gentle glow of desert dunes at dusk.

Built on the **Base16** color system for consistent theming across all supported websites.

## Available Styles

### All-in-One (Recommended)

Install a single style that themes all supported websites:

| Theme | Install |
|-------|---------|
| Rose of Dune (all sites) | [rose-of-dune.user.css](styles/all/rose-of-dune.user.css) |

### Individual Styles

Or install styles separately per website:

| Website | Install |
|---------|---------|
| [Discord](https://discord.com) | [rose-of-dune.user.css](styles/discord/rose-of-dune.user.css) |
| [Claude.ai](https://claude.ai) | [rose-of-dune.user.css](styles/claude/rose-of-dune.user.css) |

## Installation

### Prerequisites

Install the [Stylus browser extension](https://github.com/openstyles/stylus):
- [Chrome/Edge/Brave](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne)
- [Firefox](https://addons.mozilla.org/firefox/addon/styl-us/)

### Quick Install (Recommended)

Import all styles at once using the `import.json` file:

1. Open Stylus extension settings (click the gear icon)
2. Scroll down to "Backup" section
3. Click "Import" and select the `import.json` file from this repo
4. All styles will be imported and enabled

### Installing Individual Styles

1. Click on one of the install links above (or navigate to the `.user.css` file)
2. Click "Raw" to view the raw CSS
3. Stylus will automatically detect the userstyle and offer to install it
4. Click "Install style"

### Manual Installation

1. Open Stylus extension
2. Click "Write new style" 
3. Copy the contents of the desired `.user.less` file
4. Paste into the editor
5. Save

## Color Palette (Base16)

The theme is built on the Base16 color system:

| Base | Hex | Usage |
|------|-----|-------|
| base00 | `#F5E6D3` | Default Background |
| base01 | `#EBD1B8` | Lighter Background (panels, cards) |
| base02 | `#EBD1B8` | Selection Background |
| base03 | `#7A6A57` | Comments, Muted text |
| base04 | `#6B5843` | Dark Foreground (secondary text) |
| base05 | `#3C2B20` | Default Foreground (primary text) |
| base06 | `#2B1E15` | Light Foreground (headings) |
| base07 | `#E6D1C2` | Lightest Background (elevated) |
| base08 | `#B34438` | Red - Errors, Variables |
| base09 | `#D9A06B` | Orange - Warnings, Constants |
| base0A | `#D28C74` | Yellow - Classes, Search |
| base0B | `#B88642` | Green - Strings, Success |
| base0C | `#7CA973` | Cyan - Regex, Support |
| base0D | `#C87C6A` | Blue - Functions, Links |
| base0E | `#B36E5B` | Purple - Keywords |
| base0F | `#6B5843` | Brown - Deprecated |

## Development

### Project Structure

```
stylus/
├── themes/
│   ├── rose-of-dune.toml        # Theme definition (source of truth)
│   └── rose-of-dune.less        # Generated LESS (do not edit)
├── styles/
│   ├── all/                     # Combined all-in-one style
│   │   ├── rose-of-dune.user.less
│   │   └── rose-of-dune.user.css
│   ├── discord/
│   │   ├── rose-of-dune.user.less
│   │   └── rose-of-dune.user.css
│   └── claude/
│       ├── rose-of-dune.user.less
│       └── rose-of-dune.user.css
├── scripts/
│   ├── generate-theme.js        # TOML -> LESS converter
│   └── generate-import.js       # Generates import.json
├── import.json                  # Import this in Stylus
├── package.json
└── README.md
```

### Build Order

```
1. TOML -> LESS    (generate-theme.js)
2. LESS -> CSS     (lessc)
3. CSS -> JSON     (generate-import.js)
```

### Building

```bash
# Install dependencies
bun install

# Build everything (themes -> styles -> import.json)
bun run build

# Build only themes (TOML -> LESS)
bun run build:themes

# Build only styles (LESS -> CSS)
bun run build:styles

# Build only import.json
bun run build:import
```

### Creating a New Theme

1. Copy an existing theme TOML:
   ```bash
   cp themes/rose-of-dune.toml themes/my-theme.toml
   ```

2. Edit the base16 colors in `themes/my-theme.toml`:
   ```toml
   [meta]
   name = "My Theme"
   id = "mytheme"
   type = "dark"  # or "light"

   [base16]
   base00 = "1a1b26"  # Background
   base01 = "24283b"  # Lighter background
   # ... edit all 16 colors
   
   [overrides]
   primary = "7aa2f7"  # Optional accent override
   ```

3. Create site styles that import the new theme:
   ```bash
   cp styles/discord/rose-of-dune.user.less styles/discord/my-theme.user.less
   ```

4. Update the import path in the new file:
   ```less
   @import "../../themes/my-theme.less";
   ```

5. Add build scripts to `package.json` and run:
   ```bash
   bun run build
   ```

### Adding a New Website

1. Create a new directory:
   ```bash
   mkdir styles/github
   ```

2. Create the LESS source file `styles/github/rose-of-dune.user.less`:
   ```less
   /* ==UserStyle==
   @name         GitHub - Rose of Dune
   @namespace    github.com/yherrero/stylus
   @version      1.0.0
   @description  Rose of Dune theme for GitHub
   @author       yherrero
   @license      MIT
   @preprocessor less
   ==/UserStyle== */

   @import "../../themes/rose-of-dune.less";

   @-moz-document domain("github.com") {
     // Use semantic variables: @bg-primary, @text-primary, etc.
     // Use base16 directly for syntax: @base08, @syntax-keyword, etc.
   }
   ```

3. Add build script to `package.json`:
   ```json
   "build:github": "lessc styles/github/rose-of-dune.user.less styles/github/rose-of-dune.user.css"
   ```

4. Update `build:styles` to include the new target

5. Add to `scripts/generate-import.js` styles array

6. Run `bun run build`

### Base16 Semantic Variables

The generated LESS file provides semantic mappings:

```less
// Backgrounds
@bg-primary      // Main background (base00)
@bg-secondary    // Panel background (base01)
@bg-elevated     // Elevated surfaces (base07)

// Text
@text-primary    // Main text (base05)
@text-secondary  // Secondary text (base04)
@text-muted      // Muted text (base03)

// Status
@color-error     // Errors (base08)
@color-warning   // Warnings (base09)
@color-success   // Success (base0C)
@color-info      // Info/links (base0D)

// Syntax highlighting
@syntax-keyword  // Keywords (base0E)
@syntax-string   // Strings (base0B)
@syntax-function // Functions (base0D)
@syntax-variable // Variables (base08)
@syntax-comment  // Comments (base03)

// Derived (auto-generated)
@hover-overlay   // Hover state
@active-overlay  // Active state
@focus-ring      // Focus indicator
@border-primary  // Standard border
@border-subtle   // Subtle border
```

## Credits

- Color scheme inspired by [omarchy-roseofdune-theme](https://github.com/HANCORE-linux/omarchy-roseofdune-theme)
- Project structure inspired by [catppuccin/userstyles](https://github.com/catppuccin/userstyles)
- Built on [Base16](http://chriskempson.com/projects/base16/) color system

## License

MIT
