#!/usr/bin/env node

/**
 * Generate self-signed certificate for HTTPS development
 * This creates a certificate in the project root to enable HTTPS locally
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '..', 'certs');
const certFile = path.join(certDir, 'cert.pem');
const keyFile = path.join(certDir, 'key.pem');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
}

// Check if certificate already exists
if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    console.log('✅ SSL certificates already exist');
    process.exit(0);
}

console.log('🔐 Generating self-signed SSL certificate for HTTPS...');

try {
    // Generate self-signed certificate using OpenSSL
    const command = `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ SSL certificate generated successfully!');
    console.log(`📁 Certificate: ${certFile}`);
    console.log(`📁 Key: ${keyFile}`);
} catch (error) {
    console.error('❌ Failed to generate certificate');
    console.error('Make sure OpenSSL is installed on your system');
    console.error('For Windows: Install Git Bash or use WSL');
    console.error('For Mac/Linux: OpenSSL should be pre-installed');
    process.exit(1);
}
