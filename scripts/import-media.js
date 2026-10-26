import { mkdir, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

const files = {
  virat: 'Virat_Kohli_at_the_2015_IPL_opening_ceremony_(cropped).jpg',
  green: 'Mandar_Agashe_presenting_Cameron_Green_with_the_Man_of_the_Match_Trophy_-_25_April_2024_-_Sunrisers_Hyderabad_versus_Royal_Challengers_Bengaluru_-_Rajiv_Gandhi_International_Cricket_Stadium,_Hyderabad.jpg',
  dravid: 'Rahul_dravid_Bangalore_Royal_Challengers_(cropped).jpg',
  logo: 'रॉयल_चैलेंजर्स_बेंगलुरु_लोगो.png',
  stadium: 'Chinnaswamy_Stadium.jpg'
};
const soloCrops = {
  green: { x: 595, y: 0, width: 660, height: 1060 }
};
const headers = { 'User-Agent': 'RCBForever/1.0 (https://github.com/Unigalactix/RCB; licensed fan-archive media)' };
const params = new URLSearchParams({
  action: 'query', format: 'json', prop: 'imageinfo',
  titles: Object.values(files).map(file => `File:${file}`).join('|'),
  iiprop: 'url|size|extmetadata',
  iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl'
});
const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers });
if (!response.ok) throw new Error(`Commons metadata: HTTP ${response.status}`);
const data = await response.json();
if (data.error) throw new Error(`Commons API: ${data.error.info}`);
const pages = Object.values(data.query.pages);
const text = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').trim();
const photos = {};
await mkdir('assets/photos', { recursive: true });
for (const [id, file] of Object.entries(files)) {
  const page = pages.find(item => item.title.replaceAll('_', ' ') === `File:${file.replaceAll('_', ' ')}`);
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`No Commons media metadata for ${file}`);
  const meta = info.extmetadata;
  const license = meta.LicenseShortName?.value;
  if (!license || !/^(CC BY(?:-SA)? [234]\.0|CC0|Public domain|GODL-India)$/.test(license)) {
    throw new Error(`Review license before importing ${file}: ${license}`);
  }
  if (!info.width || !info.height) throw new Error(`Missing original dimensions for ${id}`);
  const url = info.url.split('?')[0];
  const image = await fetch(url, { headers });
  if (!image.ok) throw new Error(`Photo ${id}: HTTP ${image.status}`);
  if (!image.headers.get('content-type')?.startsWith('image/')) throw new Error(`Not an image: ${id}`);
  const ext = file.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  const path = `assets/photos/${id === 'logo' ? 'rcb-logo' : id}.${ext}`;
  await writeFile(path, new Uint8Array(await image.arrayBuffer()));
  let width = info.width;
  let height = info.height;
  let changes = 'Displayed with a responsive crop; original photograph otherwise unchanged.';
  if (soloCrops[id]) {
    const crop = soloCrops[id];
    execFileSync('powershell', [
      '-NoProfile', '-Command',
      `Add-Type -AssemblyName System.Drawing; $src = [System.Drawing.Image]::FromFile((Resolve-Path '${path}')); $rect = New-Object System.Drawing.Rectangle(${crop.x}, ${crop.y}, ${crop.width}, ${crop.height}); $bmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $rect.Width, $rect.Height)), $rect, [System.Drawing.GraphicsUnit]::Pixel); $g.Dispose(); $src.Dispose(); $bmp.Save((Resolve-Path '${path}'), [System.Drawing.Imaging.ImageFormat]::Jpeg); $bmp.Dispose()`
    ]);
    width = crop.width;
    height = crop.height;
    changes = `Cropped to a solo portrait (${width} × ${height}px from the ${info.width} × ${info.height}px original under ${license}) so only the player in RCB kit is shown.`;
  }
  photos[id] = {
    src: `./${path}`,
    author: text(meta.Artist?.value || ''),
    license,
    licenseUrl: meta.LicenseUrl?.value?.replace(/^http:/, 'https:') || 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    source: info.descriptionurl,
    width,
    height,
    changes
  };
  photos[id].photoType = id === 'stadium' ? 'venue' : id === 'logo' ? 'crest' : 'rcb-kit';
  if (!photos[id].author) throw new Error(`Missing author attribution for ${id}`);
  console.log(`Imported ${id}: ${width} × ${height} / ${license} / ${photos[id].author}`);
  await setTimeout(300);
}
try {
  await stat('assets/photos/virat-kohli.png');
  photos.virat = {
    src: './assets/photos/virat-kohli.png',
    author: 'Project owner archive (2026 RCB kit)',
    license: 'User-supplied local asset',
    licenseUrl: 'https://www.iplt20.com/teams/royal-challengers-bengaluru/squad',
    source: 'https://commons.wikimedia.org/wiki/File:Virat_Kohli_at_the_2015_IPL_opening_ceremony_(cropped).jpg',
    width: 612,
    height: 408,
    changes: 'User-supplied solo match photograph of Virat Kohli in 2026 RCB kit.',
    photoType: 'rcb-kit'
  };
} catch {}
await writeFile('media.js', `// Generated by scripts/import-media.js from Wikimedia Commons license metadata.\nexport const photos = ${JSON.stringify(photos, null, 2)};\n`);
console.log(`Imported ${Object.keys(photos).length} openly licensed images. Review source pages before adding new files.`);
