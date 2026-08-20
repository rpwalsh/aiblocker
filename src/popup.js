/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

// Popup: status, scan controls, evidence peek, and the Paste Checker.

document.addEventListener('DOMContentLoaded', () => {
  const el = id => document.getElementById(id);
  const elements = {
    enabled: el('enabled'),
    blockImages: el('blockImages'),
    blockText: el('blockText'),
    blockVideo: el('blockVideo'),
    blockingMode: el('blockingMode'),
    confidence: el('confidence'),
    confidenceValue: el('confidenceValue'),
    openOptions: el('openOptions'),
    openChecker: el('openChecker'),
    rescan: el('rescan'),
    statsDetected: el('statsDetected'),
    detailsBody: el('detailsBody'),
    refreshDetails: el('refreshDetails')
  };

  chrome.storage.sync.get({
    enabled: true,
    blockImages: true,
    blockText: true,
    blockVideo: false,
    blockingMode: 'none',
    confidence: 0.5
  }, (settings) => {
    elements.enabled.checked = settings.enabled;
    elements.blockImages.checked = settings.blockImages;
    elements.blockText.checked = settings.blockText;
    elements.blockVideo.checked = settings.blockVideo;
    elements.blockingMode.value = ['none', 'blur', 'watermark', 'hide'].includes(settings.blockingMode) ? settings.blockingMode : 'none';
    elements.confidence.value = settings.confidence;
    updateConfidenceDisplay();
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    refreshStats(tabs[0].id);
    requestDetails(tabs[0].id);
  });

  for (const key of ['enabled', 'blockImages', 'blockText', 'blockVideo']) {
    elements[key].addEventListener('change', saveSettings);
  }
  elements.blockingMode.addEventListener('change', saveSettings);
  elements.confidence.addEventListener('input', () => { updateConfidenceDisplay(); saveSettings(); });

  elements.openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
  elements.openChecker.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('src/checker.html') }));

  elements.refreshDetails.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) requestDetails(tabs[0].id);
    });
  });

  elements.rescan.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'rescan' }, () => { void chrome.runtime.lastError; });
      elements.rescan.textContent = 'Scanning…';
      setTimeout(() => {
        elements.rescan.textContent = 'Rescan';
        refreshStats(tabs[0].id);
      }, 1500);
    });
  });

  function refreshStats(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'getStats' }, (response) => {
      if (chrome.runtime.lastError) return;
      elements.statsDetected.textContent = String(response?.detected ?? 0);
    });
  }

  function updateConfidenceDisplay() {
    elements.confidenceValue.textContent = Math.round(elements.confidence.value * 100) + '%';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function requestDetails(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'getLastSelectionDetails' }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (!resp?.ok || !resp?.data) {
        elements.detailsBody.innerHTML = '<div class="empty">Click an outlined item on the page, or select text and right-click → Inspect with SlopBlocker.</div>';
        return;
      }
      const d = resp.data;
      const indicators = Array.isArray(d.indicators) ? d.indicators : [];
      const list = indicators.length
        ? `<ul>${indicators.map(i => `<li><strong>${esc(Math.round((i.confidence ?? 0) * 100))}%</strong> ${esc(i.indicator ?? '')}</li>`).join('')}</ul>`
        : '<div class="empty">No individual indicators; the score rests on aggregate statistics.</div>';
      elements.detailsBody.innerHTML =
        `<div><strong>${esc(d.type || 'item')}</strong> — score ${esc(Math.round((d.confidence || 0) * 100))}%</div>${list}`;
    });
  }

  function saveSettings() {
    const settings = {
      enabled: elements.enabled.checked,
      blockImages: elements.blockImages.checked,
      blockText: elements.blockText.checked,
      blockVideo: elements.blockVideo.checked,
      blockingMode: elements.blockingMode.value,
      confidence: parseFloat(elements.confidence.value)
    };
    chrome.storage.sync.set(settings);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated', settings }, () => { void chrome.runtime.lastError; });
    });
  }
});
