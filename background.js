// Background script for mouse simulator extension

// Use a namespace that works in Firefox and Chrome
const api = typeof browser !== 'undefined' ? browser : chrome;

// Handle extension installation
api.runtime.onInstalled.addListener(() => {
  console.log('Mouse Random extension installed');
});

// Handle messages from popup or content scripts
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any background processing if needed
  return true;
});

// Removed dynamic injection via chrome.scripting (Chromium-only). Firefox loads content.js
// automatically from the manifest "content_scripts".
