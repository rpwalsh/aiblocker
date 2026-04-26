/*
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Options Page Script - Simple & Clean

const DEFAULT_SETTINGS = {
  enabled: true,
  blockImages: true,
  blockText: true,
  blockVideo: false,
  blockingMode: 'none',
  confidence: 0.5,
  whitelistedDomains: [],
  crowdLearningEnabled: false,
  crowdLearningEndpoint: ''
};

// DOM elements
const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  elements.enabled = document.getElementById('enabled');
  elements.blockImages = document.getElementById('blockImages');
  elements.blockText = document.getElementById('blockText');
  elements.blockVideo = document.getElementById('blockVideo');
  elements.blockingMode = document.getElementById('blockingMode');
  elements.confidence = document.getElementById('confidence');
  elements.confidenceValue = document.getElementById('confidenceValue');
  elements.whitelistedDomains = document.getElementById('whitelistedDomains');
  elements.crowdLearningEnabled = document.getElementById('crowdLearningEnabled');
  elements.crowdLearningEndpoint = document.getElementById('crowdLearningEndpoint');
  elements.save = document.getElementById('save');
  elements.reset = document.getElementById('reset');
  elements.statusText = document.getElementById('statusText');
  elements.status = document.querySelector('.status');

  // Load settings
  loadSettings();

  // Event listeners
  elements.confidence.addEventListener('input', updateConfidenceDisplay);
  elements.save.addEventListener('click', saveSettings);
  elements.reset.addEventListener('click', resetSettings);
});

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    elements.enabled.checked = settings.enabled !== false;
    elements.blockImages.checked = settings.blockImages !== false;
    elements.blockText.checked = settings.blockText !== false;
    elements.blockVideo.checked = settings.blockVideo === true;
    if (elements.blockingMode) {
      const v = settings.blockingMode || DEFAULT_SETTINGS.blockingMode;
      elements.blockingMode.value = ['none', 'blur', 'watermark', 'hide'].includes(v) ? v : 'none';
    }
    elements.confidence.value = settings.confidence || 0.5;
    elements.crowdLearningEnabled.checked = settings.crowdLearningEnabled === true;
    elements.crowdLearningEndpoint.value = settings.crowdLearningEndpoint || '';
    
    if (settings.whitelistedDomains && settings.whitelistedDomains.length > 0) {
      elements.whitelistedDomains.value = settings.whitelistedDomains.join('\n');
    }
    
    updateConfidenceDisplay();
  });
}

function updateConfidenceDisplay() {
  const value = Math.round(elements.confidence.value * 100);
  elements.confidenceValue.textContent = value + '%';
}

function saveSettings() {
  const whitelistedDomains = elements.whitelistedDomains.value
    .split('\n')
    .map(domain => domain.trim().toLowerCase())
    .filter(domain => domain.length > 0);

  const blockingModeRaw = elements.blockingMode?.value || 'none';
  const blockingMode = ['none', 'blur', 'watermark', 'hide'].includes(blockingModeRaw) ? blockingModeRaw : 'none';

  const settings = {
    enabled: elements.enabled.checked,
    blockImages: elements.blockImages.checked,
    blockText: elements.blockText.checked,
    blockVideo: elements.blockVideo.checked,
    blockingMode,
    confidence: parseFloat(elements.confidence.value),
    whitelistedDomains,
    crowdLearningEnabled: elements.crowdLearningEnabled.checked,
    crowdLearningEndpoint: elements.crowdLearningEndpoint.value.trim()
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved!', 'success');
    
    // Notify content scripts
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated', settings }).catch(() => {});
      }
    });
  });
}

function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
      elements.enabled.checked = DEFAULT_SETTINGS.enabled;
      elements.blockImages.checked = DEFAULT_SETTINGS.blockImages;
      elements.blockText.checked = DEFAULT_SETTINGS.blockText;
      elements.blockVideo.checked = DEFAULT_SETTINGS.blockVideo;
      if (elements.blockingMode) elements.blockingMode.value = DEFAULT_SETTINGS.blockingMode;
      elements.confidence.value = DEFAULT_SETTINGS.confidence;
      elements.crowdLearningEnabled.checked = DEFAULT_SETTINGS.crowdLearningEnabled;
      elements.crowdLearningEndpoint.value = DEFAULT_SETTINGS.crowdLearningEndpoint;
      elements.whitelistedDomains.value = '';
      updateConfidenceDisplay();
      showStatus('Settings reset!', 'success');
    });
  }
}

function showStatus(message, type) {
  elements.status.className = `status ${type}`;
  elements.statusText.textContent = message;

  setTimeout(() => {
    elements.status.className = 'status';
    elements.statusText.textContent = '';
  }, 2000);
}
