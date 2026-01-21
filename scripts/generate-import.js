#!/usr/bin/env bun

/**
 * Generates import.json for Stylus browser extension
 * Run with: bun scripts/generate-import.js
 */

import { readFileSync, writeFileSync } from 'fs';

// Style definitions - add new styles here
// Uses compiled CSS files (not LESS) so Stylus can import them directly
const styles = [
  {
    path: 'styles/all/rose-of-dune.user.css',
    name: 'All Sites - Rose of Dune',
    description: 'A soft rose-gold theme for all supported websites (Discord, Claude.ai)',
  },
  {
    path: 'styles/discord/rose-of-dune.user.css',
    name: 'Discord - Rose of Dune',
    description: 'A soft rose-gold theme for Discord with warm brown accents',
  },
  {
    path: 'styles/claude/rose-of-dune.user.css',
    name: 'Claude - Rose of Dune',
    description: 'A soft rose-gold theme for Claude.ai with warm brown accents',
  },
];

// Common metadata
const author = 'yherrero';
const namespace = 'github.com/yherrero/stylus';
const version = '1.0.0';

function buildStyleEntry(styleDef, id) {
  let source = readFileSync(styleDef.path, 'utf-8');
  
  // Remove @preprocessor line since we're using compiled CSS
  source = source.replace(/@preprocessor\s+less\n?/g, '');
  
  return {
    id: id,
    enabled: true,
    name: styleDef.name,
    description: styleDef.description,
    author: author,
    usercssData: {
      name: styleDef.name,
      namespace: namespace,
      version: version,
    },
    sourceCode: source,
  };
}

// Build the import.json structure
// First element can be settings or a style - Stylus detects automatically
const importData = styles.map((style, index) => buildStyleEntry(style, index + 1));

// Write the file
writeFileSync('import.json', JSON.stringify(importData));

console.log(`Generated import.json with ${styles.length} styles:`);
styles.forEach(s => console.log(`  - ${s.name}`));
