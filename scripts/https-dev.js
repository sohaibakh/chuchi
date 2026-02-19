#!/usr/bin/env node

/**
 * HTTPS Proxy for Nuxt Dev Server
 * Runs Nuxt on HTTP and proxies it through HTTPS
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const certDir = path.join(__dirname, '..', 'certs');
const certFile = path.join(certDir, 'cert.pem');
const keyFile = path.join(certDir, 'key.pem');

// Check if certs exist
if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    console.error('❌ SSL certificates not found!');
    console.error('📝 Run this command first:');
    console.error('   npm run generate-cert');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

console.log('🔐 Starting HTTPS server...');

// Read certificates
const options = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
};

// Start Nuxt dev server on HTTP (port 3000)
console.log(`📍 Starting Nuxt on http://localhost:${PORT}...`);
const nuxtProcess = spawn('node', [
    '--max-old-space-size=16384',
    path.join(__dirname, '..', 'node_modules', 'nuxt', 'bin', 'nuxt.js')
], {
    cwd: path.join(__dirname, '..'),
    env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: PORT,
        HOST: 'localhost'
    },
    stdio: ['inherit', 'inherit', 'inherit']
});

// Wait for Nuxt to start, then create HTTPS proxy
setTimeout(() => {
    // Create HTTPS server that proxies to HTTP
    const server = https.createServer(options, (req, res) => {
        const proxyReq = http.request({
            hostname: 'localhost',
            port: PORT,
            path: req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        req.pipe(proxyReq);

        proxyReq.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(502);
            res.end('Bad Gateway');
        });
    });

    server.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`\n✅ HTTPS server ready!\n`);
        console.log(`🌐 Local: https://localhost:${HTTPS_PORT}`);
        
        // Get local IP for mobile testing
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let localIP = '127.0.0.1';
        
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIP = iface.address;
                }
            }
        }
        
        console.log(`📱 Mobile: https://${localIP}:${HTTPS_PORT}`);
        console.log(`\n⚠️  Accept the security warning on mobile - this is a self-signed certificate\n`);
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
    });
}, 3000); // Wait 3 seconds for Nuxt to start

process.on('SIGINT', () => {
    console.log('\n🛑 Stopping servers...');
    nuxtProcess.kill();
    process.exit(0);
});

nuxtProcess.on('exit', (code) => {
    console.log('Nuxt exited with code', code);
    process.exit(code);
});

