import { Configuration } from 'electron-builder';

const config: Configuration = {
  appId: 'com.circe.app',
  productName: 'Circe',
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
    // Code signing — requires APPLE_TEAM_ID and a valid Developer ID cert in keychain
    // Set CSC_LINK + CSC_KEY_PASSWORD env vars (or use keychain directly on macOS CI)
    hardenedRuntime: true,
    gatekeeperAssess: false,       // let notarization handle this
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    notarize: process.env.APPLE_ID
      ? {
          teamId: process.env.APPLE_TEAM_ID!
        }
      : false
  },
  win: {
    target: ['nsis'],
    icon: 'build/icon.ico',
    // Code signing — set CSC_LINK (path or base64 .pfx) + CSC_KEY_PASSWORD
    // Optional: CSC_NAME for certificate subject name
    signingHashAlgorithms: ['sha256'],
    sign: process.env.CSC_LINK ? undefined : null   // skip signing if no cert configured
  },
  linux: {
    target: ['AppImage'],
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
