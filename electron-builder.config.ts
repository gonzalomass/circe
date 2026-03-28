import { Configuration } from 'electron-builder';

// Detect whether a valid Apple signing certificate is available.
// CSC_LINK (file/base64) or CSC_NAME (keychain identity) indicate a cert is present.
const hasSigningCert = !!(process.env.CSC_LINK || process.env.CSC_NAME);

const config: Configuration = {
  appId: 'com.circe.app',
  productName: 'Circe',
  // Publish config — used by electron-updater to check for updates via GitHub Releases
  // Set GH_TOKEN env var (or GITHUB_TOKEN in CI) to publish; read-only for update checks
  publish: [
    {
      provider: 'github',
      owner: 'gonzalomass',   // ← update to your GitHub username/org
      repo: 'circe',
      releaseType: 'release'
    }
  ],
  directories: {
    buildResources: 'build',
    output: 'dist'
  },
  files: ['out/**/*', 'package.json'],
  mac: {
    target: [
      { target: 'dmg', arch: ['arm64', 'x64'] }
    ],
    category: 'public.app-category.developer-tools',
    icon: 'build/icon.icns',
    // Code signing — requires a valid Developer ID cert in keychain (or CSC_LINK env var).
    // When no cert is available, identity is set to null to produce a clean unsigned build
    // that shows "unidentified developer" (bypassable via right-click → Open) instead of
    // the fatal "damaged and can't be opened" Gatekeeper error.
    ...(hasSigningCert
      ? {
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'build/entitlements.mac.plist',
          entitlementsInherit: 'build/entitlements.mac.plist',
          notarize: process.env.APPLE_ID
            ? { teamId: process.env.APPLE_TEAM_ID! }
            : false
        }
      : {
          identity: null   // skip code signing entirely — no broken signatures
        }
    ),
  },
  win: {
    target: ['nsis'],
    icon: 'build/icon.ico',
    // Standard OV cert: set CSC_LINK (path or base64 .pfx) + CSC_KEY_PASSWORD
    // EV cert via Azure Key Vault: set WIN_SIGN_MODE=akv + AKV_* env vars (see build/sign.js)
    signingHashAlgorithms: ['sha256'],
    // Custom sign hook handles both standard and AKV modes; skips if no signing configured
    sign: (process.env.CSC_LINK || process.env.WIN_SIGN_MODE === 'akv')
      ? 'build/sign.js'
      : null,
    timeStampServer: 'http://timestamp.digicert.com'
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Development',
    icon: 'build/icon.png'
  },
  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};

export default config;
