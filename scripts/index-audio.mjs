// Lists the audio files that exist, so the app asks only for those. Writes public/audio-manifest.json.
// Run after adding or removing clips: npm run audio:index   (the speech script runs it too)
import fs from 'node:fs';

const names = folder => {
  const dir = new URL(`../public/${folder}/`, import.meta.url);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort() : [];
};

const manifest = { narration: names('narration'), sfx: names('sfx') };
fs.writeFileSync(new URL('../public/audio-manifest.json', import.meta.url), JSON.stringify(manifest) + '\n');
console.log(`${manifest.narration.length} narration clips, ${manifest.sfx.length} sounds`);
