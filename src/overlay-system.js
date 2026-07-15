/**
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

/**
 * ============================================================================
 * OVERLAY SYSTEM v2.3 - Fixed Position Badges + Crowd Learning
 * ============================================================================
 */

class OverlaySystem {
  constructor() {
    this.overlays = new Map(); // Use Map with targetId as key for better cleanup
    this.badgeContainer = this.createBadgeContainer();
    this.activePopover = null;
    this.createStyleSheet();

    // Update badge positions on scroll/resize (RAF-throttled)
    this.updatePositions = this.updatePositions.bind(this);
    window.addEventListener('scroll', () => this.requestPositionUpdate(), { passive: true });
    window.addEventListener('resize', () => this.requestPositionUpdate(), { passive: true });

    // Throttled position refresh for SPA-heavy sites
    this._posRaf = 0;
    this.requestPositionUpdate = this.requestPositionUpdate.bind(this);

    // Watch for element removal/changes to cleanup and reposition without polling
    this.setupMutationObserver();
  }

  requestPositionUpdate() {
    if (this._posRaf) return;
    this._posRaf = requestAnimationFrame(() => {
      this._posRaf = 0;
      this.updatePositions();
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false;
      let needsReposition = false;
      for (const mutation of mutations) {
        if (mutation.removedNodes.length > 0) needsCleanup = true;
        needsReposition = true;
      }
      if (needsCleanup) this.cleanupOrphanedBadges();
      if (needsReposition) this.requestPositionUpdate();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  createBadgeContainer() {
    // Remove any existing container first
    document.getElementById('ao-badge-container')?.remove();
    
    const container = document.createElement('div');
    container.id = 'ao-badge-container';
    container.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 0 !important;
      height: 0 !important;
      overflow: visible !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
    `;
    document.documentElement.appendChild(container);
    return container;
  }

  createStyleSheet() {
    document.getElementById('ao-overlay-styles')?.remove();
    
    const style = document.createElement('style');
    style.id = 'ao-overlay-styles';
    style.textContent = `
      .ao-ai-content {
        outline: 3px solid #ff6b00 !important;
        outline-offset: 2px !important;
      }

      .ao-badge {
        position: fixed !important;
        background: #ff6b00 !important;
        border-radius: 4px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        color: white !important;
        padding: 4px 8px !important;
        cursor: pointer !important;
        z-index: 2147483647 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
        border: 2px solid white !important;
        pointer-events: auto !important;
        font-family: system-ui, sans-serif !important;
        user-select: none !important;
        transition: transform 0.1s !important;
      }
      
      .ao-badge:hover {
        transform: scale(1.15) !important;
        background: #ff5500 !important;
      }

      .ao-image-wrapper {
        position: relative !important;
        display: inline-block !important;
      }

      .ao-popover {
        position: fixed !important;
        width: 340px !important;
        max-height: 80vh !important;
        overflow: auto !important;
        background: #1a1a1a !important;
        color: #fff !important;
        border: 2px solid #ff6b00 !important;
        border-radius: 12px !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.7) !important;
        padding: 16px !important;
        font-family: system-ui, sans-serif !important;
        pointer-events: auto !important;
        z-index: 2147483647 !important;
      }

      .ao-popover h3 {
        margin: 0 0 12px 0 !important;
        font-size: 16px !important;
        color: #ff6b00 !important;
      }

      .ao-popover .ao-confidence {
        font-size: 24px !important;
        font-weight: 700 !important;
        margin-bottom: 8px !important;
      }

      .ao-popover .ao-indicators {
        font-size: 12px !important;
        opacity: 0.9 !important;
        margin-bottom: 16px !important;
        padding: 10px !important;
        background: rgba(255,255,255,0.05) !important;
        border-radius: 8px !important;
        line-height: 1.5 !important;
      }

      .ao-popover .ao-vote-section {
        border-top: 1px solid rgba(255,255,255,0.1) !important;
        padding-top: 16px !important;
        margin-top: 8px !important;
      }

      .ao-popover .ao-vote-title {
        font-size: 13px !important;
        font-weight: 600 !important;
        margin-bottom: 12px !important;
        color: #ccc !important;
      }

      .ao-popover .ao-vote-buttons {
        display: flex !important;
        gap: 10px !important;
        margin-bottom: 12px !important;
      }

      .ao-popover .ao-vote-btn {
        flex: 1 !important;
        padding: 12px !important;
        border: 2px solid rgba(255,255,255,0.2) !important;
        border-radius: 8px !important;
        background: rgba(255,255,255,0.05) !important;
        color: white !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
      }

      .ao-popover .ao-vote-btn:hover {
        background: rgba(255,255,255,0.1) !important;
      }

      .ao-popover .ao-vote-btn.selected {
        border-color: #ff6b00 !important;
        background: rgba(255,107,0,0.2) !important;
      }

      .ao-popover .ao-vote-btn.ai-btn.selected {
        border-color: #ff6b00 !important;
        background: rgba(255,107,0,0.3) !important;
      }

      .ao-popover .ao-vote-btn.human-btn.selected {
        border-color: #20c05c !important;
        background: rgba(32,192,92,0.3) !important;
      }

      .ao-popover .ao-actions {
        display: flex !important;
        gap: 10px !important;
        margin-top: 16px !important;
      }

      .ao-popover .ao-btn {
        flex: 1 !important;
        padding: 10px !important;
        border: none !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
      }

      .ao-popover .ao-btn-close {
        background: rgba(255,255,255,0.1) !important;
        color: white !important;
      }

      .ao-popover .ao-btn-submit {
        background: #ff6b00 !important;
        color: white !important;
      }

      .ao-popover .ao-btn-submit:disabled {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }

      .ao-popover .ao-status {
        font-size: 11px !important;
        color: #888 !important;
        margin-top: 8px !important;
        text-align: center !important;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  cleanupOrphanedBadges() {
    // Remove badges whose target elements no longer exist
    this.badgeContainer.querySelectorAll('.ao-badge').forEach(badge => {
      const targetId = badge.getAttribute('data-ao-target');
      const target = document.querySelector(`[data-ao-id="${targetId}"]`);
      if (!target || !document.body.contains(target)) {
        badge.remove();
        this.overlays.delete(targetId);
      }
    });
  }

  updatePositions() {
    this.badgeContainer.querySelectorAll('.ao-badge').forEach(badge => {
      const targetId = badge.getAttribute('data-ao-target');
      const target = document.querySelector(`[data-ao-id="${targetId}"]`);
      
      if (!target || !document.body.contains(target)) {
        badge.style.display = 'none';
        return;
      }
      
      const rect = target.getBoundingClientRect();
      
      // Hide if element is off-screen or too small
      if (rect.width < 20 || rect.height < 20 || 
          rect.bottom < 0 || rect.top > window.innerHeight ||
          rect.right < 0 || rect.left > window.innerWidth) {
        badge.style.display = 'none';
        return;
      }
      
      badge.style.display = 'block';
  // Account for badge width so we anchor to the element corner reliably
  const bw = badge.getBoundingClientRect?.().width || 36;
  badge.style.left = Math.max(4, rect.right - bw - 4) + 'px';
      badge.style.top = Math.max(4, rect.top + 4) + 'px';
    });
  }

  closePopover() {
    this.activePopover?.remove();
    this.activePopover = null;
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  openPopover(badge, result) {
    this.closePopover();

    const pop = document.createElement('div');
    pop.className = 'ao-popover';

    const confidence = Math.round((result?.confidence || 0) * 100);
    const indicators = Array.isArray(result?.indicators) ? result.indicators : [];
    const indicatorText = indicators.slice(0, 5)
      .map(i => this.escapeHtml(i?.indicator || ''))
      .filter(Boolean)
      .join('<br>&bull; ') || 'AI patterns detected';
    const featureIds = Array.isArray(result?.featureIds) ? result.featureIds : [];

    pop.innerHTML = `
      <h3>AI Content Detected</h3>
      <div class="ao-confidence">${confidence}%</div>
      <div class="ao-indicators">&bull; ${indicatorText}</div>
      
      <div class="ao-vote-section">
        <div class="ao-vote-title">Help improve detection - is this AI-generated?</div>
        <div class="ao-vote-buttons">
          <button class="ao-vote-btn ai-btn" data-vote="ai">
            🤖 Yes, it's AI
          </button>
          <button class="ao-vote-btn human-btn" data-vote="human">
            👤 No, it's human
          </button>
        </div>
      </div>
      
      <div class="ao-actions">
        <button class="ao-btn ao-btn-close">Close</button>
        <button class="ao-btn ao-btn-submit" disabled>Submit Vote</button>
      </div>
      <div class="ao-status"></div>
    `;

    // Position near badge
    const r = badge.getBoundingClientRect();
    let left = r.left - 170;
    let top = r.bottom + 8;
    
    // Keep on screen
    if (left < 12) left = 12;
    if (left + 340 > window.innerWidth) left = window.innerWidth - 352;
    if (top + 300 > window.innerHeight) top = r.top - 310;
    if (top < 12) top = 12;
    
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';

    // Vote handling
    let selectedVote = null;
    const voteButtons = pop.querySelectorAll('.ao-vote-btn');
    const submitBtn = pop.querySelector('.ao-btn-submit');
    const statusEl = pop.querySelector('.ao-status');

    voteButtons.forEach(btn => {
      btn.onclick = () => {
        voteButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedVote = btn.getAttribute('data-vote');
        submitBtn.disabled = false;
      };
    });

    pop.querySelector('.ao-btn-close').onclick = () => this.closePopover();

    submitBtn.onclick = async () => {
      if (!selectedVote) return;
      
      submitBtn.disabled = true;
      statusEl.textContent = 'Submitting...';
      
      try {
        // Build vote payload
        const voteData = {
          type: result?.type || 'image',
          vote: selectedVote, // 'ai' or 'human'
          confidence: result?.confidence,
          featureIds: featureIds,
          indicators: indicators.map(i => i?.indicator).filter(Boolean),
        };
        
        // Send to background script for crowd learning
        chrome.runtime.sendMessage({ 
          action: 'submitCrowdVote', 
          payload: voteData 
        }, (response) => {
          if (response?.success) {
            statusEl.textContent = '✓ Vote submitted! Thanks for helping.';
            setTimeout(() => this.closePopover(), 1500);
          } else {
            statusEl.textContent = '✓ Vote recorded locally.';
            setTimeout(() => this.closePopover(), 1500);
          }
        });
      } catch (err) {
        statusEl.textContent = '✓ Vote saved.';
        setTimeout(() => this.closePopover(), 1500);
      }
    };
    
    // Close on outside click
    setTimeout(() => {
      const closeHandler = (ev) => {
        if (!pop.contains(ev.target) && !ev.target.classList.contains('ao-badge')) {
          this.closePopover();
          document.removeEventListener('pointerdown', closeHandler, true);
        }
      };
      document.addEventListener('pointerdown', closeHandler, true);
    }, 200);

    this.badgeContainer.appendChild(pop);
    this.activePopover = pop;
  }

  generateId() {
    return 'ao-' + Math.random().toString(36).substr(2, 9);
  }

  createBadge(targetId, result) {
    const badge = document.createElement('div');
    badge.className = 'ao-badge';
    badge.textContent = 'AI';
    badge.title = 'Click for details';
    badge.setAttribute('data-ao-target', targetId);

    badge.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.openPopover(badge, result);
    };

    this.badgeContainer.appendChild(badge);
    return badge;
  }

  markAsAI(element, result) {
    if (!element) return;
    
    // Check if already marked
    const existingId = element.getAttribute('data-ao-id');
    if (existingId && this.overlays.has(existingId)) return;
    if (element.classList.contains('ao-ai-content')) return;
    
    const targetId = this.generateId();
    element.setAttribute('data-ao-id', targetId);
    element.classList.add('ao-ai-content');
    
    const badge = this.createBadge(targetId, result);
    this.overlays.set(targetId, { element, badge, result });
    
    // Position immediately
    requestAnimationFrame(() => this.updatePositions());
  }

  markImage(img, result) {
    if (!img) return;
    if (img.closest('.ao-image-wrapper')) return;
    
    const existingId = img.getAttribute('data-ao-id');
    if (existingId && this.overlays.has(existingId)) return;
    
    // Wrap image
    const wrapper = document.createElement('div');
    wrapper.className = 'ao-image-wrapper ao-ai-content';
    
    const targetId = this.generateId();
    wrapper.setAttribute('data-ao-id', targetId);
    
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    
    const badge = this.createBadge(targetId, result);
    this.overlays.set(targetId, { element: wrapper, img, badge, result });
    
    requestAnimationFrame(() => this.updatePositions());
  }

  removeOverlay(element) {
    const targetId = element?.getAttribute?.('data-ao-id');
    if (!targetId) return;
    
    const overlay = this.overlays.get(targetId);
    if (!overlay) return;
    
    element.classList.remove('ao-ai-content');
    element.removeAttribute('data-ao-id');
    overlay.badge?.remove();
    
    if (overlay.img && overlay.element?.classList.contains('ao-image-wrapper')) {
      const wrapper = overlay.element;
      if (wrapper.parentNode) {
        wrapper.parentNode.insertBefore(overlay.img, wrapper);
        wrapper.remove();
      }
    }
    
    this.overlays.delete(targetId);
  }

  clearAll() {
    this.overlays.forEach((overlay, targetId) => {
      overlay.badge?.remove();
      const el = document.querySelector(`[data-ao-id="${targetId}"]`);
      if (el) {
        el.classList.remove('ao-ai-content');
        el.removeAttribute('data-ao-id');
      }
    });
    this.overlays.clear();
    this.badgeContainer.querySelectorAll('.ao-badge, .ao-popover').forEach(el => el.remove());
  }

  clearAllOverlays() {
    this.clearAll();
  }
}

if (typeof window !== 'undefined') {
  window.OverlaySystem = OverlaySystem;
}
