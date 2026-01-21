#!/usr/bin/env bun

/**
 * Generates [theme].json files for Stylus browser extension import
 * One JSON file per theme, containing all site styles for that theme
 * Run with: bun scripts/generate-import.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'smol-toml';

const THEMES_DIR = 'themes';
const STYLES_DIR = 'styles';

// Site configurations with metadata
// Only exporting "all" since it combines all site styles
const SITES = [
  {
    name: 'all',
    displayName: 'All Sites',
    description: 'theme for all supported websites (Discord, Claude.ai, MTools, Outlook, Teams)',
  },
];

// Common metadata
const author = 'yherrero';
const namespace = 'github.com/yherrero/stylus';
const version = '1.0.0';

/**
 * Get all theme definitions from TOML files
 */
function getThemes() {
  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.toml'));
  
  return files.map(file => {
    const tomlPath = join(THEMES_DIR, file);
    const content = readFileSync(tomlPath, 'utf-8');
    const theme = parse(content);
    
    return {
      slug: file.replace('.toml', ''),
      name: theme.meta.name,
      id: theme.meta.id,
      type: theme.meta.type,
    };
  });
}

/**
 * Build a style entry for the import JSON
 */
function buildStyleEntry(theme, site, id) {
  const cssPath = join(STYLES_DIR, site.name, `${theme.slug}.user.css`);
  
  if (!existsSync(cssPath)) {
    console.warn(`  Warning: ${cssPath} not found, skipping`);
    return null;
  }
  
  let source = readFileSync(cssPath, 'utf-8');
  
  // Remove @preprocessor line since we're using compiled CSS
  source = source.replace(/@preprocessor\s+less\n?/g, '');
  
  const styleName = `${site.displayName} - ${theme.name}`;
  const styleDescription = `${theme.name} ${site.description}`;
  
  return {
    id: id,
    enabled: true,
    name: styleName,
    description: styleDescription,
    author: author,
    usercssData: {
      name: styleName,
      namespace: namespace,
      version: version,
    },
    sourceCode: source,
  };
}

/**
 * Generate import JSON for a single theme
 */
function generateThemeImport(theme) {
  const styles = [];
  let id = 1;
  
  for (const site of SITES) {
    const entry = buildStyleEntry(theme, site, id);
    if (entry) {
      styles.push(entry);
      id++;
    }
  }
  
  return styles;
}

/**
 * Main process
 */
function main() {
  console.log('Generating import JSON files...\n');
  
  const themes = getThemes();
  
  if (themes.length === 0) {
    console.log('No theme files found in themes/');
    return;
  }
  
  console.log(`Found ${themes.length} theme(s)\n`);
  
  for (const theme of themes) {
    console.log(`Processing ${theme.name}...`);
    
    const importData = generateThemeImport(theme);
    
    if (importData.length === 0) {
      console.log(`  No styles found, skipping`);
      continue;
    }
    
    const outputPath = `${theme.slug}.json`;
    writeFileSync(outputPath, JSON.stringify(importData, null, 2));
    
    console.log(`  Generated ${outputPath} with ${importData.length} styles`);
  }
  
  console.log('\nDone!');
}

main();
