(function initChatModule() {
  const CONVERSATION_CACHE_NAMESPACE = 'liz_conversations_cache_v2';
  const LEGACY_CONVERSATION_CACHE_KEY = 'liz_conversations_cache_v1';
  const MAX_CACHED_CONVERSATIONS = 60;
  const MAX_CACHED_MESSAGES_PER_CONVERSATION = 120;
  const MAX_CACHED_MESSAGE_TEXT_LENGTH = 4000;
  const BACKEND_REPLY_MAX_WAIT_MS = 12000;
  /** Modo documentos ainda chama timeout proprio caso backend seja usado por compatibilidade. */
  const BACKEND_CHAT_DOCS_TIMEOUT_MS = 18000;
  /** Explore usa contexto web no backend, pode levar um pouco mais. */
  const BACKEND_CHAT_EXPLORE_TIMEOUT_MS = 24000;
  /** Resposta completa da Liz apos fallback do backend (alinha ao deadline do servidor ~55s). */
  const LIZ_DIRECT_REPLY_TIMEOUT_MS = 55000;
  /** Docs pode levar mais tempo para gerar PDF/TXT completo; evita fallback prematuro. */
  const DOCS_DIRECT_REPLY_TIMEOUT_MS = 125000;

  function parseImageGenerationIntent(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;

    let m = text.match(/^\/imagine\s+([\s\S]+)$/i);
    if (m) return { prompt: m[1].trim() };

    m = text.match(/^\/img\s+([\s\S]+)$/i);
    if (m) return { prompt: m[1].trim() };

    m = text.match(
      /^\s*(?:gera|crie|fa[cÃ§]a|quero|preciso\s+de)\s+(?:uma\s+)?imagem\s*[:\-]?\s+([\s\S]+)$/i,
    );
    if (m && m[1].trim()) return { prompt: m[1].trim() };

    m = text.match(/^\s*imagem\s*:\s*([\s\S]+)$/i);
    if (m && m[1].trim()) return { prompt: m[1].trim() };

    return null;
  }
  const MAX_BACKEND_MESSAGE_LENGTH = 12000;
  const MAX_ATTACHMENT_TEXT_CHARS = 12000;
  const MAX_ATTACHMENT_PROMPT_CHARS = 2400;
  const MAX_ATTACHMENT_PROMPT_TOTAL_CHARS = 3600;
  const MAX_TEXT_ATTACHMENT_BYTES = 600 * 1024;
  const MAX_PDF_ATTACHMENT_BYTES = 3 * 1024 * 1024;
  const MAX_ARCHIVE_ATTACHMENT_BYTES = 20 * 1024 * 1024;
  const MAX_BINARY_FALLBACK_BYTES = 2_500 * 1024;
  const MAX_ARCHIVE_ENTRIES = 60;
  const MAX_ARCHIVE_ENTRY_BYTES = 220 * 1024;
  const TEXT_ATTACHMENT_EXTENSIONS = new Set([
    'txt',
    'md',
    'markdown',
    'csv',
    'json',
    'xml',
    'yml',
    'yaml',
    'ini',
    'log',
    'sql',
    'js',
    'jsx',
    'ts',
    'tsx',
    'py',
    'java',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'go',
    'rs',
    'php',
    'rb',
    'sh',
    'bash',
    'zsh',
    'ps1',
    'bat',
    'cmd',
    'css',
    'scss',
    'html',
    'htm',
    'vue',
    'svelte',
    'toml',
    'env',
    'gitignore',
    'dockerfile',
  ]);
  const CODE_ATTACHMENT_EXTENSIONS = new Set([
    'html',
    'htm',
    'css',
    'scss',
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'xml',
    'py',
    'java',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'go',
    'rs',
    'php',
    'rb',
    'sh',
    'bash',
    'zsh',
    'ps1',
    'bat',
    'cmd',
    'sql',
    'vue',
    'svelte',
    'toml',
    'yaml',
    'yml',
  ]);
  const ARCHIVE_ATTACHMENT_EXTENSIONS = new Set([
    'zip',
    'apk',
    'jar',
    'docx',
    'pptx',
    'xlsx',
    'tar',
    'gz',
    'tgz',
  ]);
  const AUDIO_ATTACHMENT_EXTENSIONS = new Set([
    'mp3',
    'wav',
    'ogg',
    'flac',
    'm4a',
    'aac',
  ]);
  const VIDEO_ATTACHMENT_EXTENSIONS = new Set([
    'mp4',
    'mkv',
    'avi',
    'mov',
    'webm',
  ]);
  const IMAGE_ATTACHMENT_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'avif',
  ]);
  const ADVANCED_CONTAINER_EXTENSIONS = new Set([
    'rar',
    '7z',
    'iso',
    'exe',
    'ppt',
    'xls',
    'msi',
    'cab',
  ]);
  const SEVEN_ZIP_EXTRACTION_EXTENSIONS = new Set([
    ...ARCHIVE_ATTACHMENT_EXTENSIONS,
    ...ADVANCED_CONTAINER_EXTENSIONS,
  ]);
  const IMAGE_OCR_MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MEDIA_TRANSCRIPTION_MAX_FILE_BYTES = 26 * 1024 * 1024;
  const MEDIA_TRANSCRIPTION_MAX_SECONDS = 11 * 60;
  const ADVANCED_EXTRACTION_TIMEOUT_MS = 45_000;
  const WHISPER_MODEL_ID = 'Xenova/whisper-tiny';

  const conversationState = {
    cacheOwnerKey: 'guest',
    conversations: [],
    currentConversationId: null,
    historyHydrating: false,
    historyClearInFlight: false,
    historyClearPromise: null,
    pendingAttachments: [],
    loadingAttachments: false,
    chatModeTray: null,
    activeQuickModes: [],
    chatPlusMenu: null,
    chatPlusDropdown: null,
    chatPlusSubmenu: null,
    chatPlusMoreOption: null,
    chatAttachBtn: null,
    chatFileInput: null,
    chatAttachmentTray: null,
    chatImageModal: null,
    chatImageModalImg: null,
    chatImageModalClose: null,
  };

  const QUICK_CHAT_MODES = Object.freeze({
    imagine: {
      label: 'Criar imagem',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"></path></svg>',
    },
    docs: {
      label: 'Docs',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"></path><path d="M14 3v5h5"></path><path d="M10 14h6M10 18h4"></path></svg>',
    },
    explore: {
      label: 'Explorar',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>',
    },
  });

  let initialized = false;
  let sevenZipRuntimePromise = null;
  let asrPipelinePromise = null;
  let tesseractWorkerPromise = null;
  let xlsxModulePromise = null;

  function getUiState() {
    return window.LizUI?.getState?.() || {};
  }

  function renderMarkdownText(markdownText) {
    const safeText = String(markdownText || '');
    if (window.LizMarkdown?.render) {
      return window.LizMarkdown.render(safeText);
    }
    if (window.LizMarkdown?.escapeHtml) {
      return window.LizMarkdown.escapeHtml(safeText).replace(/\n/g, '<br>');
    }
    return safeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>');
  }

  function emitConversationsUpdated() {
    persistConversationsCache();
    window.dispatchEvent(new CustomEvent('liz:conversations-updated'));
  }

  function normalizeText(text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean || 'Nova conversa';
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1)}...`;
  }

  function normalizeTitleComparison(text) {
    let safe = String(text || '').toLowerCase();
    if (typeof safe.normalize === 'function') {
      safe = safe.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return safe
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildConversationTitleFromMessage(message) {
    const rawMessage = normalizeText(message);
    const normalized = normalizeTitleComparison(rawMessage);
    if (!normalized) return 'Nova conversa';

    const hasPriceIntent = /\bquanto custa\b|\bpreco\b|\borcamento\b/.test(normalized);
    const cleaned = normalized
      .replace(/\bquanto custa\b/g, ' ')
      .replace(/\bqual o preco\b/g, ' ')
      .replace(/\bquero\b|\bpreciso\b|\bgostaria\b|\bpode\b|\bpor favor\b/g, ' ')
      .replace(/\bfaz\b|\bfaca\b|\bfazer\b|\bgera\b|\bgerar\b|\bcria\b|\bcriar\b|\bmonta\b|\bmontar\b/g, ' ')
      .replace(/\bescreve\b|\bescrever\b|\bme ajuda\b|\bme ajude\b/g, ' ')
      .replace(/\bpdf\b|\bdoc\b|\bdocs\b|\barquivo\b|\bdocumento\b|\btexto\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stopwords = new Set([
      'a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas',
      'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas',
      'em', 'para', 'por', 'com', 'sem', 'e', 'ou', 'ao',
      'pra', 'pro', 'me', 'te', 'se', 'isso', 'isto', 'aquele', 'aquela',
      'sobre', 'tipo',
    ]);

    const tokens = cleaned
      .split(' ')
      .map(token => (token === 'pc' ? 'computador' : token))
      .filter(token => token && !stopwords.has(token));

    const compactTokens = [];
    tokens.forEach(token => {
      if (compactTokens[compactTokens.length - 1] !== token) {
        compactTokens.push(token);
      }
    });

    if (hasPriceIntent && !compactTokens.includes('preco')) {
      compactTokens.push('preco');
    }

    const candidate = compactTokens.slice(0, 7).join(' ').trim();
    if (candidate.length >= 4) {
      return truncateText(candidate, 34);
    }
    return truncateText(rawMessage.toLowerCase(), 34);
  }

  function isGenericConversationTitle(title) {
    const normalized = normalizeTitleComparison(title);
    if (!normalized) return true;
    if (['oi', 'ola', 'teste', 'chat', 'nova conversa'].includes(normalized)) return true;
    return normalized.length <= 3;
  }

  function isCommandLikeConversationTitle(title) {
    const normalized = normalizeTitleComparison(title);
    if (!normalized) return false;
    return /\b(faz|faca|gera|gerar|cria|criar|quero|preciso|pdf|arquivo|documento)\b/.test(normalized);
  }

  function maybeRefreshConversationTitle(conversation, role, text) {
    if (!conversation || role !== 'user') return;
    const candidate = buildConversationTitleFromMessage(text);
    if (!candidate) return;

    const current = truncateText(normalizeText(conversation.title), 34);
    if (
      isGenericConversationTitle(current)
      || isCommandLikeConversationTitle(current)
      || current.length <= 10
    ) {
      conversation.title = candidate;
    }
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function getPeriodLabel(date) {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((startToday - startDate) / 86400000);

    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return 'Anteriores';
  }

  function safeParseJson(rawValue) {
    try {
      if (!rawValue) return null;
      return JSON.parse(rawValue);
    } catch (error) {
      return null;
    }
  }

  function resolveConversationOwnerKey(userLike) {
    const user =
      userLike && typeof userLike === 'object'
        ? userLike
        : window.LizAuth?.getCurrentUser?.();

    const rawId = String(user?.id || '').trim().toLowerCase();
    if (rawId) {
      return `uid:${rawId}`;
    }

    const rawEmail = String(user?.email || '').trim().toLowerCase();
    if (rawEmail) {
      return `email:${rawEmail}`;
    }

    return 'guest';
  }

  function resolveConversationCacheStorageKey(ownerKey = conversationState.cacheOwnerKey) {
    const safeOwner = String(ownerKey || 'guest').trim() || 'guest';
    return `${CONVERSATION_CACHE_NAMESPACE}:${encodeURIComponent(safeOwner)}`;
  }

  function normalizeCachedMessage(message, fallbackCreatedAt) {
    if (!message || typeof message !== 'object') return null;

    const role = message.role === 'ai' ? 'ai' : 'user';
    const text = String(message.text || '').trim().slice(0, MAX_CACHED_MESSAGE_TEXT_LENGTH);
    const createdAtIso = String(message.createdAt || fallbackCreatedAt || new Date().toISOString());
    const responseTimeMs = Math.max(0, Number(message.responseTimeMs) || 0);

    return {
      id: String(message.id || `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`),
      role,
      text,
      images: [],
      createdAt: createdAtIso,
      responseTimeMs,
    };
  }

  function normalizeCachedConversation(conversation) {
    if (!conversation || typeof conversation !== 'object') return null;

    const nowMs = Date.now();
    const createdAt = Number(conversation.createdAt || nowMs);
    const lastUpdatedAt = Number(conversation.lastUpdatedAt || createdAt || nowMs);
    const safeLastDate = new Date(Number.isFinite(lastUpdatedAt) ? lastUpdatedAt : nowMs);
    const fallbackMessageDateIso = safeLastDate.toISOString();
    const messages = Array.isArray(conversation.messages)
      ? conversation.messages
        .map(message => normalizeCachedMessage(message, fallbackMessageDateIso))
        .filter(Boolean)
        .slice(-MAX_CACHED_MESSAGES_PER_CONVERSATION)
      : [];

    const cachedTitle = truncateText(normalizeText(conversation.title), 34);
    const firstUserMessage = messages.find(message => message.role === 'user' && String(message.text || '').trim());
    const suggestedTitle = firstUserMessage
      ? buildConversationTitleFromMessage(firstUserMessage.text)
      : cachedTitle;
    const title = (isGenericConversationTitle(cachedTitle) || isCommandLikeConversationTitle(cachedTitle))
      ? suggestedTitle
      : cachedTitle;

    return {
      id: String(conversation.id || `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`),
      title,
      createdAt: Number.isFinite(createdAt) ? createdAt : nowMs,
      lastUpdatedAt: Number.isFinite(lastUpdatedAt) ? lastUpdatedAt : nowMs,
      timeLabel: formatTime(safeLastDate),
      period: getPeriodLabel(safeLastDate),
      messages,
    };
  }

  function persistConversationsCache() {
    try {
      const payload = {
        currentConversationId: conversationState.currentConversationId || null,
        conversations: conversationState.conversations
          .slice(0, MAX_CACHED_CONVERSATIONS)
          .map(conversation => ({
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            lastUpdatedAt: conversation.lastUpdatedAt,
            messages: Array.isArray(conversation.messages)
              ? conversation.messages.slice(-MAX_CACHED_MESSAGES_PER_CONVERSATION).map(message => ({
                id: message.id,
                role: message.role,
                text: String(message.text || '').slice(0, MAX_CACHED_MESSAGE_TEXT_LENGTH),
                // Mantemos cache leve para abrir instantaneo.
                images: [],
                createdAt: message.createdAt,
                responseTimeMs: Math.max(0, Number(message.responseTimeMs) || 0),
              }))
              : [],
          })),
        savedAt: Date.now(),
      };

      window.localStorage.setItem(
        resolveConversationCacheStorageKey(conversationState.cacheOwnerKey),
        JSON.stringify(payload),
      );
    } catch (error) {
      // no-op
    }
  }

  function restoreConversationsFromCache() {
    const storageKey = resolveConversationCacheStorageKey(conversationState.cacheOwnerKey);
    const cached = safeParseJson(window.localStorage.getItem(storageKey));

    if (!cached) {
      // Legacy shared cache key is intentionally ignored to avoid cross-account leakage.
      try {
        window.localStorage.removeItem(LEGACY_CONVERSATION_CACHE_KEY);
      } catch (error) {
        // no-op
      }
      return false;
    }

    if (!cached || typeof cached !== 'object') return false;

    const normalizedConversations = Array.isArray(cached.conversations)
      ? cached.conversations
        .map(normalizeCachedConversation)
        .filter(Boolean)
        .slice(0, MAX_CACHED_CONVERSATIONS)
      : [];

    conversationState.conversations = normalizedConversations;
    sortConversationsByLastUpdated();

    const cachedCurrentId = String(cached.currentConversationId || '').trim();
    if (cachedCurrentId && findConversationById(cachedCurrentId)) {
      conversationState.currentConversationId = cachedCurrentId;
    } else {
      conversationState.currentConversationId = null;
    }

    return true;
  }

  function parseDateToMillis(dateLike) {
    const parsed = Date.parse(String(dateLike || ''));
    if (Number.isFinite(parsed)) return parsed;
    return Date.now();
  }

  function normalizeHistoryRole(role) {
    return String(role || '').trim().toLowerCase() === 'assistant' ? 'ai' : 'user';
  }

  function sanitizeAttachmentText(value, maxLength = MAX_ATTACHMENT_TEXT_CHARS) {
    const safeValue = String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/\u0000/g, '')
      .trim();
    if (!safeValue) return '';
    if (safeValue.length <= maxLength) return safeValue;
    return `${safeValue.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
  }

  function serializeAttachmentForBackend(attachment) {
    if (!attachment || typeof attachment !== 'object') return '';
    return String(attachment?.name || 'arquivo').slice(0, 180);
  }

  function serializeAttachmentsForBackend(attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) return [];
    return attachments
      .map(serializeAttachmentForBackend)
      .filter(Boolean);
  }

  function parseStoredAttachmentDescriptor(rawAttachment, index = 0) {
    const safeRaw = String(rawAttachment || '').trim();
    if (!safeRaw) return null;

    let parsed = null;
    try {
      parsed = JSON.parse(safeRaw);
    } catch (error) {
      parsed = null;
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        id: `att-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 7)}`,
        name: safeRaw.slice(0, 180),
        mimeType: '',
        dataUrl: '',
        objectUrl: '',
        fileUrl: '',
        storagePath: '',
        sizeBytes: 0,
        durationMs: 0,
        isImage: false,
        textContent: '',
        textKind: '',
        textTruncated: false,
      };
    }

    const mimeType = String(parsed.mimeType || parsed.mime_type || '').trim().toLowerCase();
    const kind = String(parsed.kind || parsed.type || '').trim().toLowerCase();
    const textContent = sanitizeAttachmentText(
      parsed.textContent || parsed.text_content || parsed.transcript || '',
    );

    return {
      id: `att-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 7)}`,
      name: String(parsed.name || parsed.file_name || 'arquivo').trim().slice(0, 180) || 'arquivo',
      mimeType,
      dataUrl: String(parsed.dataUrl || parsed.data_url || '').trim(),
      objectUrl: '',
      fileUrl: String(parsed.fileUrl || parsed.file_url || '').trim(),
      storagePath: String(parsed.storagePath || parsed.storage_path || '').trim(),
      sizeBytes: Math.max(0, Number(parsed.sizeBytes || parsed.size_bytes) || 0),
      durationMs: Math.max(0, Number(parsed.durationMs || parsed.duration_ms) || 0),
      isImage: mimeType.startsWith('image/'),
      textContent,
      textKind: String(parsed.textKind || parsed.text_kind || kind || '').trim().toLowerCase(),
      textTruncated: Boolean(parsed.textTruncated || parsed.text_truncated),
    };
  }

  function normalizeHistoryAttachments(rawAttachments) {
    if (!Array.isArray(rawAttachments) || rawAttachments.length === 0) return [];
    return rawAttachments
      .map((rawName, index) => parseStoredAttachmentDescriptor(rawName, index))
      .filter(Boolean);
  }

  function buildConversationsFromHistoryItems(items) {
    const grouped = new Map();

    (Array.isArray(items) ? items : []).forEach(item => {
      if (!item || typeof item !== 'object') return;

      const conversationId = String(item.conversation_id || '').trim();
      if (!conversationId) return;

      const createdAtIso = String(item.created_at || new Date().toISOString());
      const createdAtMs = parseDateToMillis(createdAtIso);
      const role = normalizeHistoryRole(item.role);
      const text = String(item.content || '').trim().slice(0, MAX_CACHED_MESSAGE_TEXT_LENGTH);
      const images = normalizeHistoryAttachments(item.attachments);
      const responseTimeMs = Math.max(
        0,
        Number(item.response_time_ms || item.responseTimeMs || item.metadata?.response_time_ms || 0) || 0,
      );

      if (!grouped.has(conversationId)) {
        grouped.set(conversationId, {
          id: conversationId,
          title: 'Nova conversa',
          createdAt: createdAtMs,
          lastUpdatedAt: createdAtMs,
          timeLabel: formatTime(new Date(createdAtMs)),
          period: getPeriodLabel(new Date(createdAtMs)),
          messages: [],
        });
      }

      const conversation = grouped.get(conversationId);
      conversation.createdAt = Math.min(conversation.createdAt, createdAtMs);
      conversation.lastUpdatedAt = Math.max(conversation.lastUpdatedAt, createdAtMs);
      conversation.messages.push({
        id: String(item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`),
        role,
        text,
        images,
        createdAt: createdAtIso,
        responseTimeMs,
      });
      maybeRefreshConversationTitle(conversation, role, text);
    });

    const conversations = Array.from(grouped.values())
      .map(conversation => {
        conversation.messages.sort(
          (a, b) => parseDateToMillis(a.createdAt) - parseDateToMillis(b.createdAt),
        );
        const lastDate = new Date(conversation.lastUpdatedAt || conversation.createdAt || Date.now());
        conversation.timeLabel = formatTime(lastDate);
        conversation.period = getPeriodLabel(lastDate);
        return conversation;
      });

    conversations.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    return conversations.slice(0, MAX_CACHED_CONVERSATIONS);
  }

  async function resolveAuthTokenForHistory() {
    const auth = window.LizAuth;
    if (!auth) return '';

    let token = String(auth.getAccessToken?.() || '').trim();
    if (token) return token;

    if (typeof auth.ensureSession === 'function') {
      try {
        await auth.ensureSession();
        token = String(auth.getAccessToken?.() || '').trim();
      } catch (error) {
        if (!auth?.isAuthRequiredError?.(error)) {
          console.warn('[Liz] falha ao restaurar sessao para carregar historico.', error);
        }
        token = '';
      }
    }

    return token;
  }

  async function fetchServerHistoryItems(limit = 100) {
    if (typeof window.LizApi?.getChatHistory !== 'function') return null;

    const auth = window.LizAuth;
    let token = await resolveAuthTokenForHistory();
    if (!token) return null;

    try {
      const response = await window.LizApi.getChatHistory({
        token,
        limit,
      });
      return Array.isArray(response?.items) ? response.items : [];
    } catch (error) {
      const unauthorized = Number(error?.status) === 401;
      if (!unauthorized || typeof auth?.refresh !== 'function') {
        throw error;
      }

      await auth.refresh();
      token = String(auth.getAccessToken?.() || '').trim();
      if (!token) {
        throw error;
      }

      const retryResponse = await window.LizApi.getChatHistory({
        token,
        limit,
      });
      return Array.isArray(retryResponse?.items) ? retryResponse.items : [];
    }
  }

  async function deleteServerHistory(options = {}) {
    if (typeof window.LizApi?.deleteChatHistory !== 'function') return false;
    const keepalive = Boolean(options.keepalive);

    const auth = window.LizAuth;
    let token = await resolveAuthTokenForHistory();
    if (!token) return false;

    try {
      await window.LizApi.deleteChatHistory({ token, keepalive });
      return true;
    } catch (error) {
      const unauthorized = Number(error?.status) === 401;
      if (!unauthorized || typeof auth?.refresh !== 'function') {
        throw error;
      }

      await auth.refresh();
      token = String(auth.getAccessToken?.() || '').trim();
      if (!token) {
        throw error;
      }

      await window.LizApi.deleteChatHistory({ token, keepalive });
      return true;
    }
  }

  async function hydrateConversationsFromServer(options = {}) {
    if (conversationState.historyHydrating) return false;

    const limit = Math.min(100, Math.max(1, Number(options.limit) || 100));
    const ownerAtStart = conversationState.cacheOwnerKey;
    const previousCurrentId = conversationState.currentConversationId;

    conversationState.historyHydrating = true;
    try {
      const items = await fetchServerHistoryItems(limit);
      if (!Array.isArray(items)) {
        return false;
      }

      if (ownerAtStart !== conversationState.cacheOwnerKey) {
        return false;
      }

      const backendConversations = buildConversationsFromHistoryItems(items);
      if (backendConversations.length === 0) {
        return false;
      }

      conversationState.conversations = backendConversations;
      const preferredConversation = String(previousCurrentId || '').trim();
      if (preferredConversation && findConversationById(preferredConversation)) {
        conversationState.currentConversationId = preferredConversation;
      } else {
        conversationState.currentConversationId = backendConversations[0]?.id || null;
      }

      renderHistory();
      renderCurrentConversation();
      emitConversationsUpdated();
      return true;
    } catch (error) {
      console.warn('[Liz] nao foi possivel sincronizar historico da conta no Turso.', error);
      return false;
    } finally {
      conversationState.historyHydrating = false;
    }
  }

  function applyConversationScope(userLike) {
    const nextOwnerKey = resolveConversationOwnerKey(userLike);
    if (nextOwnerKey === conversationState.cacheOwnerKey) return false;

    persistConversationsCache();

    conversationState.cacheOwnerKey = nextOwnerKey;
    conversationState.conversations = [];
    conversationState.currentConversationId = null;
    clearPendingAttachments();

    restoreConversationsFromCache();
    renderHistory();
    renderCurrentConversation();
    emitConversationsUpdated();
    void hydrateConversationsFromServer({ limit: 100 });
    return true;
  }

  function findConversationById(conversationId) {
    return conversationState.conversations.find(conversation => conversation.id === conversationId) || null;
  }

  function getCurrentConversation() {
    if (!conversationState.currentConversationId) return null;
    return findConversationById(conversationState.currentConversationId);
  }

  function sortConversationsByLastUpdated() {
    conversationState.conversations.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  }

  function updateConversationMeta(conversation, updatedAt) {
    const timestamp = updatedAt.getTime();
    conversation.lastUpdatedAt = timestamp;
    conversation.timeLabel = formatTime(updatedAt);
    conversation.period = getPeriodLabel(updatedAt);
  }

  function renderHistory() {
    const ui = getUiState();
    const { historyContainer } = ui;
    if (!historyContainer) return;

    if (conversationState.conversations.length === 0) {
      historyContainer.innerHTML = '<div class="period-label">Sem conversas</div>';
      return;
    }

    const grouped = conversationState.conversations.reduce((acc, conversation) => {
      if (!acc[conversation.period]) {
        acc[conversation.period] = [];
      }
      acc[conversation.period].push(conversation);
      return acc;
    }, {});

    const periodOrder = ['Hoje', 'Ontem', 'Anteriores'];
    const fragment = document.createDocumentFragment();

    periodOrder.forEach(period => {
      if (!grouped[period]?.length) return;

      const periodLabel = document.createElement('div');
      periodLabel.className = 'period-label';
      periodLabel.textContent = period;
      fragment.appendChild(periodLabel);

      grouped[period].forEach(conversation => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `conv-item${conversation.id === conversationState.currentConversationId ? ' active' : ''}`;
        item.dataset.conversationId = conversation.id;

        const dot = document.createElement('span');
        dot.className = 'conv-dot';

        const body = document.createElement('div');
        body.className = 'conv-body';

        const title = document.createElement('div');
        title.className = 'conv-title';
        title.textContent = conversation.title;

        const time = document.createElement('div');
        time.className = 'conv-time';
        time.textContent = conversation.timeLabel;

        body.appendChild(title);
        body.appendChild(time);
        item.appendChild(dot);
        item.appendChild(body);
        fragment.appendChild(item);
      });
    });

    historyContainer.innerHTML = '';
    historyContainer.appendChild(fragment);
  }

  function activateChatMode() {
    const ui = getUiState();
    if (!ui.content || !ui.chatContainer) return;
    ui.content.classList.add('chat-active');
    ui.greeting?.setAttribute('aria-hidden', 'true');
  }

  function deactivateChatMode() {
    const ui = getUiState();
    if (!ui.content) return;
    ui.content.classList.remove('chat-active');
    ui.greeting?.removeAttribute('aria-hidden');
  }

  function scrollChatToBottom() {
    const ui = getUiState();
    if (!ui.chatContainer) return;
    ui.chatContainer.scrollTop = ui.chatContainer.scrollHeight;
  }

  function openImagePreview(dataUrl, altText = 'Preview da imagem') {
    if (!conversationState.chatImageModal || !conversationState.chatImageModalImg || !dataUrl) {
      return;
    }

    conversationState.chatImageModalImg.src = dataUrl;
    conversationState.chatImageModalImg.alt = altText;
    conversationState.chatImageModal.hidden = false;
  }

  function closeImagePreview() {
    if (!conversationState.chatImageModal || !conversationState.chatImageModalImg) {
      return;
    }

    conversationState.chatImageModal.hidden = true;
    conversationState.chatImageModalImg.src = '';
  }

  function handleModalKeydown(event) {
    if (event.key !== 'Escape') return;
    if (conversationState.chatPlusMenu?.classList.contains('open')) {
      closePlusMenu();
      return;
    }
    if (conversationState.chatImageModal?.hidden !== false) return;
    closeImagePreview();
  }

  function setPlusSubmenuOpen(isOpen) {
    const shouldOpen = Boolean(isOpen);
    if (!conversationState.chatPlusSubmenu || !conversationState.chatPlusMoreOption) return;

    conversationState.chatPlusSubmenu.classList.toggle('show', shouldOpen);
    conversationState.chatPlusSubmenu.setAttribute('aria-hidden', String(!shouldOpen));
    conversationState.chatPlusMoreOption.setAttribute('aria-expanded', String(shouldOpen));
  }

  function setPlusMenuOpen(isOpen) {
    const shouldOpen = Boolean(isOpen);
    if (!conversationState.chatPlusMenu || !conversationState.chatPlusDropdown || !conversationState.chatAttachBtn) return;

    if (shouldOpen) {
      syncPlusMenuModeStates();
    }

    conversationState.chatPlusMenu.classList.toggle('open', shouldOpen);
    conversationState.chatPlusDropdown.classList.toggle('show', shouldOpen);
    conversationState.chatPlusDropdown.setAttribute('aria-hidden', String(!shouldOpen));
    conversationState.chatAttachBtn.setAttribute('aria-expanded', String(shouldOpen));
    if (!shouldOpen) {
      setPlusSubmenuOpen(false);
    }
  }

  function closePlusMenu() {
    setPlusMenuOpen(false);
  }

  function getNormalizedQuickModes() {
    const source = Array.isArray(conversationState.activeQuickModes)
      ? conversationState.activeQuickModes
      : [];

    const valid = source.filter(mode => Object.prototype.hasOwnProperty.call(QUICK_CHAT_MODES, mode));
    const normalized = valid.length <= 1 ? valid : [valid[valid.length - 1]];

    const sameLength = normalized.length === source.length;
    const sameItems = sameLength && normalized.every((mode, index) => mode === source[index]);
    if (!sameItems) {
      conversationState.activeQuickModes = normalized;
    }

    return normalized;
  }

  function syncPlusMenuModeStates() {
    if (!conversationState.chatPlusDropdown) return;
    const active = new Set(getNormalizedQuickModes());
    const toggles = Array.from(conversationState.chatPlusDropdown.querySelectorAll('[data-chat-plus-mode]'));
    toggles.forEach(toggle => {
      const mode = String(toggle.dataset.chatPlusMode || '').trim().toLowerCase();
      if (!mode || !Object.prototype.hasOwnProperty.call(QUICK_CHAT_MODES, mode)) return;
      toggle.classList.toggle('is-active', active.has(mode));
    });
  }

  function removeQuickMode(mode) {
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!normalizedMode) return;

    conversationState.activeQuickModes = getNormalizedQuickModes().filter(
      currentMode => currentMode !== normalizedMode,
    );
    renderQuickModeTray();
  }

  function applyQuickModeDefaults(mode) {
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (normalizedMode === 'docs') {
      window.LizUI?.setModelSelection?.('Liz 2.3');
    }
  }

  function toggleQuickMode(mode) {
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(QUICK_CHAT_MODES, normalizedMode)) return;

    const currentModes = getNormalizedQuickModes();
    if (currentModes.includes(normalizedMode)) {
      removeQuickMode(normalizedMode);
      return;
    }

    // Apenas um modo rapido ativo por vez.
    conversationState.activeQuickModes = [normalizedMode];
    applyQuickModeDefaults(normalizedMode);
    renderQuickModeTray();
  }

  function renderQuickModeTray() {
    const tray = conversationState.chatModeTray;
    if (!tray) return;

    tray.innerHTML = '';
    const quickModes = getNormalizedQuickModes();

    if (quickModes.length === 0) {
      tray.classList.remove('has-modes');
      syncPlusMenuModeStates();
      return;
    }

    const fragment = document.createDocumentFragment();
    quickModes.forEach(mode => {
      const meta = QUICK_CHAT_MODES[mode];
      if (!meta) return;

      const chip = document.createElement('span');
      chip.className = 'chat-mode-chip';
      chip.dataset.mode = mode;

      const icon = document.createElement('span');
      icon.className = 'chat-mode-chip-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = meta.icon;

      const label = document.createElement('span');
      label.className = 'chat-mode-chip-label';
      label.textContent = meta.label;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chat-mode-chip-remove';
      removeBtn.setAttribute('aria-label', `Remover modo ${meta.label}`);
      removeBtn.textContent = 'x';
      removeBtn.addEventListener('click', event => {
        event.stopPropagation();
        removeQuickMode(mode);
      });

      chip.appendChild(icon);
      chip.appendChild(label);
      chip.appendChild(removeBtn);
      fragment.appendChild(chip);
    });

    tray.appendChild(fragment);
    tray.classList.add('has-modes');
    syncPlusMenuModeStates();
  }

  function isDocsModeActive() {
    return getNormalizedQuickModes().includes('docs');
  }

  function isImagineModeActive() {
    return getNormalizedQuickModes().includes('imagine');
  }

  function isExploreModeActive() {
    return getNormalizedQuickModes().includes('explore');
  }

  function openWorkspace(workspace) {
    window.LizUI?.setWorkspaceView?.(workspace);
  }

  function configureChatFileInputForMode(mode) {
    const input = conversationState.chatFileInput;
    if (!input) return;
    const normalizedMode = String(mode || '').trim().toLowerCase();
    const folderMode = normalizedMode === 'folder';
    input.value = '';
    if (folderMode) {
      input.setAttribute('multiple', 'multiple');
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      return;
    }
    input.setAttribute('multiple', 'multiple');
    input.removeAttribute('webkitdirectory');
    input.removeAttribute('directory');
  }

  function handlePlusModeAction(mode) {
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!normalizedMode) return;

    if (normalizedMode === 'files' || normalizedMode === 'folder') {
      closePlusMenu();
      configureChatFileInputForMode(normalizedMode);
      conversationState.chatFileInput?.click();
      return;
    }

    if (normalizedMode === 'imagine' || normalizedMode === 'docs' || normalizedMode === 'explore') {
      toggleQuickMode(normalizedMode);
      closePlusMenu();
      return;
    }

    if (normalizedMode === 'more') {
      const shouldOpen = !conversationState.chatPlusSubmenu?.classList.contains('show');
      setPlusSubmenuOpen(shouldOpen);
    }
  }

  function handlePlusSubmodeAction(mode) {
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!normalizedMode) return;

    closePlusMenu();
    if (normalizedMode === 'search') {
      openWorkspace('search');
      return;
    }
    if (normalizedMode === 'gallery') {
      openWorkspace('gallery');
      return;
    }
    if (normalizedMode === 'new-chat') {
      startNewChat();
    }
  }

  function clearPendingAttachments() {
    conversationState.pendingAttachments = [];
    if (conversationState.chatFileInput) {
      conversationState.chatFileInput.value = '';
    }
    renderPendingAttachments();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler texto do arquivo.'));
      reader.readAsText(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Falha ao ler bytes do arquivo.'));
      reader.readAsArrayBuffer(file);
    });
  }

  function resolveFileExtension(name) {
    const safeName = String(name || '').trim().toLowerCase();
    if (!safeName) return '';
    const dotIndex = safeName.lastIndexOf('.');
    if (dotIndex < 0 || dotIndex === safeName.length - 1) return '';
    return safeName.slice(dotIndex + 1).replace(/[^a-z0-9]/g, '');
  }

  function toUint8Array(bufferLike) {
    if (!bufferLike) return new Uint8Array();
    if (bufferLike instanceof Uint8Array) return bufferLike;
    if (bufferLike instanceof ArrayBuffer) return new Uint8Array(bufferLike);
    if (ArrayBuffer.isView(bufferLike)) {
      return new Uint8Array(
        bufferLike.buffer,
        bufferLike.byteOffset,
        bufferLike.byteLength,
      );
    }
    return new Uint8Array();
  }

  async function withTimeout(promiseLike, timeoutMs, fallbackValue = null) {
    const safeTimeout = Math.max(1, Number(timeoutMs) || ADVANCED_EXTRACTION_TIMEOUT_MS);
    return new Promise(resolve => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(fallbackValue);
      }, safeTimeout);

      Promise.resolve(promiseLike)
        .then(value => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch(() => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(fallbackValue);
        });
    });
  }

  function collectPrintableUtf16LeStrings(bytes, maxChars = MAX_ATTACHMENT_TEXT_CHARS * 2) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safe.length || safe.length < 4) return '';

    const lines = [];
    let current = '';
    let total = 0;
    const pushCurrent = () => {
      const normalized = normalizeExtractedAttachmentText(current);
      if (normalized.length >= 8) {
        lines.push(normalized);
        total += normalized.length + 1;
      }
      current = '';
    };

    for (let index = 0; index + 1 < safe.length; index += 2) {
      const codePoint = safe[index] | (safe[index + 1] << 8);
      const isPrintable = codePoint >= 32 && codePoint <= 126;
      const isBreak = codePoint === 10 || codePoint === 13 || codePoint === 9;
      if (isPrintable || isBreak) {
        current += String.fromCharCode(codePoint);
      } else if (current) {
        pushCurrent();
      }

      if (total >= maxChars || lines.length >= 120) break;
    }

    if (current && total < maxChars && lines.length < 120) {
      pushCurrent();
    }

    return lines.join('\n');
  }

  function collectPrintableBinaryStringsSmart(bytes, maxChars = MAX_ATTACHMENT_TEXT_CHARS * 2) {
    const asciiText = collectPrintableBinaryStrings(bytes, Math.max(200, Math.floor(maxChars * 0.7)));
    const utf16Text = collectPrintableUtf16LeStrings(bytes, Math.max(200, Math.floor(maxChars * 0.6)));
    const merged = normalizeExtractedAttachmentText([asciiText, utf16Text].filter(Boolean).join('\n'));
    if (!merged) return '';

    const unique = [];
    const seen = new Set();
    merged.split('\n').forEach(line => {
      const normalized = normalizeExtractedAttachmentText(line);
      if (!normalized) return;
      if (seen.has(normalized)) return;
      seen.add(normalized);
      unique.push(normalized);
    });

    return unique.join('\n');
  }

  async function loadSevenZipRuntime() {
    if (sevenZipRuntimePromise) return sevenZipRuntimePromise;
    sevenZipRuntimePromise = (async () => {
      const mod = await import('/node_modules/7z-wasm/7zz.es6.js')
        .catch(() => import('https://cdn.jsdelivr.net/npm/7z-wasm@1.2.0/7zz.es6.js'));
      const factory = mod?.default;
      if (typeof factory !== 'function') {
        throw new Error('7z-wasm indisponivel para extracao local.');
      }
      const runtime = await factory({
        print: () => {},
        printErr: () => {},
      });
      return runtime;
    })().catch(error => {
      sevenZipRuntimePromise = null;
      throw error;
    });
    return sevenZipRuntimePromise;
  }

  function sevenZipModeIsDirectory(modeValue) {
    const mode = Number(modeValue || 0);
    return (mode & 0o170000) === 0o040000;
  }

  function ensureSevenZipDirectory(fs, dirPath) {
    const segments = String(dirPath || '')
      .split('/')
      .filter(Boolean);
    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      try {
        fs.mkdir(currentPath);
      } catch (error) {
        // ignore if exists
      }
    }
  }

  function removeSevenZipPath(fs, targetPath) {
    const safePath = String(targetPath || '').trim();
    if (!safePath || safePath === '/') return;
    let stat;
    try {
      stat = fs.stat(safePath);
    } catch (error) {
      return;
    }
    if (sevenZipModeIsDirectory(stat?.mode)) {
      let names = [];
      try {
        names = fs.readdir(safePath);
      } catch (error) {
        names = [];
      }
      names.forEach(name => {
        if (name === '.' || name === '..') return;
        removeSevenZipPath(fs, `${safePath}/${name}`);
      });
      try {
        fs.rmdir(safePath);
      } catch (error) {}
      return;
    }
    try {
      fs.unlink(safePath);
    } catch (error) {}
  }

  function listSevenZipFiles(fs, rootPath, depth = 0, output = []) {
    if (depth > 8 || output.length >= MAX_ARCHIVE_ENTRIES * 6) return output;
    let names = [];
    try {
      names = fs.readdir(rootPath);
    } catch (error) {
      return output;
    }
    names.forEach(name => {
      if (name === '.' || name === '..') return;
      const fullPath = `${rootPath}/${name}`;
      let stat;
      try {
        stat = fs.stat(fullPath);
      } catch (error) {
        return;
      }
      if (sevenZipModeIsDirectory(stat?.mode)) {
        listSevenZipFiles(fs, fullPath, depth + 1, output);
        return;
      }
      output.push(fullPath);
    });
    return output;
  }

  function sanitizeSevenZipPathToken(value, fallback = 'file') {
    const safe = String(value || '')
      .replace(/[^a-z0-9._-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 44);
    return safe || fallback;
  }

  async function extractTextWithSevenZip(bytes, extension) {
    const safeBytes = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safeBytes.length) return '';
    const runtime = await loadSevenZipRuntime();
    const fs = runtime?.FS;
    if (!fs || typeof runtime?.callMain !== 'function') return '';

    const ext = sanitizeSevenZipPathToken(extension || 'bin', 'bin');
    const token = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const rootPath = `/liz-extract-${token}`;
    const outPath = `${rootPath}/out`;
    const inputPath = `${rootPath}/input.${ext}`;

    ensureSevenZipDirectory(fs, outPath);
    try {
      fs.writeFile(inputPath, safeBytes);
      try {
        runtime.callMain([
          'x',
          inputPath,
          `-o${outPath}`,
          '-y',
          '-bd',
          '-bso0',
          '-bse0',
          '-bb0',
        ]);
      } catch (error) {
        // extraction failure fallback below
      }

      const filePaths = listSevenZipFiles(fs, outPath, 0, []);
      if (filePaths.length === 0) {
        return collectPrintableBinaryStringsSmart(safeBytes, MAX_ATTACHMENT_TEXT_CHARS * 2);
      }

      const blocks = [];
      let remainingChars = MAX_ATTACHMENT_TEXT_CHARS;
      for (const filePath of filePaths) {
        if (remainingChars < 140) break;
        let entryBytes = new Uint8Array();
        try {
          const loaded = fs.readFile(filePath);
          entryBytes = loaded instanceof Uint8Array ? loaded : toUint8Array(loaded);
        } catch (error) {
          entryBytes = new Uint8Array();
        }
        if (!entryBytes.length) continue;
        if (entryBytes.length > MAX_ARCHIVE_ENTRY_BYTES * 4) continue;

        const relativePath = String(filePath || '')
          .replace(`${outPath}/`, '')
          .replace(/^\/+/, '');
        const entryExtension = resolveFileExtension(relativePath);

        let extracted = '';
        if (entryExtension === 'xml') {
          extracted = xmlToReadableText(decodeBytesUtf8OrLatin1(entryBytes));
        } else if (entryExtension === 'xls' || entryExtension === 'xlsx') {
          extracted = await extractTextFromSpreadsheetBytes(entryBytes, entryExtension);
        } else if (isLikelyTextEntryExtension(entryExtension)) {
          extracted = normalizeExtractedAttachmentText(decodeBytesUtf8OrLatin1(entryBytes));
        } else {
          extracted = normalizeExtractedAttachmentText(
            collectPrintableBinaryStringsSmart(entryBytes, MAX_ATTACHMENT_PROMPT_CHARS * 2),
          );
        }
        if (!extracted) continue;

        const snippetLimit = Math.min(
          MAX_ATTACHMENT_PROMPT_CHARS,
          Math.max(0, remainingChars - 90),
        );
        if (snippetLimit <= 0) break;
        const snippet = extracted.length > snippetLimit
          ? `${extracted.slice(0, Math.max(0, snippetLimit - 3)).trimEnd()}...`
          : extracted;
        if (!snippet) continue;
        const block = `[7Z: ${relativePath || 'entrada'}]\n${snippet}`;
        blocks.push(block);
        remainingChars -= block.length + 2;
      }

      const combined = normalizeExtractedAttachmentText(blocks.join('\n\n'));
      if (combined) return combined;
      return collectPrintableBinaryStringsSmart(safeBytes, MAX_ATTACHMENT_TEXT_CHARS * 2);
    } finally {
      removeSevenZipPath(fs, rootPath);
    }
  }

  async function loadXlsxModule() {
    if (xlsxModulePromise) return xlsxModulePromise;
    xlsxModulePromise = import('/node_modules/xlsx/xlsx.mjs')
      .catch(() => import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm'))
      .then(mod => mod?.default || mod)
      .catch(error => {
        xlsxModulePromise = null;
        throw error;
      });
    return xlsxModulePromise;
  }

  async function extractTextFromSpreadsheetBytes(bytes, extension) {
    const safeBytes = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safeBytes.length) return '';
    const ext = String(extension || '').trim().toLowerCase();
    if (ext !== 'xls' && ext !== 'xlsx') return '';
    try {
      const XLSX = await loadXlsxModule();
      const workbook = XLSX.read(safeBytes, {
        type: 'array',
        cellText: true,
        dense: false,
      });
      const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames.slice(0, 12) : [];
      if (sheetNames.length === 0) return '';

      const blocks = [];
      for (const sheetName of sheetNames) {
        const sheet = workbook?.Sheets?.[sheetName];
        if (!sheet) continue;
        const csvText = String(XLSX.utils.sheet_to_csv(sheet, { blankrows: false }) || '').trim();
        if (!csvText) continue;
        blocks.push(`[Planilha: ${sheetName}]\n${csvText}`);
      }
      return normalizeExtractedAttachmentText(blocks.join('\n\n'));
    } catch (error) {
      return '';
    }
  }

  async function loadTesseractWorker() {
    if (tesseractWorkerPromise) return tesseractWorkerPromise;
    tesseractWorkerPromise = (async () => {
      let workerPath = '/node_modules/tesseract.js/dist/worker.min.js';
      const mod = await import('/node_modules/tesseract.js/dist/tesseract.esm.min.js')
        .catch(() => {
          workerPath = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js';
          return import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
        });
      const createWorker = mod?.createWorker || mod?.default?.createWorker || mod?.default;
      if (typeof createWorker !== 'function') {
        throw new Error('OCR indisponivel no navegador.');
      }
      const worker = await createWorker('por+eng', 1, {
        logger: () => {},
        workerPath,
      });
      return worker;
    })().catch(error => {
      tesseractWorkerPromise = null;
      throw error;
    });
    return tesseractWorkerPromise;
  }

  async function extractImageOcrText(imageSource, maxChars = MAX_ATTACHMENT_TEXT_CHARS) {
    try {
      const worker = await loadTesseractWorker();
      const result = await withTimeout(
        worker.recognize(imageSource, {}, { text: true }),
        ADVANCED_EXTRACTION_TIMEOUT_MS,
        null,
      );
      const raw = String(result?.data?.text || '').trim();
      if (!raw) return '';
      const normalized = normalizeExtractedAttachmentText(raw);
      const clamped = clampTextForAttachment(normalized, maxChars);
      return clamped.text;
    } catch (error) {
      return '';
    }
  }

  async function loadAsrPipeline() {
    if (asrPipelinePromise) return asrPipelinePromise;
    asrPipelinePromise = (async () => {
      let wasmPath = '/node_modules/@xenova/transformers/dist/';
      const module = await import('/node_modules/@xenova/transformers/src/transformers.js')
        .catch(() => {
          wasmPath = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
          return import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
        });
      if (module?.env?.backends?.onnx?.wasm) {
        module.env.backends.onnx.wasm.wasmPaths = wasmPath;
      }
      if (module?.env) {
        module.env.allowRemoteModels = true;
      }
      if (typeof module?.pipeline !== 'function') {
        throw new Error('Pipeline de transcricao indisponivel.');
      }
      return module.pipeline('automatic-speech-recognition', WHISPER_MODEL_ID);
    })().catch(error => {
      asrPipelinePromise = null;
      throw error;
    });
    return asrPipelinePromise;
  }

  async function extractSpeechTextFromMediaFile(file, metadata) {
    if (!file) return '';
    const fileSize = Math.max(0, Number(file.size || 0) || 0);
    if (fileSize <= 0 || fileSize > MEDIA_TRANSCRIPTION_MAX_FILE_BYTES) return '';

    const durationSeconds = Number(metadata?.duration || 0);
    if (durationSeconds > MEDIA_TRANSCRIPTION_MAX_SECONDS) return '';

    const url = URL.createObjectURL(file);
    try {
      const pipeline = await loadAsrPipeline();
      const output = await withTimeout(
        pipeline(url, {
          chunk_length_s: 22,
          stride_length_s: 4,
          task: 'transcribe',
          language: 'portuguese',
          return_timestamps: false,
        }),
        ADVANCED_EXTRACTION_TIMEOUT_MS,
        null,
      );
      const text = normalizeExtractedAttachmentText(
        String(output?.text || output?.generated_text || '').trim(),
      );
      if (!text) return '';
      const clamped = clampTextForAttachment(text, MAX_ATTACHMENT_TEXT_CHARS);
      return clamped.text;
    } catch (error) {
      return '';
    } finally {
      try { URL.revokeObjectURL(url); } catch (error) {}
    }
  }

  function readUint16LE(bytes, offset) {
    if (!bytes || offset < 0 || offset + 2 > bytes.length) return 0;
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function readUint32LE(bytes, offset) {
    if (!bytes || offset < 0 || offset + 4 > bytes.length) return 0;
    return (
      (bytes[offset])
      | (bytes[offset + 1] << 8)
      | (bytes[offset + 2] << 16)
      | (bytes[offset + 3] << 24)
    ) >>> 0;
  }

  function decodeBytesUtf8OrLatin1(bytes) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safe.length) return '';

    let utf8Text = '';
    try {
      utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(safe);
    } catch (error) {
      utf8Text = '';
    }

    if (!utf8Text) {
      try {
        return new TextDecoder('latin1', { fatal: false }).decode(safe);
      } catch (error) {
        return '';
      }
    }

    const replacementCount = (utf8Text.match(/\uFFFD/g) || []).length;
    if (replacementCount > Math.max(4, Math.floor(utf8Text.length * 0.08))) {
      try {
        const latinText = new TextDecoder('latin1', { fatal: false }).decode(safe);
        if (latinText) return latinText;
      } catch (error) {
        // fallback utf-8 below
      }
    }
    return utf8Text;
  }

  function isTextLikeMimeType(mimeType) {
    const safeMime = String(mimeType || '').trim().toLowerCase();
    if (!safeMime) return false;
    if (safeMime.startsWith('text/')) return true;
    if (safeMime === 'application/json') return true;
    if (safeMime === 'application/xml') return true;
    if (safeMime === 'application/javascript') return true;
    if (safeMime === 'application/x-javascript') return true;
    if (safeMime === 'application/typescript') return true;
    if (safeMime === 'application/x-sh') return true;
    if (safeMime === 'application/x-httpd-php') return true;
    if (safeMime.endsWith('+json')) return true;
    if (safeMime.endsWith('+xml')) return true;
    return false;
  }

  function isPdfAttachmentMimeOrExt(mimeType, extension) {
    return String(mimeType || '').trim().toLowerCase() === 'application/pdf' || extension === 'pdf';
  }

  function isArchiveAttachment(mimeType, extension) {
    if (SEVEN_ZIP_EXTRACTION_EXTENSIONS.has(extension)) return true;
    const safeMime = String(mimeType || '').trim().toLowerCase();
    return safeMime === 'application/zip'
      || safeMime === 'application/x-zip-compressed'
      || safeMime === 'application/x-tar'
      || safeMime === 'application/gzip'
      || safeMime === 'application/x-gzip'
      || safeMime === 'application/vnd.rar'
      || safeMime === 'application/x-7z-compressed'
      || safeMime === 'application/x-msdownload'
      || safeMime === 'application/x-iso9660-image';
  }

  function isAudioAttachment(mimeType, extension) {
    if (AUDIO_ATTACHMENT_EXTENSIONS.has(extension)) return true;
    const safeMime = String(mimeType || '').trim().toLowerCase();
    return safeMime.startsWith('audio/');
  }

  function isVideoAttachment(mimeType, extension) {
    if (VIDEO_ATTACHMENT_EXTENSIONS.has(extension)) return true;
    const safeMime = String(mimeType || '').trim().toLowerCase();
    return safeMime.startsWith('video/');
  }

  function isImageMimeOrExt(mimeType, extension) {
    if (IMAGE_ATTACHMENT_EXTENSIONS.has(extension)) return true;
    const safeMime = String(mimeType || '').trim().toLowerCase();
    return safeMime.startsWith('image/');
  }

  function normalizeExtractedAttachmentText(text) {
    return String(text || '')
      .replace(/\u0000/g, '')
      .replace(/\r\n?/g, '\n')
      .replace(/\f/g, '\n')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }

  function clampTextForAttachment(text, maxChars) {
    const safe = String(text || '');
    if (safe.length <= maxChars) {
      return { text: safe, truncated: false };
    }
    return {
      text: safe.slice(0, Math.max(0, maxChars - 3)).trimEnd().concat('...'),
      truncated: true,
    };
  }

  function decodePdfLiteralText(literalText) {
    return String(literalText || '')
      .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '')
      .replace(/\\f/g, '')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\./g, '');
  }

  function extractReadableTextFromPdfRaw(rawPdfText) {
    const source = String(rawPdfText || '');
    if (!source) return '';

    const snippets = [];
    let snippetsLength = 0;
    const pushSnippet = value => {
      const clean = normalizeExtractedAttachmentText(value);
      if (!clean) return;
      snippets.push(clean);
      snippetsLength += clean.length + 1;
    };

    const literalRegex = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
    let literalMatch;
    while ((literalMatch = literalRegex.exec(source)) !== null) {
      pushSnippet(decodePdfLiteralText(literalMatch[1]));
      if (snippetsLength >= MAX_ATTACHMENT_TEXT_CHARS * 2) {
        break;
      }
    }

    const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch;
    while ((arrayMatch = arrayRegex.exec(source)) !== null) {
      const body = arrayMatch[1];
      const innerLiteralRegex = /\(((?:\\.|[^\\()])*)\)/g;
      let innerMatch;
      while ((innerMatch = innerLiteralRegex.exec(body)) !== null) {
        pushSnippet(decodePdfLiteralText(innerMatch[1]));
      }
      if (snippetsLength >= MAX_ATTACHMENT_TEXT_CHARS * 2) {
        break;
      }
    }

    if (snippets.length === 0) {
      const fallback = source.match(/[A-Za-z0-9][A-Za-z0-9 \t.,;:!?()[\]{}'"@#%&*+=_\/\\|-]{24,}/g) || [];
      fallback.slice(0, 40).forEach(value => pushSnippet(value));
    }

    return snippets.join('\n');
  }

  function decodeXmlEntities(text) {
    return String(text || '')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, '\'')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
        const codePoint = parseInt(hex, 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
      })
      .replace(/&#(\d+);/g, (_, dec) => {
        const codePoint = parseInt(dec, 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
      });
  }

  function xmlToReadableText(xmlText) {
    const safeXml = String(xmlText || '');
    if (!safeXml) return '';
    return normalizeExtractedAttachmentText(
      decodeXmlEntities(
        safeXml
          .replace(/<w:tab[^>]*\/>/gi, ' ')
          .replace(/<w:br[^>]*\/>/gi, '\n')
          .replace(/<\/(w:p|p|div|li|h[1-6]|tr|row|table|worksheet|sheetData)>/gi, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, ' '),
      ),
    );
  }

  async function inflateRawBytes(dataBytes) {
    if (typeof DecompressionStream !== 'function') return null;
    try {
      const stream = new Blob([dataBytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch (error) {
      return null;
    }
  }

  async function gunzipBytes(dataBytes) {
    if (typeof DecompressionStream !== 'function') return null;
    try {
      const stream = new Blob([dataBytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch (error) {
      return null;
    }
  }

  function collectPrintableBinaryStrings(bytes, maxChars = MAX_ATTACHMENT_TEXT_CHARS * 2) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safe.length) return '';

    const chunks = [];
    let current = '';
    let totalChars = 0;

    const pushCurrent = () => {
      const normalized = normalizeExtractedAttachmentText(current);
      if (normalized.length >= 18) {
        chunks.push(normalized);
        totalChars += normalized.length + 1;
      }
      current = '';
    };

    for (let i = 0; i < safe.length; i += 1) {
      const code = safe[i];
      const isAsciiPrintable = code >= 32 && code <= 126;
      const isWhitespace = code === 9 || code === 10 || code === 13;
      if (isAsciiPrintable || isWhitespace) {
        current += String.fromCharCode(code);
      } else if (current.length > 0) {
        pushCurrent();
      }

      if (totalChars >= maxChars || chunks.length >= 80) {
        break;
      }
    }

    if (current.length > 0 && totalChars < maxChars && chunks.length < 80) {
      pushCurrent();
    }

    return chunks.join('\n');
  }

  function isLikelyTextEntryExtension(entryExtension) {
    const ext = String(entryExtension || '').trim().toLowerCase();
    if (!ext) return false;
    if (TEXT_ATTACHMENT_EXTENSIONS.has(ext)) return true;
    return ext === 'xml'
      || ext === 'svg'
      || ext === 'yaml'
      || ext === 'yml';
  }

  async function parseZipEntries(bytes) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    const entries = [];
    if (safe.length < 30) return entries;

    let offset = 0;
    let guard = 0;
    while (offset + 4 <= safe.length && entries.length < MAX_ARCHIVE_ENTRIES) {
      guard += 1;
      if (guard > 600000) break;

      const signature = readUint32LE(safe, offset);
      if (signature === 0x02014b50 || signature === 0x06054b50) {
        break;
      }
      if (signature !== 0x04034b50) {
        offset += 1;
        continue;
      }

      if (offset + 30 > safe.length) break;
      const flags = readUint16LE(safe, offset + 6);
      const compressionMethod = readUint16LE(safe, offset + 8);
      const compressedSize = readUint32LE(safe, offset + 18);
      const fileNameLength = readUint16LE(safe, offset + 26);
      const extraFieldLength = readUint16LE(safe, offset + 28);

      const fileNameStart = offset + 30;
      const fileNameEnd = fileNameStart + fileNameLength;
      if (fileNameEnd > safe.length) break;
      const entryName = decodeBytesUtf8OrLatin1(safe.slice(fileNameStart, fileNameEnd))
        .replace(/\u0000/g, '')
        .trim();

      const dataStart = fileNameEnd + extraFieldLength;
      if (dataStart > safe.length) break;

      if ((flags & 0x08) !== 0) {
        // Arquivo zip com data descriptor: sem tamanho no header local.
        // Mantemos compativel com parser simples evitando falso positivo.
        break;
      }

      const dataEnd = dataStart + compressedSize;
      if (dataEnd > safe.length) break;
      const rawData = safe.slice(dataStart, dataEnd);

      let decodedBytes = null;
      if (compressionMethod === 0) {
        decodedBytes = rawData;
      } else if (compressionMethod === 8) {
        decodedBytes = await inflateRawBytes(rawData);
      }

      entries.push({
        name: entryName,
        compressionMethod,
        data: decodedBytes,
      });

      offset = dataEnd;
    }

    return entries;
  }

  function decodeTarTextField(bytes) {
    const raw = decodeBytesUtf8OrLatin1(bytes).replace(/\u0000/g, '');
    return String(raw || '').trim();
  }

  function parseTarEntries(bytes) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    const entries = [];
    if (safe.length < 512) return entries;

    let offset = 0;
    while (offset + 512 <= safe.length && entries.length < MAX_ARCHIVE_ENTRIES) {
      const header = safe.slice(offset, offset + 512);
      const isEmptyHeader = header.every(value => value === 0);
      if (isEmptyHeader) break;

      const baseName = decodeTarTextField(header.slice(0, 100));
      const prefix = decodeTarTextField(header.slice(345, 500));
      const name = prefix ? `${prefix}/${baseName}` : baseName;
      const sizeOctal = decodeTarTextField(header.slice(124, 136)).replace(/\0/g, '').trim();
      const size = parseInt(sizeOctal || '0', 8);
      const typeFlag = String.fromCharCode(header[156] || 0);

      const payloadStart = offset + 512;
      const payloadEnd = payloadStart + (Number.isFinite(size) ? size : 0);
      if (payloadEnd > safe.length) break;

      if ((typeFlag === '\0' || typeFlag === '0') && name) {
        entries.push({
          name,
          data: safe.slice(payloadStart, Math.min(payloadEnd, payloadStart + MAX_ARCHIVE_ENTRY_BYTES)),
        });
      }

      const alignedSize = Math.ceil((Number.isFinite(size) ? size : 0) / 512) * 512;
      offset = payloadStart + alignedSize;
    }

    return entries;
  }

  function looksLikeTarArchive(bytes) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (safe.length < 262) return false;
    const marker = decodeBytesUtf8OrLatin1(safe.slice(257, 262));
    return marker === 'ustar';
  }

  function buildArchiveContextFromEntries(entries, originLabel) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    if (safeEntries.length === 0) return '';

    const blocks = [];
    let remainingChars = MAX_ATTACHMENT_TEXT_CHARS;
    for (const entry of safeEntries) {
      if (!entry || !entry.name || !(entry.data instanceof Uint8Array)) continue;
      if (remainingChars < 120) break;

      const extension = resolveFileExtension(entry.name);
      if (!isLikelyTextEntryExtension(extension)) continue;

      const rawText = decodeBytesUtf8OrLatin1(entry.data);
      const normalized = extension === 'xml'
        ? xmlToReadableText(rawText)
        : normalizeExtractedAttachmentText(rawText);
      if (!normalized) continue;

      const snippetLimit = Math.min(MAX_ATTACHMENT_PROMPT_CHARS, Math.max(0, remainingChars - 80));
      if (snippetLimit <= 0) break;
      const snippet = normalized.length > snippetLimit
        ? `${normalized.slice(0, Math.max(0, snippetLimit - 3)).trimEnd()}...`
        : normalized;
      const block = `[${originLabel}: ${entry.name}]\n${snippet}`;
      blocks.push(block);
      remainingChars -= block.length + 2;
    }

    return normalizeExtractedAttachmentText(blocks.join('\n\n'));
  }

  function extractOoxmlContent(extension, zipEntries) {
    const safeEntries = Array.isArray(zipEntries) ? zipEntries : [];
    if (safeEntries.length === 0) return '';

    if (extension === 'docx') {
      const targets = safeEntries
        .filter(entry => /^word\/(document|header\d+|footer\d+)\.xml$/i.test(String(entry.name || '')))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      const chunks = targets
        .map(entry => xmlToReadableText(decodeBytesUtf8OrLatin1(entry.data)))
        .filter(Boolean);
      return normalizeExtractedAttachmentText(chunks.join('\n\n'));
    }

    if (extension === 'pptx') {
      const slides = safeEntries
        .filter(entry => /^ppt\/slides\/slide\d+\.xml$/i.test(String(entry.name || '')))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
      const chunks = slides
        .map((entry, index) => {
          const text = xmlToReadableText(decodeBytesUtf8OrLatin1(entry.data));
          if (!text) return '';
          return `[Slide ${index + 1}]\n${text}`;
        })
        .filter(Boolean);
      return normalizeExtractedAttachmentText(chunks.join('\n\n'));
    }

    if (extension === 'xlsx') {
      const sharedEntry = safeEntries.find(entry => String(entry.name || '').toLowerCase() === 'xl/sharedstrings.xml');
      const sharedText = sharedEntry
        ? xmlToReadableText(decodeBytesUtf8OrLatin1(sharedEntry.data))
        : '';
      const sheetEntries = safeEntries
        .filter(entry => /^xl\/worksheets\/sheet\d+\.xml$/i.test(String(entry.name || '')))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
      const sheetChunks = sheetEntries
        .map((entry, index) => {
          const text = xmlToReadableText(decodeBytesUtf8OrLatin1(entry.data));
          if (!text) return '';
          return `[Planilha ${index + 1}]\n${text}`;
        })
        .filter(Boolean);
      return normalizeExtractedAttachmentText(
        [
          sharedText ? '[SharedStrings]\n' + sharedText : '',
          sheetChunks.join('\n\n'),
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
    }

    return '';
  }

  async function extractTextFromArchiveBytes(bytes, extension) {
    const safe = bytes instanceof Uint8Array ? bytes : toUint8Array(bytes);
    if (!safe.length) return '';
    const ext = String(extension || '').trim().toLowerCase();

    if (ext === 'xls' || ext === 'xlsx') {
      const spreadsheetText = await extractTextFromSpreadsheetBytes(safe, ext);
      if (spreadsheetText) return spreadsheetText;
    }

    if (ext === 'tar') {
      const tarEntries = parseTarEntries(safe);
      return buildArchiveContextFromEntries(tarEntries, 'TAR');
    }

    if (ext === 'gz' || ext === 'tgz') {
      const ungzipped = await gunzipBytes(safe);
      if (!(ungzipped instanceof Uint8Array) || ungzipped.length === 0) {
        const sevenZipFallback = await withTimeout(
          extractTextWithSevenZip(safe, ext || 'gz'),
          ADVANCED_EXTRACTION_TIMEOUT_MS,
          '',
        );
        return sevenZipFallback || collectPrintableBinaryStringsSmart(safe);
      }
      if (looksLikeTarArchive(ungzipped)) {
        const tarEntries = parseTarEntries(ungzipped);
        return buildArchiveContextFromEntries(tarEntries, 'TAR.GZ');
      }
      const plainText = normalizeExtractedAttachmentText(decodeBytesUtf8OrLatin1(ungzipped));
      return plainText || collectPrintableBinaryStringsSmart(ungzipped);
    }

    const zipEntries = await parseZipEntries(safe);
    if (zipEntries.length > 0) {
      const ooxmlText = extractOoxmlContent(ext, zipEntries);
      if (ooxmlText) return ooxmlText;

      const zipText = buildArchiveContextFromEntries(zipEntries, 'ZIP');
      if (zipText) return zipText;
    }

    const shouldTrySevenZip = SEVEN_ZIP_EXTRACTION_EXTENSIONS.has(ext) || zipEntries.length === 0;
    if (shouldTrySevenZip) {
      const sevenZipText = await withTimeout(
        extractTextWithSevenZip(safe, ext || 'bin'),
        ADVANCED_EXTRACTION_TIMEOUT_MS,
        '',
      );
      if (sevenZipText) return sevenZipText;
    }

    return collectPrintableBinaryStringsSmart(safe);
  }

  function formatDurationLabel(secondsValue) {
    const safe = Number(secondsValue);
    if (!Number.isFinite(safe) || safe < 0) return '';
    const totalSeconds = Math.floor(safe);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async function readImageMetadataFromFile(file) {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    return new Promise(resolve => {
      const img = new Image();
      const timer = setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch (error) {}
        resolve(null);
      }, 7000);

      img.onload = () => {
        clearTimeout(timer);
        const payload = {
          width: Number(img.naturalWidth || 0),
          height: Number(img.naturalHeight || 0),
        };
        try { URL.revokeObjectURL(url); } catch (error) {}
        resolve(payload);
      };
      img.onerror = () => {
        clearTimeout(timer);
        try { URL.revokeObjectURL(url); } catch (error) {}
        resolve(null);
      };
      img.src = url;
    });
  }

  function buildImageContextText(file, mimeType, extension, metadata) {
    const safeName = String(file?.name || 'imagem').trim() || 'imagem';
    const safeMime = String(mimeType || '').trim() || 'application/octet-stream';
    const safeExt = String(extension || '').trim() || '-';
    const sizeBytes = Math.max(0, Number(file?.size || 0) || 0);

    const lines = [
      `[Imagem anexada: ${safeName}]`,
      `MIME: ${safeMime}`,
      `Extensao: .${safeExt}`,
      `Tamanho: ${sizeBytes} bytes`,
    ];

    const width = Math.max(0, Number(metadata?.width || 0) || 0);
    const height = Math.max(0, Number(metadata?.height || 0) || 0);
    if (width > 0 && height > 0) {
      lines.push(`Dimensoes: ${width}x${height}`);
    }
    lines.push('Resumo: analise automatica de metadados da imagem pronta.');
    return normalizeExtractedAttachmentText(lines.join('\n'));
  }

  async function readMediaMetadataFromFile(file, mediaKind) {
    if (!file) return null;
    const kind = mediaKind === 'video' ? 'video' : 'audio';
    const url = URL.createObjectURL(file);
    const element = document.createElement(kind);
    element.preload = 'metadata';
    element.muted = true;
    element.crossOrigin = 'anonymous';

    const cleanup = () => {
      try { element.pause?.(); } catch (error) {}
      try { element.removeAttribute('src'); } catch (error) {}
      try { element.load?.(); } catch (error) {}
      try { URL.revokeObjectURL(url); } catch (error) {}
    };

    return new Promise(resolve => {
      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 7000);

      element.onloadedmetadata = () => {
        clearTimeout(timer);
        const payload = {
          duration: Number(element.duration),
          width: kind === 'video' ? Number(element.videoWidth || 0) : 0,
          height: kind === 'video' ? Number(element.videoHeight || 0) : 0,
        };
        cleanup();
        resolve(payload);
      };
      element.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      };
      element.src = url;
      try { element.load?.(); } catch (error) {}
    });
  }

  function buildMediaContextText(file, mimeType, extension, mediaKind, metadata) {
    const safeName = String(file?.name || 'arquivo').trim() || 'arquivo';
    const safeMime = String(mimeType || '').trim() || 'application/octet-stream';
    const safeExt = String(extension || '').trim() || '-';
    const sizeBytes = Math.max(0, Number(file?.size || 0) || 0);

    const lines = [];
    if (mediaKind === 'audio') {
      lines.push(`[Audio anexado: ${safeName}]`);
    } else {
      lines.push(`[Video anexado: ${safeName}]`);
    }
    lines.push(`MIME: ${safeMime}`);
    lines.push(`Extensao: .${safeExt}`);
    lines.push(`Tamanho: ${sizeBytes} bytes`);

    const durationLabel = formatDurationLabel(metadata?.duration);
    if (durationLabel) {
      lines.push(`Duracao: ${durationLabel}`);
    }

    if (mediaKind === 'video') {
      const width = Math.max(0, Number(metadata?.width || 0) || 0);
      const height = Math.max(0, Number(metadata?.height || 0) || 0);
      if (width > 0 && height > 0) {
        lines.push(`Resolucao: ${width}x${height}`);
      }
      lines.push('Resumo: analise automatica de metadados do video pronta.');
    } else {
      lines.push('Resumo: analise automatica de metadados do audio pronta.');
    }

    return normalizeExtractedAttachmentText(lines.join('\n'));
  }

  async function extractTextFromAttachmentFile(file, mimeType) {
    const extension = resolveFileExtension(file?.name || '');
    const pdfLike = isPdfAttachmentMimeOrExt(mimeType, extension);
    const textLike = isTextLikeMimeType(mimeType) || TEXT_ATTACHMENT_EXTENSIONS.has(extension);
    const archiveLike = isArchiveAttachment(mimeType, extension);
    const audioLike = isAudioAttachment(mimeType, extension);
    const videoLike = isVideoAttachment(mimeType, extension);
    const imageLike = isImageMimeOrExt(mimeType, extension);

    try {
      if (pdfLike) {
        const wasByteTrimmed = Number(file?.size || 0) > MAX_PDF_ATTACHMENT_BYTES;
        const inputFile = wasByteTrimmed ? file.slice(0, MAX_PDF_ATTACHMENT_BYTES) : file;
        const rawBuffer = await readFileAsArrayBuffer(inputFile);
        const rawText = new TextDecoder('latin1', { fatal: false }).decode(rawBuffer);
        const extracted = normalizeExtractedAttachmentText(extractReadableTextFromPdfRaw(rawText));
        const clamped = clampTextForAttachment(extracted, MAX_ATTACHMENT_TEXT_CHARS);
        return {
          content: clamped.text,
          textKind: 'pdf',
          truncated: Boolean(wasByteTrimmed || clamped.truncated),
        };
      }

      if (imageLike) {
        const metadata = await readImageMetadataFromFile(file);
        const baseContext = buildImageContextText(file, mimeType, extension, metadata || {});
        const shouldRunOcr = Number(file?.size || 0) <= IMAGE_OCR_MAX_FILE_BYTES;
        const ocrText = shouldRunOcr
          ? await extractImageOcrText(file, Math.max(600, Math.floor(MAX_ATTACHMENT_TEXT_CHARS * 0.7)))
          : '';
        const contextText = ocrText
          ? `${baseContext}\n[OCR detectado]\n${ocrText}`
          : (shouldRunOcr
            ? `${baseContext}\n[OCR]\nNenhum texto visivel detectado na imagem.`
            : `${baseContext}\n[OCR]\nImagem muito grande para OCR automatico nesta etapa.`);
        const clamped = clampTextForAttachment(contextText, MAX_ATTACHMENT_TEXT_CHARS);
        return {
          content: clamped.text,
          textKind: 'image',
          truncated: clamped.truncated,
        };
      }

      if (archiveLike) {
        const wasByteTrimmed = Number(file?.size || 0) > MAX_ARCHIVE_ATTACHMENT_BYTES;
        const inputFile = wasByteTrimmed ? file.slice(0, MAX_ARCHIVE_ATTACHMENT_BYTES) : file;
        const rawBuffer = await readFileAsArrayBuffer(inputFile);
        const rawBytes = toUint8Array(rawBuffer);
        const extracted = normalizeExtractedAttachmentText(
          await extractTextFromArchiveBytes(rawBytes, extension),
        );
        const clamped = clampTextForAttachment(extracted, MAX_ATTACHMENT_TEXT_CHARS);
        return {
          content: clamped.text,
          textKind: 'archive',
          truncated: Boolean(wasByteTrimmed || clamped.truncated),
        };
      }

      if (audioLike || videoLike) {
        const mediaKind = videoLike ? 'video' : 'audio';
        const metadata = await readMediaMetadataFromFile(file, mediaKind);
        const wasByteTrimmed = Number(file?.size || 0) > MAX_BINARY_FALLBACK_BYTES;
        const inputFile = wasByteTrimmed ? file.slice(0, MAX_BINARY_FALLBACK_BYTES) : file;
        const rawBuffer = await readFileAsArrayBuffer(inputFile);
        const binaryHints = normalizeExtractedAttachmentText(
          collectPrintableBinaryStringsSmart(toUint8Array(rawBuffer), 1800),
        );
        const baseContext = buildMediaContextText(file, mimeType, extension, mediaKind, metadata || {});
        const transcriptText = await extractSpeechTextFromMediaFile(file, metadata || {});
        let containerHints = '';
        if (!transcriptText) {
          const deepTrimmed = Number(file?.size || 0) > MAX_ARCHIVE_ATTACHMENT_BYTES;
          const deepFile = deepTrimmed ? file.slice(0, MAX_ARCHIVE_ATTACHMENT_BYTES) : file;
          const deepBuffer = await readFileAsArrayBuffer(deepFile);
          containerHints = normalizeExtractedAttachmentText(
            await withTimeout(
              extractTextWithSevenZip(toUint8Array(deepBuffer), extension || mediaKind),
              ADVANCED_EXTRACTION_TIMEOUT_MS,
              '',
            ),
          );
        }
        const contextChunks = [baseContext];
        if (transcriptText) {
          contextChunks.push(`[Transcricao detectada]\n${transcriptText}`);
        } else {
          contextChunks.push('[Transcricao]\nNao foi possivel transcrever fala automaticamente neste arquivo.');
        }
        if (containerHints) {
          contextChunks.push(`[Analise de container]\n${containerHints}`);
        }
        if (binaryHints) {
          contextChunks.push(`[Trechos textuais detectados]\n${binaryHints}`);
        }
        const contextText = normalizeExtractedAttachmentText(contextChunks.join('\n\n'));
        const clamped = clampTextForAttachment(contextText, MAX_ATTACHMENT_TEXT_CHARS);
        return {
          content: clamped.text,
          textKind: mediaKind,
          truncated: Boolean(wasByteTrimmed || clamped.truncated),
        };
      }

      const wasByteTrimmed = Number(file?.size || 0) > MAX_TEXT_ATTACHMENT_BYTES;
      const inputFile = wasByteTrimmed ? file.slice(0, MAX_TEXT_ATTACHMENT_BYTES) : file;
      let rawText = '';
      if (textLike) {
        rawText = await readFileAsText(inputFile);
        if (!rawText && Number(inputFile?.size || 0) > 0) {
          const rawBuffer = await readFileAsArrayBuffer(inputFile);
          rawText = decodeBytesUtf8OrLatin1(toUint8Array(rawBuffer));
        }
      } else {
        const fallbackBuffer = await readFileAsArrayBuffer(inputFile);
        rawText = collectPrintableBinaryStringsSmart(
          toUint8Array(fallbackBuffer),
          MAX_ATTACHMENT_TEXT_CHARS * 2,
        );
      }

      const extracted = normalizeExtractedAttachmentText(rawText);
      const clamped = clampTextForAttachment(extracted, MAX_ATTACHMENT_TEXT_CHARS);
      return {
        content: clamped.text,
        textKind: textLike ? 'text' : 'binary',
        truncated: Boolean(wasByteTrimmed || clamped.truncated),
      };
    } catch (error) {
      return {
        content: '',
        textKind: pdfLike
          ? 'pdf'
          : (imageLike ? 'image' : (archiveLike ? 'archive' : (audioLike ? 'audio' : (videoLike ? 'video' : 'text')))),
        truncated: false,
      };
    }
  }

  function isImageAttachment(attachment) {
    if (attachment?.isImage) return true;
    const source = String(attachment?.dataUrl || '').trim();
    const looksLikeImageSource =
      source.startsWith('data:image/')
      || source.startsWith('blob:')
      || /^https?:\/\//i.test(source);

    return Boolean(
      attachment
      && looksLikeImageSource,
    );
  }

  function resolveAttachmentExt(name, mimeType) {
    const safeName = String(name || '').trim();
    const fromName = safeName.includes('.') ? safeName.split('.').pop() : '';
    const normalizedFromName = String(fromName || '')
      .replace(/[^a-z0-9]/gi, '')
      .toUpperCase();
    if (normalizedFromName) {
      return normalizedFromName.slice(0, 5);
    }

    const mimeToken = String(mimeType || '').trim().toLowerCase().split('/')[1] || '';
    const normalizedFromMime = mimeToken
      .split(/[+;.-]/)[0]
      ?.replace(/[^a-z0-9]/gi, '')
      .toUpperCase();
    if (normalizedFromMime) {
      return normalizedFromMime.slice(0, 5);
    }

    return 'FILE';
  }

  function createAttachmentGrid(attachments) {
    const grid = document.createElement('div');
    grid.className = 'message-media-grid';

    attachments.forEach(attachment => {
      const item = document.createElement('div');
      if (isImageAttachment(attachment)) {
        item.className = 'message-media-item';

        const img = document.createElement('img');
        img.className = 'message-media-img';
        img.src = attachment.dataUrl;
        img.alt = attachment.name || 'Imagem anexada';
        img.loading = 'lazy';
        img.addEventListener('click', () => {
          openImagePreview(attachment.dataUrl, attachment.name || 'Imagem anexada');
        });
        item.appendChild(img);
      } else {
        item.className = 'message-media-file';

        const ext = document.createElement('span');
        ext.className = 'message-media-file-ext';
        ext.textContent = resolveAttachmentExt(attachment?.name || '', attachment?.mimeType || '');

        const name = document.createElement('span');
        name.className = 'message-media-file-name';
        name.textContent = String(attachment?.name || 'arquivo');
        name.title = name.textContent;

        item.appendChild(ext);
        item.appendChild(name);
      }

      grid.appendChild(item);
    });

    return grid;
  }

  function createPendingAttachmentItem(attachment) {
    const item = document.createElement('div');
    item.className = 'chat-attachment-item';

    if (isImageAttachment(attachment)) {
      const img = document.createElement('img');
      img.className = 'chat-attachment-thumb';
      img.src = attachment.dataUrl;
      img.alt = attachment.name || 'Imagem anexada';
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        openImagePreview(attachment.dataUrl, attachment.name || 'Imagem anexada');
      });
      item.appendChild(img);
    } else {
      const file = document.createElement('div');
      file.className = 'chat-attachment-file';

      const ext = document.createElement('span');
      ext.className = 'chat-attachment-file-ext';
      ext.textContent = resolveAttachmentExt(attachment?.name || '', attachment?.mimeType || '');

      const name = document.createElement('span');
      name.className = 'chat-attachment-file-name';
      name.textContent = String(attachment?.name || 'arquivo');
      name.title = name.textContent;

      file.appendChild(ext);
      file.appendChild(name);
      item.appendChild(file);
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'chat-attachment-remove';
    remove.setAttribute('aria-label', `Remover ${attachment.name || 'arquivo'}`);
    remove.textContent = 'x';

    remove.addEventListener('click', () => {
      conversationState.pendingAttachments = conversationState.pendingAttachments.filter(
        currentAttachment => currentAttachment.id !== attachment.id,
      );
      renderPendingAttachments();
    });

    item.appendChild(remove);
    return item;
  }

  function renderPendingAttachments() {
    const tray = conversationState.chatAttachmentTray;
    if (!tray) return;

    tray.innerHTML = '';
    if (conversationState.pendingAttachments.length === 0) {
      tray.classList.remove('has-files');
      return;
    }

    const fragment = document.createDocumentFragment();
    conversationState.pendingAttachments.forEach(attachment => {
      fragment.appendChild(createPendingAttachmentItem(attachment));
    });

    tray.appendChild(fragment);
    tray.classList.add('has-files');
  }

  function getImageFiles(files) {
    return Array.from(files || []).filter(file => String(file.type || '').startsWith('image/'));
  }

  function getImageFilesFromClipboard(event) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return [];

    const itemImages = Array.from(clipboardData.items || [])
      .filter(item => item.kind === 'file' && String(item.type || '').startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean);

    if (itemImages.length > 0) {
      return itemImages;
    }

    return getImageFiles(clipboardData.files || []);
  }

  async function addFilesToPending(files) {
    const inputFiles = Array.from(files || []);
    if (inputFiles.length === 0) return false;

    conversationState.loadingAttachments = true;
    try {
      const attachments = [];
      for (const file of inputFiles) {
        const mimeType = String(file.type || '').trim().toLowerCase();
        const isImage = mimeType.startsWith('image/');
        let dataUrl = '';
        let textContent = '';
        let textKind = '';
        let textTruncated = false;

        if (isImage) {
          try {
            dataUrl = await readFileAsDataUrl(file);
            const extracted = await extractTextFromAttachmentFile(file, mimeType);
            textContent = String(extracted?.content || '');
            textKind = String(extracted?.textKind || 'image');
            textTruncated = Boolean(extracted?.truncated);
          } catch (error) {
            continue;
          }
        } else {
          const extracted = await extractTextFromAttachmentFile(file, mimeType);
          textContent = String(extracted?.content || '');
          textKind = String(extracted?.textKind || '');
          textTruncated = Boolean(extracted?.truncated);
        }

        attachments.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          name: String(file.webkitRelativePath || file.name || 'arquivo').trim() || 'arquivo',
          mimeType,
          isImage,
          dataUrl,
          textContent,
          textKind,
          textTruncated,
        });
      }

      if (attachments.length === 0) return false;

      conversationState.pendingAttachments = conversationState.pendingAttachments.concat(attachments);
      renderPendingAttachments();
      return true;
    } catch (error) {
      console.error('[Liz] erro ao anexar arquivo.', error);
      return false;
    } finally {
      conversationState.loadingAttachments = false;
    }
  }

  async function handleChatFileSelection(event) {
    const files = Array.from(event.target?.files || []);
    if (files.length === 0) return;

    await addFilesToPending(files);

    if (conversationState.chatFileInput) {
      conversationState.chatFileInput.value = '';
      configureChatFileInputForMode('files');
    }
  }

  async function handleChatPaste(event) {
    if (conversationState.loadingAttachments) return;

    const imageFiles = getImageFilesFromClipboard(event);
    if (imageFiles.length === 0) return;

    event.preventDefault();
    await addFilesToPending(imageFiles);
  }

  function getCurrentUserAvatarUrl() {
    const user = window.LizAuth?.getCurrentUser?.();
    if (!user || typeof user !== 'object') return '';

    const candidate = user.avatar_url || user.avatarUrl || user.picture || '';
    const avatarUrl = String(candidate || '').trim();
    if (!avatarUrl) return '';
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    if (/^data:image\//i.test(avatarUrl)) return avatarUrl;
    if (avatarUrl.startsWith('/')) return avatarUrl;
    return '';
  }

  function createChatAvatar(role) {
    const safeRole = role === 'ai' ? 'ai' : 'user';
    const avatar = document.createElement('div');
    avatar.className = `chat-avatar ${safeRole}`;
    avatar.setAttribute('aria-hidden', 'true');

    const avatarImage = document.createElement('img');
    avatarImage.className = 'chat-avatar-logo';
    avatarImage.alt = '';

    if (safeRole === 'ai') {
      avatarImage.src = 'img/crown-logo.png?v=2';
      avatar.appendChild(avatarImage);
      return avatar;
    }

    const userAvatarUrl = getCurrentUserAvatarUrl();
    if (!userAvatarUrl) {
      return avatar;
    }

    avatar.classList.add('has-image');
    avatarImage.src = userAvatarUrl;
    avatarImage.referrerPolicy = 'no-referrer';
    avatarImage.addEventListener('error', () => {
      avatar.classList.remove('has-image');
      avatarImage.remove();
    }, { once: true });
    avatar.appendChild(avatarImage);
    return avatar;
  }

  async function copyTextToClipboard(rawText) {
    const safeText = String(rawText || '');
    if (!safeText) return false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(safeText);
        return true;
      } catch (error) {
        // fallback abaixo
      }
    }

    try {
      const helper = document.createElement('textarea');
      helper.value = safeText;
      helper.setAttribute('readonly', 'true');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      helper.style.pointerEvents = 'none';
      helper.style.left = '-9999px';
      helper.style.top = '-9999px';
      document.body.appendChild(helper);
      helper.focus();
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      return Boolean(copied);
    } catch (error) {
      return false;
    }
  }

  function updateMessageCopyButtonPayload(button, text) {
    if (!button) return false;
    const safeText = String(text || '').trim();
    button.dataset.copyText = safeText;
    const has = Boolean(safeText);
    button.disabled = !has;
    if (!has) {
      button.classList.remove('copied', 'copy-error');
      button.title = 'Copiar mensagem';
      button.setAttribute('aria-label', 'Copiar mensagem');
      return false;
    }
    return true;
  }

  function normalizeResponseTimeMs(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    return Math.max(1, Math.round(numeric));
  }

  function formatResponseTimeLabelMs(responseTimeMs) {
    const safeMs = normalizeResponseTimeMs(responseTimeMs);
    if (!safeMs) return '';
    if (safeMs < 1000) return `${safeMs}ms`;
    if (safeMs < 10000) return `${(safeMs / 1000).toFixed(1)}s`;
    return `${Math.round(safeMs / 1000)}s`;
  }

  function updateAiMessageResponseTime(actionsWrap, responseTimeMs) {
    if (!actionsWrap) return;
    const timeNode = actionsWrap.querySelector('.message-response-time');
    if (!timeNode) return;

    const safeMs = normalizeResponseTimeMs(responseTimeMs);
    if (!safeMs) {
      timeNode.hidden = true;
      timeNode.textContent = '';
      actionsWrap.dataset.responseTimeMs = '';
      return;
    }

    const label = formatResponseTimeLabelMs(safeMs);
    timeNode.hidden = false;
    timeNode.textContent = `Tempo: ${label}`;
    actionsWrap.dataset.responseTimeMs = String(safeMs);
  }

  function wrapMessageActions(copyButton) {
    const wrap = document.createElement('div');
    wrap.className = 'message-actions message-actions--user';
    wrap.appendChild(copyButton);
    return wrap;
  }

  function createMessageActionButton(extraClass, ariaLabel, title, svgMarkup) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `message-action-btn ${extraClass}`.trim();
    button.setAttribute('aria-label', ariaLabel);
    button.title = title;
    button.innerHTML = svgMarkup;
    return button;
  }

  function finalizeAiMessageActions(actionsWrap, text, options = {}) {
    if (!actionsWrap) return;
    const has = Boolean(String(text || '').trim());
    const regen = actionsWrap.querySelector('.message-regen-btn');
    const share = actionsWrap.querySelector('.message-share-btn');
    const up = actionsWrap.querySelector('.message-thumb-up-btn');
    const down = actionsWrap.querySelector('.message-thumb-down-btn');
    [regen, share, up, down].forEach(btn => {
      if (btn) btn.disabled = !has;
    });
    if (Object.prototype.hasOwnProperty.call(options, 'responseTimeMs')) {
      updateAiMessageResponseTime(actionsWrap, options.responseTimeMs);
    }
  }

  async function shareAssistantText(text) {
    const payload = String(text || '').trim();
    if (!payload) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: payload });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    await copyTextToClipboard(payload);
  }

  async function regenerateAssistantFromRow(hostRow) {
    const ui = getUiState();
    if (!ui.chatContainer || conversationState.loadingAttachments) return;

    const container = ui.chatContainer;
    if (hostRow !== container.lastElementChild) return;

    const conv = getCurrentConversation();
    if (!conv?.messages?.length) return;

    const lastMsg = conv.messages[conv.messages.length - 1];
    if (lastMsg.role !== 'ai') return;

    conv.messages.pop();
    updateConversationMeta(conv, new Date());
    sortConversationsByLastUpdated();
    renderHistory();
    emitConversationsUpdated();
    persistConversationsCache();

    hostRow.remove();

    const userMsg = conv.messages[conv.messages.length - 1];
    if (!userMsg || userMsg.role !== 'user') {
      renderCurrentConversation();
      return;
    }

    const message = String(userMsg.text || '');
    const images = userMsg.images || [];

    const docsModeEnabled = resolveDocsModeForOutgoingMessage(message);
    const previousUserText = getLatestUserMessageText(conv);
    const previousAssistantText = getLatestAssistantMessageText(conv);
    const conversationContextText = buildConversationHistoryContext(conv, {
      maxEntries: 12,
      maxChars: 7200,
    });
    const docsSourceText = docsModeEnabled
      ? resolveDocsSourceText(
          message,
          previousUserText,
          previousAssistantText,
          conversationContextText,
        )
      : '';

    const conversationId = conv.id;

    const typingRow = createTypingRow();
    container.appendChild(typingRow);
    scrollChatToBottom();

    let liveStreamText = '';
    const backendReply = await fetchBackendReply(
      message,
      conversationId,
      images,
      docsModeEnabled,
      false,
      docsSourceText,
      conversationContextText,
      (partialText, streamMeta = {}) => {
        if (streamMeta.isPlaceholder) {
          setThinkingStatus(typingRow, 'Pensando...');
          return;
        }
        liveStreamText = String(partialText || '');
        updateTypingRowText(typingRow, liveStreamText);
      },
      eventPayload => {
        handleThinkingStreamEvent(typingRow, eventPayload);
      },
    );

    let aiReply =
      backendReply ||
      liveStreamText ||
      'Nao foi possivel obter resposta da API da IA agora. Tente novamente.';
    if (docsModeEnabled) {
      aiReply = ensureDocsReplyCodeBlock(aiReply, message, docsSourceText);
      saveGeneratedDocsToGallery(aiReply, {
        requestText: message,
        docsSourceText,
        conversationContextText,
        conversationId,
        conversationTitle: conv.title || '',
      });
    } else {
      aiReply = ensureCodeOnlyReplyCodeBlock(aiReply, message, images, conversationContextText);
    }
    const responseTimeMs = normalizeResponseTimeMs(getThinkingElapsedMs(typingRow));
    appendMessageToConversation(conversationId, 'ai', aiReply, [], { responseTimeMs });

    if (conversationState.currentConversationId === conversationId) {
      if (typingRow.isConnected) {
        finalizeTypingRow(typingRow, aiReply, {
          usedBackend: Boolean(backendReply || liveStreamText),
          responseTimeMs,
        });
      } else {
        appendMessageToUi('ai', aiReply, [], { responseTimeMs });
      }
    } else if (typingRow.isConnected) {
      stopThinkingTimer(typingRow);
      typingRow.remove();
    }

  }

  function createAiMessageActions(assistantText, hostRow, options = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'message-actions message-actions--ai';

    const copyBtn = createMessageCopyButton(assistantText);
    updateMessageCopyButtonPayload(copyBtn, assistantText);

    const regenSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>';
    const regenBtn = createMessageActionButton(
      'message-regen-btn',
      'Gerar resposta novamente',
      'Gerar novamente',
      regenSvg,
    );

    const thumbUpSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.67 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>';
    const thumbUpBtn = createMessageActionButton(
      'message-thumb-up-btn',
      'Marcar resposta como util',
      'Boa resposta',
      thumbUpSvg,
    );
    thumbUpBtn.setAttribute('aria-pressed', 'false');

    const thumbDownSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.33 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path></svg>';
    const thumbDownBtn = createMessageActionButton(
      'message-thumb-down-btn',
      'Marcar resposta como nao util',
      'Resposta ruim',
      thumbDownSvg,
    );
    thumbDownBtn.setAttribute('aria-pressed', 'false');

    const shareSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"></path></svg>';
    const shareBtn = createMessageActionButton(
      'message-share-btn',
      'Compartilhar resposta',
      'Compartilhar',
      shareSvg,
    );

    const hasText = Boolean(String(assistantText || '').trim());
    [regenBtn, shareBtn, thumbUpBtn, thumbDownBtn].forEach(btn => {
      btn.disabled = !hasText;
    });

    regenBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (regenBtn.disabled) return;
      void regenerateAssistantFromRow(hostRow);
    });

    thumbUpBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (thumbUpBtn.disabled) return;
      thumbUpBtn.classList.toggle('is-active');
      thumbUpBtn.setAttribute('aria-pressed', thumbUpBtn.classList.contains('is-active') ? 'true' : 'false');
      if (thumbUpBtn.classList.contains('is-active')) {
        thumbDownBtn.classList.remove('is-active');
        thumbDownBtn.setAttribute('aria-pressed', 'false');
      }
    });

    thumbDownBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (thumbDownBtn.disabled) return;
      thumbDownBtn.classList.toggle('is-active');
      thumbDownBtn.setAttribute('aria-pressed', thumbDownBtn.classList.contains('is-active') ? 'true' : 'false');
      if (thumbDownBtn.classList.contains('is-active')) {
        thumbUpBtn.classList.remove('is-active');
        thumbUpBtn.setAttribute('aria-pressed', 'false');
      }
    });

    shareBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (shareBtn.disabled) return;
      const latest = String(copyBtn.dataset.copyText || assistantText || '').trim();
      void shareAssistantText(latest);
    });

    wrap.appendChild(copyBtn);
    wrap.appendChild(regenBtn);
    wrap.appendChild(thumbUpBtn);
    wrap.appendChild(thumbDownBtn);
    wrap.appendChild(shareBtn);

    const timeNode = document.createElement('span');
    timeNode.className = 'message-response-time';
    timeNode.hidden = true;
    wrap.appendChild(timeNode);
    updateAiMessageResponseTime(wrap, options.responseTimeMs);

    return wrap;
  }

  function createMessageCopyButton(initialText = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'message-copy-btn message-action-btn';
    button.setAttribute('aria-label', 'Copiar mensagem');
    button.title = 'Copiar mensagem';
    button.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 13h6M9 17h4"></path></svg>';

    updateMessageCopyButtonPayload(button, initialText);

    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();

      const payload = String(button.dataset.copyText || '').trim();
      if (!payload || button.disabled) return;

      button.disabled = true;
      button.classList.remove('copied', 'copy-error');

      const copied = await copyTextToClipboard(payload);
      if (copied) {
        button.classList.add('copied');
        button.title = 'Copiado';
        button.setAttribute('aria-label', 'Mensagem copiada');
      } else {
        button.classList.add('copy-error');
        button.title = 'Falha ao copiar';
        button.setAttribute('aria-label', 'Falha ao copiar');
      }

      window.setTimeout(() => {
        button.classList.remove('copied', 'copy-error');
        const stillHas = Boolean(String(button.dataset.copyText || '').trim());
        button.disabled = !stillHas;
        button.title = 'Copiar mensagem';
        button.setAttribute('aria-label', 'Copiar mensagem');
      }, 1200);
    });

    return button;
  }

  function createMessageRow(role, text, images = [], options = {}) {
    const row = document.createElement('div');
    row.className = `chat-message-row ${role}`;

    const avatar = createChatAvatar(role);

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${role}`;

    const hasText = Boolean(String(text || '').trim());
    const hasImages = Array.isArray(images) && images.length > 0;

    if (hasText) {
      const textNode = document.createElement('div');
      textNode.className = 'message-text';
      textNode.innerHTML = renderMarkdownText(text);
      bubble.appendChild(textNode);
    }

    if (hasImages) {
      bubble.appendChild(createAttachmentGrid(images));
      bubble.classList.add('has-media');
    }

    let messageBlock = null;
    if (role === 'ai' && hasText) {
      messageBlock = document.createElement('div');
      messageBlock.className = 'chat-message-block';
      messageBlock.classList.add('has-copy');
      messageBlock.appendChild(bubble);
      messageBlock.appendChild(createAiMessageActions(text, row, {
        responseTimeMs: options.responseTimeMs,
      }));
    } else if (role === 'user' && hasText) {
      const copyButton = createMessageCopyButton(text);
      if (copyButton && updateMessageCopyButtonPayload(copyButton, text)) {
        messageBlock = document.createElement('div');
        messageBlock.className = 'chat-message-block';
        messageBlock.classList.add('has-copy', 'user');
        messageBlock.appendChild(bubble);
        messageBlock.appendChild(wrapMessageActions(copyButton));
      }
    }

    if (!hasText && hasImages) {
      bubble.classList.add('media-only');
    }

    const mainContent = messageBlock || bubble;

    if (role === 'user') {
      row.appendChild(mainContent);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(mainContent);
    }

    return row;
  }

  function getThinkingElapsedMs(typingRow) {
    const startedAt = Number(typingRow?._thinkingStartedAtMs || 0);
    if (!startedAt) return 0;
    return Math.max(0, Date.now() - startedAt);
  }

  function getThinkingElapsedSeconds(typingRow) {
    return Math.max(0, Math.round(getThinkingElapsedMs(typingRow) / 1000));
  }

  function formatSecondsLabel(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    return `${safeSeconds} ${safeSeconds === 1 ? 'segundo' : 'segundos'}`;
  }

  function refreshThinkingTimer(typingRow) {
    const timeNode = typingRow?._thinkingTimeNode;
    if (!timeNode) return;
    const elapsedSeconds = getThinkingElapsedSeconds(typingRow);
    timeNode.textContent = `${elapsedSeconds}s`;
  }

  function setThinkingStatus(typingRow, status, options = {}) {
    if (!typingRow) return;
    const labelNode = typingRow._thinkingLabelNode;
    const timeNode = typingRow._thinkingTimeNode;
    if (!labelNode || !timeNode) return;

    labelNode.textContent = String(status || 'Pensando...');
    typingRow._thinkingStatus = labelNode.textContent;

    if (options.done) {
      timeNode.hidden = true;
      timeNode.textContent = '';
      return;
    }

    timeNode.hidden = false;
    refreshThinkingTimer(typingRow);
  }

  function stopThinkingTimer(typingRow) {
    if (!typingRow?._thinkingTimerId) return;
    window.clearInterval(typingRow._thinkingTimerId);
    typingRow._thinkingTimerId = null;
  }

  function startThinkingTimer(typingRow) {
    if (!typingRow) return;
    stopThinkingTimer(typingRow);
    refreshThinkingTimer(typingRow);
    typingRow._thinkingTimerId = window.setInterval(() => {
      if (!typingRow.isConnected) {
        stopThinkingTimer(typingRow);
        return;
      }
      refreshThinkingTimer(typingRow);
    }, 1000);
  }

  function handleThinkingStreamEvent(typingRow, eventPayload) {
    if (!typingRow?.isConnected) return;
    if (!eventPayload || typeof eventPayload !== 'object') return;

    const eventName = String(eventPayload.event || '').toLowerCase();
    if (eventName === 'meta') {
      setThinkingStatus(typingRow, 'Conexao feita. Preparando resposta...');
      return;
    }

    if (eventName === 'chunk') {
      const delta = String(eventPayload.delta || '');
      const content = String(eventPayload.content || '').trim();
      const isPlaceholder = !delta && /^pensando(\.\.\.)?$/i.test(content);
      if (isPlaceholder) {
        setThinkingStatus(typingRow, 'Pensando...');
        return;
      }
      if (delta) {
        setThinkingStatus(typingRow, 'Respondendo...');
      }
      return;
    }

    if (eventName === 'done') {
      setThinkingStatus(typingRow, 'Finalizando resposta...');
      return;
    }

    if (eventName === 'error') {
      setThinkingStatus(typingRow, 'Falha no streaming. Tentando resposta normal...');
    }
  }

  function createTypingRow() {
    const row = document.createElement('div');
    row.className = 'chat-message-row ai';

    const avatar = createChatAvatar('ai');

    const responseStack = document.createElement('div');
    responseStack.className = 'ai-response-stack';

    const thinkingLine = document.createElement('div');
    thinkingLine.className = 'thinking-inline';

    const thinkingDot = document.createElement('span');
    thinkingDot.className = 'thinking-inline-dot';

    const thinkingLabel = document.createElement('span');
    thinkingLabel.className = 'thinking-inline-label';
    thinkingLabel.textContent = 'Pensando...';

    const thinkingTime = document.createElement('span');
    thinkingTime.className = 'thinking-inline-time';
    thinkingTime.textContent = '0s';

    thinkingLine.appendChild(thinkingDot);
    thinkingLine.appendChild(thinkingLabel);
    thinkingLine.appendChild(thinkingTime);

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ai';
    bubble.hidden = true;

    const textNode = document.createElement('div');
    textNode.className = 'message-text';
    textNode.hidden = true;
    bubble.appendChild(textNode);

    const actionsWrap = createAiMessageActions('', row);
    actionsWrap.hidden = true;
    actionsWrap.setAttribute('aria-hidden', 'true');

    responseStack.appendChild(thinkingLine);
    responseStack.appendChild(bubble);
    responseStack.appendChild(actionsWrap);
    row.appendChild(avatar);
    row.appendChild(responseStack);

    row._typingTextNode = textNode;
    row._typingBubble = bubble;
    row._typingCopyButton = actionsWrap.querySelector('.message-copy-btn');
    row._typingActionsWrap = actionsWrap;
    row._thinkingLabelNode = thinkingLabel;
    row._thinkingTimeNode = thinkingTime;
    row._thinkingStartedAtMs = Date.now();
    row._thinkingStatus = 'Pensando...';
    setThinkingStatus(row, row._thinkingStatus);
    startThinkingTimer(row);

    return row;
  }

  function updateTypingRowText(typingRow, text, options = {}) {
    if (!typingRow?.isConnected) return;

    const textNode = typingRow._typingTextNode;
    if (!textNode) return;

    const safeText = String(text || '');
    const bubble = typingRow._typingBubble;
    if (bubble) {
      bubble.hidden = false;
    }

    textNode.hidden = false;
    textNode.innerHTML = renderMarkdownText(safeText);
    if (safeText.trim()) {
      setThinkingStatus(typingRow, 'Respondendo...');
    }

    if (options.done) {
      stopThinkingTimer(typingRow);
      setThinkingStatus(
        typingRow,
        `Pensou por ${formatSecondsLabel(getThinkingElapsedSeconds(typingRow))}`,
        { done: true },
      );
    }

    scrollChatToBottom();
  }

  function finalizeTypingRow(typingRow, finalReply, options = {}) {
    if (!typingRow?.isConnected) return;

    const usedBackend = Boolean(options.usedBackend);
    const responseTimeMs = normalizeResponseTimeMs(options.responseTimeMs) || normalizeResponseTimeMs(getThinkingElapsedMs(typingRow));
    updateTypingRowText(typingRow, finalReply);
    const copyButton = typingRow._typingCopyButton;
    const bubble = typingRow._typingBubble;
    const canCopy = updateMessageCopyButtonPayload(copyButton, finalReply);
    const actionsWrap = typingRow._typingActionsWrap;
    finalizeAiMessageActions(actionsWrap, finalReply, { responseTimeMs });
    if (actionsWrap) {
      actionsWrap.hidden = false;
      actionsWrap.removeAttribute('aria-hidden');
    }
    const responseStack = bubble?.parentElement;
    if (responseStack?.classList?.contains('ai-response-stack')) {
      responseStack.classList.toggle('has-copy', canCopy);
    }
    stopThinkingTimer(typingRow);
    if (usedBackend) {
      setThinkingStatus(
        typingRow,
        `Pensou por ${formatSecondsLabel(getThinkingElapsedSeconds(typingRow))}`,
        { done: true },
      );
      return;
    }
    setThinkingStatus(
      typingRow,
      `Falha na API em ${formatSecondsLabel(getThinkingElapsedSeconds(typingRow))}`,
      { done: true },
    );
  }

  function appendMessageToUi(role, text, images = [], options = {}) {
    const ui = getUiState();
    if (!ui.chatContainer) return null;

    const row = createMessageRow(role, text, images, options);
    ui.chatContainer.appendChild(row);
    scrollChatToBottom();
    return row;
  }

  function renderCurrentConversation() {
    const ui = getUiState();
    if (!ui.chatContainer) return;

    ui.chatContainer.innerHTML = '';

    const conversation = getCurrentConversation();
    if (!conversation || conversation.messages.length === 0) {
      deactivateChatMode();
      return;
    }

    activateChatMode();
    conversation.messages.forEach(message => {
      ui.chatContainer.appendChild(createMessageRow(message.role, message.text, message.images || [], {
        responseTimeMs: message.responseTimeMs,
      }));
    });
    scrollChatToBottom();
  }

  function createConversationFromMessage(message) {
    const createdAt = new Date();
    const conversation = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      title: buildConversationTitleFromMessage(message),
      createdAt: createdAt.getTime(),
      lastUpdatedAt: createdAt.getTime(),
      timeLabel: formatTime(createdAt),
      period: getPeriodLabel(createdAt),
      messages: [],
    };

    conversationState.conversations.unshift(conversation);
    conversationState.currentConversationId = conversation.id;
    renderHistory();
    emitConversationsUpdated();
    return conversation;
  }

  function appendMessageToConversation(conversationId, role, text, images = [], options = {}) {
    const conversation = findConversationById(conversationId);
    if (!conversation) return null;

    const createdAt = new Date();
    conversation.messages.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      role,
      text,
      images,
      createdAt: createdAt.toISOString(),
      responseTimeMs: normalizeResponseTimeMs(options.responseTimeMs),
    });

    maybeRefreshConversationTitle(conversation, role, text);
    updateConversationMeta(conversation, createdAt);
    sortConversationsByLastUpdated();
    renderHistory();
    emitConversationsUpdated();
    return conversation;
  }

  function ensureActiveConversation(message) {
    const current = getCurrentConversation();
    if (current) return current;
    return createConversationFromMessage(message);
  }

  function startNewChat() {
    const ui = getUiState();
    conversationState.currentConversationId = null;

    if (ui.chatContainer) {
      ui.chatContainer.innerHTML = '';
    }

    deactivateChatMode();

    if (ui.input) {
      ui.input.value = '';
      ui.input.style.height = 'auto';
    }

    clearPendingAttachments();
    window.LizUI?.refreshGreeting?.();

    renderHistory();
    persistConversationsCache();
  }

  async function clearAllConversations() {
    if (conversationState.historyClearInFlight) {
      return;
    }

    conversationState.conversations.length = 0;
    startNewChat();
    emitConversationsUpdated();

    conversationState.historyClearInFlight = true;
    let clearPromise;
    clearPromise = (async () => {
      try {
        await deleteServerHistory({ keepalive: true });
      } catch (error) {
        console.warn('[Liz] nao foi possivel limpar o historico no Turso.', error);
      } finally {
        if (conversationState.historyClearPromise === clearPromise) {
          conversationState.historyClearPromise = null;
        }
        conversationState.historyClearInFlight = false;
      }
    })();
    conversationState.historyClearPromise = clearPromise;
  }

  function normalizeAttachmentPayload(attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) return [];
    return attachments.map(attachment => String(attachment?.name || 'arquivo').slice(0, 180));
  }

  function buildAttachmentTextContext(attachments) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const chunks = [];
    let remainingChars = MAX_ATTACHMENT_PROMPT_TOTAL_CHARS;

    safeAttachments.forEach(attachment => {
      if (remainingChars < 140) return;
      if (!attachment) return;
      if (attachment.isImage && !String(attachment.textContent || '').trim()) return;

      const rawContent = String(attachment.textContent || '').trim();
      if (!rawContent) return;

      const safeName = String(attachment.name || 'arquivo').slice(0, 120);
      const sourceLabelMap = {
        pdf: 'PDF',
        image: 'imagem',
        audio: 'audio',
        video: 'video',
        archive: 'arquivo compactado',
        binary: 'arquivo binario',
      };
      const sourceLabel = sourceLabelMap[String(attachment.textKind || '').trim().toLowerCase()]
        || (attachment.isImage ? 'imagem' : 'arquivo');
      const header = `[Conteudo extraido de ${sourceLabel}: ${safeName}]`;
      const suffixNotes = [];
      if (attachment.textTruncated) {
        suffixNotes.push('arquivo truncado');
      }

      const headerWithLineBreak = `${header}\n`;
      const maxSnippetLength = Math.min(MAX_ATTACHMENT_PROMPT_CHARS, Math.max(0, remainingChars - headerWithLineBreak.length - 12));
      if (maxSnippetLength <= 0) return;

      let snippet = rawContent;
      let snippetWasReduced = false;
      if (snippet.length > maxSnippetLength) {
        snippet = snippet.slice(0, Math.max(0, maxSnippetLength - 3)).trimEnd().concat('...');
        snippetWasReduced = true;
      }
      if (!snippet) return;
      if (snippetWasReduced) {
        suffixNotes.push('trecho reduzido');
      }

      const suffix = suffixNotes.length > 0
        ? `\n[${suffixNotes.join(', ')}]`
        : '';
      const block = `${headerWithLineBreak}${snippet}${suffix}`;
      chunks.push(block);
      remainingChars -= block.length + 2;
    });

    return chunks.join('\n\n').trim();
  }

  function buildDirectPromptWithAttachmentContext(message, attachments) {
    const normalizedMessage = String(message || '').trim();
    const attachmentNames = normalizeAttachmentPayload(attachments);
    const attachmentTextContext = buildAttachmentTextContext(attachments);

    if (attachmentNames.length === 0 && !attachmentTextContext) {
      return normalizedMessage || '(mensagem com anexo)';
    }

    const chunks = [normalizedMessage || '(mensagem com anexo)'];
    if (attachmentNames.length > 0) {
      chunks.push(
        attachmentNames.length === 1
          ? `[Anexo recebido: ${attachmentNames[0]}]`
          : `[Anexos recebidos: ${attachmentNames.join(', ')}]`,
      );
    }
    if (attachmentTextContext) {
      chunks.push('Use o texto extraido dos anexos abaixo como contexto da resposta:');
      chunks.push(attachmentTextContext);
    }
    return chunks.join('\n\n');
  }

  function buildBackendStoredMessageText(message, attachments) {
    const normalizedMessage = String(message || '').trim();
    if (normalizedMessage) {
      return normalizedMessage;
    }

    return getAttachmentSeedTitle(attachments) || '(mensagem com anexo)';
  }

  function clampMessageForBackend(message) {
    const safeMessage = String(message || '').trim();
    if (!safeMessage) return '';
    if (safeMessage.length <= MAX_BACKEND_MESSAGE_LENGTH) {
      return safeMessage;
    }
    const marker = '\n\n[contexto truncado...]\n\n';
    const usableLength = Math.max(0, MAX_BACKEND_MESSAGE_LENGTH - marker.length);
    if (usableLength <= 20) {
      return `${safeMessage.slice(0, Math.max(0, MAX_BACKEND_MESSAGE_LENGTH - 24)).trimEnd()}\n\n[contexto truncado...]`;
    }

    const headLength = Math.max(1, Math.floor(usableLength * 0.58));
    const tailLength = Math.max(1, usableLength - headLength);
    const head = safeMessage.slice(0, headLength).trimEnd();
    const tail = safeMessage.slice(Math.max(0, safeMessage.length - tailLength)).trimStart();
    return `${head}${marker}${tail}`;
  }

  function wantsPdfDocument(message) {
    const safe = String(message || '').trim().toLowerCase();
    if (!safe) return false;
    return /\bpdf\b/.test(safe) || safe.includes('portable document format');
  }

  function normalizeIntentText(message) {
    let safe = String(message || '').trim().toLowerCase();
    if (typeof safe.normalize === 'function') {
      safe = safe.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return safe.replace(/\s+/g, ' ').trim();
  }

  function isSimpleGreetingOrAck(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    const compact = normalized.replace(/[!?.,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!compact) return false;
    const wordCount = compact.split(' ').filter(Boolean).length;
    if (wordCount > 7) return false;

    if (/^(oi|ola|opa|e ai|eae|salve|hello|hi|bom dia|boa tarde|boa noite)$/.test(compact)) {
      return true;
    }
    if (/^(ok|blz|beleza|valeu|obrigado|obrigada|show|top|perfeito|fechou)$/.test(compact)) {
      return true;
    }
    return /^(oi|ola|opa|bom dia|boa tarde|boa noite)\b/.test(compact) && wordCount <= 4;
  }

  function isSimpleDateOrTimeQuestion(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    const wordCount = normalized.split(' ').filter(Boolean).length;
    if (wordCount > 15) return false;

    const dateQuery = /\b(que dia e hoje|dia de hoje|data de hoje|qual e a data|qual a data|hoje e que dia|data atual)\b/.test(normalized);
    const timeQuery = /\b(que horas sao|que horas e|qual a hora|qual e a hora|hora atual|agora sao)\b/.test(normalized);
    return dateQuery || timeQuery;
  }

  function wantsImageGeneration(message) {
    const safeMessage = String(message || '').trim();
    if (!safeMessage) return false;
    if (parseImageGenerationIntent(safeMessage)) return true;

    const normalized = normalizeIntentText(safeMessage);
    if (!normalized) return false;

    const asksImageAction = /\b(gera|gerar|cria|criar|faca|fazer|quero|preciso|produz|produzir|desenha|desenhar|monta|montar)\b/.test(normalized);
    const hasImageTarget = /\b(imagem|foto|fotografia|ilustracao|arte|poster|capa)\b/.test(normalized);
    return asksImageAction && hasImageTarget;
  }

  function hasLikelyCodeInText(rawText) {
    const safeText = String(rawText || '').trim();
    if (!safeText) return false;

    const fenced = extractFirstCodeFence(safeText);
    if (String(fenced?.content || '').trim()) return true;

    if (/<[a-z][^>]*>[\s\S]*<\/[a-z]+>/i.test(safeText)) return true;
    if (/^\s*[.#]?[a-z0-9_-]+\s*\{[\s\S]*\}\s*$/im.test(safeText)) return true;
    if (/^\s*(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|class\s+\w+|import\s+.+\s+from|export\s+(default|const|function|class)|if\s*\(|for\s*\(|while\s*\(|return\b)/im.test(safeText)) return true;
    if (/\b(select|insert|update|delete)\b[\s\S]*\b(from|into|set|where)\b/i.test(safeText)) return true;

    const hasSymbols = /[{}();<>]/.test(safeText);
    const hasKeywords = /\b(html|body|div|span|script|style|input|button|python|javascript|typescript|sql|json|css)\b/i.test(safeText);
    return hasSymbols && hasKeywords;
  }

  function hasCodeLikeAttachmentContext(attachments) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    return safeAttachments.some(attachment => {
      if (!attachment) return false;
      const extension = resolveFileExtension(String(attachment.name || ''));
      const mimeType = String(attachment.mimeType || '').trim().toLowerCase();
      const content = String(attachment.textContent || '');

      if (CODE_ATTACHMENT_EXTENSIONS.has(extension)) return true;
      if (isTextLikeMimeType(mimeType) && hasLikelyCodeInText(content)) return true;
      return hasLikelyCodeInText(content);
    });
  }

  function hasImprovementIntentVerb(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    return /\b(melhora|melhorar|melhore|otimiza|otimizar|otimize|refatora|refatorar|refatore|corrige|corrigir|corrija|ajusta|ajustar|ajuste|adapta|adaptar|adapte|aperfeicoa|aperfeicoar|aperfeicoe|incrementa|incrementar|incremente|mudar|mudo|mudaria)\b/.test(normalized);
  }

  function requestsCodeImprovement(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;

    const improveAction = hasImprovementIntentVerb(message);
    if (!improveAction) return false;

    const mentionsCode = /\b(codigo|script|html|css|js|javascript|typescript|python|sql|layout|componente|pagina|formulario|arquivo)\b/.test(normalized);
    const mentionsExistingBase = /\b(esse|este|isso|acima|anexo|anexado|enviado|que mandei|que eu mandei|com base|em cima|na base|manter)\b/.test(normalized);
    return mentionsCode || mentionsExistingBase || hasLikelyCodeInText(message);
  }

  function requestsCodeFeedback(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;

    if (/^(o\s*que|oque)\s+(mudo|mudar|melhoro|melhorar|arrumo|ajusto)\b/.test(normalized)) {
      return true;
    }
    if (/\b(ta bom assim|esta bom assim|algo pra melhorar|algo para melhorar|tem como melhorar|o que acha desse codigo|o que acha do codigo|analisa esse codigo)\b/.test(normalized)) {
      return true;
    }
    return false;
  }

  function requestsCodeChangeAudit(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    return /\b(o\s*que|oque|quais)\s+(mudou|mudaram|mudei|mude|alterou|alteraram|mudancas|alteracoes)\b/.test(normalized)
      || /\b(o\s*que|oque)\s+ela\s+mudou\b/.test(normalized)
      || /\b(foi alterado|foi mudado|que foi alterado)\b/.test(normalized);
  }

  function requestsStrictCodePreservation(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    return /\b(sem mudar|nao mudar|sem alterar|nao alterar|nao mexer|mesma estrutura|mesmo layout|so melhorar|somente melhorar|com base no codigo|em cima do codigo|na base do codigo)\b/.test(normalized);
  }

  function requestsFullCodeOutput(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    return /\b(codigo completo|codigo todo|codigo inteiro|html completo|arquivo completo|manda completo|me manda completo|envia completo|manda o codigo|me manda o codigo|envia o codigo|do zero|refaz tudo|recria tudo|reescreve tudo|pagina completa)\b/.test(normalized);
  }

  function isLizDevModel25(modelApiValue) {
    const normalized = String(modelApiValue || '').trim().toLowerCase();
    return normalized === '2.5'
      || normalized === 'liz-2.5'
      || normalized === 'liz 2.5';
  }

  function buildCodeEditInstruction(message, attachments, conversationContextText = '') {
    const hasSourceCode = hasLikelyCodeInText(message)
      || hasCodeLikeAttachmentContext(attachments)
      || hasLikelyCodeInText(conversationContextText);
    const asksImprovement = requestsCodeImprovement(message)
      || (hasImprovementIntentVerb(message) && hasSourceCode);
    const asksFeedback = requestsCodeFeedback(message);
    const asksChangeAudit = requestsCodeChangeAudit(message);
    const asksFullCode = requestsFullCodeOutput(message);
    if (!asksImprovement && !asksFeedback && !asksChangeAudit) return '';

    const strictPreservation = requestsStrictCodePreservation(message);

    const rules = ['MODO EDICAO DE CODIGO (OBRIGATORIO).'];
    if (!hasSourceCode) {
      rules.push(
        'Pedido de melhoria de codigo detectado.',
        'Se nao houver codigo suficiente no contexto, peca o codigo antes de propor reescrita completa.',
      );
      return rules.join(' ');
    }

    rules.push(
      'Use o codigo enviado como base principal.',
      'Preserve estrutura, layout, nomes e fluxo existentes sempre que possivel.',
      'Aplique apenas alteracoes necessarias para atender ao pedido.',
      'Nao reescreva tudo do zero e nao troque framework/stack sem pedido explicito.',
      'Mantenha a mesma linguagem do codigo original.',
      'Nao invente mudancas: cite apenas alteracoes comprovaveis no codigo/contexto.',
    );
    if (asksFeedback) {
      rules.push(
        'Se o usuario perguntar "o que mudar/melhorar", entregue melhorias concretas em vez de responder "nada".',
        'Liste pelo menos 3 ajustes objetivos, mantendo o mesmo layout e estrutura base.',
        'Nao devolva o arquivo completo e nao repita todo o codigo que ja foi enviado.',
        'Se precisar mostrar codigo, mostre apenas pequenos trechos pontuais (no maximo 6 linhas por trecho).',
      );
    }
    if (asksFullCode) {
      rules.push(
        'O usuario pediu codigo completo.',
        'Ao responder com codigo completo, nao escreva resumo textual de mudancas antes do codigo.',
        'Se citar mudancas, cite apenas o que existir literalmente no codigo final entregue.',
      );
    }
    if (asksChangeAudit) {
      rules.push(
        'MODO AUDITORIA: explique somente o que realmente mudou no codigo.',
        'Cada item deve referenciar um trecho visivel (tag, atributo, classe ou texto presente).',
        'Nao cite mudanca que nao esteja no trecho analisado.',
        'Nao adicione sugestoes novas, a menos que o usuario peca explicitamente.',
      );
    }
    if (strictPreservation) {
      rules.push('Pedido com preservacao estrita: faca somente ajustes pontuais no codigo original.');
    }
    return rules.join(' ');
  }

  function wantsTextFileDocument(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;

    const asksGeneration = /\b(fazer|faca|criar|crie|gerar|gera|gere|montar|monta|produzir|produza|exportar|exporta|salvar|salve|baixar|baixa|enviar|envia|quero|preciso|gostaria)\b/.test(normalized);
    const formatTarget = /\b(pdf|txt|markdown|md|json|xml|csv|doc|docx)\b|\.pdf\b|\.txt\b|\.md\b|\.json\b|\.xml\b|\.csv\b|\.doc\b|\.docx\b|\barquivo de texto\b|\barquivo\b.{0,18}\b(pdf|txt|markdown|md|json|xml|csv|doc|docx)\b/.test(normalized);
    const explicitFormat = /\b(em|formato|arquivo)\s+(pdf|txt|markdown|md|json|xml|csv|doc|docx)\b/.test(normalized);

    if (explicitFormat) return true;
    if (wantsPdfDocument(normalized) && (asksGeneration || /\b(sobre|de|do|da)\b/.test(normalized))) {
      return true;
    }
    return asksGeneration && formatTarget;
  }

  function tryAutoEnableDocsMode(message) {
    if (isDocsModeActive()) return true;
    if (!wantsTextFileDocument(message)) return false;
    conversationState.activeQuickModes = ['docs'];
    applyQuickModeDefaults('docs');
    renderQuickModeTray();
    return true;
  }

  function resolveDocsModeForOutgoingMessage(message) {
    const safeMessage = String(message || '').trim();
    if (!safeMessage) {
      return isDocsModeActive();
    }

    const docsRequested = wantsTextFileDocument(safeMessage);
    const docsActive = isDocsModeActive();

    const asksCodeFeedback = requestsCodeFeedback(safeMessage)
      || requestsCodeImprovement(safeMessage)
      || requestsCodeChangeAudit(safeMessage);
    if (docsActive && asksCodeFeedback && !docsRequested) {
      return false;
    }

    if (docsActive) {
      return true;
    }

    if (!docsActive && docsRequested) {
      return tryAutoEnableDocsMode(safeMessage);
    }

    return docsActive;
  }

  function tryAutoEnableImagineMode(message) {
    if (isImagineModeActive()) return true;
    if (!wantsImageGeneration(message)) return false;
    conversationState.activeQuickModes = ['imagine'];
    applyQuickModeDefaults('imagine');
    renderQuickModeTray();
    return true;
  }

  function resolveImagineModeForOutgoingMessage(message, options = {}) {
    const safeMessage = String(message || '').trim();
    const docsModeEnabled = Boolean(options.docsModeEnabled);
    const imagineActive = isImagineModeActive();

    if (docsModeEnabled) {
      if (imagineActive) {
        removeQuickMode('imagine');
      }
      return false;
    }

    const imagineRequested = wantsImageGeneration(safeMessage);

    if (!imagineActive && imagineRequested) {
      return tryAutoEnableImagineMode(safeMessage);
    }

    return imagineActive;
  }

  function resolveExploreModeForOutgoingMessage(message, options = {}) {
    const docsModeEnabled = Boolean(options.docsModeEnabled);
    const imagineModeEnabled = Boolean(options.imagineModeEnabled);
    const exploreActive = isExploreModeActive();

    if (docsModeEnabled || imagineModeEnabled) {
      if (exploreActive) {
        removeQuickMode('explore');
      }
      return false;
    }

    const safeMessage = String(message || '').trim();
    if (!safeMessage) {
      return exploreActive;
    }

    return exploreActive;
  }

  function extractInlineDocumentSourceFromMessage(message) {
    const source = String(message || '').replace(/\r\n?/g, '\n').trim();
    if (!source) return '';

    const markerWithFollowingTextPattern = /\b(?:a partir (?:do|deste|desse) texto|com base (?:no|neste|nesse) texto|com este texto|com esse texto|texto abaixo|seguinte texto)\b\s*(?:[:\-]\s*|\n+)([\s\S]{60,})$/i;
    const markerWithFollowingTextMatch = source.match(markerWithFollowingTextPattern);
    if (markerWithFollowingTextMatch) {
      const afterMarker = collapseBlankLines(markerWithFollowingTextMatch[1] || '');
      if (afterMarker.length > 60) {
        return afterMarker;
      }
    }

    const lines = source.split('\n');
    if (lines.length >= 2) {
      const firstLine = String(lines[0] || '').trim();
      const remainingLines = collapseBlankLines(lines.slice(1).join('\n'));
      if (remainingLines.length > 60 && wantsTextFileDocument(firstLine)) {
        return remainingLines;
      }
    }

    const leadingCommandWithSeparatorPattern = /^\s*(?:quero\s+)?(?:fazer|faca|criar|crie|gerar|gera|gere|montar|monta|produzir|produza|exportar|exporta|salvar|salve|baixar|baixa|enviar|envia|converter|converte|transformar|transforma)\b[\s\S]{0,240}?(?:[:\-]\s+)([\s\S]{60,})$/i;
    const leadingCommandWithSeparatorMatch = source.match(leadingCommandWithSeparatorPattern);
    if (leadingCommandWithSeparatorMatch) {
      const afterSeparator = collapseBlankLines(leadingCommandWithSeparatorMatch[1] || '');
      if (afterSeparator.length > 60) {
        return afterSeparator;
      }
    }

    const commandAtEndPattern = /(?:^|\n)\s*(?:faz(?:er)?|faca|gera(?:r)?|cria(?:r)?|transforma(?:r)?|converte(?:r)?|monta(?:r)?|exporta(?:r)?|salva(?:r)?|crie|gere)\b[\s\S]{0,220}$/i;
    const commandMatch = source.match(commandAtEndPattern);
    if (commandMatch && typeof commandMatch.index === 'number' && commandMatch.index > 40) {
      const beforeCommand = source.slice(0, commandMatch.index).trim();
      if (beforeCommand.length > 60) {
        return beforeCommand;
      }
    }

    const markerPattern = /\b(?:a partir (?:do|deste|desse) texto|com base (?:no|neste|nesse) texto|com (?:este|esse) texto|do texto acima|do texto que enviei|texto anterior)\b/i;
    const markerMatch = markerPattern.exec(source);
    if (markerMatch && typeof markerMatch.index === 'number' && markerMatch.index > 40) {
      const beforeMarker = source.slice(0, markerMatch.index).trim();
      if (beforeMarker.length > 60) {
        return beforeMarker;
      }
    }

    return '';
  }

  function isSourceBasedDocumentRequest(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    return /\b(a partir (do|deste|desse) texto|com este texto|com esse texto|texto que enviei|texto anterior|texto acima|texto abaixo|seguinte texto|desse texto|deste texto)\b/.test(normalized);
  }

  function messageRefersToPreviousText(message) {
    return isSourceBasedDocumentRequest(message);
  }

  function isGenericAiFailureText(text) {
    const normalized = normalizeIntentText(text);
    if (!normalized) return false;
    return /nao foi possivel obter resposta da api da ia|estou com instabilidade momentanea|instabilidade momentanea|pode tentar novamente em instantes|falha na api|falha no chat|tente novamente|tentar novamente|erro interno|erro ao consultar/i.test(normalized);
  }

  function extractDocumentSourceCandidate(rawText) {
    const safe = String(rawText || '').trim();
    if (!safe) return '';
    if (isGenericAiFailureText(safe)) return '';

    const codeFence = extractFirstCodeFence(safe);
    if (codeFence && String(codeFence.content || '').trim()) {
      return collapseBlankLines(codeFence.content);
    }
    return collapseBlankLines(safe);
  }

  function isShortConversionCommand(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    if (!wantsTextFileDocument(normalized)) return false;
    if (extractInlineDocumentSourceFromMessage(normalized)) return false;

    const referencesExistingText = /\b(texto|deste|desse|este|esse|acima|anterior|isso)\b/.test(normalized);
    if (!referencesExistingText) {
      if (/\bsobre\b/.test(normalized)) return false;
      if (/\b(de|do|da)\b/.test(normalized) && !/\b(texto|arquivo|anexo)\b/.test(normalized)) {
        return false;
      }
    }

    const wordCount = normalized.split(' ').filter(Boolean).length;
    if (referencesExistingText) {
      return normalized.length <= 120 && wordCount <= 16;
    }
    return normalized.length <= 60 && wordCount <= 5;
  }

  function resolveDocsSourceText(
    message,
    previousUserText,
    previousAssistantText = '',
    conversationHistoryText = '',
  ) {
    const inlineSource = extractInlineDocumentSourceFromMessage(message);
    if (inlineSource) {
      return collapseBlankLines(inlineSource);
    }

    const historySource = extractDocumentSourceCandidate(conversationHistoryText);
    const previousAssistant = extractDocumentSourceCandidate(previousAssistantText);
    const previousUser = extractDocumentSourceCandidate(previousUserText);
    const fallbackPrevious = [historySource, previousUser, previousAssistant]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || '';

    if (!fallbackPrevious) return '';
    if (messageRefersToPreviousText(message)) return fallbackPrevious;
    if (isShortConversionCommand(message)) return fallbackPrevious;
    return '';
  }

  function shouldForceDocsSourceContent(message, sourceText, generatedContent) {
    const safeSource = collapseBlankLines(sourceText || '');
    if (!safeSource) return false;

    if (isSourceBasedDocumentRequest(message)) return true;
    if (isShortConversionCommand(message) && safeSource.length > 90) return true;

    const safeGenerated = collapseBlankLines(generatedContent || '');
    if (!safeGenerated) return true;

    return safeSource.length > 160 && safeGenerated.length <= Math.floor(safeSource.length * 0.55);
  }

  function extractFirstCodeFence(markdownText) {
    const source = String(markdownText || '');
    const match = source.match(/```[ \t]*([^\n`]*)\n([\s\S]*?)```/i);
    if (!match) return null;
    return {
      language: String(match[1] || '').trim().toLowerCase(),
      content: String(match[2] || ''),
    };
  }

  function mapExtensionToCodeFenceLanguage(extension) {
    const ext = String(extension || '').trim().toLowerCase();
    if (!ext) return '';
    const byExt = {
      htm: 'html',
      html: 'html',
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      rb: 'ruby',
      sh: 'bash',
      bash: 'bash',
      zsh: 'bash',
      ps1: 'powershell',
      yml: 'yaml',
      md: 'markdown',
      cs: 'csharp',
    };
    return byExt[ext] || ext;
  }

  function resolvePreferredCodeFenceLanguage(message, attachments, conversationContextText = '', fallbackLanguage = '') {
    const safeFallback = String(fallbackLanguage || '').trim().toLowerCase();
    if (safeFallback) return safeFallback;

    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    for (const attachment of safeAttachments) {
      const extension = resolveFileExtension(String(attachment?.name || ''));
      if (!extension) continue;
      if (!CODE_ATTACHMENT_EXTENSIONS.has(extension)) continue;
      const mapped = mapExtensionToCodeFenceLanguage(extension);
      if (mapped) return mapped;
    }

    const normalized = normalizeIntentText(message);
    if (/\bhtml\b/.test(normalized)) return 'html';
    if (/\bcss\b/.test(normalized)) return 'css';
    if (/\b(javascript|js)\b/.test(normalized)) return 'javascript';
    if (/\b(typescript|ts)\b/.test(normalized)) return 'typescript';
    if (/\bpython\b|\bpy\b/.test(normalized)) return 'python';
    if (/\bjson\b/.test(normalized)) return 'json';
    if (/\bsql\b/.test(normalized)) return 'sql';

    const context = String(conversationContextText || '');
    if (/<!doctype html|<html[\s>]/i.test(context)) return 'html';
    if (/^\s*\{[\s\S]*\}\s*$/m.test(context)) return 'json';

    return 'txt';
  }

  function extractLikelyCodeBodyFromText(rawText) {
    const safe = String(rawText || '').trim();
    if (!safe) return '';

    const htmlDocumentMatch = safe.match(/<!doctype html[\s\S]*?<\/html>/i);
    if (htmlDocumentMatch && String(htmlDocumentMatch[0] || '').trim()) {
      return String(htmlDocumentMatch[0] || '').trim();
    }

    const htmlBlockMatch = safe.match(/<html[\s\S]*?<\/html>/i);
    if (htmlBlockMatch && String(htmlBlockMatch[0] || '').trim()) {
      return String(htmlBlockMatch[0] || '').trim();
    }

    const anchors = [
      /<!doctype html/i,
      /<html[\s>]/i,
      /^\s*(import|export|const|let|var|function|class)\b/m,
      /^\s*(select|insert|update|delete)\b/m,
      /^\s*[{[]/m,
    ];
    const indices = anchors
      .map(pattern => safe.search(pattern))
      .filter(index => Number.isFinite(index) && index >= 0);
    if (indices.length > 0) {
      const firstIndex = Math.min(...indices);
      if (firstIndex > 0) {
        const sliced = safe.slice(firstIndex).trim();
        if (hasLikelyCodeInText(sliced)) {
          return sliced;
        }
      }
    }

    return hasLikelyCodeInText(safe) ? safe : '';
  }

  function normalizeBrokenCodeFenceReply(rawText, fallbackLanguage = '') {
    const safe = String(rawText || '').trim();
    if (!safe.startsWith('```')) return '';

    const lines = safe.replace(/\r\n?/g, '\n').split('\n');
    if (lines.length < 2) return '';

    const opening = String(lines[0] || '').trim();
    if (!opening.startsWith('```')) return '';
    const openingLanguage = opening.slice(3).trim().toLowerCase();
    const language = openingLanguage || String(fallbackLanguage || '').trim().toLowerCase() || 'txt';

    let bodyLines = lines.slice(1);
    const closingIndex = bodyLines.findIndex(line => String(line || '').trim() === '```');
    if (closingIndex >= 0) {
      bodyLines = bodyLines.slice(0, closingIndex);
    }
    const body = bodyLines.join('\n').trim();
    if (!body) return '';

    return `\`\`\`${language}\n${body}\n\`\`\``;
  }

  function resolvePrimaryCodeSourceFromAttachments(attachments = []) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    for (const attachment of safeAttachments) {
      if (!attachment) continue;
      const rawText = String(attachment.textContent || '').trim();
      if (!rawText) continue;

      const extension = resolveFileExtension(String(attachment.name || ''));
      const mimeType = String(attachment.mimeType || '').trim().toLowerCase();
      const looksCodeByExt = Boolean(extension && CODE_ATTACHMENT_EXTENSIONS.has(extension));
      const looksCodeByMime = isTextLikeMimeType(mimeType) && hasLikelyCodeInText(rawText);
      const looksCodeByBody = hasLikelyCodeInText(rawText);

      if (!looksCodeByExt && !looksCodeByMime && !looksCodeByBody) continue;

      return {
        source: rawText,
        extension,
        language: mapExtensionToCodeFenceLanguage(extension),
      };
    }
    return null;
  }

  function looksLikeReasoningLeakInCode(rawText) {
    const safe = String(rawText || '').trim();
    if (!safe) return true;
    if (hasLikelyCodeInText(safe)) return false;
    const normalized = normalizeIntentText(safe);
    return /\b(wait|i should|final code construction|thinking|raciocinio|passo a passo|vou (fazer|montar|criar)|aqui esta)\b/.test(normalized);
  }

  function isLikelyCompleteCodeCandidate(codeText, language, referenceSource = '') {
    const safeCode = String(codeText || '').trim();
    if (!safeCode) return false;
    if (looksLikeReasoningLeakInCode(safeCode)) return false;
    if (!hasLikelyCodeInText(safeCode)) return false;

    const normalizedLanguage = String(language || '').trim().toLowerCase();
    if (normalizedLanguage === 'html') {
      const hasHtmlShell = /<!doctype html|<html[\s>]/i.test(safeCode);
      const hasHtmlClose = /<\/html>/i.test(safeCode);
      if (hasHtmlShell && !hasHtmlClose) return false;
    }

    const safeReference = String(referenceSource || '').trim();
    if (safeReference) {
      const minExpectedLength = Math.min(1400, Math.max(160, Math.floor(safeReference.length * 0.3)));
      if (safeCode.length < minExpectedLength) return false;
      if (/<!doctype html|<html[\s>]/i.test(safeReference) && /<\/html>/i.test(safeReference)) {
        if (!/<\/html>/i.test(safeCode)) return false;
      }
    }

    return true;
  }

  function buildFallbackFullCodeReply(message, attachments = [], conversationContextText = '') {
    const primarySource = resolvePrimaryCodeSourceFromAttachments(attachments);
    if (!primarySource || !String(primarySource.source || '').trim()) return '';
    const language = resolvePreferredCodeFenceLanguage(
      message,
      attachments,
      conversationContextText,
      primarySource.language || '',
    );
    return `\`\`\`${language}\n${String(primarySource.source || '').trim()}\n\`\`\``;
  }

  function ensureCodeOnlyReplyCodeBlock(
    replyText,
    message,
    attachments = [],
    conversationContextText = '',
  ) {
    const safeReply = String(replyText || '').trim();
    if (!safeReply) return safeReply;
    if (!requestsFullCodeOutput(message)) return safeReply;

    const hasCodeContext = hasLikelyCodeInText(message)
      || hasCodeLikeAttachmentContext(attachments)
      || hasLikelyCodeInText(conversationContextText);
    if (!hasCodeContext) return safeReply;

    const primarySource = resolvePrimaryCodeSourceFromAttachments(attachments);
    const fallbackSource = String(primarySource?.source || '').trim();
    const fallbackReply = buildFallbackFullCodeReply(message, attachments, conversationContextText);

    const codeFence = extractFirstCodeFence(safeReply);
    if (codeFence && String(codeFence.content || '').trim()) {
      const language = resolvePreferredCodeFenceLanguage(
        message,
        attachments,
        conversationContextText,
        codeFence.language,
      );
      const candidate = String(codeFence.content || '').trim();
      if (isLikelyCompleteCodeCandidate(candidate, language, fallbackSource)) {
        return `\`\`\`${language}\n${candidate}\n\`\`\``;
      }
      if (fallbackReply) {
        return fallbackReply;
      }
    }

    const normalizedBrokenFence = normalizeBrokenCodeFenceReply(
      safeReply,
      resolvePreferredCodeFenceLanguage(message, attachments, conversationContextText, ''),
    );
    if (normalizedBrokenFence) {
      const normalizedFenceBody = String(extractFirstCodeFence(normalizedBrokenFence)?.content || '').trim();
      const normalizedFenceLanguage = resolvePreferredCodeFenceLanguage(
        message,
        attachments,
        conversationContextText,
        String(extractFirstCodeFence(normalizedBrokenFence)?.language || ''),
      );
      if (isLikelyCompleteCodeCandidate(normalizedFenceBody, normalizedFenceLanguage, fallbackSource)) {
        return normalizedBrokenFence;
      }
      if (fallbackReply) {
        return fallbackReply;
      }
    }

    const codeBody = extractLikelyCodeBodyFromText(safeReply);
    if (!codeBody) {
      return fallbackReply || safeReply;
    }

    const language = resolvePreferredCodeFenceLanguage(message, attachments, conversationContextText, '');
    if (isLikelyCompleteCodeCandidate(codeBody, language, fallbackSource)) {
      return `\`\`\`${language}\n${codeBody.trim()}\n\`\`\``;
    }
    return fallbackReply || safeReply;
  }

  function collapseBlankLines(text) {
    return String(text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function stripAiLimitationLines(text) {
    const rawLines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const normalizeForRuleMatch = value => {
      let safe = String(value || '').toLowerCase();
      if (typeof safe.normalize === 'function') {
        safe = safe.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return safe;
    };
    const blockedPatterns = [
      /como sou (um|uma) (ia|modelo)/,
      /as an ai (language )?model/,
      /nao consigo gerar .*arquivo .*binario/,
      /nao consigo gerar .*pdf/,
      /nao posso gerar .*pdf/,
      /nao consigo criar .*pdf/,
      /i (can't|cannot) generate .*pdf/,
      /no entanto[, ]+posso fornecer/,
      /however[, ]+i can provide/,
      /copiar e salvar/,
      /copy and save/,
    ];

    const keptLines = rawLines.filter(line => {
      const normalizedLine = normalizeForRuleMatch(line).trim();
      if (!normalizedLine) return true;
      return !blockedPatterns.some(pattern => pattern.test(normalizedLine));
    });
    return collapseBlankLines(keptLines.join('\n'));
  }

  function normalizePdfVisibleContent(text) {
    const safeText = String(text || '').trim();
    if (!safeText) return '';

    const looksLikeRawPdf =
      /^%PDF-\d/i.test(safeText)
      || /(?:^|\n)\d+\s+\d+\s+obj(?:\n|$)/i.test(safeText)
      || /(?:^|\n)endobj(?:\n|$)/i.test(safeText)
      || /\/Type\s*\/Catalog/i.test(safeText)
      || /(?:^|\n)(xref|trailer|startxref|%%EOF)(?:\n|$)/i.test(safeText);

    if (!looksLikeRawPdf) {
      return collapseBlankLines(safeText);
    }

    const extracted = collapseBlankLines(
      normalizeExtractedAttachmentText(
        extractReadableTextFromPdfRaw(safeText),
      ),
    );
    if (extracted) {
      return extracted;
    }

    const filtered = safeText
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .filter(line => {
        const trimmed = String(line || '').trim();
        if (!trimmed) return false;
        if (/^%PDF-\d/i.test(trimmed)) return false;
        if (/^\d+\s+\d+\s+obj$/i.test(trimmed)) return false;
        if (/^endobj$/i.test(trimmed)) return false;
        if (/^<<.*>>$/.test(trimmed)) return false;
        if (/^stream$/i.test(trimmed)) return false;
        if (/^endstream$/i.test(trimmed)) return false;
        if (/^(xref|trailer|startxref|%%EOF)$/i.test(trimmed)) return false;
        return true;
      })
      .join('\n');

    return collapseBlankLines(filtered || 'Documento em PDF');
  }

  function normalizePdfDocumentText(text) {
    let normalized = String(text || '').replace(/\r\n?/g, '\n');
    if (!normalized.trim()) return '';

    normalized = normalized
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^\s*[-+*]\s+/gm, '- ')
      .replace(/^\s*\d+\.\s+/gm, '- ')
      .replace(/^```[\w+-]*\s*$/gm, '')
      .replace(/```/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/_([^_\n]+)_/g, '$1')
      .replace(/`([^`\n]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/^[-_]{3,}$/gm, '');

    return collapseBlankLines(normalized);
  }

  function buildDocsModeInstruction(message, docsSourceText = '') {
    const prefersPdf = wantsPdfDocument(message);
    const hasSourceText = Boolean(collapseBlankLines(docsSourceText || ''));
    const instructions = [
      'MODO DOCS ATIVO.',
      'Responda apenas com um bloco de codigo markdown (``` ... ```), sem texto antes ou depois.',
      'Inclua conteudo completo e pronto para salvar em arquivo.',
      'Nao diga que nao consegue gerar arquivo binario; entregue somente o conteudo.',
      'Nunca use frases de limitacao da IA como "como sou um modelo de linguagem".',
      prefersPdf
        ? 'O usuario pediu PDF: use linguagem pdf no bloco markdown (```pdf) e escreva conteudo final sem sintaxe markdown (#, **, listas numeradas).'
        : 'Se nao houver linguagem especifica, use txt.',
    ];

    if (prefersPdf && hasSourceText) {
      instructions.push(
        'Use integralmente o TEXTO BASE fornecido.',
        'Nao resuma, nao encurte, nao substitua por uma versao menor.',
      );
    } else if (prefersPdf) {
      instructions.push(
        'Se for pedido por tema (sem TEXTO BASE), gere documento completo, nao resumo curto.',
        'Formato recomendado: titulo + introducao + secoes claras com paragrafos.',
        'Entregue no minimo 5 paragrafos e pelo menos 420 palavras.',
      );
    }

    return instructions.join(' ');
  }

  function wantsMathHighlighting(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;

    const hasMathKeyword = /\b(conta|calculo|calcular|equacao|equacoes|matematica|matematico|soma|subtracao|multiplicacao|divisao|porcentagem|regra de tres|bhaskara|derivada|integral)\b/.test(normalized);
    if (hasMathKeyword) return true;

    return /\d/.test(normalized) && /[=+\-*/x×÷]/.test(normalized);
  }

  function shouldUseCompactReplyStyle(message) {
    const normalized = normalizeIntentText(message);
    if (!normalized) return false;
    if (wantsTextFileDocument(message)) return false;
    if (wantsImageGeneration(message)) return false;
    if (wantsMathHighlighting(message)) return false;
    if (requestsCodeFeedback(message)) return false;
    if (requestsCodeImprovement(message)) return false;
    if (requestsCodeChangeAudit(message)) return false;
    if (isSimpleGreetingOrAck(message)) return true;
    if (isSimpleDateOrTimeQuestion(message)) return true;
    return normalized.split(' ').filter(Boolean).length <= 2;
  }

  function buildReadableAnswerInstruction(message) {
    if (shouldUseCompactReplyStyle(message)) {
      return [
        'FORMATO DA RESPOSTA (OBRIGATORIO).',
        'Responda de forma curta, natural e direta.',
        'Nao use titulo, secoes, listas, introducao ou conclusao.',
        'Para saudacao, responda em 1 linha (ex: "Oi! Como posso ajudar?").',
        'Para pergunta simples de data/hora, entregue somente a informacao pedida.',
        'Nao adicione explicacao extra sem o usuario pedir.',
      ].join(' ');
    }

    const instructions = [
      'FORMATO DA RESPOSTA (OBRIGATORIO).',
      'Responda em markdown organizado e facil de escanear.',
      'Use ### e blocos com **negrito** somente quando houver mais de um ponto importante.',
      'Quando houver etapas, use lista com - (um item por linha).',
      'Paragrafos curtos: no maximo 2 frases por paragrafo.',
      'Evite introducao e conclusao desnecessarias.',
      'Se a pergunta for objetiva, responda de forma objetiva.',
      'Evite texto corrido longo e estilo redacao.',
    ];

    if (wantsMathHighlighting(message)) {
      instructions.push(
        'Para contas/matematica: mostre o passo a passo.',
        'Centralize cada conta principal em bloco proprio usando $$ ... $$.',
        'Quando usar $$ ... $$, deixe a conta sozinha na linha (sem texto antes ou depois).',
        'Evite LaTeX avancado como \\frac e \\sqrt; prefira formato simples como (6/2).',
        'Destaque o resultado final com **Resultado final:**.',
      );
    }

    return instructions.join(' ');
  }

  function ensureDocsReplyCodeBlock(replyText, message, docsSourceText = '') {
    const safeReply = String(replyText || '').trim();
    const preferredLanguage = wantsPdfDocument(message) ? 'pdf' : 'txt';
    const safeSourceText = collapseBlankLines(docsSourceText || '');
    let content = '';

    if (safeReply) {
      const codeFence = extractFirstCodeFence(safeReply);
      content = codeFence
        ? String(codeFence.content || '')
        : safeReply;
    }

    if (preferredLanguage === 'pdf') {
      content = stripAiLimitationLines(content);
      content = normalizePdfVisibleContent(content);
      content = normalizePdfDocumentText(content);
    } else {
      content = collapseBlankLines(content);
    }

    const shouldPreferSourceContent = shouldForceDocsSourceContent(message, safeSourceText, content);
    const shouldFallbackToSource =
      Boolean(safeSourceText)
      && (
        shouldPreferSourceContent
        || !safeReply
        || !content.trim()
        || content.trim().length < 26
        || /^documento$/i.test(content.trim())
        || isGenericAiFailureText(content)
      );

    if (shouldFallbackToSource) {
      content = preferredLanguage === 'pdf'
        ? normalizePdfDocumentText(safeSourceText)
        : safeSourceText;
    }

    const shouldMarkAsAiFailure =
      !safeSourceText
      && (
        !content.trim()
        || content.trim().length < 26
        || /^documento$/i.test(content.trim())
        || isGenericAiFailureText(content)
      );

    if (shouldMarkAsAiFailure) {
      content = 'Falha ao gerar documento pela IA nesta tentativa. Tente novamente.';
    }

    if (!content.trim()) {
      content = 'Falha ao gerar documento pela IA nesta tentativa. Tente novamente.';
    }

    return `\`\`\`${preferredLanguage}\n${content}\n\`\`\``;
  }

  function saveGeneratedDocsToGallery(replyText, context = {}) {
    const safeReply = String(replyText || '').trim();
    if (!safeReply) return false;
    if (typeof window.LizUI?.addGeneratedDocsFileToGallery !== 'function') {
      return false;
    }

    try {
      return Boolean(
        window.LizUI.addGeneratedDocsFileToGallery({
          replyText: safeReply,
          requestText: String(context.requestText || ''),
          docsSourceText: String(context.docsSourceText || ''),
          conversationContextText: String(context.conversationContextText || ''),
          conversationId: String(context.conversationId || ''),
          conversationTitle: String(context.conversationTitle || ''),
        }),
      );
    } catch (error) {
      console.warn('[Liz] falha ao salvar docs gerado na galeria.', error);
      return false;
    }
  }

  function saveGeneratedImagesToGallery(images, context = {}) {
    const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (safeImages.length === 0) return 0;
    if (typeof window.LizUI?.addGeneratedImagesToGallery !== 'function') {
      return 0;
    }

    try {
      return Number(
        window.LizUI.addGeneratedImagesToGallery(safeImages, {
          source: String(context.source || 'chat'),
          prompt: String(context.prompt || context.requestText || ''),
          conversationId: String(context.conversationId || ''),
          conversationTitle: String(context.conversationTitle || ''),
        }),
      ) || 0;
    } catch (error) {
      console.warn('[Liz] falha ao salvar imagem gerada na galeria.', error);
      return 0;
    }
  }

  function getAttachmentSeedTitle(attachments) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    if (safeAttachments.length === 0) return '';

    const imageCount = safeAttachments.filter(attachment => isImageAttachment(attachment)).length;
    const fileCount = safeAttachments.length - imageCount;
    if (fileCount > 0 && imageCount === 0) {
      return safeAttachments.length > 1 ? 'Arquivos enviados' : 'Arquivo enviado';
    }
    if (fileCount === 0) {
      return safeAttachments.length > 1 ? 'Imagens enviadas' : 'Imagem enviada';
    }
    return safeAttachments.length > 1 ? 'Arquivos enviados' : 'Arquivo enviado';
  }

  function getLatestUserMessageText(conversation) {
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const current = messages[index];
      if (!current || current.role !== 'user') continue;
      const text = String(current.text || '').trim();
      if (text) return text;
    }
    return '';
  }

  function getLatestAssistantMessageText(conversation) {
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const current = messages[index];
      if (!current || (current.role !== 'ai' && current.role !== 'assistant')) continue;
      const text = String(current.text || '').trim();
      if (text) return text;
    }
    return '';
  }

  function buildConversationHistoryContext(conversation, options = {}) {
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    if (messages.length === 0) return '';

    const maxEntriesRaw = Number(options.maxEntries);
    const maxEntries = Math.max(2, Math.min(16, Number.isFinite(maxEntriesRaw) ? maxEntriesRaw : 10));
    const maxCharsRaw = Number(options.maxChars);
    const maxChars = Math.max(900, Math.min(16000, Number.isFinite(maxCharsRaw) ? maxCharsRaw : 6400));

    const chunks = [];
    let consumed = 0;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (chunks.length >= maxEntries || consumed >= maxChars) break;

      const current = messages[index];
      if (!current || (current.role !== 'user' && current.role !== 'ai' && current.role !== 'assistant')) {
        continue;
      }

      const sourceText = extractDocumentSourceCandidate(current.text || '');
      if (!sourceText) continue;

      const roleLabel = current.role === 'user' ? 'Usuario' : 'IA';
      const remaining = Math.max(0, maxChars - consumed);
      const trimmed = remaining > 0
        ? sourceText.slice(0, remaining)
        : '';
      if (!trimmed.trim()) continue;

      const chunk = `[${roleLabel}] ${trimmed.trim()}`;
      chunks.unshift(chunk);
      consumed += chunk.length + 2;
    }

    return collapseBlankLines(chunks.join('\n\n'));
  }

  function getCurrentModelApiValue() {
    return window.LizUI?.getCurrentModelApiValue?.() || 'mini';
  }

  function getCurrentLanguagePreferences() {
    const prefs = window.LizUI?.getLanguagePreferences?.();
    if (!prefs || typeof prefs !== 'object') {
      return {
        uiLanguage: null,
      };
    }
    const uiLanguage = String(prefs.ui_language || '').trim();
    return {
      uiLanguage: uiLanguage || null,
    };
  }

  function buildOutboundChatEnvelope({
    message,
    attachments,
    docsModeEnabled,
    docsSourceText,
    conversationContextText,
    modelApiValue,
  }) {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const basePrompt = buildDirectPromptWithAttachmentContext(message, safeAttachments);
    const normalizedDocsSource = collapseBlankLines(docsSourceText || '');
    const normalizedConversationContext = collapseBlankLines(conversationContextText || '');
    const promptBlocks = [];
    if (normalizedConversationContext) {
      if (!docsModeEnabled) {
        promptBlocks.push([
          '[REGRAS DE CONTINUIDADE - OBRIGATORIO]',
          '- Use o historico abaixo como memoria da conversa.',
          '- Se o usuario perguntar sobre algo dito antes, responda com base no historico.',
          '- Se existir informacao previa no historico, nao diga que ela nao existe.',
          '- Se o usuario disser "me chama de X" ou "meu nome e X", memorize X como nome preferido ate ele mudar.',
        ].join('\n'));
      }
      const historyLabel = docsModeEnabled
        ? '[HISTORICO DA CONVERSA PARA CONTEXTO]'
        : '[CONTEXTO DA CONVERSA RECENTE]';
      promptBlocks.push(`${historyLabel}\n${normalizedConversationContext}`);
    }
    promptBlocks.push(`[MENSAGEM ATUAL DO USUARIO]\n${basePrompt}`);
    if (docsModeEnabled && normalizedDocsSource) {
      promptBlocks.push(`[TEXTO BASE PARA O ARQUIVO]\n${normalizedDocsSource}`);
    }
    const prompt = promptBlocks.join('\n\n');
    const codeEditInstruction = docsModeEnabled
      ? ''
      : buildCodeEditInstruction(message, safeAttachments, normalizedConversationContext);
    const docsInstruction = docsModeEnabled ? buildDocsModeInstruction(message, normalizedDocsSource) : '';
    const hasCodeContext = hasLikelyCodeInText(message)
      || hasCodeLikeAttachmentContext(safeAttachments)
      || hasLikelyCodeInText(normalizedConversationContext);
    const codeOnlyOutputRequested = (!docsModeEnabled)
      && requestsFullCodeOutput(message)
      && (Boolean(codeEditInstruction) || hasCodeContext);
    const codeOutputFormatInstruction = codeOnlyOutputRequested
      ? [
        'FORMATO DE SAIDA (OBRIGATORIO).',
        'Responda somente com um bloco de codigo markdown com o arquivo final completo.',
        'Nao entregue trecho parcial/snipet: entregue o arquivo inteiro, do inicio ao fim.',
        'Nao escreva texto antes ou depois do bloco de codigo.',
        'Nao inclua lista de mudancas fora do codigo.',
        'Nao coloque raciocinio, plano ou comentarios fora do codigo dentro do bloco.',
        'Se o arquivo for HTML, inclua documento completo e fechado (incluindo </html>).',
      ].join(' ')
      : '';
    const readabilityInstruction = docsModeEnabled
      ? ''
      : (codeOnlyOutputRequested ? '' : buildReadableAnswerInstruction(message));
    const modelGuardInstruction = (!docsModeEnabled
      && isLizDevModel25(modelApiValue)
      && Boolean(codeEditInstruction)
      && !requestsFullCodeOutput(message))
      ? [
        'MODO LIZ 2.5 DEV (PRIORIDADE MAXIMA).',
        'Em melhoria/feedback de codigo: nao reescreva o arquivo inteiro.',
        'Preserve a base enviada e proponha apenas ajustes pontuais.',
        'So devolva codigo completo se o usuario pedir isso explicitamente.',
      ].join(' ')
      : '';
    const outboundMessage = clampMessageForBackend(
      [modelGuardInstruction, codeEditInstruction, codeOutputFormatInstruction, prompt, readabilityInstruction, docsInstruction]
        .filter(Boolean)
        .join('\n\n'),
    );

    return {
      prompt,
      outboundMessage,
      modelGuardInstruction,
      codeOutputFormatInstruction,
      codeOnlyOutputRequested,
      codeEditInstruction,
      docsInstruction,
      readabilityInstruction,
      normalizedDocsSource,
      normalizedConversationContext,
      serializedAttachments: serializeAttachmentsForBackend(safeAttachments),
      attachmentNames: normalizeAttachmentPayload(safeAttachments),
    };
  }

  async function fetchBackendReply(
    message,
    conversationId,
    images,
    docsModeEnabled,
    exploreModeEnabled,
    docsSourceText,
    conversationContextText,
    onStreamUpdate,
    onStreamEvent,
  ) {
    const languagePrefs = getCurrentLanguagePreferences();
    const usageModel = getCurrentModelApiValue();
    const envelope = buildOutboundChatEnvelope({
      message,
      attachments: images,
      docsModeEnabled,
      docsSourceText,
      conversationContextText,
      modelApiValue: usageModel,
    });
    const {
      prompt,
      outboundMessage,
      serializedAttachments,
    } = envelope;
    const directUsageActivity = (() => {
      const attCount = Array.isArray(images) ? images.length : 0;
      if (attCount > 0) return 'file_read';
      if (docsModeEnabled) return 'pdf_generation';
      return 'chat_simple';
    })();
    const usageMode = exploreModeEnabled
      ? 'explore'
      : (docsModeEnabled ? 'docs' : 'default');
    const usageAttachmentsCount = Array.isArray(images) ? images.length : 0;

    async function tryDirectLizOnce(options = {}) {
      if (!window.LizApi?.sendDirectLizMessage) {
        return null;
      }
      const timeoutMs = Math.max(
        1200,
        Number(options.timeoutMs) || LIZ_DIRECT_REPLY_TIMEOUT_MS,
      );
      const forceRemote = typeof options.forceRemote === 'boolean'
        ? options.forceRemote
        : false;
      try {
        onStreamEvent?.({
          event: 'meta',
          provider: 'liz-direct',
        });
        onStreamUpdate?.('', {
          isPlaceholder: true,
          delta: '',
          content: 'Pensando...',
        });

        const assistantText = await window.LizApi.sendDirectLizMessage({
          message: outboundMessage || prompt,
          model: getCurrentModelApiValue(),
          uiLanguage: languagePrefs.uiLanguage,
          timeoutMs,
          forceRemote,
        });

        const safeAssistantText = String(assistantText || '').trim();
        if (!safeAssistantText) {
          return null;
        }

        onStreamUpdate?.(safeAssistantText, {
          isPlaceholder: false,
          delta: safeAssistantText,
          content: safeAssistantText,
        });
        onStreamEvent?.({
          event: 'done',
          provider: 'liz-direct',
        });
        const usageToken = window.LizAuth?.getAccessToken?.() || '';
        if (usageToken && window.LizApi?.consumeUsageAction) {
          try {
            await window.LizApi.consumeUsageAction({
              token: usageToken,
              activity: directUsageActivity,
              count: 1,
              model: usageModel,
              mode: usageMode,
              attachmentsCount: usageAttachmentsCount,
            });
          } catch (consumeError) {
            const blockedMessage = String(consumeError?.message || '').trim();
            if (blockedMessage) {
              onStreamUpdate?.(blockedMessage, {
                isPlaceholder: false,
                delta: blockedMessage,
                content: blockedMessage,
              });
              void window.LizUI?.syncUsageSummary?.({ render: true, force: true });
              return blockedMessage;
            }
          }
        }
        void window.LizUI?.syncUsageSummary?.({ render: true, force: true });
        return safeAssistantText;
      } catch (error) {
        const messageText = String(error?.message || '');
        onStreamEvent?.({
          event: 'error',
          provider: 'liz-direct',
          message: messageText || 'Falha ao consultar API da Liz.',
        });
        console.warn('[Liz] falha ao consultar API da Liz no frontend.', error);
        return null;
      }
    }

    const preferDirectFirst = false;

    if (preferDirectFirst) {
      const directReply = await tryDirectLizOnce();
      if (directReply) {
        return directReply;
      }
    }

    const auth = window.LizAuth;
    let token = auth?.getAccessToken?.() || '';
    if (!token && typeof auth?.ensureSession === 'function') {
      try {
        await auth.ensureSession();
        token = auth.getAccessToken?.() || '';
      } catch (error) {
        if (!auth?.isAuthRequiredError?.(error)) {
          console.warn('[Liz] falha ao validar sessao antes do chat.', error);
        }
        token = '';
      }
    }

    if (token && typeof window.LizApi?.sendChatMessage === 'function' && outboundMessage) {
      const sendBackendMessage = currentToken => window.LizApi.sendChatMessage({
        token: currentToken,
        message: buildBackendStoredMessageText(message, images),
        aiPrompt: outboundMessage,
        conversationId: conversationId || null,
        attachments: serializedAttachments,
        model: getCurrentModelApiValue(),
        mode: exploreModeEnabled
          ? 'explore'
          : (docsModeEnabled ? 'docs' : 'default'),
        uiLanguage: languagePrefs.uiLanguage,
        timeoutMs: docsModeEnabled
          ? BACKEND_CHAT_DOCS_TIMEOUT_MS
          : (exploreModeEnabled ? BACKEND_CHAT_EXPLORE_TIMEOUT_MS : BACKEND_REPLY_MAX_WAIT_MS),
      });

      try {
        onStreamEvent?.({
          event: 'meta',
          provider: 'liz-backend',
        });
        onStreamUpdate?.('', {
          isPlaceholder: true,
          delta: '',
          content: 'Pensando...',
        });

        let res;
        try {
          res = await sendBackendMessage(token);
        } catch (error) {
          const unauthorized = Number(error?.status) === 401;
          if (!unauthorized || typeof auth?.refresh !== 'function') {
            throw error;
          }

          await auth.refresh();
          token = auth.getAccessToken?.() || '';
          if (!token) {
            throw error;
          }
          res = await sendBackendMessage(token);
        }

        const assistantText = String(
          res?.assistant_message?.content
          || res?.content
          || res?.message?.content
          || '',
        ).trim();
        const backendFallbackReply = Boolean(res?.fallback || res?.assistant_message?.fallback);
        if (assistantText && isGenericAiFailureText(assistantText) && !backendFallbackReply) {
          throw new Error(assistantText);
        }
        if (assistantText) {
          onStreamUpdate?.(assistantText, {
            isPlaceholder: false,
            delta: assistantText,
            content: assistantText,
          });
          onStreamEvent?.({
            event: 'done',
            provider: 'liz-backend',
          });
          void window.LizUI?.syncUsageSummary?.({ render: true });
          return assistantText;
        }
      } catch (error) {
        const messageText = String(error?.message || '');
        const statusCode = Number(error?.status || 0);
        const quotaBlocked = statusCode === 403
          || /\b(tokens?\s+gratuitos?|limite\s+mensal|cota)\b/i.test(messageText);
        if (quotaBlocked) {
          const quotaMessage = messageText || 'Seus tokens gratuitos acabaram. Aguarde a recarga automatica.';
          onStreamUpdate?.(quotaMessage, {
            isPlaceholder: false,
            delta: quotaMessage,
            content: quotaMessage,
          });
          onStreamEvent?.({
            event: 'done',
            provider: 'liz-backend',
          });
          void window.LizUI?.syncUsageSummary?.({ render: true, force: true });
          return quotaMessage;
        }
        onStreamEvent?.({
          event: 'error',
          provider: 'liz-backend',
          message: messageText || 'Falha no chat do servidor.',
        });
        console.warn('[Liz] chat via backend falhou; tentando API direta.', error);
      }
    }

    if (exploreModeEnabled) {
      return null;
    }

    if (!preferDirectFirst) {
      const fallbackDirect = await tryDirectLizOnce();
      if (fallbackDirect) {
        return fallbackDirect;
      }
    } else {
      const retryDirect = await tryDirectLizOnce();
      if (retryDirect) {
        return retryDirect;
      }
    }

    return null;
  }

  async function sendMessage() {
    if (conversationState.historyClearPromise) {
      try {
        await conversationState.historyClearPromise;
      } catch (error) {
        // no-op: segue tentativa de envio mesmo se limpeza remota falhar.
      }
    }

    const ui = getUiState();
    const message = ui.input?.value?.trim() || '';
    if (conversationState.loadingAttachments) {
      return;
    }

    const images = conversationState.pendingAttachments.slice();
    if (!message && images.length === 0) return;

    const seedTitle = message || getAttachmentSeedTitle(images) || 'Nova conversa';
    const docsModeEnabled = resolveDocsModeForOutgoingMessage(message);
    const imagineModeEnabled = resolveImagineModeForOutgoingMessage(message, { docsModeEnabled });
    const exploreModeEnabled = resolveExploreModeForOutgoingMessage(message, {
      docsModeEnabled,
      imagineModeEnabled,
    });
    const imageIntent = imagineModeEnabled ? parseImageGenerationIntent(message) : null;

    const activeConversation = ensureActiveConversation(seedTitle);
    if (!activeConversation) return;

    const previousUserText = getLatestUserMessageText(activeConversation);
    const previousAssistantText = getLatestAssistantMessageText(activeConversation);
    const conversationContextText = buildConversationHistoryContext(activeConversation, {
      maxEntries: 12,
      maxChars: 7200,
    });
    const docsSourceText = docsModeEnabled
      ? resolveDocsSourceText(
          message,
          previousUserText,
          previousAssistantText,
          conversationContextText,
        )
      : '';

    const conversationId = activeConversation.id;

    activateChatMode();
    appendMessageToUi('user', message, images);
    appendMessageToConversation(conversationId, 'user', message, images);

    ui.input.value = '';
    ui.input.style.height = 'auto';
    clearPendingAttachments();

    if (!ui.chatContainer) return;

    const typingRow = createTypingRow();
    ui.chatContainer.appendChild(typingRow);
    scrollChatToBottom();

    let liveStreamText = '';
    let backendReply = null;
    let aiImages = [];
    let usedBackend = false;

    if (imagineModeEnabled && typeof window.LizApi?.generateFluxImage === 'function') {
      setThinkingStatus(typingRow, 'Gerando imagem...');
      const tokenForImages = window.LizAuth?.getAccessToken?.() || '';
      let quotaBlocked = false;
      if (tokenForImages && window.LizApi?.getUsageSummary) {
        try {
          const sum = await window.LizApi.getUsageSummary({ token: tokenForImages, timeoutMs: 6000 });
          const planRemaining = Number(sum?.token_pool_remaining);
          const freeRemaining = Number(sum?.free_tokens_remaining);
          const remaining = Number.isFinite(planRemaining) ? planRemaining : freeRemaining;
          const imageCost = Number(sum?.token_activity_costs?.image_generation)
            || Number(sum?.free_tokens_activity_costs?.image_generation)
            || 250;
          const used = Number(sum?.images_used);
          const limit = Number(sum?.images_limit);
          if (Number.isFinite(remaining) && remaining < imageCost) {
            quotaBlocked = true;
            liveStreamText = 'Tokens insuficientes para gerar imagem agora.';
          } else if (Number.isFinite(used) && Number.isFinite(limit) && used >= limit) {
            quotaBlocked = true;
            liveStreamText = 'Limite de imagens atingido para o seu plano.';
          }
        } catch (error) {
          console.warn('[Liz] nao foi possivel verificar cota antes de gerar imagem no chat.', error);
        }
      }

      if (!quotaBlocked) {
        try {
          const fluxPrompt = imageIntent ? imageIntent.prompt : message;
          const generated = await window.LizApi.generateFluxImage({
            prompt: fluxPrompt,
            attachments: images,
            token: tokenForImages,
            timeoutMs: Math.max(BACKEND_REPLY_MAX_WAIT_MS, 65000),
          });
          aiImages = Array.isArray(generated?.images) ? generated.images : [];
          liveStreamText = String(generated?.text || '').trim();
          usedBackend = aiImages.length > 0 || Boolean(liveStreamText);

          if (aiImages.length > 0 && tokenForImages && window.LizApi?.consumeImagesUsage) {
            try {
              await window.LizApi.consumeImagesUsage({ token: tokenForImages, count: 1 });
              void window.LizUI?.syncUsageSummary?.({ render: true });
            } catch (error) {
              console.warn('[Liz] imagem gerada no chat, mas uso nao registrado no servidor.', error);
            }
          }
        } catch (error) {
          liveStreamText = String(error?.message || '').trim()
            || 'Nao foi possivel gerar imagem agora. Tente novamente.';
        }
      }
    } else {
      backendReply = await fetchBackendReply(
        message,
        conversationId,
        images,
        docsModeEnabled,
        exploreModeEnabled,
        docsSourceText,
        conversationContextText,
        (partialText, streamMeta = {}) => {
          if (streamMeta.isPlaceholder) {
            setThinkingStatus(typingRow, exploreModeEnabled ? 'Pesquisando na web...' : 'Pensando...');
            return;
          }
          liveStreamText = String(partialText || '');
          updateTypingRowText(typingRow, liveStreamText);
        },
        eventPayload => {
          handleThinkingStreamEvent(typingRow, eventPayload);
        },
      );
      usedBackend = Boolean(backendReply || liveStreamText);
    }

    let aiReply = backendReply || liveStreamText || 'Nao foi possivel obter resposta da API da IA agora. Tente novamente.';
    if (exploreModeEnabled && !backendReply && !liveStreamText) {
      aiReply = 'Nao consegui concluir a pesquisa profunda na web agora. Tente novamente em instantes.';
    }
    if (imagineModeEnabled && aiImages.length > 0 && !String(aiReply || '').trim()) {
      aiReply = 'Imagem pronta. Se quiser, eu gero novas variacoes.';
    }
    if (docsModeEnabled) {
      aiReply = ensureDocsReplyCodeBlock(aiReply, message, docsSourceText);
      saveGeneratedDocsToGallery(aiReply, {
        requestText: message,
        docsSourceText,
        conversationContextText,
        conversationId,
        conversationTitle: activeConversation.title || '',
      });
    } else {
      aiReply = ensureCodeOnlyReplyCodeBlock(aiReply, message, images, conversationContextText);
    }
    if (aiImages.length > 0) {
      saveGeneratedImagesToGallery(aiImages, {
        source: 'chat',
        prompt: imageIntent ? imageIntent.prompt : message,
        requestText: message,
        conversationId,
        conversationTitle: activeConversation.title || '',
      });
    }
    const responseTimeMs = normalizeResponseTimeMs(getThinkingElapsedMs(typingRow));
    appendMessageToConversation(conversationId, 'ai', aiReply, aiImages, { responseTimeMs });

    if (conversationState.currentConversationId === conversationId) {
      if (typingRow.isConnected) {
        if (aiImages.length > 0) {
          stopThinkingTimer(typingRow);
          typingRow.remove();
          appendMessageToUi('ai', aiReply, aiImages, { responseTimeMs });
        } else {
          finalizeTypingRow(typingRow, aiReply, {
            usedBackend,
            responseTimeMs,
          });
        }
      } else {
        appendMessageToUi('ai', aiReply, aiImages, { responseTimeMs });
      }
    } else if (typingRow.isConnected) {
      stopThinkingTimer(typingRow);
      typingRow.remove();
    }

  }

  function openConversationById(conversationId) {
    const conversation = findConversationById(conversationId);
    if (!conversation) return false;

    conversationState.currentConversationId = conversationId;
    renderHistory();
    renderCurrentConversation();
    persistConversationsCache();
    return true;
  }

  function getConversationSummaries() {
    return conversationState.conversations.map(conversation => ({
      id: conversation.id,
      title: conversation.title,
      period: conversation.period,
      timeLabel: conversation.timeLabel,
      messageCount: conversation.messages.length,
      lastUpdatedAt: conversation.lastUpdatedAt,
      createdAt: conversation.createdAt,
    }));
  }

  function getActivitySeries(monthCount = 8) {
    const safeMonthCount = Math.min(24, Math.max(3, Number(monthCount) || 8));
    const now = new Date();
    const monthKeys = [];
    const buckets = new Map();

    for (let offset = safeMonthCount - 1; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
      buckets.set(key, {
        key,
        label: new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date),
        messages: 0,
        conversations: 0,
      });
    }

    const seenConversationMonth = new Set();

    conversationState.conversations.forEach(conversation => {
      const fallbackDate = new Date(conversation.lastUpdatedAt || conversation.createdAt || Date.now());
      const conversationKey = `${fallbackDate.getFullYear()}-${String(fallbackDate.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(conversationKey)) {
        const marker = `${conversation.id}:${conversationKey}`;
        if (!seenConversationMonth.has(marker)) {
          seenConversationMonth.add(marker);
          buckets.get(conversationKey).conversations += 1;
        }
      }

      conversation.messages.forEach(message => {
        const messageDate = new Date(message.createdAt || fallbackDate);
        if (Number.isNaN(messageDate.getTime())) return;
        const key = `${messageDate.getFullYear()}-${String(messageDate.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) return;
        buckets.get(key).messages += 1;
      });
    });

    return monthKeys.map(key => buckets.get(key));
  }

  function bindEvents() {
    const ui = getUiState();
    if (!ui.input || !ui.sendBtn) return;

    conversationState.chatAttachBtn = document.getElementById('chatAttachBtn');
    conversationState.chatModeTray = document.getElementById('chatModeTray');
    conversationState.chatPlusMenu = document.getElementById('chatPlusMenu');
    conversationState.chatPlusDropdown = document.getElementById('chatPlusDropdown');
    conversationState.chatPlusSubmenu = document.getElementById('chatPlusSubmenu');
    conversationState.chatPlusMoreOption = document.querySelector('[data-chat-plus-mode="more"]');
    conversationState.chatFileInput = document.getElementById('chatFileInput');
    conversationState.chatAttachmentTray = document.getElementById('chatAttachmentTray');
    conversationState.chatImageModal = document.getElementById('chatImageModal');
    conversationState.chatImageModalImg = document.getElementById('chatImageModalImg');
    conversationState.chatImageModalClose = document.getElementById('chatImageModalClose');

    conversationState.chatAttachBtn?.addEventListener('click', event => {
      event.stopPropagation();
      const shouldOpen = !conversationState.chatPlusMenu?.classList.contains('open');
      setPlusMenuOpen(shouldOpen);
    });

    conversationState.chatPlusDropdown?.addEventListener('click', event => {
      const option = event.target.closest('[data-chat-plus-mode]');
      if (!option) return;
      event.stopPropagation();
      handlePlusModeAction(option.dataset.chatPlusMode || '');
    });

    conversationState.chatPlusSubmenu?.addEventListener('click', event => {
      const option = event.target.closest('[data-chat-plus-submode]');
      if (!option) return;
      event.stopPropagation();
      handlePlusSubmodeAction(option.dataset.chatPlusSubmode || '');
    });

    conversationState.chatFileInput?.addEventListener('change', handleChatFileSelection);
    conversationState.chatImageModalClose?.addEventListener('click', closeImagePreview);
    conversationState.chatImageModal?.addEventListener('click', event => {
      if (event.target === conversationState.chatImageModal) {
        closeImagePreview();
      }
    });
    document.addEventListener('keydown', handleModalKeydown);
    document.addEventListener('click', event => {
      if (!conversationState.chatPlusMenu?.contains(event.target)) {
        closePlusMenu();
      }
    });

    ui.historyContainer?.addEventListener('click', event => {
      const target = event.target.closest('.conv-item');
      if (!target) return;

      const conversationId = target.dataset.conversationId;
      if (!conversationId) return;

      window.LizUI?.setWorkspaceView?.('chat');
      openConversationById(conversationId);
    });

    ui.clearAllBtn?.addEventListener('click', clearAllConversations);
    window.addEventListener('liz:user-updated', event => {
      const nextUser = event?.detail?.user || null;
      applyConversationScope(nextUser);
    });

    ui.input.addEventListener('input', () => {
      ui.input.style.height = 'auto';
      ui.input.style.height = `${Math.min(ui.input.scrollHeight, 120)}px`;
    });

    ui.input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    ui.input.addEventListener('paste', handleChatPaste);

    ui.sendBtn.addEventListener('click', sendMessage);
    renderQuickModeTray();
    renderPendingAttachments();
  }

  function initChat() {
    if (initialized) return;
    conversationState.cacheOwnerKey = resolveConversationOwnerKey();
    restoreConversationsFromCache();
    renderHistory();
    renderCurrentConversation();
    bindEvents();
    emitConversationsUpdated();
    void hydrateConversationsFromServer({ limit: 100 });
    initialized = true;
  }

  function resolveDocsModeForOutgoingMessageWithState(message, docsModeActive = false) {
    const previousModes = Array.isArray(conversationState.activeQuickModes)
      ? conversationState.activeQuickModes.slice()
      : [];
    conversationState.activeQuickModes = docsModeActive ? ['docs'] : [];
    try {
      return resolveDocsModeForOutgoingMessage(message);
    } finally {
      conversationState.activeQuickModes = previousModes;
    }
  }

  function getChatDebugApi() {
    return {
      normalizeIntentText,
      wantsTextFileDocument,
      requestsCodeImprovement,
      requestsCodeFeedback,
      requestsCodeChangeAudit,
      requestsStrictCodePreservation,
      requestsFullCodeOutput,
      isLizDevModel25,
      buildCodeEditInstruction,
      shouldUseCompactReplyStyle,
      clampMessageForBackend,
      buildOutboundChatEnvelope,
      ensureCodeOnlyReplyCodeBlock,
      extractLikelyCodeBodyFromText,
      resolvePreferredCodeFenceLanguage,
      resolveDocsModeForOutgoingMessageWithState,
      hasLikelyCodeInText,
    };
  }

  const lizChatApi = {
    initChat,
    sendMessage,
    startNewChat,
    getConversationSummaries,
    getActivitySeries,
    openConversationById,
    isDocsModeActive,
  };
  if (window.__LIZ_ENABLE_DEBUG_API__) {
    lizChatApi.__debug = getChatDebugApi();
  }

  window.LizChat = lizChatApi;
})();
