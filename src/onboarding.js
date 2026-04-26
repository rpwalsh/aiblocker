/*
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('skipOnboarding')?.addEventListener('click', () => {
    window.close();
  });

  document.getElementById('openOptions')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
