# Code Signing & Notarization

This document explains how to set up code signing for Circe so end users don't get security warnings on install.

---

## macOS — Code Signing + Notarization

Without signing, users see: *"Circe cannot be opened because it is from an unidentified developer"* (Gatekeeper).

### What you need

1. **Apple Developer Program membership** — $99/year at [developer.apple.com](https://developer.apple.com)
2. **Developer ID Application certificate** — issued from Xcode or developer.apple.com → Certificates
3. **App-specific password** — generated at [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords

### Required env vars

| Variable | Description |
|---|---|
| `APPLE_ID` | Your Apple ID email (e.g. `you@example.com`) |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password (not your main Apple ID password) |
| `APPLE_TEAM_ID` | 10-character team ID from developer.apple.com → Membership |
| `CSC_LINK` | Path to `.p12` cert file, or base64-encoded cert string |
| `CSC_KEY_PASSWORD` | Password for the `.p12` certificate |

### Local build with signing

```bash
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
export CSC_LINK="/path/to/certificate.p12"
export CSC_KEY_PASSWORD="your-cert-password"

npm run build && npm run package
```

electron-builder will:
1. Sign the app with your Developer ID cert
2. Submit to Apple notary service via `notarytool`
3. Staple the notarization ticket to the `.dmg`

### CI (GitHub Actions)

Add all 5 variables as **repository secrets** in GitHub → Settings → Secrets and variables → Actions.

For `CSC_LINK`, encode your `.p12` as base64:
```bash
base64 -i certificate.p12 | pbcopy   # macOS
```
Paste the output as the `CSC_LINK` secret value.

See `.github/workflows/release.yml` for how these are injected at build time.

---

## Windows — Code Signing

Without signing, users see SmartScreen: *"Windows protected your PC."*

### What you need

- A **code signing certificate** from a trusted CA (DigiCert, Sectigo, etc.)
  - Standard OV cert: ~$200/year, SmartScreen reputation builds over time
  - EV cert: ~$300+/year, instant SmartScreen reputation (recommended for public release)

### Required env vars

| Variable | Description |
|---|---|
| `CSC_LINK` | Path to `.pfx` file, or base64-encoded `.pfx` |
| `CSC_KEY_PASSWORD` | Password for the `.pfx` certificate |
| `CSC_NAME` | (Optional) Certificate subject name for lookup |

### Standard OV cert — local build

```bash
export CSC_LINK="/path/to/certificate.pfx"
export CSC_KEY_PASSWORD="your-cert-password"

npm run build && npm run package
```

For CI, encode the `.pfx` as base64 and store as a secret:
```bash
base64 -w 0 certificate.pfx   # Linux
base64 -i certificate.pfx     # macOS
```
Set `CSC_LINK` to the base64 string, `CSC_KEY_PASSWORD` to the cert password.

### EV cert via Azure Key Vault

EV certs live on a hardware token and can't be exported as `.pfx`. Use [AzureSignTool](https://github.com/vcsjones/AzureSignTool) + Key Vault instead:

1. Upload your EV cert to Azure Key Vault
2. Create a Service Principal with `Key Vault Certificate User` role
3. Set `WIN_SIGN_MODE=akv` + these env vars:

| Variable | Description |
|---|---|
| `WIN_SIGN_MODE` | Set to `akv` to activate Key Vault mode |
| `AKV_TENANT_ID` | Azure tenant ID |
| `AKV_CLIENT_ID` | Service principal client ID |
| `AKV_CLIENT_SECRET` | Service principal secret |
| `AKV_VAULT_URI` | Key Vault URI (e.g. `https://myvault.vault.azure.net`) |
| `AKV_CERT_NAME` | Certificate name in Key Vault |

The custom hook in `build/sign.js` handles the AzureSignTool invocation.

### Verify signing (Windows)

```powershell
# Check signature
Get-AuthenticodeSignature "dist\Circe Setup x.x.x.exe" | Select-Object Status, SignerCertificate

# Or via signtool
signtool verify /pa /v "dist\Circe Setup x.x.x.exe"
```

Expected: `Valid` with your certificate's CN.

---

## Skip signing for local/dev builds

If none of the signing env vars are set, electron-builder will skip signing automatically (configured in `electron-builder.config.ts`). The app will still build and run, but will trigger OS warnings on other machines.

```bash
# Dev/test build — no signing
npm run build && npm run package
```

---

## Verify signing (macOS)

```bash
codesign --verify --verbose dist/mac/Circe.app
spctl --assess --verbose dist/mac/Circe.app
```

Expected output: `accepted` and `source=Notarized Developer ID`.
