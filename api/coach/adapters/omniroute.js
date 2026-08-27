/* OmniRoute adapter — OpenAI-compatible gateway.

   OmniRoute exposes an OpenAI-style /v1/chat/completions endpoint. Unlike the Claude/Codex
   adapters this is not a spawned subprocess: the Coach job talks to it over HTTP from inside
   the api container. The openGym container reaches the gateway via its reachable address, not
   localhost (localhost inside the container is the container itself), so OMNIROUTE_BASE_URL
   must point at the gateway — e.g. http://192.168.1.207:20128.

   Auth is a single bearer key (OMNIROUTE_API_KEY). Combos like free/gym stream SSE with periodic
   ":keepalive" pings and only resolve a concrete model on the first real token, so this client
   reads the stream to [DONE] and treats keepalives as no-ops. If a model answers with a plain
   (non-streamed) JSON body instead, invoke() falls back to a non-stream POST. */
import http from 'node:http';
import https from 'node:https';

const DEFAULT_BASE = 'http://192.168.1.207:20128';
// Default model routed through the gateway. The owner's free/gym combo was not resolving on the
// gateway at setup (keepalive, no model resolved), so a concrete free model is the default:
// nvidia/nvidia/nemotron-3-super-120b-a12b returns valid JSON. Override per-instance from the
// admin dashboard (AI Coach → model).
const DEFAULT_MODEL = 'nvidia/nvidia/nemotron-3-super-120b-a12b';

const baseUrl = () => (process.env.OMNIROUTE_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
const apiKey = env => (env && env.OMNIROUTE_API_KEY) || process.env.OMNIROUTE_API_KEY || '';
// Model resolution priority: dashboard (cfg.model) ▸ OMNIROUTE_MODEL env ▸ built-in default.
const modelFrom = cfg => cfg.model || process.env.OMNIROUTE_MODEL || DEFAULT_MODEL;
const clientFor = u => (u.protocol === 'https:' ? https : http);

function request(u, key, body, { timeoutMs }) {
  const data = JSON.stringify(body);
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  return new Promise((resolve, reject) => {
    const req = clientFor(u).request({
      method: 'POST',
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Accept': body.stream ? 'text/event-stream' : 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      if (!body.stream) {
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, raw: Buffer.concat(chunks).toString('utf8') }); });
        return;
      }
      // Streaming: accumulate SSE deltas until [DONE] or the connection ends.
      let content = '';
      let model = null;
      res.setEncoding('utf8');
      res.on('data', chunk => {
        for (const line of chunk.split('\n')) {
          const s = line.trim();
          if (!s.startsWith('data:')) continue;          // skips ":keepalive" pings and blanks
          const payload = s.slice(5).trim();
          if (payload === '[DONE]') { clearTimeout(timer); resolve({ status: res.statusCode, content, model }); return; }
          try {
            const o = JSON.parse(payload);
            if (o.model && o.model !== 'omniroute') model = o.model;
            content += o.choices?.[0]?.delta?.content || o.choices?.[0]?.message?.content || '';
          } catch { /* non-JSON keepalive line — ignore */ }
        }
      });
      res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, content, model }); });
    });
    req.on('error', e => { clearTimeout(timer); reject(e); });
    req.write(data);
    req.end();
  });
}

const SYSTEM = 'You are the openGym Coach. Answer only the supplied task and return exactly the requested JSON. You have no tools, filesystem access, external services, or persistent memory.';

async function complete(u, key, prompt, model, timeoutMs) {
  // Preferred path: stream (free/gym requires it).
  try {
    const r = await request(u, key, {
      model, stream: true, max_tokens: 4000,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }]
    }, { timeoutMs });
    if (r.status !== 200) throw new Error(`OmniRoute ${r.status}: ${(r.content || r.raw || '').slice(0, 200)}`);
    return r.content || '';
  } catch (e) {
    if (/abort|timeout/i.test(String(e.message))) throw e;   // surface as timeout to the caller
    // Fallback: some models return a single non-streamed JSON object.
    const r = await request(u, key, {
      model, stream: false, max_tokens: 4000,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }]
    }, { timeoutMs });
    if (r.status !== 200) throw new Error(`OmniRoute ${r.status}: ${(r.raw || '').slice(0, 200)}`);
    try { return JSON.parse(r.raw).choices?.[0]?.message?.content || ''; }
    catch { throw new Error(`OmniRoute ${r.status}: ${(r.raw || '').slice(0, 200)}`); }
  }
}

export default {
  id: 'omniroute',
  runtime: 'OmniRoute gateway',

  async check(cfg, env) {
    const u = new URL(baseUrl() + '/v1/chat/completions');
    try {
      const r = await request(u, apiKey(env), {
        model: modelFrom(cfg), stream: true, max_tokens: 64,
        messages: [{ role: 'user', content: 'Reply with exactly this JSON object: {"coach_contract":1,"ok":true}' }]
      }, { timeoutMs: 60000 });
      return r.status === 200 ? { ok: true, version: r.model || 'omniroute' } : { ok: false, error: `OmniRoute ${r.status}` };
    } catch (e) { return { ok: false, error: String(e.message || e).slice(0, 200) }; }
  },

  async invoke({ cfg, prompt, env, model, timeoutMs }) {
    const u = new URL(baseUrl() + '/v1/chat/completions');
    const m = modelFrom(cfg);
    try {
      const text = (await complete(u, apiKey(env), prompt, m, timeoutMs || 300000)).trim();
      return { code: 0, text, stderr: '', timedOut: false, spawnError: false };
    } catch (e) {
      const timedOut = /abort|timeout/i.test(String(e.message));
      return {
        code: timedOut ? -1 : 1,
        text: '',
        stderr: String(e.message || e).slice(0, 300),
        timedOut,
        spawnError: false
      };
    }
  }
};
