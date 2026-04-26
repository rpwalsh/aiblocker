/*
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Popup Script - Simple & Clean

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    enabled: document.getElementById('enabled'),
    blockImages: document.getElementById('blockImages'),
    blockText: document.getElementById('blockText'),
    blockVideo: document.getElementById('blockVideo'),
    blockingMode: document.getElementById('blockingMode'),
    confidence: document.getElementById('confidence'),
    confidenceValue: document.getElementById('confidenceValue'),
    crowdLearningEnabled: document.getElementById('crowdLearningEnabled'),
    openOptions: document.getElementById('openOptions'),
    rescan: document.getElementById('rescan'),
  statsDetected: document.getElementById('statsDetected'),
  detailsBody: document.getElementById('detailsBody'),
  refreshDetails: document.getElementById('refreshDetails'),
  voteAI: document.getElementById('voteAI'),
  voteNotAI: document.getElementById('voteNotAI'),
  toggleLearningMode: document.getElementById('toggleLearningMode')
  };

  // Load current settings
  chrome.storage.sync.get({
    enabled: true,
    blockImages: true,
    blockText: true,
    blockVideo: false,
    blockingMode: 'none',
    confidence: 0.5,
    crowdLearningEnabled: false
  }, (settings) => {
    elements.enabled.checked = settings.enabled;
    elements.blockImages.checked = settings.blockImages;
    elements.blockText.checked = settings.blockText;
    elements.blockVideo.checked = settings.blockVideo;
  if (elements.blockingMode) elements.blockingMode.value = settings.blockingMode || 'none';
    elements.confidence.value = settings.confidence;
    elements.crowdLearningEnabled.checked = settings.crowdLearningEnabled;
    updateConfidenceDisplay();
  });

  // Get stats from current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.detected) {
          elements.statsDetected.textContent = response.detected;
  }
      });

  // Try to hydrate details panel from last selection
  requestDetails(tabs[0].id);
    }
  });

  // Event listeners
  elements.enabled.addEventListener('change', saveSettings);
  elements.blockImages.addEventListener('change', saveSettings);
  elements.blockText.addEventListener('change', saveSettings);
  elements.blockVideo.addEventListener('change', saveSettings);
  elements.blockingMode?.addEventListener('change', saveSettings);
  elements.crowdLearningEnabled.addEventListener('change', saveSettings);
  elements.confidence.addEventListener('input', () => {
    updateConfidenceDisplay();
    saveSettings();
  });

  elements.openOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  function getBlockingModeValue() {
    const v = elements.blockingMode?.value || 'none';
    return ['none', 'blur', 'watermark', 'hide'].includes(v) ? v : 'none';
  }

  elements.refreshDetails?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) requestDetails(tabs[0].id);
    });
  });

  elements.voteAI?.addEventListener('click', () => sendVote('confirm_ai'));
  elements.voteNotAI?.addEventListener('click', () => sendVote('dismiss_not_ai'));

  elements.toggleLearningMode?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleLearningMode' }, (resp) => {
        if (chrome.runtime.lastError) return;
        const enabled = !!resp?.enabled;
        elements.toggleLearningMode.textContent = enabled ? 'Learning Mode: ON' : 'Initialize Learning Mode';
      });
    });
  });

  elements.rescan.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'rescan' }, () => {
          if (chrome.runtime.lastError) return;
        });
        elements.rescan.textContent = 'Scanning...';
        setTimeout(() => {
          elements.rescan.textContent = 'Rescan Page';
          // Update stats
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getStats' }, (response) => {
            if (response?.detected) {
              elements.statsDetected.textContent = response.detected;
            }
          });
        }, 1500);
      }
    });
  });

  function updateConfidenceDisplay() {
    const value = Math.round(elements.confidence.value * 100);
    elements.confidenceValue.textContent = value + '%';
  }

  function setDetailsHtml(html) {
    if (!elements.detailsBody) return;
    elements.detailsBody.innerHTML = html;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function requestDetails(tabId) {
    if (!elements.detailsBody) return;
    chrome.tabs.sendMessage(tabId, { action: 'getLastSelectionDetails' }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (!resp?.ok || !resp?.data) {
        setDetailsHtml('<div class="details-empty">Click a highlighted item on the page to see evidence here.</div>');
        return;
      }

      const d = resp.data;
      const indicators = Array.isArray(d.indicators) ? d.indicators : [];
      const featureIds = Array.isArray(d.featureIds) ? d.featureIds : [];

      const indHtml = indicators.length
        ? `<ul style="margin:0; padding-left:16px;">
             ${indicators.map(i => `<li><strong>${esc(Math.round((i.confidence ?? 0) * 100))}%</strong> ${esc(i.indicator ?? '')}</li>`).join('')}
           </ul>`
        : '<div class="details-empty">No indicators available.</div>';

      const featHtml = featureIds.length
        ? `<div style="margin-top:8px; font-weight:700;">Signals</div>
           <div style="margin-top:4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:10px; color:#666;">
             ${featureIds.slice(0, 24).map(f => `<div>${esc(f)}</div>`).join('')}
           </div>`
        : '';

      setDetailsHtml(
        `<div><strong>Type:</strong> ${esc(d.type || 'unknown')} &nbsp; <strong>Confidence:</strong> ${esc(Math.round((d.confidence || 0) * 100))}%</div>
         <div style="margin-top:8px; font-weight:700;">Why</div>
         ${indHtml}
         ${featHtml}`
      );
    });
  }

  function sendVote(label) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'voteLastSelection', label }, (resp) => {
        if (chrome.runtime.lastError) return;
        if (resp?.ok) {
          // Refresh details (so you can see if features changed)
          requestDetails(tabs[0].id);
        }
      });
    });
  }

  function saveSettings() {
    const settings = {
      enabled: elements.enabled.checked,
      blockImages: elements.blockImages.checked,
      blockText: elements.blockText.checked,
      blockVideo: elements.blockVideo.checked,
      blockingMode: getBlockingModeValue(),
      confidence: parseFloat(elements.confidence.value),
      crowdLearningEnabled: elements.crowdLearningEnabled.checked
    };

    chrome.storage.sync.set(settings);
    
    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated', settings });
      }
    });
  }
});
