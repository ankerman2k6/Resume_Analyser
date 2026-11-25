const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');

// Share public configuration only; secrets must never enter the Expo config.
const sharedEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(sharedEnvPath)) {
  const sharedEnv = parseEnv(fs.readFileSync(sharedEnvPath, 'utf8'));
  for (const [key, value] of Object.entries(sharedEnv)) {
    if (key.startsWith('EXPO_PUBLIC_') && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

module.exports = ({ config }) => config;
