#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Setting up Firebase Emulators...');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is already installed');
} catch (error) {
  console.log('📦 Installing Firebase CLI...');
  execSync('npm install -g firebase-tools', { stdio: 'inherit' });
}

// Create firebase.json if it doesn't exist
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
if (!fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = {
    "emulators": {
      "auth": {
        "port": 9099
      },
      "firestore": {
        "port": 8080
      },
      "storage": {
        "port": 9199
      },
      "ui": {
        "enabled": true,
        "port": 4000
      }
    }
  };

  fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Created firebase.json');
}

// Create .firebaserc if it doesn't exist
const firebaseRcPath = path.join(__dirname, '..', '.firebaserc');
if (!fs.existsSync(firebaseRcPath)) {
  const firebaseRc = {
    "projects": {
      "default": "store-online-dev"
    }
  };

  fs.writeFileSync(firebaseRcPath, JSON.stringify(firebaseRc, null, 2));
  console.log('✅ Created .firebaserc');
}

console.log('🎉 Firebase Emulators setup complete!');
console.log('');
console.log('To start the emulators, run:');
console.log('  firebase emulators:start');
console.log('');
console.log('Emulator URLs:');
console.log('  - Auth: http://localhost:9099');
console.log('  - Firestore: http://localhost:8080');
console.log('  - Storage: http://localhost:9199');
console.log('  - UI: http://localhost:4000');
