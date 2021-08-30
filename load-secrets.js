const { writeFileSync } = require('fs');
const requiredSecrets = require('./src/required-secrets');

// load variables from .env file
require('dotenv').config();

const outputFile = './src/secrets.ts';

const missingSecrets = [];

for (const secret of requiredSecrets) {
  if (process.env[secret] === undefined) {
    missingSecrets.push(secret);
  }
}

// if missing, terminate script to prevent build or serve from running
if (missingSecrets.length) {
  console.error(`ERROR: Missing the following environment variables: ${missingSecrets.join(',')}`);
  process.exit(1);
}

// write to secrets.ts file
const secretsFileContent = `export const SECRETS = { ${requiredSecrets.map(name => `${name}: '${process.env[name]}'`).join(', ')} }`;
try {
  writeFileSync(outputFile, secretsFileContent);
} catch (err) {
  console.error(`Error writing to file: ${JSON.stringify(err)}`);
}
