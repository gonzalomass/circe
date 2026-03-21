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
    target: ['dmg'],
    category: 'public.app-category.developer-tools'
  },
  win: {
    target: ['nsis'],
    icon: 'build/icon.ico'
  },
  linux: {
    target: ['AppImage'],
    category: 'Development'
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
