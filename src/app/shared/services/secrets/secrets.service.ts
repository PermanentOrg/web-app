import { Injectable } from '@angular/core';
import requiredSecrets from '@root/required-secrets';
import debug from 'debug';

let secrets = {};

try {
  secrets = require('@root/secrets').SECRETS;
} catch (err) {
  console.error(err);
  throw new Error('Unable to read secrets.ts - make sure to run `node secrets.js` before building!');
}

@Injectable({
  providedIn: 'root'
})
export class SecretsService {
  private debug = debug('service:secretsService');

  constructor() {
    const missingSecrets = [];

    for (const secret of requiredSecrets) {
      if (secrets[secret] === undefined) {
        missingSecrets.push(secret);
      }
    }

    this.debug('Loaded %d secrets from secrets.ts', Object.keys(secrets).length);

    if (missingSecrets.length) {
      console.error('SecretsService: Missing required secrets: %s', missingSecrets.join(','));
    }
  }

  get(key: string) {
    return SecretsService.getStatic(key);
  }

  static getStatic(key: string) {
    if (secrets[key] === undefined) {
      throw new Error(`Secret ${key} not found. Check your .env file and restart`);
    }

    return secrets[key];
  }
}
