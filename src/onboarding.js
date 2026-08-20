/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
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
