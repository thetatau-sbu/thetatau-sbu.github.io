// Renders scripts/og.html to public/og.jpg (1200x630), the image link previews show
// when someone shares the site. Run with: npm run og
// Needs Google Chrome (or Chromium) installed. Safe to run as many times as you like.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.join(here, 'og.html');
const out = path.join(here, '..', 'public', 'og.jpg');
const tmp = path.join(os.tmpdir(), `thetatau-og-${process.pid}.png`);

function findChrome() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      const found = execFileSync('which', [name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (found) return found;
    } catch {}
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.error('✗ Could not find Google Chrome or Chromium.');
  console.error('  Install Google Chrome from https://www.google.com/chrome/ and run this again.');
  process.exit(1);
}

try {
  execFileSync(chrome, [
    '--headless=new',
    `--screenshot=${tmp}`,
    '--window-size=1200,630',
    '--hide-scrollbars',
    '--virtual-time-budget=4000',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    pathToFileURL(template).href,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
} catch (err) {
  console.error('✗ Chrome failed to render scripts/og.html');
  console.error(String(err.stderr || err.message));
  process.exit(1);
}

if (!fs.existsSync(tmp)) {
  console.error('✗ Chrome ran but did not write a screenshot.');
  process.exit(1);
}

const info = await sharp(tmp).jpeg({ quality: 85, mozjpeg: true }).toFile(out);
fs.rmSync(tmp, { force: true });

const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log(`✓ wrote ${path.relative(process.cwd(), out) || out} (${info.width}x${info.height}, ${kb} KB)`);
