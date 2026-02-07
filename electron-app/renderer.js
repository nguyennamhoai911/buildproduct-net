const { ipcRenderer } = require('electron');
const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3040/figma/clipboard';
const statusDiv = document.getElementById('status');
const gridDiv = document.getElementById('grid');

function setStatus(msg) {
  statusDiv.textContent = new Date().toLocaleTimeString() + ': ' + msg;
}

// 1. Fetch Assets
async function fetchAssets() {
  try {
    setStatus('Fetching assets from DB...');
    const res = await axios.get(API_URL);
    renderGrid(res.data);
    setStatus('Assets loaded.');
  } catch (err) {
    console.error('Fetch error:', err);
    setStatus('Failed to load assets: ' + err.message);
  }
}

// 2. Render List
function renderGrid(items) {
  gridDiv.innerHTML = '';
  if (items.length === 0) {
    gridDiv.innerHTML = '<div class="loading">No assets found.</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Check if illustration exists, otherwise fallback
    const imgUrl = item.illustration || 'https://via.placeholder.com/200?text=No+Preview';
    
    // Try to parse content to see if it's our Hex format
    let isHexData = false;
    let contentObj = {};
    try {
        contentObj = JSON.parse(item.content);
        if (contentObj && (contentObj['image/x-adobe-aicb'] || contentObj['application/pdf'] || contentObj['com.adobe.illustrator.aicb'])) {
            isHexData = true;
        }
    } catch (e) {}

    const title = item.title || 'Untitled Asset';
    const date = new Date(item.createdAt).toLocaleDateString();

    card.innerHTML = `
      <div class="preview">
        <img src="${imgUrl}" alt="${title}">
      </div>
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-meta">Added: ${date}</div>
        <div class="actions">
          <button class="btn" onclick="copyAsset(${item.id})">Copy for Illustrator</button>
        </div>
      </div>
    `;
    
    gridDiv.appendChild(card);
  });
}

// Make copyAsset global
window.copyAsset = async (id) => {
  try {
    setStatus(`Fetching asset ${id} details...`);
    // Ideally fetch single item, but we can find from grid or re-fetch list.
    // Let's re-fetch list is simpler for now or assume we have the data.
    // For better performance, we should fetch by ID or store the current list in memory.
    // Since API list endpoint returns full content, let's just use the cached version if possible, 
    // but to be safe let's just fetch specifically or filter from re-fetch.
    // Actually, let's fetch by ID if API supports it, or just filter from list (since list is small for now)
    const res = await axios.get(API_URL); // Optimization needed later
    const item = res.data.find(i => i.id === id);
    
    if (!item) throw new Error('Item not found');

    let data = {};
    try {
        data = JSON.parse(item.content);
    } catch {
       alert('This asset does not seem to be in the correct binary format.');
       return;
    }

    setStatus('Restoring to System Clipboard...');
    
    // Call IPC to write
    // Helper to detect if content is our format
    // UPDATE: We now support ALL formats (Black Box), so we just pass everything back.
    const payload = data; 
    const result = await ipcRenderer.invoke('write-illustrator-clipboard', payload);
    
    setStatus(`Copied! Ready to paste in Illustrator. Restored ${result.length} formats.`);
    alert('Copied to Clipboard!');

  } catch (err) {
    console.error(err);
    setStatus('Error copying: ' + err.message);
  }
};

// 3. Capture Logic
document.getElementById('captureBtn').addEventListener('click', async () => {
    try {
        setStatus('Reading System Clipboard...');
        const result = await ipcRenderer.invoke('read-illustrator-clipboard');
        
        console.log('Formats Captured:', Object.keys(result.data));
        console.log('Debug Logs:', result.logs);

        const capturedKeys = Object.keys(result.data);
        if (capturedKeys.length === 0) {
            alert('Clipboard Empty! Debug Info:\n' + (result.logs ? result.logs.join('\n') : 'No logs'));
            setStatus('Clipboard empty.');
            return;
        }

        // Prepare Upload
        setStatus('Uploading to Database...');
        
        const formData = new FormData();
        
        // Convert preview DataURL to Blob
        if (result.preview) {
            const res = await fetch(result.preview);
            const blob = await res.blob();
            formData.append('illustration', blob, 'preview.png');
        }

        formData.append('title', `AI Capture ${new Date().toLocaleTimeString()}`);
        formData.append('content', JSON.stringify(result.data));
        formData.append('tags', 'illustrator,binary');
        // Save logs to description for debugging
        formData.append('description', 'Debug Logs:\n' + (result.logs ? result.logs.join('\n') : ''));

        await axios.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setStatus(`Saved ${capturedKeys.length} formats!`);
        alert(`Success! Captured: ${capturedKeys.join(', ')}`);
        fetchAssets(); // Refresh

    } catch (err) {
        console.error(err);
        setStatus('Save failed: ' + err.message);
        alert('Failed to save to database. Check console.');
    }
});

// Initial Load
fetchAssets();
