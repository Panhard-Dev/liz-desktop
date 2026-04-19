const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BACKEND_ENV_PATHS = [
  path.resolve(ROOT, '..', 'backend-worker', '.dev.vars'),
  path.resolve(ROOT, '..', 'backend-worker', '.env'),
  path.resolve(ROOT, '..', 'backend', '.env'),
];
const LIZ_CHAT_COMPLETIONS_PATH = '/v1/chat/completions';
const LIZ_CHAT_ROUTE_MODEL_MAP = Object.freeze({
  '/api/liz-mini': 'liz-mini',
  '/api/liz-2.3': 'liz-2.3',
  '/api/liz-flash': 'liz-flash',
  '/api/liz-2.5': 'liz-2.5',
});
const LIZ_CHAT_PROXY_PATHS = new Set(Object.keys(LIZ_CHAT_ROUTE_MODEL_MAP));
const LIZ_IMAGE_PROXY_PATH = '/api/liz-image';
const LIZ_PROXY_MAX_BODY_BYTES = 1_000_000;
const DEFAULT_LIZ_DIRECT_BASE = 'https://liz-edge-server.studiosluxgames.workers.dev';
const DEFAULT_LIZ_DIRECT_BASE_25 = 'https://liz-25-dev-server.studiosluxgames.workers.dev';
const DEFAULT_FLUX_IMAGE_BASE_PRIMARY = 'https://liz-ia-imagens.lizs.workers.dev';
const DEFAULT_FLUX_IMAGE_BASE_FALLBACK = 'https://liz-ia-imagens.hsa-gab234.workers.dev';
const DEFAULT_FLUX_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const DEFAULT_FLUX_IMAGE_PATH = '/api/ai/run';
const CLOUDFLARE_API_HOST = 'api.cloudflare.com';
const CLOUDFLARE_MODEL_PREFIX = '@cf/';

const HOST = process.env.FRONTEND_HOST || '127.0.0.1';
const PORT = Number(process.env.FRONTEND_PORT || 5500);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const out = {};
    raw.split(/\r?\n/).forEach(line => {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (!key) return;
      if (
        value.length >= 2 &&
        ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    });
    return out;
  } catch (error) {
    return {};
  }
}

function loadBackendEnv() {
  return BACKEND_ENV_PATHS.reduce((acc, filePath) => {
    if (!filePath) return acc;
    return {
      ...acc,
      ...parseEnvFile(filePath),
    };
  }, {});
}

function normalizeBaseUrl(value, fallback) {
  const raw = String(value || '').trim();
  const selected = raw || String(fallback || '').trim();
  return selected.replace(/\/+$/, '');
}

function normalizeApiPath(value, fallbackPath) {
  const raw = String(value || '').trim();
  const selected = raw || String(fallbackPath || '').trim();
  if (!selected) return '/';
  return selected.startsWith('/') ? selected : `/${selected}`;
}

function resolveLizChatCompletionsUrl(baseUrl) {
  const normalizedBase = normalizeBaseUrl(baseUrl, DEFAULT_LIZ_DIRECT_BASE);
  if (/\/v1\/chat\/completions$/i.test(normalizedBase)) return normalizedBase;
  if (/\/v1$/i.test(normalizedBase)) return `${normalizedBase}/chat/completions`;
  return `${normalizedBase}${LIZ_CHAT_COMPLETIONS_PATH}`;
}

function normalizeLizChatModel(model, fallbackModel = 'liz-mini') {
  const normalized = String(model || '').trim().toLowerCase();
  if (!normalized) return fallbackModel;
  if (normalized === 'mini' || normalized === 'liz-mini') return 'liz-mini';
  if (normalized === '2.3' || normalized === 'liz-2.3') return 'liz-2.3';
  if (
    normalized === 'flash'
    || normalized === 'liz flash'
    || normalized === 'liz-flash'
  ) {
    return 'liz-flash';
  }
  if (
    normalized === '2.5'
    || normalized === 'liz 2.5'
    || normalized === 'liz-2.5'
  ) {
    return 'liz-2.5';
  }
  return fallbackModel;
}

function extractLegacyContentsText(source) {
  if (!source || typeof source !== 'object') return '';
  const contents = Array.isArray(source.contents) ? source.contents : [];
  for (const item of contents) {
    const parts = Array.isArray(item?.parts) ? item.parts : [];
    for (const part of parts) {
      const text = String(part?.text || '').trim();
      if (text) return text;
    }
  }
  return '';
}

function normalizeLizChatMessages(source) {
  const rawMessages = Array.isArray(source?.messages) ? source.messages : [];
  const normalized = rawMessages
    .map(entry => {
      const role = String(entry?.role || '').trim().toLowerCase();
      const safeRole = ['user', 'assistant', 'system'].includes(role) ? role : 'user';
      const content = entry?.content;
      if (typeof content === 'string') {
        const safeContent = content.trim();
        if (safeContent) return { role: safeRole, content: safeContent };
        return null;
      }
      if (Array.isArray(content)) {
        const merged = content
          .map(part => String(part?.text || part?.content || '').trim())
          .filter(Boolean)
          .join('\n')
          .trim();
        if (merged) return { role: safeRole, content: merged };
      }
      return null;
    })
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized;
  }

  const directMessage = String(source?.message || '').trim();
  if (directMessage) {
    return [{ role: 'user', content: directMessage }];
  }

  const legacyMessage = extractLegacyContentsText(source);
  if (legacyMessage) {
    return [{ role: 'user', content: legacyMessage }];
  }

  return [];
}

function buildLizChatPayload(sourceBody, fallbackModel) {
  const source = sourceBody && typeof sourceBody === 'object' ? sourceBody : {};
  const model = normalizeLizChatModel(source.model, fallbackModel);
  const messages = normalizeLizChatMessages(source);
  if (messages.length === 0) return null;
  return {
    model,
    messages,
    stream: Boolean(source.stream),
  };
}

function resolveLizDirectSettings(env, model = 'liz-mini') {
  const normalizedModel = normalizeLizChatModel(model, 'liz-mini');
  const isModel25 = normalizedModel === 'liz-2.5';
  return {
    baseUrl: normalizeBaseUrl(
      (isModel25
        ? (
          env.LIZ_API_BASE_URL_25 ||
          env.LIZ_API_URL_25 ||
          process.env.LIZ_API_BASE_URL_25 ||
          process.env.LIZ_API_URL_25
        )
        : (
          env.LIZ_API_BASE_URL ||
          env.LIZ_API_URL ||
          process.env.LIZ_API_BASE_URL ||
          process.env.LIZ_API_URL
        )),
      isModel25 ? DEFAULT_LIZ_DIRECT_BASE_25 : DEFAULT_LIZ_DIRECT_BASE,
    ),
    authKey: String(
      env.LIZ_API_KEY ||
      env.LIZ_AUTH_KEY ||
      process.env.LIZ_API_KEY ||
      process.env.LIZ_AUTH_KEY ||
      '',
    ).trim(),
  };
}

function resolveFluxSettings(env, lizSettings) {
  const keyFallback = lizSettings?.authKey || '';
  const primaryBaseUrl = normalizeBaseUrl(
    env.FLUX_API_BASE_URL ||
    env.IMAGE_API_BASE_URL ||
    process.env.FLUX_API_BASE_URL ||
    process.env.IMAGE_API_BASE_URL,
    DEFAULT_FLUX_IMAGE_BASE_PRIMARY,
  );
  const fallbackBaseUrl = normalizeBaseUrl(
    env.FLUX_API_BASE_URL_FALLBACK ||
    env.FLUX_API_BASE_URL_BACKUP ||
    env.IMAGE_API_BASE_URL_FALLBACK ||
    env.IMAGE_API_BASE_URL_BACKUP ||
    process.env.FLUX_API_BASE_URL_FALLBACK ||
    process.env.FLUX_API_BASE_URL_BACKUP ||
    process.env.IMAGE_API_BASE_URL_FALLBACK ||
    process.env.IMAGE_API_BASE_URL_BACKUP,
    DEFAULT_FLUX_IMAGE_BASE_FALLBACK,
  );
  const primaryAuthKey = String(
    env.FLUX_API_KEY ||
    env.IMAGE_API_KEY ||
    process.env.FLUX_API_KEY ||
    process.env.IMAGE_API_KEY ||
    keyFallback,
  ).trim();
  const fallbackAuthKey = String(
    env.FLUX_API_KEY_FALLBACK ||
    env.FLUX_API_KEY_BACKUP ||
    env.IMAGE_API_KEY_FALLBACK ||
    env.IMAGE_API_KEY_BACKUP ||
    process.env.FLUX_API_KEY_FALLBACK ||
    process.env.FLUX_API_KEY_BACKUP ||
    process.env.IMAGE_API_KEY_FALLBACK ||
    process.env.IMAGE_API_KEY_BACKUP ||
    primaryAuthKey ||
    '',
  ).trim();
  const authKeys = [primaryAuthKey, fallbackAuthKey]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);

  return {
    baseUrl: primaryBaseUrl,
    fallbackBaseUrl,
    authKey: authKeys[0] || '',
    fallbackAuthKey,
    authKeys,
    model: String(
      env.FLUX_MODEL ||
      env.IMAGE_MODEL ||
      process.env.FLUX_MODEL ||
      process.env.IMAGE_MODEL ||
      DEFAULT_FLUX_MODEL,
    ).trim() || DEFAULT_FLUX_MODEL,
    imagePath: normalizeApiPath(
      env.FLUX_IMAGE_PATH ||
      env.IMAGE_API_IMAGE_PATH ||
      process.env.FLUX_IMAGE_PATH ||
      process.env.IMAGE_API_IMAGE_PATH,
      DEFAULT_FLUX_IMAGE_PATH,
    ),
  };
}

function buildFluxImagePathCandidates(primaryPath) {
  const candidates = [
    normalizeApiPath(primaryPath, DEFAULT_FLUX_IMAGE_PATH),
    '/api/ai/run',
    '/api/images/generations',
    '/api/images/generate',
    '/v1/images/generations',
    '/api/flux-image',
    '/api/flux/generate',
  ];

  return candidates.filter((value, index, arr) => arr.indexOf(value) === index);
}

function normalizeCloudflareFluxPath(imagePath, modelName) {
  const normalizedModel = String(modelName || '').trim();
  const modelPath = normalizedModel ? `/${normalizedModel.replace(/^\/+/, '')}` : '/';
  const selectedPath = normalizeApiPath(imagePath, modelPath);
  if (selectedPath.toLowerCase().startsWith('/@cf/')) {
    return selectedPath;
  }
  if (normalizedModel.toLowerCase().startsWith(CLOUDFLARE_MODEL_PREFIX)) {
    return modelPath;
  }
  return selectedPath;
}

function isCloudflareAiRunConfig(fluxSettings) {
  const baseUrl = String(fluxSettings?.baseUrl || '').toLowerCase();
  const imagePath = String(fluxSettings?.imagePath || '').toLowerCase();
  const model = String(fluxSettings?.model || '').toLowerCase();
  return (
    baseUrl.includes(CLOUDFLARE_API_HOST)
    && (baseUrl.includes('/ai/run') || imagePath.startsWith('/@cf/') || model.startsWith(CLOUDFLARE_MODEL_PREFIX))
  );
}

function shouldUseCloudflareMultipart(fluxSettings, parsedBody) {
  const configuredModel = String(fluxSettings?.model || '').trim().toLowerCase();
  const requestedModel = String(parsedBody?.model || '').trim().toLowerCase();
  const model = requestedModel || configuredModel;
  return model.includes('/flux-2-');
}

function buildCloudflareMultipartBody(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const prompt = String(source.prompt || '').trim();
  const form = new FormData();
  form.append('prompt', prompt);

  const seedRaw = Number(source.seed);
  const safeSeed = Number.isFinite(seedRaw)
    ? Math.max(0, Math.trunc(seedRaw))
    : Math.floor(Math.random() * 10_000_000);
  form.append('seed', String(safeSeed));

  const size = String(source.size || '').trim();
  if (size) {
    form.append('size', size);
  }

  const negativePrompt = String(source.negative_prompt || '').trim();
  if (negativePrompt) {
    form.append('negative_prompt', negativePrompt);
  }

  return form;
}

function buildFluxUpstreamPayload(parsedBody, fluxSettings, useCloudflareAiRun) {
  const source = parsedBody && typeof parsedBody === 'object' ? parsedBody : {};
  const sourceInput =
    source.input && typeof source.input === 'object' && !Array.isArray(source.input)
      ? source.input
      : {};
  const prompt = String(source.prompt || sourceInput.prompt || '').trim();
  if (!prompt) return {};

  if (!useCloudflareAiRun) {
    const sourceNegativePrompt = String(source.negative_prompt || source.negativePrompt || '').trim();
    const inputPayload = {
      ...sourceInput,
      prompt,
      ...(sourceNegativePrompt ? { negative_prompt: sourceNegativePrompt } : {}),
    };
    return {
      ...source,
      model: String(source.model || fluxSettings.model || DEFAULT_FLUX_MODEL).trim() || DEFAULT_FLUX_MODEL,
      input: inputPayload,
      prompt,
    };
  }

  const payload = { prompt };
  const configuredModel = String(fluxSettings?.model || '').trim().toLowerCase();
  const requestedModel = String(source.model || '').trim().toLowerCase();
  const isFlux2DevModel =
    configuredModel.includes('/flux-2-dev')
    || requestedModel.includes('/flux-2-dev');

  const seedRaw = Number(source.seed);
  if (Number.isFinite(seedRaw)) {
    payload.seed = Math.max(0, Math.trunc(seedRaw));
  }

  const sizeRaw = String(source.size || '').trim();
  if (/^\d{2,5}\s*[xX]\s*\d{2,5}$/.test(sizeRaw)) {
    payload.size = sizeRaw.replace(/\s+/g, '');
  }

  const negativePrompt = String(source.negative_prompt || source.negativePrompt || '').trim();
  if (negativePrompt) {
    payload.negative_prompt = negativePrompt;
  }

  if (typeof source.multipart === 'boolean') {
    payload.multipart = source.multipart;
  } else if (isFlux2DevModel) {
    // Cloudflare flux-2-dev currently requires `multipart` to be present.
    payload.multipart = true;
  }

  return payload;
}

function buildRuntimeConfig() {
  const env = loadBackendEnv();
  const lizSettings = resolveLizDirectSettings(env, 'liz-mini');
  const lizSettings25 = resolveLizDirectSettings(env, 'liz-2.5');
  const fluxSettings = resolveFluxSettings(env, lizSettings);
  const supabaseUrl = normalizeBaseUrl(
    env.SUPABASE_URL || process.env.SUPABASE_URL,
    '',
  );

  return {
    supabaseUrl,
    lizDirectBase: lizSettings.baseUrl,
    lizDirectBase25: lizSettings25.baseUrl,
    // O frontend nao recebe chave; chamadas devem passar pelo proxy local.
    lizDirectProxy: Boolean(lizSettings.authKey),
    fluxImageProxy: Boolean(fluxSettings.authKey),
    fluxImageEndpoint: LIZ_IMAGE_PROXY_PATH,
    fluxModel: fluxSettings.model,
  };
}

function injectRuntimeConfigIntoHtml(htmlText) {
  const runtime = buildRuntimeConfig();
  const runtimeScript = `<script>window.__LIZ_RUNTIME=${JSON.stringify(runtime)};</script>`;
  if (htmlText.includes('</head>')) {
    return htmlText.replace('</head>', `${runtimeScript}\n</head>`);
  }
  return `${runtimeScript}\n${htmlText}`;
}

function sendNotFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload || {}));
}

function readRequestBody(req, maxBytes = LIZ_PROXY_MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let aborted = false;

    req.on('data', chunk => {
      if (aborted) return;
      total += chunk.length;
      if (total > maxBytes) {
        aborted = true;
        reject(new Error('REQUEST_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      resolve(Buffer.concat(chunks));
    });
    req.on('error', error => {
      if (aborted) return;
      reject(error);
    });
  });
}

function parseRetryAfterMs(value) {
  const raw = String(value || '').trim();
  if (!raw) return 0;

  const asSeconds = Number(raw);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.max(0, Math.trunc(asSeconds * 1000));
  }

  const asDateMs = Date.parse(raw);
  if (Number.isFinite(asDateMs)) {
    return Math.max(0, asDateMs - Date.now());
  }

  return 0;
}

function delayMs(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  if (!safeMs) {
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, safeMs));
}

function parseJsonBufferSafe(rawBuffer) {
  try {
    return JSON.parse(Buffer.from(rawBuffer || []).toString('utf8'));
  } catch (error) {
    return null;
  }
}

function payloadHasImageData(payload) {
  if (!payload || typeof payload !== 'object') return false;

  const looksLikeImageString = value => {
    const safe = String(value || '').trim();
    if (!safe) return false;
    if (/^https?:\/\//i.test(safe)) return true;
    if (/^data:image\//i.test(safe)) return true;
    if (safe.length >= 80 && /^[A-Za-z0-9+/=]+$/.test(safe)) return true;
    return false;
  };

  const entries = [];
  const push = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(item => push(item));
      return;
    }
    entries.push(value);
  };

  push(payload?.data);
  push(payload?.images);
  push(payload?.output);
  push(payload?.artifacts);
  push(payload?.result?.data);
  push(payload?.result?.images);
  push(payload?.result?.output);
  push(payload?.result);
  push(payload?.image);
  push(payload?.image_url);
  push(payload?.url);

  for (const entry of entries) {
    if (typeof entry === 'string' && looksLikeImageString(entry)) {
      return true;
    }
    if (!entry || typeof entry !== 'object') continue;
    if (looksLikeImageString(
      entry.b64_json
      || entry.base64
      || entry.b64
      || entry.image_base64
      || entry.image
      || entry.data
      || entry.bytes
      || entry.url
      || entry.image_url
      || entry.src
      || '',
    )) {
      return true;
    }
  }

  return false;
}

async function proxyLizApiRequest(req, res, pathname) {
  const env = loadBackendEnv();
  const fallbackModel = normalizeLizChatModel(
    LIZ_CHAT_ROUTE_MODEL_MAP[pathname] || 'liz-mini',
    'liz-mini',
  );
  const lizSettings = resolveLizDirectSettings(env, fallbackModel);

  if (!lizSettings.authKey) {
    sendJson(res, 502, {
      detail: 'LIZ_API_KEY/LIZ_AUTH_KEY nao configurada nos arquivos de ambiente locais.',
    });
    return;
  }

  let bodyBuffer;
  try {
    bodyBuffer = await readRequestBody(req);
  } catch (error) {
    const isTooLarge = String(error?.message || '') === 'REQUEST_TOO_LARGE';
    sendJson(res, isTooLarge ? 413 : 400, {
      detail: isTooLarge
        ? 'Payload excede o limite do proxy local.'
        : 'Falha ao ler payload da requisicao.',
    });
    return;
  }

  let parsedBody = {};
  try {
    parsedBody = bodyBuffer.length > 0 ? JSON.parse(bodyBuffer.toString('utf8')) : {};
  } catch (error) {
    sendJson(res, 400, {
      detail: 'Payload JSON invalido para requisicao da Liz.',
    });
    return;
  }

  const upstreamPayload = buildLizChatPayload(parsedBody, fallbackModel);
  if (!upstreamPayload) {
    sendJson(res, 400, {
      detail: 'Mensagem invalida. Envie texto em messages[].content.',
    });
    return;
  }

  const upstreamUrl = resolveLizChatCompletionsUrl(lizSettings.baseUrl);
  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-liz-key': lizSettings.authKey,
      },
      body: JSON.stringify(upstreamPayload),
    });

    const rawBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.statusCode = upstreamResponse.status;
    res.setHeader(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8',
    );
    res.setHeader('Cache-Control', 'no-store');
    res.end(rawBuffer);
  } catch (error) {
    sendJson(res, 502, { detail: 'Falha ao consultar API da Liz via proxy local.' });
  }
}

async function proxyFluxImageRequest(req, res) {
  const env = loadBackendEnv();
  const lizSettings = resolveLizDirectSettings(env, 'liz-mini');
  const fluxSettings = resolveFluxSettings(env, lizSettings);
  const fluxTargets = [
    {
      baseUrl: String(fluxSettings.baseUrl || '').trim(),
      authKey: String(fluxSettings.authKey || '').trim(),
    },
    {
      baseUrl: String(fluxSettings.fallbackBaseUrl || fluxSettings.baseUrl || '').trim(),
      authKey: String(fluxSettings.fallbackAuthKey || '').trim(),
    },
  ]
    .filter(item => item.baseUrl && item.authKey)
    .filter((item, index, arr) => (
      arr.findIndex(other => other.baseUrl === item.baseUrl && other.authKey === item.authKey) === index
    ));

  if (fluxTargets.length === 0) {
    sendJson(res, 502, {
      detail: 'FLUX_API_KEY/IMAGE_API_KEY nao configurada nos arquivos de ambiente locais.',
    });
    return;
  }

  let bodyBuffer;
  try {
    bodyBuffer = await readRequestBody(req);
  } catch (error) {
    const isTooLarge = String(error?.message || '') === 'REQUEST_TOO_LARGE';
    sendJson(res, isTooLarge ? 413 : 400, {
      detail: isTooLarge
        ? 'Payload excede o limite do proxy local.'
        : 'Falha ao ler payload da requisicao.',
    });
    return;
  }

  let parsedBody = {};
  try {
    parsedBody = bodyBuffer.length > 0 ? JSON.parse(bodyBuffer.toString('utf8')) : {};
  } catch (error) {
    parsedBody = {};
  }
  const useCloudflareAiRun = isCloudflareAiRunConfig(fluxSettings);
  const useCloudflareMultipart = useCloudflareAiRun && shouldUseCloudflareMultipart(fluxSettings, parsedBody);
  const upstreamPayload = buildFluxUpstreamPayload(parsedBody, fluxSettings, useCloudflareAiRun);
  const upstreamPrompt = String(upstreamPayload.prompt || '').trim();
  if (!upstreamPrompt) {
    sendJson(res, 400, {
      detail: 'Prompt de imagem invalido. Envie um texto no campo "prompt".',
    });
    return;
  }
  const upstreamBodyBuffer = Buffer.from(JSON.stringify(upstreamPayload));

  const pathCandidates = useCloudflareAiRun
    ? [normalizeCloudflareFluxPath(fluxSettings.imagePath, fluxSettings.model)]
    : buildFluxImagePathCandidates(fluxSettings.imagePath);
  try {
    let lastNotFoundPath = '';
    let fallbackCandidate = null;
    let sawRateLimit = false;
    let lastRateLimitRetryMs = 0;
    let lastRateLimitDetail = '';

    for (const imagePath of pathCandidates) {
      let goToNextPath = false;

      for (let targetIndex = 0; targetIndex < fluxTargets.length; targetIndex += 1) {
        const activeTarget = fluxTargets[targetIndex];
        const activeAuthKey = activeTarget.authKey;
        const activeBaseUrl = activeTarget.baseUrl;
        const hasNextTarget = targetIndex < (fluxTargets.length - 1);
        const upstreamUrl = `${activeBaseUrl}${imagePath}`;

        const buildUpstreamHeaders = () => {
          const upstreamHeaders = {
            Authorization: `Bearer ${activeAuthKey}`,
          };
          if (!useCloudflareMultipart) {
            upstreamHeaders['Content-Type'] = 'application/json';
          }
          if (!useCloudflareAiRun) {
            upstreamHeaders['x-api-key'] = activeAuthKey;
            upstreamHeaders['x-liz-key'] = activeAuthKey;
          }
          return upstreamHeaders;
        };
        const sendUpstreamRequest = () => fetch(upstreamUrl, {
          method: 'POST',
          headers: buildUpstreamHeaders(),
          body: useCloudflareMultipart ? buildCloudflareMultipartBody(upstreamPayload) : upstreamBodyBuffer,
        });

        let upstreamResponse;
        try {
          upstreamResponse = await sendUpstreamRequest();
        } catch (error) {
          if (hasNextTarget) {
            continue;
          }
          throw error;
        }

        if (upstreamResponse.status === 429) {
          sawRateLimit = true;
          const retryAfterMs = parseRetryAfterMs(upstreamResponse.headers.get('retry-after'));
          lastRateLimitRetryMs = Math.max(lastRateLimitRetryMs, retryAfterMs);

          if (hasNextTarget) {
            continue;
          }

          const waitMs = Math.max(600, Math.min(4500, retryAfterMs || 1200));
          await delayMs(waitMs);
          try {
            upstreamResponse = await sendUpstreamRequest();
          } catch (error) {
            throw error;
          }
        }

        if (upstreamResponse.status === 404) {
          if (hasNextTarget) {
            continue;
          }
          lastNotFoundPath = imagePath;
          goToNextPath = true;
          break;
        }

        let contentType = String(upstreamResponse.headers.get('content-type') || '').toLowerCase();
        let rawBuffer = Buffer.from(await upstreamResponse.arrayBuffer());

        if (useCloudflareAiRun && upstreamResponse.status === 400 && !useCloudflareMultipart) {
          const firstErrorText = rawBuffer.toString('utf8');
          const requiresMultipart = firstErrorText.includes("required properties at '/' are 'multipart'");
          if (requiresMultipart) {
            try {
              upstreamResponse = await fetch(upstreamUrl, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${activeAuthKey}`,
                },
                body: buildCloudflareMultipartBody(upstreamPayload),
              });
            } catch (error) {
              if (hasNextTarget) {
                continue;
              }
              throw error;
            }
            contentType = String(upstreamResponse.headers.get('content-type') || '').toLowerCase();
            rawBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
          }
        }

        const parsedPayload = contentType.includes('application/json')
          ? parseJsonBufferSafe(rawBuffer)
          : null;

        if (upstreamResponse.status === 429) {
          sawRateLimit = true;
          const retryAfterMs = parseRetryAfterMs(upstreamResponse.headers.get('retry-after'));
          lastRateLimitRetryMs = Math.max(lastRateLimitRetryMs, retryAfterMs);
          const apiErrorMessage = String(
            parsedPayload?.errors?.[0]?.message
            || parsedPayload?.error?.message
            || parsedPayload?.message
            || parsedPayload?.detail
            || '',
          ).trim();
          if (apiErrorMessage) {
            lastRateLimitDetail = apiErrorMessage;
          }

          if (hasNextTarget) {
            continue;
          }
          continue;
        }

        if (!upstreamResponse.ok) {
          if ((upstreamResponse.status === 401 || upstreamResponse.status === 403) && targetIndex > 0 && sawRateLimit) {
            continue;
          }
          if (hasNextTarget) {
            continue;
          }
          res.statusCode = upstreamResponse.status;
          res.setHeader(
            'Content-Type',
            contentType || 'application/json; charset=utf-8',
          );
          res.setHeader('Cache-Control', 'no-store');
          res.end(rawBuffer);
          return;
        }

        const isImageBinary = contentType.startsWith('image/');
        const hasImagePayload = contentType.includes('application/json') && payloadHasImageData(parsedPayload);
        const looksLikeValidPayload = isImageBinary || hasImagePayload;

        if (!looksLikeValidPayload) {
          if (hasNextTarget) {
            continue;
          }
          if (!fallbackCandidate) {
            fallbackCandidate = {
              status: upstreamResponse.status,
              contentType: contentType || 'application/octet-stream',
              buffer: rawBuffer,
            };
          }
          continue;
        }

        res.statusCode = upstreamResponse.status;
        res.setHeader(
          'Content-Type',
          contentType || 'application/json; charset=utf-8',
        );
        res.setHeader('Cache-Control', 'no-store');
        res.end(rawBuffer);
        return;
      }

      if (goToNextPath) {
        continue;
      }
    }

    if (sawRateLimit) {
      const retrySeconds = Math.max(1, Math.ceil(lastRateLimitRetryMs / 1000));
      sendJson(res, 429, {
        detail: lastRateLimitDetail
          || (lastRateLimitRetryMs > 0
          ? `API de imagem temporariamente sobrecarregada. Tente novamente em ${retrySeconds}s.`
          : 'API de imagem temporariamente sobrecarregada. Tente novamente em instantes.'),
      });
      return;
    }

    if (fallbackCandidate) {
      res.statusCode = fallbackCandidate.status;
      res.setHeader('Content-Type', fallbackCandidate.contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.end(fallbackCandidate.buffer);
      return;
    }

    sendJson(res, 502, {
      detail: `Nao foi encontrado endpoint de imagem ativo na API remota (ultimo caminho testado: ${lastNotFoundPath || fluxSettings.imagePath}).`,
    });
  } catch (error) {
    sendJson(res, 502, { detail: 'Falha ao consultar API de imagens (Flux) via proxy local.' });
  }
}

function safePathFromUrl(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0].split('#')[0]);
  const normalized = path.normalize(clean).replace(/^(\.\.[/\\])+/, '');
  return normalized;
}

function resolveTargetPath(urlPath) {
  const relative = safePathFromUrl(urlPath);
  const relativeWithoutSlash = relative.replace(/^[/\\]/, '');
  
  // Bloqueio explícito de arquivos sensíveis e pastas de controle
  if (
    relativeWithoutSlash.includes('.env') || 
    relativeWithoutSlash.includes('.vars') ||
    relativeWithoutSlash.startsWith('scripts') ||
    relativeWithoutSlash.startsWith('node_modules')
  ) {
    return null;
  }

  const candidateInPublic = path.join(PUBLIC_DIR, relativeWithoutSlash);

  // Garante que o arquivo está dentro da PUBLIC_DIR
  if (!candidateInPublic.startsWith(PUBLIC_DIR)) return null;
  
  if (urlPath === '/' || urlPath === '') {
    return path.join(PUBLIC_DIR, 'index.html');
  }

  return candidateInPublic;
}

const server = http.createServer(async (req, res) => {
  const pathname = String(req.url || '/').split('?')[0].split('#')[0];
  if (LIZ_CHAT_PROXY_PATHS.has(pathname)) {
    if (String(req.method || 'GET').toUpperCase() !== 'POST') {
      sendJson(res, 405, { detail: 'Metodo nao permitido.' });
      return;
    }
    await proxyLizApiRequest(req, res, pathname);
    return;
  }
  if (pathname === LIZ_IMAGE_PROXY_PATH) {
    if (String(req.method || 'GET').toUpperCase() !== 'POST') {
      sendJson(res, 405, { detail: 'Metodo nao permitido.' });
      return;
    }
    await proxyFluxImageRequest(req, res);
    return;
  }

  const target = resolveTargetPath(req.url || '/');
  if (!target) return sendNotFound(res);

  fs.stat(target, (statErr, stats) => {
    if (statErr) return sendNotFound(res);

    const filePath = stats.isDirectory() ? path.join(target, 'index.html') : target;
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return sendNotFound(res);

      const ext = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');

      if (ext === '.html') {
        const htmlText = data.toString('utf8');
        const withRuntime = injectRuntimeConfigIntoHtml(htmlText);
        res.setHeader('Cache-Control', 'no-store');
        res.end(withRuntime);
        return;
      }

      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[liz-frontend] http://${HOST}:${PORT}`);
  console.log(`[liz-frontend] root: ${ROOT}`);
});
