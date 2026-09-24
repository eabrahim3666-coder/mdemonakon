import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const VIDEO = '/home/z/my-project/upload/hover_video.mp4';
const b64 = fs.readFileSync(VIDEO).toString('base64');
console.log('video size:', (fs.statSync(VIDEO).size / 1024 / 1024).toFixed(2), 'MB');

const PROMPT = `Watch this screen recording of a website very carefully, focusing ONLY on the MOUSE CURSOR behavior throughout the whole video. Answer with precise observation:
1. Is the native OS arrow cursor (normal pointer) visible the whole time, or hidden/replaced?
2. A circle follows the cursor. HOW does it follow: stuck exactly to the cursor at all times, or lagging/trailing behind while the cursor moves, catching up when it stops?
3. When the cursor is STATIONARY (not moving), where is the circle: centered exactly on the cursor, or offset from it (which direction)?
4. When hovering over the project cards/content, the circle grows into a magnifying glass. Is that magnifying glass centered exactly on the cursor, or offset from it?
5. Describe the transition moments: what happens when the circle changes from small ring to big lens, and back?`;

const zai = await ZAI.create();
const res = await zai.chat.completions.createVision({
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: PROMPT },
        { type: 'video_url', video_url: { url: `data:video/mp4;base64,${b64}` } },
      ],
    },
  ],
  thinking: { type: 'disabled' },
});
console.log(res.choices[0]?.message?.content || 'NO CONTENT');
