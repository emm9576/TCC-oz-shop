import { spawn } from 'child_process';

// iniciar backend
spawn('node', ['./api/server.js'], {
  stdio: 'inherit',
});

// iniciar frontend
spawn('npm', ['run', 'dev'], {
  cwd: './src/',
  stdio: 'inherit',
});
