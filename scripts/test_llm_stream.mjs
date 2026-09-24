import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();
  const result = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Reply in one short sentence.' },
      { role: 'user', content: 'Say hello!' }
    ],
    stream: true,
    thinking: { type: 'disabled' }
  });
  if (result && typeof result.getReader === 'function') {
    const reader = result.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }
    console.log('=== RAW SSE (first 1500 chars) ===');
    console.log(raw.slice(0, 1500));
  } else {
    console.log('Non-stream result:', JSON.stringify(result).slice(0, 800));
  }
}

main().catch(e => { console.error('ERR', e.message); process.exit(1); });
