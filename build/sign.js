/**
 * Custom Windows signing hook for electron-builder.
 *
 * Supports two modes:
 *   1. Standard OV cert  — CSC_LINK + CSC_KEY_PASSWORD (.pfx file or base64)
 *   2. EV cert via Azure Key Vault — AKV_* env vars (hardware token simulation)
 *
 * Set WIN_SIGN_MODE=akv to use Azure Key Vault mode, otherwise defaults to standard.
 *
 * References:
 *   https://www.electron.build/code-signing
 *   https://github.com/nicowillis/electron-builder-azure-key-vault-sign
 */

const { execSync } = require('child_process');
const path = require('path');

exports.default = async function sign(configuration) {
  const filePath = configuration.path;

  if (!filePath || !filePath.endsWith('.exe')) {
    // Only sign .exe files
    return;
  }

  const mode = process.env.WIN_SIGN_MODE || 'standard';

  if (mode === 'akv') {
    // Azure Key Vault signing (EV cert)
    // Requires: AKV_TENANT_ID, AKV_CLIENT_ID, AKV_CLIENT_SECRET, AKV_VAULT_URI, AKV_CERT_NAME
    // Tool: AzureSignTool (https://github.com/vcsjones/AzureSignTool)
    const required = ['AKV_TENANT_ID', 'AKV_CLIENT_ID', 'AKV_CLIENT_SECRET', 'AKV_VAULT_URI', 'AKV_CERT_NAME'];
    for (const v of required) {
      if (!process.env[v]) throw new Error(`Missing env var: ${v}`);
    }

    const cmd = [
      'AzureSignTool sign',
      `-kvu "${process.env.AKV_VAULT_URI}"`,
      `-kvi "${process.env.AKV_CLIENT_ID}"`,
      `-kvt "${process.env.AKV_TENANT_ID}"`,
      `-kvs "${process.env.AKV_CLIENT_SECRET}"`,
      `-kvc "${process.env.AKV_CERT_NAME}"`,
      `-tr http://timestamp.digicert.com`,
      `-td sha256`,
      `-fd sha256`,
      `"${filePath}"`
    ].join(' ');

    console.log(`[sign] AKV signing: ${path.basename(filePath)}`);
    execSync(cmd, { stdio: 'inherit' });

  } else {
    // Standard OV cert signing — electron-builder handles this natively via CSC_LINK
    // This hook is a no-op for standard mode; electron-builder's built-in signing runs
    console.log(`[sign] Standard signing delegated to electron-builder: ${path.basename(filePath)}`);
  }
};
