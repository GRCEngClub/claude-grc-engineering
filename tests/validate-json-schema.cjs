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

function formatDataFile(file) {
  return basename(file)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C');
}

function sanitizeDiagnostic(message) {
  return String(message)
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function writeOutput(stream, message) {
  stream.write(`${sanitizeDiagnostic(message)}\n`);
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  writeOutput(process.stderr, `schema-validator: ${error.message}`);
  process.exit(2);
}

try {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    // Repository schemas intentionally place `required` in conditional/union
    // branches while defining the corresponding properties in a parent schema.
    strictRequired: false,
  });
  addFormats(ajv);
  const validate = ajv.compile(readJson(options.schema));
  let failed = false;

  for (const file of options.data) {
    let data;
    try {
      data = readJson(file);
    } catch (error) {
      throw new Error(`data file ${formatDataFile(file)} invalid JSON: ${error.message}`);
    }

    const valid = validate(data);
    if (valid) {
      if (!options.quiet) writeOutput(process.stdout, `data file ${formatDataFile(file)} valid`);
    } else {
      failed = true;
      writeOutput(
        process.stderr,
        `data file ${formatDataFile(file)} invalid: ${formatErrors(validate.errors)}`,
      );
    }
  }

  process.exit(failed ? 1 : 0);
} catch (error) {
  writeOutput(process.stderr, `schema-validator: ${error.message}`);
  process.exit(2);
}
