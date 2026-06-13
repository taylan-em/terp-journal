// Debug overlay - shows if React fails to render
window.addEventListener('error', function(e) {
  document.getElementById('root').innerHTML = 
    '<div style="background:#1a0505;color:#f87171;padding:20px;font-family:monospace;min-height:100vh">' +
    '<h2>⚠️ App Crash</h2>' +
    '<pre style="white-space:pre-wrap;word-break:break-all">' + 
    (e.error ? (e.error.message || e.error) : e.message) + 
    '</pre>' +
    '<p style="margin-top:20px;color:#888">Check browser console for more details.</p>' +
    '</div>';
});

// Also catch unhandled rejections
window.addEventListener('unhandledrejection', function(e) {
  document.getElementById('root').innerHTML = 
    '<div style="background:#1a0505;color:#f87171;padding:20px;font-family:monospace;min-height:100vh">' +
    '<h2>⚠️ Unhandled Promise Rejection</h2>' +
    '<pre style="white-space:pre-wrap;word-break:break-all">' + 
    (e.reason ? (e.reason.message || String(e.reason)) : 'Unknown') + 
    '</pre>' +
    '</div>';
});

// Show a "React loaded" indicator for 1 second
document.addEventListener('DOMContentLoaded', function() {
  var el = document.createElement('div');
  el.textContent = 'Resin v3 — ' + new Date().toISOString();
  el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0c0905;color:#4a4;padding:4px 8px;font-size:10px;font-family:monospace;z-index:99999;opacity:0.8;text-align:center';
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; el.style.transition = 'opacity 1s'; }, 3000);
  setTimeout(function() { if(el.parentNode) el.remove(); }, 5000);
});
