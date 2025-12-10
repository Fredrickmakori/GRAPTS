const { execSync } = require('child_process');

// Skip running nested installs in CI environments (Vercel, GitHub Actions, general CI)
const isCI = !!(
  process.env.CI === 'true' ||
  process.env.CI === '1' ||
  process.env.VERCEL === '1' ||
  process.env.VERCEL === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.GITHUB_ACTIONS === '1'
);

if (isCI) {
  console.log('CI detected — skipping nested postinstall (client/server installs).');
  process.exit(0);
}

try {
  console.log('Running local postinstall: installing client and server dependencies...');
  // Run with inherited stdio so output is visible
  execSync('cd client && npm install', { stdio: 'inherit' });
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('Local nested installs complete.');
} catch (err) {
  console.error('postinstall nested install failed:', err);
  // still exit cleanly to avoid breaking local installs
  process.exit(0);
}
