/*
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Content script for AI Content Blocker Pro
// Advanced detection with caching, domain whitelisting, and performance optimization
// Version 2.0.0 - Production Ready

// NOTE: This repo now includes *two* content pipelines:
//  - Agent Orange overlay pipeline (`src/content-agent-orange.js`)
//  - Blocker blur/hide pipeline (this file)
// Both run as content scripts, so we must avoid leaking globals that collide.
// Wrap the entire file in an IIFE to keep variables scoped.

(function () {
  'use strict';

let settings = {};
let blockedElements = [];
let debounceTimer;
let observer;
const SCAN_DEBOUNCE = 300;
const MAX_ELEMENTS_PER_SCAN = 100;
const MAX_CONTENT_LENGTH = 10000;

// Media/provenance (lightweight, no network calls)
const MEDIA_SCAN_MAX = 40;
const VIDEO_SCAN_MAX = 10;
const imageScanCache = new WeakSet();
const videoScanCache = new WeakSet();

// Performance monitoring
const perfMetrics = {
  scansPerformed: 0,
  elementsBlocked: 0,
  cacheHits: 0,
  avgScanTime: 0
};

// Error logging
function logError(context, error) {
  console.error(`[AIB Content] ${context}:`, error);
}

// Load settings on page load
try {
  loadSettings();
} catch (e) {
  logError('Initial setup failed', e);
}

// Listen for dynamic content with debouncing
try {
  observer = new MutationObserver(() => {
    try {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanPage, SCAN_DEBOUNCE);
    } catch (e) {
      logError('Mutation observer callback failed', e);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'alt', 'title', 'data-ai', 'class', 'data-test']
  });
} catch (e) {
  logError('Mutation observer initialization failed', e);
}

function loadSettings() {
  try {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      try {
        if (chrome.runtime.lastError) {
          logError('Settings message error', chrome.runtime.lastError);
          return;
        }
        settings = response || {};
        if (settings.enabled) {
          performInitialScan();
        }
      } catch (e) {
        logError('Settings load callback failed', e);
      }
    });
  } catch (e) {
    logError('loadSettings failed', e);
  }
}

function performInitialScan() {
  try {
    const startTime = performance.now();
    
    // Scan visible content first (critical rendering path)
    const visibleElements = getVisibleElements();
    scanElements(visibleElements);
    
    // Scan rest of page after initial render
    setTimeout(() => {
      try {
        scanPage();
      } catch (e) {
        logError('Delayed scan failed', e);
      }
    }, 1000);
    
    perfMetrics.avgScanTime = performance.now() - startTime;
  } catch (e) {
    logError('performInitialScan failed', e);
  }
}

function getVisibleElements() {
  try {
    const elements = [];
    const nodeList = document.querySelectorAll('img, article, div[role="article"], p, h1, h2, h3');
    
    nodeList.forEach(el => {
      try {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && rect.width > 0 && rect.top < window.innerHeight + 500) {
          elements.push(el);
        }
      } catch (e) {
        // Skip elements that cause errors
      }
    });
    
    return elements.slice(0, MAX_ELEMENTS_PER_SCAN);
  } catch (e) {
    logError('getVisibleElements failed', e);
    return [];
  }
}

function scanPage() {
  try {
    if (!settings || !settings.enabled) return;

    perfMetrics.scansPerformed++;
    const startTime = performance.now();

    // Check domain whitelist/blacklist
    if (isDomainBlocked() || isDomainWhitelisted()) {
      return;
    }

    // Scan for images
    if (settings.blockImages) {
      scanImages();
    }

    // Video scanning is opt-in and lightweight by default.
    if (settings.blockVideos) {
      scanVideos();
    }

    // Scan for text content
    if (settings.blockText) {
      scanTextContent();
    }

    perfMetrics.avgScanTime = (perfMetrics.avgScanTime + (performance.now() - startTime)) / 2;
  } catch (e) {
    logError('scanPage failed', e);
  }
}

function isDomainBlocked() {
  try {
    if (!settings.blockedDomains || !Array.isArray(settings.blockedDomains) || settings.blockedDomains.length === 0) {
      return false;
    }
    const domain = window.location.hostname;
    return settings.blockedDomains.some(blocked => 
      typeof blocked === 'string' && domain.includes(blocked)
    );
  } catch (e) {
    logError('isDomainBlocked failed', e);
    return false;
  }
}

function isDomainWhitelisted() {
  try {
    if (!settings.whitelistedDomains || !Array.isArray(settings.whitelistedDomains) || settings.whitelistedDomains.length === 0) {
      return false;
    }
    const domain = window.location.hostname;
    return settings.whitelistedDomains.some(whitelisted => 
      typeof whitelisted === 'string' && domain.includes(whitelisted)
    );
  } catch (e) {
    logError('isDomainWhitelisted failed', e);
    return false;
  }
}

function scanImages() {
  try {
    // Keep the existing hybrid text-based image scan (alt/title/src).
    const images = document.querySelectorAll('img');
    scanElements(Array.from(images).slice(0, MAX_ELEMENTS_PER_SCAN));

    // Add a second-stage provenance scan for images (doesn't rely on keywords).
    scanImageProvenance(Array.from(images).slice(0, MEDIA_SCAN_MAX));
  } catch (e) {
    logError('scanImages failed', e);
  }
}

function scanVideos() {
  try {
    const videos = Array.from(document.querySelectorAll('video')).slice(0, VIDEO_SCAN_MAX);
    scanVideoProvenance(videos);
  } catch (e) {
    logError('scanVideos failed', e);
  }
}

function scanImageProvenance(images) {
  try {
    if (!Array.isArray(images)) return;

    images.forEach((img) => {
      try {
        if (!img || imageScanCache.has(img)) return;
        imageScanCache.add(img);

        const hints = collectMediaProvenanceHints(img);
        if (!hints) return;

        // Send a compact hint string to existing background analyzer (keeps detector details private).
        const contentToAnalyze = `media image provenance ${hints}`;
        chrome.runtime.sendMessage(
          {
            action: 'analyzeContent',
            content: contentToAnalyze,
            type: 'image',
            url: window.location.href
          },
          (response) => {
            try {
              if (chrome.runtime.lastError) return;
              if (response && response.isAiGenerated && response.confidence >= (settings.confidence || 0.7)) {
                blockElement(img, response, settings.blockingMode || 'none');
                perfMetrics.elementsBlocked++;
              }
            } catch (e) {
              logError('scanImageProvenance response handling failed', e);
            }
          }
        );
      } catch (e) {
        // ignore per-element failures
      }
    });
  } catch (e) {
    logError('scanImageProvenance failed', e);
  }
}

function scanVideoProvenance(videos) {
  try {
    if (!Array.isArray(videos)) return;

    videos.forEach((video) => {
      try {
        if (!video || videoScanCache.has(video)) return;
        videoScanCache.add(video);

        const hints = collectMediaProvenanceHints(video);
        const videoMeta = collectVideoElementStats(video);

        // Always do a lightweight analysis first.
        const contentToAnalyze = `media video provenance ${hints} ${videoMeta}`;
        chrome.runtime.sendMessage(
          {
            action: 'analyzeContent',
            content: contentToAnalyze,
            type: 'video',
            url: window.location.href
          },
          async (response) => {
            try {
              if (chrome.runtime.lastError) return;

              // Optionally escalate to deepfake detector when enabled and video is playable.
              if (settings.enableDeepfakeScan && typeof window.DeepfakeDetector === 'function') {
                const detector = new window.DeepfakeDetector({
                  analysisDepth: 'basic',
                  confidenceThreshold: settings.confidence || 0.7,
                  enableBiometricAnalysis: false
                });

                // Only attempt deeper scan for sufficiently large/active videos.
                if (video.videoWidth >= 256 && video.videoHeight >= 256) {
                  const deepfakeResult = await detector.analyze(video, 'full');
                  // Treat "suspicious" as ai-generated for UI purposes.
                  const combined = {
                    isAiGenerated: deepfakeResult?.isSuspicious || deepfakeResult?.isAiGenerated || deepfakeResult?.isDeepfake,
                    confidence: deepfakeResult?.overallConfidence || response?.confidence || 0,
                    matchedTerms: (deepfakeResult?.suspiciousIndicators || []).slice(0, 5),
                    analysis: { type: 'video', method: 'deepfake+hybrid', timestamp: Date.now() }
                  };

                  if (combined.isAiGenerated && combined.confidence >= (settings.confidence || 0.7)) {
                    blockElement(video, combined, settings.blockingMode || 'none');
                    perfMetrics.elementsBlocked++;
                  }
                  return;
                }
              }

              if (response && response.isAiGenerated && response.confidence >= (settings.confidence || 0.7)) {
                blockElement(video, response, settings.blockingMode || 'none');
                perfMetrics.elementsBlocked++;
              }
            } catch (e) {
              logError('scanVideoProvenance response handling failed', e);
            }
          }
        );
      } catch (e) {
        // ignore per-element failures
      }
    });
  } catch (e) {
    logError('scanVideoProvenance failed', e);
  }
}

function collectVideoElementStats(video) {
  try {
    const parts = [];
    if (typeof video.duration === 'number' && isFinite(video.duration)) parts.push(`duration:${Math.round(video.duration)}`);
    if (video.videoWidth) parts.push(`w:${video.videoWidth}`);
    if (video.videoHeight) parts.push(`h:${video.videoHeight}`);
    if (video.currentSrc) parts.push(`src:${safeCompact(video.currentSrc)}`);
    if (video.poster) parts.push(`poster:${safeCompact(video.poster)}`);
    return parts.join(' ');
  } catch {
    return '';
  }
}

function collectMediaProvenanceHints(el) {
  try {
    const pieces = [];
    const attrs = ['data-credits', 'data-source', 'data-provenance', 'data-origin', 'data-ai', 'data-c2pa', 'data-iptc', 'itemprop', 'aria-label', 'title', 'alt'];
    attrs.forEach((a) => {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) pieces.push(`${a}:${safeCompact(v)}`);
    });

    // Common provenance/meta tags present on modern sites
    const metaNames = ['generator', 'og:site_name', 'og:type', 'twitter:label1', 'twitter:data1'];
    metaNames.forEach((name) => {
      const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      const v = meta?.getAttribute('content');
      if (v) pieces.push(`meta:${name}:${safeCompact(v)}`);
    });

    return pieces.join(' ');
  } catch {
    return '';
  }
}

function safeCompact(value) {
  try {
    return String(value).replace(/\s+/g, ' ').trim().slice(0, 200);
  } catch {
    return '';
  }
}

function scanTextContent() {
  try {
    const elements = document.querySelectorAll('article, [role="article"], .post, .content, main:not(.ai-scanned)');
    scanElements(Array.from(elements).slice(0, MAX_ELEMENTS_PER_SCAN));
  } catch (e) {
    logError('scanTextContent failed', e);
  }
}

function scanElements(elements) {
  try {
    if (!Array.isArray(elements)) {
      return;
    }

    elements.forEach((element) => {
      try {
        if (!element || element.classList.contains('ai-scanned')) {
          return;
        }
        
        let contentToAnalyze = '';
        
        if (element.tagName === 'IMG') {
          const alt = element.getAttribute('alt') || '';
          const src = element.getAttribute('src') || '';
          const title = element.getAttribute('title') || '';
          contentToAnalyze = `${alt} ${title} ${src}`;
        } else {
          const text = element.textContent || '';
          contentToAnalyze = text.substring(0, MAX_CONTENT_LENGTH);
        }

        if (contentToAnalyze.trim().length > 10) {
          chrome.runtime.sendMessage(
            { 
              action: 'analyzeContent', 
              content: contentToAnalyze,
              type: element.tagName === 'IMG' ? 'image' : 'text',
              url: window.location.href
            },
            (response) => {
              try {
                if (chrome.runtime.lastError) {
                  logError('Analysis message error', chrome.runtime.lastError);
                  return;
                }
                
                if (response && response.isAiGenerated && response.confidence >= (settings.confidence || 0.7)) {
                  blockElement(element, response, settings.blockingMode || 'none');
                  perfMetrics.elementsBlocked++;
                }
              } catch (e) {
                logError('Analysis response handling failed', e);
              } finally {
                try {
                  element.classList.add('ai-scanned');
                } catch (e) {
                  // Element may have been removed
                }
              }
            }
          );
        }
      } catch (e) {
        logError('Element scanning failed', e);
      }
    });
  } catch (e) {
    logError('scanElements failed', e);
  }
}

function blockElement(element, analysisResult, blockingMode = 'none') {
  try {
    if (!element || !analysisResult || blockedElements.includes(element)) {
      return;
    }

    blockedElements.push(element);
    element.classList.add('ai-blocked');
    
    // Apply blocking based on mode
    switch (blockingMode) {
      case 'none':
        // Badge/flag only: don't modify the content.
        break;
      case 'hide':
        element.style.display = 'none';
        break;
      case 'watermark':
        element.style.opacity = '0.6';
        addWatermark(element);
        break;
      case 'blur':
      default:
        element.style.filter = 'blur(8px)';
        element.style.opacity = '0.5';
    }

    // Add detailed indicator
    const indicator = document.createElement('div');
    indicator.className = 'ai-content-indicator';
    const confidence = Math.round((analysisResult.confidence || 0) * 100);
    indicator.setAttribute('data-confidence', confidence);
    const indicatorContent = document.createElement('div');
    indicatorContent.className = 'ai-indicator-content';
    const icon = document.createElement('span');
    icon.className = 'ai-icon';
    icon.textContent = 'AI';
    const text = document.createElement('span');
    text.className = 'ai-text';
    text.textContent = 'AI-Generated Content';
    const confidenceText = document.createElement('span');
    confidenceText.className = 'ai-confidence';
    confidenceText.textContent = `${confidence}%`;
    indicatorContent.append(icon, text, confidenceText);
    indicator.appendChild(indicatorContent);
    
    try {
      if (element.style.position !== 'absolute' && element.style.position !== 'fixed') {
        element.style.position = 'relative';
      }
    } catch (e) {
      // Position change may fail on some elements
    }
    
    indicator.addEventListener('click', () => {
      try {
        showDetailedAnalysis(analysisResult);
      } catch (e) {
        logError('Detailed analysis display failed', e);
      }
    });
    
    element.appendChild(indicator);
  } catch (e) {
    logError('blockElement failed', e);
  }
}

function addWatermark(element) {
  try {
    const watermark = document.createElement('div');
    watermark.className = 'ai-watermark';
    watermark.textContent = 'AI-GENERATED';
    element.appendChild(watermark);
  } catch (e) {
    logError('Watermark addition failed', e);
  }
}

function showDetailedAnalysis(result) {
  try {
    const details = document.createElement('div');
    details.className = 'ai-analysis-popup';
    const confidence = Math.round((result.confidence || 0) * 100);
    const method = (result.analysis && result.analysis.method) || 'hybrid';

    const content = document.createElement('div');
    content.className = 'popup-content';

    const title = document.createElement('h3');
    title.textContent = 'AI Content Analysis';
    const confidenceLine = document.createElement('p');
    confidenceLine.textContent = `Confidence: ${confidence}%`;
    const methodLine = document.createElement('p');
    methodLine.textContent = `Method: ${method}`;
    content.append(title, confidenceLine, methodLine);

    if (Array.isArray(result.matchedTerms) && result.matchedTerms.length > 0) {
      const label = document.createElement('p');
      label.textContent = 'Indicators:';
      const list = document.createElement('ul');
      result.matchedTerms
        .filter(term => typeof term === 'string')
        .forEach(term => {
          const item = document.createElement('li');
          item.textContent = term;
          list.appendChild(item);
        });
      content.append(label, list);
    }

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => details.remove());
    content.appendChild(close);

    details.appendChild(content);
    document.body.appendChild(details);
  } catch (e) {
    logError('Detailed analysis creation failed', e);
  }
}

function initContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.parentElement.classList.contains('ai-blocked')) {
      // Context menu will be handled by background script
    }
  });
}

// Listen for analysis requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'rescan') {
    blockedElements = [];
    try {
      document.querySelectorAll('.ai-scanned').forEach(el => el.classList.remove('ai-scanned'));
    } catch (e) {
      logError('rescan reset failed', e);
    }
    performInitialScan();
    sendResponse({ ok: true, metrics: perfMetrics });
    return true;
  }

  if (request.action === 'settingsUpdated') {
    settings = { ...settings, ...(request.settings || {}) };
    performInitialScan();
    sendResponse({ ok: true });
    return true;
  }

  if (request.action === 'analyzeVisibleContent') {
    const visibleElements = getVisibleElements();
    let aiContentCount = 0;
    
    visibleElements.forEach(el => {
      if (el.classList.contains('ai-blocked')) {
        aiContentCount++;
      }
    });
    
    sendResponse({
      visibleElements: visibleElements.length,
      aiContentFound: aiContentCount,
      metrics: perfMetrics
    });
  }
  
  if (request.action === 'showAnalysisResult') {
    showDetailedAnalysis(request.result);
    sendResponse({ ok: true });
    return true;
  }
});

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled || changes.blockImages || changes.blockText || changes.confidence || changes.blockingMode) {
    loadSettings();
    // Reset scanning
    blockedElements = [];
    performInitialScan();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
  clearTimeout(debounceTimer);
});

})();

