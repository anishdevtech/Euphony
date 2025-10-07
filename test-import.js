// test-import.js
console.log('Testing imports...');

try {
  const pkg = require('youtubei.js/package.json');
  console.log('Package exports:', JSON.stringify(pkg.exports, null, 2));
} catch (e) {
  console.log('Error:', e.message);
}