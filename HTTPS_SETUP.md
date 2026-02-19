# HTTPS Setup for Mobile WebGL Testing

This project now supports HTTPS for testing the 3D spinner on mobile devices.

## Prerequisites

You need **OpenSSL** installed:

**Windows (Git Bash):**
- If you have Git Bash installed, OpenSSL is included
- Or install via: `choco install openssl` (using Chocolatey)

**Mac/Linux:**
- OpenSSL is pre-installed

## Quick Start

### Step 1: Generate SSL Certificate (One Time)

```bash
npm run generate-cert
```

This creates self-signed certificates in `/certs/` (ignored by git).

### Step 2: Start HTTPS Dev Server

```bash
npm run dev:https
```

The server will output:
```
✅ HTTPS server ready!
🌐 Local: https://localhost:8443
📱 Mobile: https://192.168.X.X:8443
```

### Step 3: Access on Mobile

1. On your mobile device, open the URL shown (e.g., `https://192.168.1.100:8443`)
2. Accept the browser's security warning (self-signed certificate)
3. ✅ The 3D spinner will now appear!

## How It Works

The `npm run dev:https` command:
1. Generates SSL certificates if needed
2. Starts Nuxt dev server on `http://localhost:3000`
3. Creates an HTTPS proxy on `https://0.0.0.0:8443`
4. Proxies requests from HTTPS to the HTTP Nuxt server

## Regular HTTP Development

For development without mobile testing:

```bash
npm run dev
# Runs on http://localhost:3000
```

## Troubleshooting

### "Certificate not found" error
```bash
npm run generate-cert
```

### OpenSSL not installed (Windows)

Install Git Bash: https://gitforwindows.org/

Or use Chocolatey:
```bash
choco install openssl
```

### Mobile can't reach server
- Ensure both devices are on the **same Wi-Fi network**
- Verify the IP address (run `ipconfig`)
- Check Windows Firewall isn't blocking port 8443

### Certificate warning on mobile
- This is normal for self-signed certificates
- Tap "Advanced" → "Continue" or "Proceed"
- It's only for development

## Custom HTTPS Port

```bash
set HTTPS_PORT=9443
npm run dev:https
```

Or Mac/Linux:
```bash
HTTPS_PORT=9443 npm run dev:https
```

## Notes

- Certificates are valid for 365 days
- They're stored in `/certs/` (ignored by git, don't commit)
- Each regeneration creates a new certificate
- The proxy adds minimal overhead
- All WebGL features now work on mobile!
