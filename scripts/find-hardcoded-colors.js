#!/usr/bin/env node

/**
 * This script helps find hardcoded color values in the codebase
 * and suggests replacements with theme variables
 * 
 * Usage:
 * node scripts/find-hardcoded-colors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Defines color mappings from hardcoded values to theme variables
const COLOR_MAPPINGS = {
  // Monad colors
  '#4ADE80': 'var(--monad-green)',
  '#22c55e': 'var(--monad-dark-green)',
  
  // Fuse colors
  '#FA761E': 'var(--fuse-orange)',
  '#F9C846': 'var(--fuse-gold)',
  '#1E88FA': 'var(--fuse-blue)',
  '#0D2B47': 'var(--fuse-dark-blue)',
};

// Tailwind class suggestions for common hardcoded colors
const TAILWIND_SUGGESTIONS = {
  '#4ADE80': 'bg-theme-primary or bg-monad-green',
  '#22c55e': 'bg-theme-secondary or bg-monad-dark-green',
  '#FA761E': 'bg-fuse-orange',
  '#F9C846': 'bg-fuse-gold',
  '#0D2B47': 'bg-fuse-dark-blue',
  
  // With opacity variants
  '#4ADE80/20': 'bg-theme-primary/20 or bg-monad-green/20',
  '#22c55e/20': 'bg-theme-secondary/20 or bg-monad-dark-green/20',
};

// Regular expression to find color hex values in CSS classes
const COLOR_REGEX = /#[0-9A-Fa-f]{3,8}(?:\/\d+)?/g;
const CLASS_WITH_COLOR_REGEX = /\b(bg|text|border|ring|shadow|outline)-\[#[0-9A-Fa-f]{3,8}(?:\/\d+)?\]/g;

// Search directories
const SEARCH_DIRS = ['src/components', 'src/screens', 'src/pages'];

// Function to search for hardcoded colors in files
function findHardcodedColors() {
  console.log('🔍 Searching for hardcoded colors in codebase...\n');
  
  // Use grep to find all files with hex colors
  try {
    SEARCH_DIRS.forEach(dir => {
      const files = execSync(`grep -r -l "#[0-9A-Fa-f]" ${dir} --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js"`)
        .toString()
        .split('\n')
        .filter(Boolean);
      
      if (files.length === 0) {
        console.log(`No hardcoded colors found in ${dir}`);
        return;
      }
      
      console.log(`\n📁 Found hardcoded colors in ${files.length} files in ${dir}:`);
      
      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const classMatches = [...content.matchAll(CLASS_WITH_COLOR_REGEX)];
        
        if (classMatches.length > 0) {
          console.log(`\n📄 ${file}:`);
          
          // Group by color for better readability
          const colorClasses = {};
          classMatches.forEach(match => {
            const fullMatch = match[0];
            const colorValue = fullMatch.match(/#[0-9A-Fa-f]{3,8}(?:\/\d+)?/)[0];
            
            if (!colorClasses[colorValue]) {
              colorClasses[colorValue] = [];
            }
            
            if (!colorClasses[colorValue].includes(fullMatch)) {
              colorClasses[colorValue].push(fullMatch);
            }
          });
          
          // Print each color and its usages
          Object.entries(colorClasses).forEach(([color, classes]) => {
            console.log(`  🎨 ${color}:`);
            classes.forEach(cls => {
              console.log(`    - ${cls}`);
              
              // Suggest replacement
              const type = cls.split('-')[0]; // bg, text, etc.
              const suggestion = TAILWIND_SUGGESTIONS[color] || 
                                `${type}-theme-primary (dynamic) or ${type}-monad-green/fuse-gold (explicit)`;
              console.log(`      ↳ Suggested: ${suggestion}`);
            });
          });
        }
      });
    });
  } catch (error) {
    console.error('Error searching for hardcoded colors:', error.message);
  }
}

// Run the function
findHardcodedColors(); 