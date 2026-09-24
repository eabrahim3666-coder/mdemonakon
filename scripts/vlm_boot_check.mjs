import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const frames = process.argv.slice(2);
if (frames.length === 0) {
  console.error('usage: node vlm_boot_check.mjs <frame.png> [...]');
  process.exit(1);
}

const PROMPT = `You are looking at screenshots taken in sequence during the initial load of a portfolio website (image size 1440x900).
Describe precisely:
1. Is there a full-screen LOADING SCREEN visible? What text does it show (label, big name, subtitle)?
2. Is there a progress bar? Estimate its fill percentage and describe it.
3. Is the page background clean/solid, or is there any gradient/colorful splashes/flash visible anywhere?
4. If the loading screen is gone: describe what page content is visible (hero text, memoji character, input field, buttons row, giant watermark text at bottom).
5. Any visual glitches, overlapping text, or artifacts?
Be literal and concise.`;

const zai = await ZAI.create();
for (const f of frames) {
  const b64 = fs.readFileSync(f).toString('base64');
  const res = await zai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        ],
      },
    ],
  });
  console.log(`\n===== ${f} =====`);
  console.log(res.choices[0].message.content);
}
