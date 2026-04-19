(function initLizBridgeModule() {
  const CHANNEL = 'liz-bridge-v1';
  const REQUEST_TYPE = 'LIZ_BRIDGE_REQUEST';
  const RESPONSE_TYPE = 'LIZ_BRIDGE_RESPONSE';
  const DEFAULT_SERVER_URL = 'server-node.html';
  const DEFAULT_TIMEOUT_MS = 20000;

  const state = {
    iframe: null,
    serverWindow: null,
    pending: new Map(),
    initPromise: null,
    ready: false,
    sequence: 0,
    onMessageBound: null,
    serverUrl: DEFAULT_SERVER_URL,
  };

  function nowId() {
    state.sequence += 1;
    return `liz-${Date.now()}-${state.sequence}-${Math.random().toString(16).slice(2, 9)}`;
  }

  function getTargetOrigin() {
    return window.location.origin;
  }

  function normalizeServerUrl(serverUrl) {
    const raw = String(serverUrl || '').trim();
    if (!raw) return DEFAULT_SERVER_URL;
    return raw;
  }

  function rejectAllPending(errorMessage) {
    const err = new Error(String(errorMessage || 'Intermediador Liz indisponivel.'));
    state.pending.forEach(entry => {
      window.clearTimeout(entry.timeoutId);
      entry.reject(err);
    });
    state.pending.clear();
  }

  function ensureMessageListener() {
    if (state.onMessageBound) return;
    state.onMessageBound = event => {
      if (event.origin !== getTargetOrigin()) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.channel !== CHANNEL || data.type !== RESPONSE_TYPE) return;

      const requestId = String(data.requestId || '');
      if (!requestId) return;

      const pending = state.pending.get(requestId);
      if (!pending) return;

      state.pending.delete(requestId);
      window.clearTimeout(pending.timeoutId);

      if (data.success) {
        pending.resolve(data.data);
        return;
      }

      const remoteMessage = String(data.error || 'Falha no servidor intermediador Liz.');
      pending.reject(new Error(remoteMessage));
    };

    window.addEventListener('message', state.onMessageBound);
  }

  function createHiddenIframe(url) {
    const iframe = document.createElement('iframe');
    iframe.id = 'liz-server-node-bridge';
    iframe.src = url;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    return iframe;
  }

  function init(serverUrl = DEFAULT_SERVER_URL) {
    state.serverUrl = normalizeServerUrl(serverUrl);

    if (state.ready && state.serverWindow) {
      return Promise.resolve(true);
    }

    if (state.initPromise) {
      return state.initPromise;
    }

    state.initPromise = new Promise((resolve, reject) => {
      if (!document.body) {
        reject(new Error('Body indisponivel para iniciar intermediador Liz.'));
        return;
      }

      ensureMessageListener();

      if (state.iframe?.isConnected) {
        state.iframe.remove();
      }

      state.ready = false;
      state.serverWindow = null;

      const iframe = createHiddenIframe(state.serverUrl);
      state.iframe = iframe;

      const loadTimeoutId = window.setTimeout(() => {
        if (state.ready) return;
        iframe.remove();
        state.iframe = null;
        state.serverWindow = null;
        reject(new Error('Timeout ao iniciar servidor intermediador Liz.'));
      }, 12000);

      iframe.addEventListener('load', () => {
        window.clearTimeout(loadTimeoutId);
        state.serverWindow = iframe.contentWindow;
        state.ready = Boolean(state.serverWindow);
        if (!state.ready) {
          reject(new Error('Janela do servidor intermediador Liz nao disponivel.'));
          return;
        }
        resolve(true);
      }, { once: true });

      iframe.addEventListener('error', () => {
        window.clearTimeout(loadTimeoutId);
        state.ready = false;
        state.serverWindow = null;
        reject(new Error('Falha ao carregar servidor intermediador Liz.'));
      }, { once: true });

      document.body.appendChild(iframe);
    })
      .finally(() => {
        state.initPromise = null;
      });

    return state.initPromise;
  }

  async function ask(payload, timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (!state.ready || !state.serverWindow) {
      await init(state.serverUrl);
    }

    if (!state.serverWindow) {
      throw new Error('Servidor intermediador Liz indisponivel.');
    }

    const requestId = nowId();
    const safeTimeout = Math.max(1000, Number(timeoutMs) || DEFAULT_TIMEOUT_MS);

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        state.pending.delete(requestId);
        reject(new Error('Timeout aguardando resposta do intermediador Liz.'));
      }, safeTimeout);

      state.pending.set(requestId, { resolve, reject, timeoutId });

      state.serverWindow.postMessage(
        {
          channel: CHANNEL,
          type: REQUEST_TYPE,
          requestId,
          payload: payload || {},
        },
        getTargetOrigin(),
      );
    });
  }

  function isReady() {
    return Boolean(state.ready && state.serverWindow);
  }

  function shutdown() {
    rejectAllPending('Intermediador Liz encerrado.');
    if (state.iframe?.isConnected) {
      state.iframe.remove();
    }
    state.iframe = null;
    state.serverWindow = null;
    state.ready = false;
  }

  window.addEventListener('beforeunload', shutdown);

  window.LizBridge = {
    init,
    ask,
    isReady,
    shutdown,
  };
})();
