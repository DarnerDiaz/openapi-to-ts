#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { parseOpenAPI, extractSchemas } from './parser';
import { generateAllTypes } from './generator';

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: openapi-to-ts <spec-file> [-o output-file]');
    process.exit(1);
  }
  
  const specFile = args[0];
  const outputIndex = args.indexOf('-o');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;
  
  if (!fs.existsSync(specFile)) {
    console.error(`Error: File not found - ${specFile}`);
    process.exit(1);
  }
  
  try {
    const spec = parseOpenAPI(specFile);
    const schemas = extractSchemas(spec);
    const typeScript = generateAllTypes(schemas);
    
    if (outputFile) {
      fs.writeFileSync(outputFile, typeScript, 'utf-8');
      console.log(`✓ Generated types written to ${outputFile}`);
    } else {
      console.log(typeScript);
    }
  } catch (error) {
    console.error('Error generating types:', (error as Error).message);
    process.exit(1);
  }
}

main();
