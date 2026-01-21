#!/usr/bin/env bun

/**
 * Builds CSS styles for each theme + site combination
 * Injects theme variables at build time using LESS
 * Run with: bun scripts/build-styles.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';
import { parse } from 'smol-toml';

const THEMES_DIR = 'themes';
const STYLES_DIR = 'styles';

// Site configurations - which .user.less files to build
const SITES = [
  { name: 'discord', file: 'discord.user.less' },
  { name: 'claude', file: 'claude.user.less' },
  { name: 'mtools', file: 'mtools.user.less' },
  { name: 'all', file: 'all.user.less' },
];

/**
 * Get all theme definitions from TOML files
 */
function getThemes() {
  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.toml'));
  
  return files.map(file => {
    const tomlPath = join(THEMES_DIR, file);
    const lessPath = join(THEMES_DIR, file.replace('.toml', '.less'));
    const content = readFileSync(tomlPath, 'utf-8');
    const theme = parse(content);
    
    return {
      slug: file.replace('.toml', ''),
      name: theme.meta.name,
      id: theme.meta.id,
      type: theme.meta.type,
      lessPath,
    };
  });
}

/**
 * Build a single site style with a theme
 */
function buildStyle(theme, site) {
  const siteDir = join(STYLES_DIR, site.name);
  const stylePath = join(siteDir, site.file);
  const outputPath = join(siteDir, `${theme.slug}.user.css`);
  
  // Check if source files exist
  if (!existsSync(stylePath)) {
    console.error(`  Error: ${stylePath} not found`);
    return false;
  }
  
  if (!existsSync(theme.lessPath)) {
    console.error(`  Error: ${theme.lessPath} not found (run build:themes first)`);
    return false;
  }
  
  try {
    // Read theme LESS and site style
    const themeLess = readFileSync(theme.lessPath, 'utf-8');
    const styleLess = readFileSync(stylePath, 'utf-8');
    
    // Combine: theme variables first, then site style
    const combinedLess = themeLess + '\n\n' + styleLess;
    
    // Write to temp file for lessc to process
    const tempPath = join(siteDir, `.${theme.slug}.temp.less`);
    writeFileSync(tempPath, combinedLess);
    
    // Compile with lessc
    const css = execSync(`lessc "${tempPath}"`, { encoding: 'utf-8' });
    
    // Remove temp file
    execSync(`rm "${tempPath}"`);
    
    // Replace {{THEME_NAME}} placeholder
    const finalCss = css.replace(/\{\{THEME_NAME\}\}/g, theme.name);
    
    // Remove @preprocessor line (not needed for compiled CSS)
    const cleanCss = finalCss.replace(/@preprocessor\s+less\n?/g, '');
    
    // Write output
    writeFileSync(outputPath, cleanCss);
    
    return true;
  } catch (error) {
    console.error(`  Error building ${site.name}/${theme.slug}: ${error.message}`);
    return false;
  }
}

/**
 * Main build process
 */
function main() {
  console.log('Building styles...\n');
  
  // Get all themes
  const themes = getThemes();
  
  if (themes.length === 0) {
    console.log('No theme files found in themes/');
    return;
  }
  
  console.log(`Found ${themes.length} theme(s): ${themes.map(t => t.name).join(', ')}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Build each theme + site combination
  for (const theme of themes) {
    console.log(`Building ${theme.name}...`);
    
    for (const site of SITES) {
      const success = buildStyle(theme, site);
      
      if (success) {
        console.log(`  ${site.name}/${theme.slug}.user.css`);
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log('');
  }
  
  console.log(`Done! Built ${successCount} styles, ${failCount} failed.`);
}

main();
