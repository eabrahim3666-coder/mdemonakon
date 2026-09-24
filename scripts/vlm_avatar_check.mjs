import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const f = process.argv[2];
if (!f) {
  console.error('usage: node vlm_avatar_check.mjs <preview.png>');
  process.exit(1);
}

const PROMPT = `This image shows a person's photo cut out on a checkerboard background (checkerboard = transparency).
Answer precisely:
1. Is a person (head/bust) fully visible inside the frame? Any part cut off?
2. Is the background fully transparent (checkerboard visible around the whole subject)?
3. Are there any leftover background patches stuck to the person (hair, shoulders, edges)?
4. Describe the crop: where are the head top and shoulders relative to the frame edges?
5. Overall quality of the cutout (clean / acceptable / bad).`;

const zai = await ZAI.create();
const b64 = fs.readFileSync(f).toString('base64');
const res = await zai.chat.completions.createVision({
    model: 'glm-4.6v',
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
console.log(res.choices[0].message.content);
