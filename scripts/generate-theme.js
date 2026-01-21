#!/usr/bin/env bun

/**
 * Generates LESS theme files from TOML definitions
 * Processes all .toml files in themes/ directory
 * Run with: bun scripts/generate-theme.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'smol-toml';
import { join, basename } from 'path';

const THEMES_DIR = 'themes';

/**
 * Generate LESS content from parsed TOML theme
 */
function generateLess(theme, filename) {
  const { meta, base16, overrides = {} } = theme;
  
  // Ensure all base16 colors have # prefix
  const b16 = {};
  for (const [key, value] of Object.entries(base16)) {
    b16[key] = value.startsWith('#') ? value : `#${value}`;
  }
  
  // Process overrides
  const ovr = {};
  for (const [key, value] of Object.entries(overrides)) {
    ovr[key] = value.startsWith('#') ? value : `#${value}`;
  }

  return `// ============================================================================
// ${meta.name} - Auto-generated from ${filename}
// DO NOT EDIT DIRECTLY - Edit the .toml file and run: bun run build:themes
// ============================================================================

@theme-name: "${meta.name}";
@theme-id: "${meta.id}";
@theme-type: "${meta.type}";

// ============================================================================
// Base16 Palette
// ============================================================================

@base00: ${b16.base00};  // Default Background
@base01: ${b16.base01};  // Lighter Background (panels, cards)
@base02: ${b16.base02};  // Selection Background
@base03: ${b16.base03};  // Comments, Muted text
@base04: ${b16.base04};  // Dark Foreground (secondary text)
@base05: ${b16.base05};  // Default Foreground (primary text)
@base06: ${b16.base06};  // Light Foreground (headings, emphasis)
@base07: ${b16.base07};  // Lightest Background (elevated surfaces)
@base08: ${b16.base08};  // Red - Errors, Deleted, Variables
@base09: ${b16.base09};  // Orange - Warnings, Constants, Numbers
@base0A: ${b16.base0A};  // Yellow - Classes, Search highlight
@base0B: ${b16.base0B};  // Green - Strings, Success, Inserted
@base0C: ${b16.base0C};  // Cyan - Regex, Escape chars, Support
@base0D: ${b16.base0D};  // Blue - Functions, Links
@base0E: ${b16.base0E};  // Purple - Keywords, Storage
@base0F: ${b16.base0F};  // Brown - Deprecated, Embedded

// ============================================================================
// Overrides (from TOML)
// ============================================================================

@primary: ${ovr.primary || '@base0E'};
@accent: ${ovr.accent || '@base0D'};
@border-color: ${ovr.border || '@base01'};

// ============================================================================
// Semantic Mappings - Backgrounds
// ============================================================================

@bg-primary: @base00;
@bg-secondary: @base01;
@bg-selection: @base02;
@bg-elevated: @base07;
@bg-tertiary: @base01;

// ============================================================================
// Semantic Mappings - Text
// ============================================================================

@text-muted: @base03;
@text-secondary: @base04;
@text-primary: @base05;
@text-emphasis: @base06;

// ============================================================================
// Semantic Mappings - Status Colors
// ============================================================================

@color-error: @base08;
@color-warning: @base09;
@color-info: @base0D;
@color-success: @base0C;

// ============================================================================
// Semantic Mappings - Syntax Highlighting
// ============================================================================

@syntax-variable: @base08;
@syntax-constant: @base09;
@syntax-class: @base0A;
@syntax-string: @base0B;
@syntax-regex: @base0C;
@syntax-function: @base0D;
@syntax-keyword: @base0E;
@syntax-comment: @base03;
@syntax-deprecated: @base0F;

// ============================================================================
// Derived Colors (using LESS functions)
// ============================================================================

@hover-overlay: fade(@base04, 10%);
@active-overlay: fade(@base04, 20%);
@focus-ring: fade(@primary, 50%);
@border-subtle: fade(@base04, 15%);
@border-primary: fade(@base04, 20%);
@shadow: fade(@base05, 10%);
@selection-bg: fade(@primary, 20%);

// Scrollbar colors
@scrollbar-track: @bg-secondary;
@scrollbar-thumb: fade(@base04, 40%);
@scrollbar-hover: fade(@base04, 60%);

// Input colors
@input-bg: @bg-elevated;
@input-border: @border-primary;
@input-focus-border: @primary;
@input-placeholder: @text-muted;

// Card colors
@card-bg: @bg-elevated;
@card-border: @border-subtle;
@card-shadow: fade(@base05, 10%);

// Code colors
@code-bg: @bg-secondary;
@code-text: @base08;

// ============================================================================
// Utility Mixins
// ============================================================================

.apply-scrollbar() {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: @scrollbar-track;
  }
  &::-webkit-scrollbar-thumb {
    background: @scrollbar-thumb;
    border-radius: 4px;
    &:hover {
      background: @scrollbar-hover;
    }
  }
}

.apply-focus-ring() {
  outline: 2px solid @focus-ring;
  outline-offset: 2px;
}

.apply-card() {
  background: @card-bg;
  border: 1px solid @card-border;
  border-radius: 8px;
  box-shadow: 0 2px 8px @card-shadow;
}
`;
}

/**
 * Process all TOML files in themes directory
 */
function main() {
  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.toml'));
  
  if (files.length === 0) {
    console.log('No .toml files found in themes/');
    return;
  }
  
  console.log(`Processing ${files.length} theme(s)...`);
  
  for (const file of files) {
    const tomlPath = join(THEMES_DIR, file);
    const lessPath = join(THEMES_DIR, file.replace('.toml', '.less'));
    
    try {
      const tomlContent = readFileSync(tomlPath, 'utf-8');
      const theme = parse(tomlContent);
      const lessContent = generateLess(theme, file);
      
      writeFileSync(lessPath, lessContent);
      console.log(`  ${file} -> ${basename(lessPath)}`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error.message);
    }
  }
  
  console.log('Done!');
}

main();
