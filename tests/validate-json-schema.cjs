#!/usr/bin/env node

const { readFileSync } = require('node:fs');
const { basename } = require('node:path');
const Ajv2020 = require('ajv/dist/2020').default;
const addFormats = require('ajv-formats');

function parseArguments(argv) {
  const options = { data: [], quiet: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--schema') {
      options.schema = argv[index + 1];
      index += 1;
    } else if (argument === '--data') {
      options.data.push(argv[index + 1]);
      index += 1;
    } else if (argument === '--quiet') {
      options.quiet = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.schema) throw new Error('Missing required --schema <file> argument');
  if (options.data.length === 0) throw new Error('Provide at least one --data <file> argument');
  return options;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function formatErrors(errors = []) {
  return errors
    .map((error) => `${error.instancePath || '/'} ${error.message}`)
    .join('; ');
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(`schema-validator: ${error.message}`);
  process.exit(2);
}

try {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(readJson(options.schema));
  let failed = false;

  for (const file of options.data) {
    let data;
    try {
      data = readJson(file);
    } catch (error) {
      throw new Error(`${basename(file)} invalid JSON: ${error.message}`);
    }

    const valid = validate(data);
    if (valid) {
      if (!options.quiet) console.log(`${basename(file)} valid`);
    } else {
      failed = true;
      console.error(`${basename(file)} invalid: ${formatErrors(validate.errors)}`);
    }
  }

  process.exit(failed ? 1 : 0);
} catch (error) {
  console.error(`schema-validator: ${error.message}`);
  process.exit(2);
}
