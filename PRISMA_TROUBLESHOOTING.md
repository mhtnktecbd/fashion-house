# Windows Prisma Troubleshooting Guide

## ❌ Error: `EPERM: operation not permitted`
This error means a file in `node_modules/.prisma` is locked by another process.

## 🛠️ Automated Fix
Run the included script in PowerShell as Admin:
```powershell
./scripts/fix-prisma.ps1
```

## 🖐️ Manual Fix Steps
1.  **Close Everything**: Close all terminal windows and stop `npm run dev`.
2.  **Kill Node**: Open Task Manager -> Details -> End all `node.exe` processes.
3.  **Delete Cache**: Delete the folder `node_modules/.prisma`.
4.  **Regenerate**: Run `npx prisma generate`.

## 🛡️ Antivirus Exclusions
If the error persists, Windows Defender might be locking the file during generation.
1.  Open **Windows Security** -> **Virus & threat protection**.
2.  Click **Manage settings** under "Virus & threat protection settings".
3.  Scroll to **Exclusions** -> **Add or remove exclusions**.
4.  Add Folder: `c:\Users\MOJA\Documents\fation house\node_modules`

## ☁️ OneDrive Issues
If your project is in a OneDrive synced folder:
1.  Pause OneDrive syncing temporarily.
2.  Or move the project outside of OneDrive (e.g., to `C:\Projects`).
