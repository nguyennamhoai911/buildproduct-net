const { app, BrowserWindow, ipcMain, clipboard, nativeImage } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this internal tool
      webSecurity: false
    },
    title: "Illustrator Clipboard Manager (Database Connected)"
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Clipboard Logic ---

// 1. Capture Logic (Illustrator -> App)
ipcMain.handle('read-illustrator-clipboard', async () => {
    // True "Black Box": Get verified available formats from the system
    const systemFormats = clipboard.availableFormats();
    const logs = [`System reports: ${systemFormats.length} formats available: ${systemFormats.join(', ')}`];
    console.log(logs[0]);

    const payload = {
        preview: null,
        data: {},
        logs: logs
    };

    // Check for success of key formats
    const hasVectorData = payload.data['image/x-adobe-aicb'] || payload.data['application/pdf'] || payload.data['com.adobe.illustrator.aicb'];

    if (!hasVectorData) {
        logs.push('⚠️ WARNING: No Vector Data found!');
        logs.push('HINT: In Illustrator, go to Edit > Preferences > Clipboard Handling.');
        logs.push('Ensure "AICB (No Transparency)" and "Preserve Paths" are CHECKED.');
        logs.push('Also ensure you selected actual vector paths, not just an image.');
    }

    // Force Check Known Adobe Formats (even if not in systemFormats) ... (rest of code)

    // Force Check Known Adobe Formats
    // On Windows, the format might just be registered as "AICB" without the mime-type prefix
    const knownFormats = [
        // Standard Mime Types
        'application/pdf', 
        'image/x-adobe-aicb', 
        'com.adobe.illustrator.aicb', 
        // Windows Specific / Raw Format Names
        'AICB', 
        'Adobe Illustrator AICB',
        'Adobe AI3',
        'PostScript',
        // Standard Windows types
        'CF_DIB', 'CF_BITMAP', 'CF_METAFILEPICT', 'CF_ENHMETAFILE',
        'DeviceIndependentBitmap',
        'text/html', 
        'text/plain'
    ];

    // Combine systemFormats and knownFormats (unique)
    const allFormatsToCheck = [...new Set([...systemFormats, ...knownFormats])];

    allFormatsToCheck.forEach(format => {
        try {
            const buf = clipboard.readBuffer(format);
            if (buf.length > 0) {
                payload.data[format] = buf.toString('hex');
                // If we found raw "AICB", let's also save it as the standard mime type for consistency if missing
                if (format === 'AICB' && !payload.data['image/x-adobe-aicb']) {
                    payload.data['image/x-adobe-aicb'] = buf.toString('hex');
                }
                
                logs.push(`SUCCESS: Captured [${format}]: ${buf.length} bytes`);
                console.log(`Captured ${format}: ${buf.length} bytes`);
            } else {
                 if (['AICB', 'application/pdf', 'image/x-adobe-aicb'].includes(format)) {
                     logs.push(`Attempted [${format}] but buffer was empty.`);
                 }
            }
        } catch (err) {
            logs.push(`Failed to read [${format}]: ${err.message}`);
            console.error(`Failed to read format ${format}`, err);
        }
    });

    return payload;
});

// 2. Restore Logic (App -> Illustrator)
ipcMain.handle('write-illustrator-clipboard', async (event, data) => {
    clipboard.clear();
    
    // data is { 'format_name': 'hex_string', ... }
    const restoredFormats = [];
    
    // We need to write multiple formats at once if possible. 
    // Electron's clipboard.write() accepts an object of formats.
    // However, writeBuffer is usually a single call. 
    // Actually, consecutive writeBuffer calls might clear previous ones on some OS/Electron versions 
    // UNLESS we use clipboard.write({ ...data }).
    // But `clipboard.write` mainly supports standard types (text, html, image, rtf, bookmark).
    // For custom/native formats, we usually use `writeBuffer`.
    // IMPORTANT: In Electron, `clipboard.writeBuffer` sets data for a specific format. 
    // To write MULTIPLE custom formats, we must rely on how the underlying OS clipboard transaction works.
    // Electron docs say: "Writes the buffer into the clipboard as format".
    // Usually, calling it multiple times sequentially *during a single tick* might work, or it might overwrite.
    // A safer way for "Raw" restore might ideally use native addon, but let's try standard Electron loop first.
    // Many Electron apps report issues with multi-format writeBuffer. 
    // Let's try writing them sequentially. usage of `clipboard.writeBuffer` usually merges if not cleared.
    
    for (const format in data) {
        if (data.hasOwnProperty(format)) {
            try {
                const buf = Buffer.from(data[format], 'hex');
                clipboard.writeBuffer(format, buf);
                restoredFormats.push(format);
            } catch (err) {
                console.error(`Failed to write format ${format}`, err);
            }
        }
    }

    console.log('Restored formats:', restoredFormats);
    return restoredFormats;
});
