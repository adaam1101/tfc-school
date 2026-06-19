const { spawn } = require('child_process');
const path = require('path');

console.log("==========================================================");
console.log("Starting TFC School & NextMind Academy Multi-School Web App");
console.log("==========================================================");

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Run Backend
const backend = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Run Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  process.exit(code);
});
