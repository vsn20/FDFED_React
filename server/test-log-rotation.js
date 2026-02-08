/**
 * Test Log Rotation - Run this to verify date-based log files work
 * Usage: node test-log-rotation.js
 */

const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');

const logsDir = path.join(__dirname, 'logs');

// Helper function to get formatted date string
const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Test with different dates
const testDates = [
  new Date(),                          // Today
  new Date(Date.now() - 86400000),     // Yesterday
  new Date(Date.now() - 86400000 * 2), // 2 days ago
  new Date(Date.now() + 86400000),     // Tomorrow
];

console.log('\n🔍 Testing Log Rotation Date Logic\n');
console.log('='.repeat(50));

testDates.forEach((date, index) => {
  const dateStr = getDateString(date);
  const filename = `access-${dateStr}.log`;
  const filepath = path.join(logsDir, filename);
  
  const labels = ['Today', 'Yesterday', '2 Days Ago', 'Tomorrow'];
  console.log(`\n${labels[index]}:`);
  console.log(`  Date: ${date.toDateString()}`);
  console.log(`  File: ${filename}`);
  console.log(`  Exists: ${fs.existsSync(filepath) ? '✅ Yes' : '❌ No'}`);
});

console.log('\n' + '='.repeat(50));

// Create test entries in simulated date files
console.log('\n📝 Creating test log entries for yesterday and tomorrow...\n');

['Yesterday', 'Tomorrow'].forEach((label, i) => {
  const date = i === 0 
    ? new Date(Date.now() - 86400000)  // Yesterday
    : new Date(Date.now() + 86400000); // Tomorrow
  
  const dateStr = getDateString(date);
  const filename = `access-${dateStr}.log`;
  const filepath = path.join(logsDir, filename);
  
  const testEntry = `[${date.toISOString()}] TEST - Simulated ${label} log entry\n`;
  
  fs.appendFileSync(filepath, testEntry);
  console.log(`✅ Created/Updated: ${filename}`);
});

console.log('\n📂 Current log files in logs directory:\n');

fs.readdirSync(logsDir)
  .filter(f => f.endsWith('.log'))
  .sort()
  .forEach(file => {
    const stats = fs.statSync(path.join(logsDir, file));
    console.log(`  ${file} (${stats.size} bytes)`);
  });

console.log('\n✅ Test complete! Check the logs folder.\n');
