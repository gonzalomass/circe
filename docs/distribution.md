# Distributing & Installing Circe

This guide explains how to build Circe for distribution and install it locally — no terminal required for end users.

---

## Building the Installable

Run this once from the project root (requires Node.js 20+):

```bash
npm run build      # Compile the app
npm run package    # Package into a distributable
```

Output is written to the `dist/` folder:

| Platform | Output file | How users install it |
|---|---|---|
| **macOS** | `dist/Circe-x.x.x.dmg` | Double-click → drag to Applications |
| **Windows** | `dist/Circe Setup x.x.x.exe` | Double-click → follow installer |
| **Linux** | `dist/Circe-x.x.x.AppImage` | Mark executable → double-click |

---

## macOS — `.dmg` installer

1. Double-click `Circe-x.x.x.dmg`
2. A window opens with the Circe icon and an Applications folder shortcut
3. Drag **Circe** onto **Applications**
4. Eject the disk image
5. Open **Launchpad** or **Applications** folder and launch Circe

> **First launch warning:** macOS may show *"Circe cannot be opened because it is from an unidentified developer."*
> To bypass: **right-click → Open** instead of double-clicking, then confirm in the dialog.
> This happens because the app is not yet notarized with Apple. You only need to do this once.

---

## Windows — `.exe` installer

1. Double-click `Circe Setup x.x.x.exe`
2. Choose installation directory (default: `C:\Program Files\Circe`)
3. Click Install
4. Launch from the Start menu or desktop shortcut

> **SmartScreen warning:** Windows may show *"Windows protected your PC."* Click **More info → Run anyway**.
> This happens because the app is not code-signed yet.

---

## Linux — `.AppImage`

```bash
chmod +x Circe-x.x.x.AppImage   # Make it executable (one time)
./Circe-x.x.x.AppImage          # Run it
```

Or double-click in your file manager if it supports AppImage execution.

To integrate with your app launcher, use a tool like [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

---

## Requirements

End users need:
- **Node.js is NOT required** — Circe bundles its own Node.js runtime via Electron
- **npm is required** — for running scripts inside the managed projects (separate from Circe itself)
- macOS 10.13+, Windows 10+, or Ubuntu 18+

---

## For developers — running without packaging

If you want to run Circe locally without building an installer:

```bash
npm install
npm run dev     # Opens the app window with hot reload
```

Or build once and preview:

```bash
npm run build
npm run preview
```
