import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const f = process.argv[2];
const q = process.argv[3] || 'Describe this webpage screenshot.';
if (!f) {
  console.error('usage: node vlm_site_check.mjs <shot.png> "<question>"');
  process.exit(1);
}

const zai = await ZAI.create();
const b64 = fs.readFileSync(f).toString('base64');
const res = await zai.chat.completions.createVision({
  model: 'glm-4.6v',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: q },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
      ],
    },
  ],
});
console.log(res.choices[0].message.content);
