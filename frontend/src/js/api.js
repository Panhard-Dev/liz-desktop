(function initApiModule() {
  const DEFAULT_REMOTE_API_BASE = 'https://liz-brasil-api.studiosluxgames.workers.dev/api/v1';
  const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

  function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function shouldForceRemoteApiBase(candidateBase) {
    const protocol = String(window.location?.protocol || 'http:').toLowerCase();
    const host = String(window.location?.hostname || '').trim().toLowerCase();
    const isLocalHost = LOCAL_HOSTS.has(host);
    if (protocol === 'file:' || isLocalHost) return false;

    const origin = normalizeBaseUrl(window.location?.origin || '');
    const candidate = normalizeBaseUrl(candidateBase);
    if (!origin || !candidate) return false;

    return (
      candidate === `${origin}/api` ||
      candidate === `${origin}/api/v1` ||
      candidate.startsWith(`${origin}/api/`)
    );
  }

  const DEFAULT_API_BASE = (() => {
    if (typeof window !== 'undefined' && window.LIZ_API_BASE_URL) {
      const candidate = normalizeBaseUrl(window.LIZ_API_BASE_URL);
      if (shouldForceRemoteApiBase(candidate)) return DEFAULT_REMOTE_API_BASE;
      return candidate;
    }

    const fromMeta = document
      ?.querySelector?.('meta[name="liz-api-base"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      const candidate = normalizeBaseUrl(fromMeta);
      if (shouldForceRemoteApiBase(candidate)) return DEFAULT_REMOTE_API_BASE;
      return candidate;
    }

    const protocol = window.location?.protocol || 'http:';
    const host = window.location?.hostname || '127.0.0.1';
    const isLocalHost = LOCAL_HOSTS.has(String(host || '').trim().toLowerCase());
    if (protocol === 'file:') {
      return 'http://127.0.0.1:8000/api/v1';
    }
    if (isLocalHost) {
      const backendPort = window.LIZ_API_PORT || '8000';
      return `${protocol}//${host}:${backendPort}/api/v1`;
    }
    return DEFAULT_REMOTE_API_BASE;
  })();

  const DIRECT_LIZ_BASE = (() => {
    const runtimeBase = window.__LIZ_RUNTIME?.lizDirectBase;
    if (runtimeBase) {
      return String(runtimeBase).replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.LIZ_DIRECT_API_BASE_URL) {
      return String(window.LIZ_DIRECT_API_BASE_URL).replace(/\/+$/, '');
    }
    const fromMeta = document
      ?.querySelector?.('meta[name="liz-direct-base"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      return String(fromMeta).replace(/\/+$/, '');
    }
    return 'https://liz-edge-server.studiosluxgames.workers.dev';
  })();
  const DIRECT_LIZ_BASE_25 = (() => {
    const runtimeBase = window.__LIZ_RUNTIME?.lizDirectBase25;
    if (runtimeBase) {
      return String(runtimeBase).replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.LIZ_DIRECT_API_BASE_URL_25) {
      return String(window.LIZ_DIRECT_API_BASE_URL_25).replace(/\/+$/, '');
    }
    const fromMeta = document
      ?.querySelector?.('meta[name="liz-direct-base-25"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      return String(fromMeta).replace(/\/+$/, '');
    }
    return 'https://liz-25-dev-server.studiosluxgames.workers.dev';
  })();

  const DIRECT_LIZ_CHAT_COMPLETIONS_PATH = '/v1/chat/completions';
  const DIRECT_LIZ_MODEL_CONFIG = {
    mini: { proxyPath: '/api/liz-mini', apiModel: 'liz-mini' },
    '2.3': { proxyPath: '/api/liz-2.3', apiModel: 'liz-2.3' },
    '2.5': { proxyPath: '/api/liz-2.5', apiModel: 'liz-2.5' },
    flash: { proxyPath: '/api/liz-flash', apiModel: 'liz-flash' },
  };
  const FLUX_IMAGE_PROXY_PATH = '/api/liz-image';
  const DEFAULT_FLUX_API_BASE = 'https://liz-ia-imagens.lizs.workers.dev';
  const DEFAULT_FLUX_API_BASE_FALLBACK = 'https://liz-ia-imagens.hsa-gab234.workers.dev';
  const DEFAULT_FLUX_IMAGE_PATH = '/api/ai/run';
  const DEFAULT_FLUX_MODEL = '@cf/black-forest-labs/flux-1-schnell';

  function normalizeDirectLizModel(model) {
    const normalized = String(model || '').trim().toLowerCase();
    if (normalized === 'liz-mini') return 'mini';
    if (normalized === 'liz-2.3') return '2.3';
    if (normalized === 'liz-2.5') return '2.5';
    if (normalized === 'liz-flash' || normalized === 'liz flash') return 'flash';
    return Object.prototype.hasOwnProperty.call(DIRECT_LIZ_MODEL_CONFIG, normalized) ? normalized : 'mini';
  }

  function resolveDirectLizChatCompletionsEndpoint(baseUrl) {
    const normalizedBase = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (!normalizedBase) return DIRECT_LIZ_CHAT_COMPLETIONS_PATH;
    if (/\/v1\/chat\/completions$/i.test(normalizedBase)) return normalizedBase;
    if (/\/v1$/i.test(normalizedBase)) return `${normalizedBase}/chat/completions`;
    return `${normalizedBase}${DIRECT_LIZ_CHAT_COMPLETIONS_PATH}`;
  }

  function resolveDirectLizBaseByModel(normalizedModel) {
    if (String(normalizedModel || '').trim() === '2.5') {
      return DIRECT_LIZ_BASE_25;
    }
    return DIRECT_LIZ_BASE;
  }

  function resolveDirectLizApiKey() {
    const fromWindow = String(window.LIZ_DIRECT_API_KEY || '').trim();
    if (fromWindow) return fromWindow;

    try {
      const fromStorage = String(window.localStorage.getItem('liz_direct_api_key') || '').trim();
      if (fromStorage) return fromStorage;
    } catch (error) {
      // no-op
    }

    return '';
  }

  function normalizeApiPath(pathValue, fallbackPath) {
    const raw = String(pathValue || '').trim();
    const selected = raw || String(fallbackPath || '').trim();
    if (!selected) return '/';
    return selected.startsWith('/') ? selected : `/${selected}`;
  }

  function resolveFluxApiBase() {
    const runtimeBase = window.__LIZ_RUNTIME?.fluxBase || window.__LIZ_RUNTIME?.lizDirectBase;
    if (runtimeBase) {
      return String(runtimeBase).replace(/\/+$/, '');
    }

    const fromWindow = String(window.FLUX_API_BASE_URL || window.IMAGE_API_BASE_URL || '').trim();
    if (fromWindow) {
      return fromWindow.replace(/\/+$/, '');
    }

    const fromMeta = document
      ?.querySelector?.('meta[name="flux-api-base"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      return String(fromMeta).replace(/\/+$/, '');
    }

    return DEFAULT_FLUX_API_BASE;
  }

  function resolveFluxApiFallbackBase() {
    const runtimeFallback = window.__LIZ_RUNTIME?.fluxBaseFallback || window.__LIZ_RUNTIME?.fluxFallbackBase;
    if (runtimeFallback) {
      return String(runtimeFallback).replace(/\/+$/, '');
    }

    const fromWindow = String(
      window.FLUX_API_BASE_URL_FALLBACK
      || window.FLUX_API_BASE_URL_BACKUP
      || window.IMAGE_API_BASE_URL_FALLBACK
      || window.IMAGE_API_BASE_URL_BACKUP
      || '',
    ).trim();
    if (fromWindow) {
      return fromWindow.replace(/\/+$/, '');
    }

    const fromMeta = document
      ?.querySelector?.('meta[name="flux-api-base-fallback"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      return String(fromMeta).replace(/\/+$/, '');
    }

    return DEFAULT_FLUX_API_BASE_FALLBACK;
  }

  function resolveFluxImagePath() {
    const runtimePath = window.__LIZ_RUNTIME?.fluxImagePath || window.__LIZ_RUNTIME?.fluxPath;
    if (runtimePath) {
      return normalizeApiPath(runtimePath, DEFAULT_FLUX_IMAGE_PATH);
    }

    const fromWindow = String(window.FLUX_IMAGE_PATH || window.IMAGE_API_IMAGE_PATH || '').trim();
    if (fromWindow) {
      return normalizeApiPath(fromWindow, DEFAULT_FLUX_IMAGE_PATH);
    }

    try {
      const fromStorage = String(window.localStorage.getItem('flux_image_path') || '').trim();
      if (fromStorage) return normalizeApiPath(fromStorage, DEFAULT_FLUX_IMAGE_PATH);
    } catch (error) {
      // no-op
    }

    return DEFAULT_FLUX_IMAGE_PATH;
  }

  function resolveFluxModel(overrideModel) {
    const directModel = String(overrideModel || '').trim();
    if (directModel) return directModel;

    const fromRuntime = String(window.__LIZ_RUNTIME?.fluxModel || '').trim();
    if (fromRuntime) return fromRuntime;

    const fromWindow = String(window.FLUX_MODEL || window.IMAGE_MODEL || '').trim();
    if (fromWindow) return fromWindow;

    try {
      const fromStorage = String(window.localStorage.getItem('flux_model') || '').trim();
      if (fromStorage) return fromStorage;
    } catch (error) {
      // no-op
    }

    return DEFAULT_FLUX_MODEL;
  }

  function resolveFluxApiKey() {
    const fromWindow = String(window.FLUX_API_KEY || window.IMAGE_API_KEY || '').trim();
    if (fromWindow) return fromWindow;

    try {
      const fromStorage = String(window.localStorage.getItem('flux_api_key') || '').trim();
      if (fromStorage) return fromStorage;
    } catch (error) {
      // no-op
    }

    return resolveDirectLizApiKey();
  }

  async function tryRefreshTokenForRequest(path, token) {
    const safePath = String(path || '').trim();
    if (!token || safePath.startsWith('/auth/')) return '';
    if (!window.LizAuth || typeof window.LizAuth.refresh !== 'function') return '';

    try {
      await window.LizAuth.refresh();
      const refreshed = String(window.LizAuth.getAccessToken?.() || '').trim();
      if (!refreshed || refreshed === String(token || '').trim()) return '';
      return refreshed;
    } catch (error) {
      return '';
    }
  }

  function extractLizErrorMessage(payload, status) {
    const validation =
      (Array.isArray(payload?.error?.details) && payload.error.details[0]) ||
      (Array.isArray(payload?.detail) && payload.detail[0]) ||
      null;
    const validationMessage =
      validation?.msg ||
      validation?.message ||
      '';

    return (
      validationMessage ||
      payload?.error?.message ||
      payload?.message ||
      payload?.detail ||
      `Falha na API Liz (HTTP ${status})`
    );
  }

  function extractLizText(payload) {
    if (!payload || typeof payload !== 'object') return '';

    const choices = Array.isArray(payload.choices) ? payload.choices : [];
    for (const choice of choices) {
      if (!choice || typeof choice !== 'object') continue;

      const choiceText = String(choice.text || '').trim();
      if (choiceText) return choiceText;

      const message = choice.message;
      if (!message || typeof message !== 'object') continue;

      const messageContent = message.content;
      if (typeof messageContent === 'string' && messageContent.trim()) {
        return messageContent.trim();
      }
      if (Array.isArray(messageContent)) {
        for (const part of messageContent) {
          const partText = String(part?.text || part?.content || '').trim();
          if (partText) return partText;
        }
      }
    }

    const directContent = payload.content;
    if (typeof directContent === 'string' && directContent.trim()) {
      return directContent.trim();
    }

    const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== 'object') continue;
      const content = candidate.content;
      if (!content || typeof content !== 'object') continue;
      const parts = Array.isArray(content.parts) ? content.parts : [];
      for (const part of parts) {
        const partText = String(part?.text || '').trim();
        if (partText) return partText;
      }
    }

    return '';
  }

  function buildDirectLizPayload(message, uiLanguage, apiModel) {
    const languageHints = [];
    if (uiLanguage) {
      languageHints.push(`UI language: ${uiLanguage}`);
    }
    const hintText = languageHints.length > 0 ? `\n\n${languageHints.join(' | ')}` : '';

    return {
      model: String(apiModel || 'liz-mini'),
      messages: [
        {
          role: 'user',
          content: `${String(message || '')}${hintText}`,
        },
      ],
      stream: false,
    };
  }

  async function request(path, options = {}) {
    const {
      method = 'GET',
      body,
      token,
      headers = {},
      timeoutMs = 15000,
      keepalive = false,
      retryUnauthorized = true,
    } = options;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${DEFAULT_API_BASE}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        keepalive: Boolean(keepalive),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : null;

      if (response.status === 401 && token && retryUnauthorized) {
        const refreshedToken = await tryRefreshTokenForRequest(path, token);
        if (refreshedToken) {
          return request(path, {
            ...options,
            token: refreshedToken,
            retryUnauthorized: false,
          });
        }
      }

      if (!response.ok) {
        const firstValidation =
          (Array.isArray(payload?.error?.details) && payload.error.details[0]) ||
          (Array.isArray(payload?.detail) && payload.detail[0]) ||
          null;
        const validationMessage =
          firstValidation?.msg ||
          firstValidation?.message ||
          '';
        const error = new Error(
          validationMessage ||
          payload?.error?.message ||
          payload?.detail ||
          `Erro HTTP ${response.status}`,
        );
        error.status = response.status;
        error.payload = payload;
        throw error;
      }

      return payload;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout ao conectar no backend local.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function sendDirectLizMessage({
    message,
    model,
    uiLanguage,
    timeoutMs = 15000,
    forceRemote = false,
  }) {
    const useLocalProxy = Boolean(window.__LIZ_RUNTIME?.lizDirectProxy) && !Boolean(forceRemote);
    if (!useLocalProxy) {
      const proxyError = new Error('Proxy local da Liz indisponivel para chamada segura.');
      proxyError.code = 'LIZ_PROXY_REQUIRED';
      throw proxyError;
    }

    const normalizedModel = normalizeDirectLizModel(model);
    const modelConfig = DIRECT_LIZ_MODEL_CONFIG[normalizedModel] || DIRECT_LIZ_MODEL_CONFIG.mini;
    const proxyBase = String(window.location?.origin || '').replace(/\/+$/, '');
    const endpointBase = proxyBase;
    const endpoint = `${endpointBase}${modelConfig.proxyPath}`;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), Math.max(800, Number(timeoutMs) || 15000));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildDirectLizPayload(message, uiLanguage, modelConfig.apiModel)),
        signal: controller.signal,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      if (!response.ok) {
        const requestError = new Error(extractLizErrorMessage(payload, response.status));
        requestError.status = response.status;
        requestError.payload = payload;
        throw requestError;
      }

      const text = extractLizText(payload);
      if (!text) {
        throw new Error('A API Liz retornou resposta vazia.');
      }
      return text;
    } catch (error) {
      if (error?.name === 'AbortError') {
        const timeoutError = new Error('Timeout ao consultar API da Liz.');
        timeoutError.code = 'LIZ_TIMEOUT';
        throw timeoutError;
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function guessImageMimeType(rawValue, fallback = 'image/png') {
    const safe = String(rawValue || '').trim().toLowerCase();
    if (!safe) return fallback;
    if (safe.startsWith('image/')) return safe;
    if (safe === 'png') return 'image/png';
    if (safe === 'jpeg' || safe === 'jpg') return 'image/jpeg';
    if (safe === 'webp') return 'image/webp';
    if (safe === 'gif') return 'image/gif';
    return fallback;
  }

  function arrayBufferToBase64(buffer) {
    try {
      const bytes = new Uint8Array(buffer || new ArrayBuffer(0));
      let binary = '';
      const chunkSize = 0x8000;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.subarray(offset, offset + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return window.btoa(binary);
    } catch (error) {
      return '';
    }
  }

  function normalizeImageSource(value, mimeType) {
    const safeValue = String(value || '').trim();
    if (!safeValue) return '';
    if (safeValue.startsWith('data:image/')) return safeValue;
    if (/^https?:\/\//i.test(safeValue)) return safeValue;

    const compact = safeValue.replace(/\s+/g, '');
    const looksLikeBase64 = compact.length >= 60 && /^[A-Za-z0-9+/]+=*$/.test(compact);
    if (!looksLikeBase64) return '';
    const mime = guessImageMimeType(mimeType, 'image/png');
    return `data:${mime};base64,${compact}`;
  }

  function imageExtensionFromSource(source, mimeType) {
    const safeMime = guessImageMimeType(mimeType, '');
    if (safeMime === 'image/jpeg') return 'jpg';
    if (safeMime === 'image/webp') return 'webp';
    if (safeMime === 'image/gif') return 'gif';
    if (safeMime === 'image/png') return 'png';

    const fromUrl = String(source || '').trim().match(/\.([a-z0-9]{3,4})(?:\?|#|$)/i);
    if (fromUrl && fromUrl[1]) return fromUrl[1].toLowerCase();
    return 'png';
  }

  function collectFluxImageCandidates(payload) {
    const candidates = [];
    const push = value => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach(item => push(item));
        return;
      }
      candidates.push(value);
    };

    // OpenAI-style responses: only use `data` so we do not merge ghost slots from `output` / `artifacts`.
    const dataArray = payload?.data;
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      push(dataArray);
      return candidates;
    }

    push(payload?.data);
    push(payload?.images);
    push(payload?.output);
    push(payload?.artifacts);
    push(payload?.result?.images);
    push(payload?.result?.data);
    push(payload?.result?.output);
    push(payload?.result);
    push(payload?.image);
    push(payload?.image_url);
    push(payload?.url);

    return candidates;
  }

  function normalizeFluxImages(payload) {
    const out = [];
    const candidates = collectFluxImageCandidates(payload);
    let sequence = 0;

    for (const candidate of candidates) {
      let source = '';
      let mimeType = 'image/png';
      let name = '';

      if (typeof candidate === 'string') {
        source = normalizeImageSource(candidate, mimeType);
      } else if (candidate && typeof candidate === 'object') {
        const objectCandidate = candidate;
        mimeType = guessImageMimeType(
          objectCandidate.mime_type
          || objectCandidate.mimeType
          || objectCandidate.format,
          mimeType,
        );
        source = normalizeImageSource(
          objectCandidate.b64_json
          || objectCandidate.base64
          || objectCandidate.b64
          || objectCandidate.image_base64
          || objectCandidate.image
          || objectCandidate.data
          || objectCandidate.bytes
          || objectCandidate.url
          || objectCandidate.image_url
          || objectCandidate.src
          || '',
          mimeType,
        );
        name = String(objectCandidate.file_name || objectCandidate.name || '').trim();
      }

      if (!source) continue;
      sequence += 1;
      const extension = imageExtensionFromSource(source, mimeType);
      const normalizedName = String(name || '').replace(/^flux[-_\s]*/i, 'liz-imagina-').trim();
      const finalName = normalizedName || `liz-imagina-${Date.now()}-${sequence}.${extension}`;

      out.push({
        id: `liz-imagina-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name: finalName,
        mimeType,
        dataUrl: source,
        isImage: true,
      });
    }

    return out;
  }

  function extractFluxErrorMessage(payload, status) {
    return (
      payload?.error?.message
      || payload?.message
      || payload?.detail
      || extractLizErrorMessage(payload, status)
    );
  }

  function buildFluxPrompt(prompt, style, attachments) {
    const safePrompt = String(prompt || '').trim();
    const promptParts = [safePrompt || 'Gerar imagem detalhada de alta qualidade.'];

    const safeStyle = String(style || '').trim();
    if (safeStyle && safeStyle.toLowerCase() !== 'estilo') {
      promptParts.push(`Estilo visual: ${safeStyle}.`);
    }

    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const attachmentNames = safeAttachments
      .map(attachment => String(attachment?.name || '').trim())
      .filter(Boolean)
      .slice(0, 4);
    if (attachmentNames.length > 0) {
      promptParts.push(`Usar como referencia os arquivos: ${attachmentNames.join(', ')}.`);
    }

    return promptParts.join('\n');
  }

  async function generateFluxImage({
    prompt,
    style,
    attachments,
    model,
    token,
    timeoutMs = 60000,
    size,
    negativePrompt,
  }) {
    const runtime = window.__LIZ_RUNTIME || {};
    const useLocalProxy = Boolean(runtime.fluxImageProxy);

    const proxyBase = String(window.location?.origin || '').replace(/\/+$/, '');
    const proxyPath = normalizeApiPath(runtime.fluxImageEndpoint || FLUX_IMAGE_PROXY_PATH, FLUX_IMAGE_PROXY_PATH);
    const endpointCandidates = [`${proxyBase}${proxyPath}`];
    const authToken = String(token || '').trim();

    const neg = String(negativePrompt || '').trim();
    const fluxPrompt = buildFluxPrompt(prompt, style, attachments);
    const requestBody = {
      model: resolveFluxModel(model),
      prompt: fluxPrompt,
      input: {
        prompt: fluxPrompt,
        ...(neg ? { negative_prompt: neg } : {}),
      },
      n: 1,
      response_format: 'b64_json',
      ...(size ? { size: String(size) } : {}),
      ...(neg ? { negative_prompt: neg } : {}),
    };

    let lastError = null;

    if (authToken) {
      try {
        const payload = await request('/images/generate', {
          method: 'POST',
          token: authToken,
          timeoutMs: Math.max(1200, Number(timeoutMs) || 60000),
          body: requestBody,
        });

        const images = normalizeFluxImages(payload);
        if (images.length === 0) {
          throw new Error('A API de imagens retornou resposta sem imagem.');
        }

        const text =
          String(payload?.message || '').trim()
          || String(payload?.detail || '').trim()
          || 'Imagem pronta.';

        return {
          text,
          images,
          payload,
        };
      } catch (error) {
        lastError = error;
        if (!useLocalProxy) {
          throw error;
        }
      }
    }

    if (!useLocalProxy) {
      const proxyError = new Error('Proxy local de imagens indisponivel para chamada segura.');
      proxyError.code = 'FLUX_PROXY_REQUIRED';
      throw (lastError || proxyError);
    }

    for (let attempt = 0; attempt < endpointCandidates.length; attempt += 1) {
      const endpoint = endpointCandidates[attempt];
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), Math.max(1200, Number(timeoutMs) || 60000));

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        const contentType = String(response.headers.get('content-type') || '').toLowerCase();
        let payload = null;

        if (contentType.includes('application/json')) {
          try {
            payload = await response.json();
          } catch (error) {
            payload = null;
          }
        } else if (contentType.startsWith('image/')) {
          const binary = await response.arrayBuffer();
          const base64 = arrayBufferToBase64(binary);
          payload = {
            data: [{ b64_json: base64, mime_type: contentType }],
          };
        } else {
          const fallbackText = await response.text();
          payload = {
            message: fallbackText,
          };
        }

        if (!response.ok) {
          const requestError = new Error(extractFluxErrorMessage(payload, response.status));
          requestError.status = response.status;
          requestError.payload = payload;
          throw requestError;
        }

        if (
          payload
          && typeof payload === 'object'
          && payload.success === false
          && payload.error
        ) {
          const requestError = new Error(extractFluxErrorMessage(payload, response.status));
          requestError.status = response.status;
          requestError.payload = payload;
          throw requestError;
        }

        const images = normalizeFluxImages(payload);
        if (images.length === 0) {
          throw new Error('A API de imagens retornou resposta sem imagem.');
        }

        const text =
          String(payload?.message || '').trim()
          || String(payload?.detail || '').trim()
          || 'Imagem pronta.';

        return {
          text,
          images,
          payload,
        };
      } catch (error) {
        if (error?.name === 'AbortError') {
          const timeoutError = new Error('Timeout ao consultar API de imagens.');
          timeoutError.code = 'FLUX_TIMEOUT';
          lastError = timeoutError;
        } else {
          lastError = error;
        }

        if (attempt >= endpointCandidates.length - 1) {
          throw lastError;
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    throw (lastError || new Error('Falha ao consultar API de imagens.'));
  }

  function getAiReply(userMessage) {
    const normalized = String(userMessage || '').trim().toLowerCase();
    if (normalized === 'oi' || normalized.startsWith('oi ')) {
      return 'Oi! Estou aqui para ajudar. Me conta no que voce quer avancar agora.';
    }
    return 'Entendi sua mensagem. Posso te ajudar a transformar isso em uma acao pratica agora.';
  }

  function register({ email, password, displayName }) {
    return request('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        display_name: displayName,
      },
    });
  }

  function login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  function getSocialAuthorizeUrl({ provider, redirectTo }) {
    return request('/auth/social/authorize', {
      method: 'POST',
      body: {
        provider: String(provider || '').trim().toLowerCase(),
        redirect_to: String(redirectTo || '').trim(),
      },
    });
  }

  function socialLogin({ provider, supabaseAccessToken }) {
    return request('/auth/social/login', {
      method: 'POST',
      body: {
        provider: String(provider || '').trim().toLowerCase(),
        supabase_access_token: String(supabaseAccessToken || '').trim(),
      },
    });
  }

  function refreshSession(refreshToken) {
    return request('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });
  }

  function logout(refreshToken) {
    return request('/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });
  }

  function getMe(token) {
    return request('/users/me', { token });
  }

  function updateMe({ token, displayName, username, avatarUrl }) {
    return request('/users/me', {
      method: 'PATCH',
      token,
      body: {
        ...(displayName !== undefined ? { display_name: displayName } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      },
    });
  }

  function getMyActivity({ token, months = 8 }) {
    const params = new URLSearchParams();
    params.set('months', String(months));
    return request(`/users/me/activity?${params.toString()}`, { token });
  }

  function getUsageSummary({ token, timeoutMs = 12000 }) {
    return request('/usage/summary', {
      method: 'GET',
      token,
      timeoutMs,
    });
  }

  function consumeImagesUsage({ token, count = 1 }) {
    return request('/usage/consume-images', {
      method: 'POST',
      token,
      timeoutMs: 12000,
      body: { count: Number(count) > 0 ? Number(count) : 1 },
    });
  }

  function consumeUsageAction({
    token,
    activity,
    count = 1,
    model,
    mode,
    attachmentsCount = 0,
  }) {
    return request('/usage/consume-action', {
      method: 'POST',
      token,
      timeoutMs: 12000,
      body: {
        activity: String(activity || '').trim() || 'chat_simple',
        count: Number(count) > 0 ? Number(count) : 1,
        ...(model ? { model: String(model) } : {}),
        ...(mode ? { mode: String(mode) } : {}),
        attachments_count: Math.max(0, Number(attachmentsCount) || 0),
      },
    });
  }

  function sendChatMessage({
    token,
    message,
    aiPrompt,
    conversationId,
    attachments,
    model,
    mode,
    uiLanguage,
    timeoutMs = 12000,
  }) {
    const params = new URLSearchParams();
    if (uiLanguage) params.set('ui_language', String(uiLanguage));
    const endpoint = params.toString() ? `/chat/messages?${params.toString()}` : '/chat/messages';

    return request(endpoint, {
      method: 'POST',
      token,
      timeoutMs,
      body: {
        message,
        ...(String(aiPrompt || '').trim() ? { ai_prompt: String(aiPrompt).trim() } : {}),
        conversation_id: conversationId || null,
        attachments: Array.isArray(attachments) ? attachments : [],
        model: model || 'mini',
        mode: mode || 'default',
      },
    });
  }

  async function sendChatMessageStream({
    token,
    message,
    aiPrompt,
    conversationId,
    attachments,
    model,
    mode,
    uiLanguage,
    onChunk,
    onEvent,
    timeoutMs = 60000,
  }) {
    const params = new URLSearchParams();
    if (uiLanguage) params.set('ui_language', String(uiLanguage));
    const endpointBase = '/chat/messages/stream';
    const endpoint = params.toString() ? `${endpointBase}?${params.toString()}` : endpointBase;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    let streamStarted = false;
    try {
      const response = await fetch(`${DEFAULT_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          ...(String(aiPrompt || '').trim() ? { ai_prompt: String(aiPrompt).trim() } : {}),
          conversation_id: conversationId || null,
          attachments: Array.isArray(attachments) ? attachments : [],
          model: model || 'mini',
          mode: mode || 'default',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let payload = null;
        try {
          payload = await response.json();
        } catch (error) {
          payload = null;
        }
        const firstValidation =
          (Array.isArray(payload?.error?.details) && payload.error.details[0]) ||
          (Array.isArray(payload?.detail) && payload.detail[0]) ||
          null;
        const validationMessage =
          firstValidation?.msg ||
          firstValidation?.message ||
          '';

        const streamError = new Error(
          validationMessage ||
          payload?.error?.message ||
          payload?.detail ||
          `Erro HTTP ${response.status}`,
        );
        streamError.status = response.status;
        streamError.payload = payload;
        throw streamError;
      }

      if (!response.body) {
        throw new Error('Streaming indisponivel no navegador.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let doneEvent = null;

      const processLine = line => {
        if (!line) return;
        let eventPayload = null;
        try {
          eventPayload = JSON.parse(line);
        } catch (error) {
          return;
        }

        onEvent?.(eventPayload);

        if (eventPayload.event === 'chunk') {
          streamStarted = true;
          const fullContent = typeof eventPayload.content === 'string'
            ? eventPayload.content
            : String(eventPayload.delta || '');
          onChunk?.(fullContent, String(eventPayload.delta || ''));
        }

        if (eventPayload.event === 'done') {
          doneEvent = eventPayload;
        }

        if (eventPayload.event === 'error') {
          const streamError = new Error(
            eventPayload.message || 'Falha no streaming do backend.',
          );
          streamError.status = Number(eventPayload.status || 502);
          streamError.payload = eventPayload;
          streamError.streamStarted = streamStarted;
          throw streamError;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let separator = buffer.indexOf('\n');

        while (separator >= 0) {
          const line = buffer.slice(0, separator).trim();
          buffer = buffer.slice(separator + 1);
          processLine(line);
          separator = buffer.indexOf('\n');
        }
      }

      const tail = buffer.trim();
      if (tail) processLine(tail);

      if (!doneEvent) {
        const streamError = new Error('Stream finalizado sem payload final.');
        streamError.streamStarted = streamStarted;
        throw streamError;
      }

      return doneEvent;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Timeout no streaming do backend.');
        timeoutError.streamStarted = streamStarted;
        throw timeoutError;
      }
      if (error && typeof error === 'object' && !('streamStarted' in error)) {
        error.streamStarted = streamStarted;
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function getChatHistory({ token, conversationId, limit = 30 }) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (conversationId) params.set('conversation_id', conversationId);
    return request(`/chat/history?${params.toString()}`, {
      token,
      timeoutMs: 30000,
    });
  }

  function deleteChatHistory({ token, conversationId, keepalive = false } = {}) {
    const params = new URLSearchParams();
    if (conversationId) params.set('conversation_id', conversationId);
    const suffix = params.toString();
    return request(`/chat/history${suffix ? `?${suffix}` : ''}`, {
      method: 'DELETE',
      token,
      keepalive,
    });
  }

  function uploadFile({
    token,
    fileName,
    dataUrl,
    timeoutMs = 30000,
  }) {
    return request('/files/upload', {
      method: 'POST',
      token,
      timeoutMs,
      body: {
        file_name: String(fileName || '').trim(),
        data_url: String(dataUrl || '').trim(),
      },
    });
  }

  function listFiles({
    token,
    limit = 200,
    timeoutMs = 30000,
  }) {
    const params = new URLSearchParams();
    params.set('limit', String(Math.max(1, Math.min(300, Number(limit) || 200))));
    return request(`/files?${params.toString()}`, {
      method: 'GET',
      token,
      timeoutMs,
    });
  }

  function getSettings(token) {
    return request('/settings', { token });
  }

  function updateSettings({ token, patch }) {
    return request('/settings', {
      method: 'PUT',
      token,
      body: patch || {},
    });
  }

  function sendSupportMessage({ token, message }) {
    return request('/help/support-message', {
      method: 'POST',
      token,
      timeoutMs: 15000,
      body: {
        message,
      },
    });
  }

  function getBillingPlans() {
    return request('/billing/plans', {
      method: 'GET',
      timeoutMs: 12000,
    });
  }

  function getBillingMe({ token }) {
    return request('/billing/me', {
      method: 'GET',
      token,
      timeoutMs: 12000,
    });
  }

  window.LizApi = {
    getApiBase: () => DEFAULT_API_BASE,
    getDirectLizBase: () => DIRECT_LIZ_BASE,
    getDirectLizBase25: () => DIRECT_LIZ_BASE_25,
    getFluxApiBase: () => resolveFluxApiBase(),
    hasDirectLizApiKey: () => Boolean(resolveDirectLizApiKey()),
    hasFluxApiKey: () => Boolean(resolveFluxApiKey()),
    setDirectLizApiKey: key => {
      const normalized = String(key || '').trim();
      if (!normalized) {
        try { window.localStorage.removeItem('liz_direct_api_key'); } catch (error) {}
        return false;
      }
      try {
        window.localStorage.setItem('liz_direct_api_key', normalized);
        return true;
      } catch (error) {
        return false;
      }
    },
    setFluxApiKey: key => {
      const normalized = String(key || '').trim();
      if (!normalized) {
        try { window.localStorage.removeItem('flux_api_key'); } catch (error) {}
        return false;
      }
      try {
        window.localStorage.setItem('flux_api_key', normalized);
        return true;
      } catch (error) {
        return false;
      }
    },
    request,
    sendDirectLizMessage,
    generateFluxImage,
    getAiReply,
    register,
    login,
    getSocialAuthorizeUrl,
    socialLogin,
    refreshSession,
    logout,
    getMe,
    updateMe,
    getMyActivity,
    sendChatMessage,
    sendChatMessageStream,
    getChatHistory,
    deleteChatHistory,
    uploadFile,
    listFiles,
    getSettings,
    updateSettings,
    sendSupportMessage,
    getBillingPlans,
    getBillingMe,
    getUsageSummary,
    consumeImagesUsage,
    consumeUsageAction,
  };
})();
