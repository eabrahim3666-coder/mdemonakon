import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const frames = process.argv.slice(2);
if (frames.length === 0) {
  console.error('usage: node vlm_cursor_recheck.mjs <frame.png> [...]');
  process.exit(1);
}

const PROMPT = `You are looking at a screenshot from a screen recording of a website.
Focus ONLY on the mouse cursor area. Answer these questions precisely:
1. Is a native OS mouse cursor (arrow pointer) visible in this frame? Where (approx x,y)?
2. Is there a separate circle/ring shape near or around the cursor? Describe: its size in px (image is 1920x902), its border color/thickness, whether it is filled or just an outline.
3. What is INSIDE the circle — does it show magnified (zoomed-in) content, or is it empty/transparent?
4. What is the position of the circle relative to the arrow cursor: centered exactly on it, offset, or trailing behind?
5. Describe what website content is under the cursor right now (cards? text? background?).
Be literal and precise. If something is not visible, say so.`;

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
