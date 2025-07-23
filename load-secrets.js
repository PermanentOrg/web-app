const { writeFileSync } = require('fs');
const requiredSecrets = require('./src/required-secrets');
const optionalSecrets = require('./src/optional-secrets');

// load variables from .env file
require('dotenv').config();

const outputFile = './src/secrets.ts';

const missingSecrets = [];

for (const secret of requiredSecrets) {
	if (process.env[secret] === undefined) {
		missingSecrets.push(secret);
	}
}
for (const secret of optionalSecrets) {
	if (process.env[secret.name] === undefined) {
		process.env[secret.name] = secret.default;
	}
	requiredSecrets.push(secret.name);
}

// if missing, terminate script to prevent build or serve from running
if (missingSecrets.length) {
	console.error(
		`ERROR: Missing the following environment variables: ${missingSecrets.join(
			',',
		)}`,
	);
	process.exit(1);
}

// write to secrets.ts file
const secretsFileContent = `export const SECRETS = { ${requiredSecrets
	.map((name) => `'${name}': '${process.env[name]}'`)
	.join(', ')} }`;
try {
	writeFileSync(outputFile, secretsFileContent);
} catch (err) {
	console.error(`Error writing to file: ${JSON.stringify(err)}`);
}
