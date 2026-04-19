(function initAuthModule() {
  const STORAGE_KEY = 'liz_auth_session_v3';
  const LOGIN_PAGE = 'login.html';
  const SOCIAL_LOGIN_PENDING_KEY = 'liz_social_login_pending_v1';
  const SOCIAL_LOGIN_PENDING_TTL_MS = 15 * 60 * 1000;
  const SUPPORTED_SOCIAL_PROVIDERS = new Set(['google', 'github']);
  const CONNECTED_ACCOUNTS_KEY = 'liz_connected_accounts_v1';
  const CONNECTED_ACCOUNTS_LIMIT = 8;

  let currentUser = null;
  let accessToken = null;
  let refreshToken = null;
  let ensurePromise = null;
  let initialized = false;
  const TOKEN_EXPIRY_SKEW_MS = 45000;
  const ACCESS_TOKEN_REVALIDATE_MS = 60000;
  let lastAccessValidationAtMs = 0;

  function isUnauthorizedError(error) {
    return Number(error?.status) === 401;
  }

  function createAuthRequiredError() {
    const error = new Error('AUTH_REQUIRED');
    error.code = 'AUTH_REQUIRED';
    return error;
  }

  function isAuthRequiredError(error) {
    return error?.code === 'AUTH_REQUIRED' || error?.message === 'AUTH_REQUIRED';
  }

  function isTransientSessionError(error) {
    const status = Number(error?.status || 0);
    if (status >= 500 || status === 0) {
      return true;
    }

    const message = String(error?.message || '').trim().toLowerCase();
    if (!message) return false;

    return (
      message.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('conectar')
    );
  }

  function hasUsableLocalSession() {
    return Boolean(
      currentUser &&
      accessToken &&
      tokenLooksLikeCurrentFormat(accessToken) &&
      !tokenIsNearExpiry(accessToken, 5000),
    );
  }

  function tokenLooksLikeCurrentFormat(token) {
    if (typeof token !== 'string') return false;
    const trimmed = token.trim();
    if (!trimmed) return false;

    // Accept current JWT format (header.payload.signature)
    // and keep compatibility with old local tokens (... .z).
    const looksLikeJwt = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed);
    const looksLikeLegacy = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.z$/.test(trimmed);
    return looksLikeJwt || looksLikeLegacy;
  }

  function decodeJwtPayload(token) {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) return null;
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
      const decoded = window.atob(payload);
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function tokenIsNearExpiry(token, skewMs = TOKEN_EXPIRY_SKEW_MS) {
    const payload = decodeJwtPayload(token);
    const exp = Number(payload?.exp || 0);
    if (!Number.isFinite(exp) || exp <= 0) {
      return false;
    }
    const expiryMs = exp * 1000;
    return (Date.now() + Math.max(0, skewMs)) >= expiryMs;
  }

  function normalizeSessionTokenValue(value) {
    const safe = String(value || '').trim();
    if (!safe || !tokenLooksLikeCurrentFormat(safe)) return '';
    return safe;
  }

  function normalizeAuthTokens(tokens, options = {}) {
    if (!tokens || typeof tokens !== 'object') return null;
    const allowMissingRefresh = Boolean(options.allowMissingRefresh);
    const access = normalizeSessionTokenValue(tokens.access_token);
    const refresh = normalizeSessionTokenValue(tokens.refresh_token);

    if (!access) return null;
    if (!allowMissingRefresh && !refresh) return null;

    return {
      access_token: access,
      refresh_token: refresh,
      token_type: String(tokens.token_type || 'Bearer'),
      expires_in: Number(tokens.expires_in || 0) || undefined,
    };
  }

  function extractAuthTokens(response, options = {}) {
    if (!response || typeof response !== 'object') return null;

    const direct = normalizeAuthTokens(response, options);
    if (direct) return direct;

    const nestedTokens = response.tokens;
    return normalizeAuthTokens(nestedTokens, options);
  }

  function extractAuthUser(response) {
    if (!response || typeof response !== 'object') return null;

    if (response.user && typeof response.user === 'object') {
      return response.user;
    }

    const looksLikeUser = response.id || response.email || response.username || response.display_name;
    return looksLikeUser ? response : null;
  }

  function readAuthTokensOrThrow(response, actionName, options = {}) {
    const tokens = extractAuthTokens(response, options);
    if (tokens) return tokens;
    const action = String(actionName || 'auth').trim().toUpperCase();
    const error = new Error(`AUTH_${action}_TOKENS_INVALID`);
    error.code = 'AUTH_TOKENS_INVALID';
    throw error;
  }

  function readAuthUserOrThrow(response, actionName) {
    const user = extractAuthUser(response);
    if (user) return user;
    const action = String(actionName || 'auth').trim().toUpperCase();
    const error = new Error(`AUTH_${action}_USER_INVALID`);
    error.code = 'AUTH_USER_INVALID';
    throw error;
  }

  function sanitizeAccountAvatarUrl(value) {
    const avatarUrl = String(value || '').trim();
    if (!avatarUrl) return '';
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    if (avatarUrl.startsWith('/')) return avatarUrl;
    if (/^data:image\//i.test(avatarUrl) && avatarUrl.length <= 400000) {
      return avatarUrl;
    }
    return '';
  }

  function sanitizeConnectedAccountUser(user) {
    if (!user || typeof user !== 'object') return null;

    const email = String(user.email || '').trim().toLowerCase();
    const id = String(user.id || '').trim();
    if (!id && !email) return null;

    return {
      id: id || undefined,
      email: email || undefined,
      display_name: String(user.display_name || user.displayName || '').trim() || undefined,
      username: String(user.username || user.user_name || '').trim() || undefined,
      avatar_url: sanitizeAccountAvatarUrl(user.avatar_url || user.avatarUrl || user.picture || ''),
      created_at: String(user.created_at || user.createdAt || '').trim() || undefined,
      tier: String(user.tier || '').trim() || undefined,
    };
  }

  function readConnectedAccounts() {
    try {
      const raw = window.localStorage.getItem(CONNECTED_ACCOUNTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map(item => {
          if (!item || typeof item !== 'object') return null;
          const user = sanitizeConnectedAccountUser(item.user);
          const savedAccess = String(item.accessToken || '').trim();
          const savedRefresh = String(item.refreshToken || '').trim();
          if (!user || !savedAccess || !savedRefresh) return null;
          if (!tokenLooksLikeCurrentFormat(savedAccess) || !tokenLooksLikeCurrentFormat(savedRefresh)) {
            return null;
          }
          return {
            user,
            accessToken: savedAccess,
            refreshToken: savedRefresh,
            lastUsedAt: Number(item.lastUsedAt || 0) || Date.now(),
          };
        })
        .filter(Boolean)
        .slice(0, CONNECTED_ACCOUNTS_LIMIT);
    } catch (error) {
      return [];
    }
  }

  function writeConnectedAccounts(accounts) {
    try {
      const safe = Array.isArray(accounts) ? accounts.slice(0, CONNECTED_ACCOUNTS_LIMIT) : [];
      window.localStorage.setItem(CONNECTED_ACCOUNTS_KEY, JSON.stringify(safe));
    } catch (error) {
      // no-op
    }
  }

  function findConnectedAccount(accounts, accountKey) {
    const safeKey = String(accountKey || '').trim().toLowerCase();
    if (!safeKey) return null;
    const list = Array.isArray(accounts) ? accounts : [];
    return list.find(item => {
      const id = String(item?.user?.id || '').trim().toLowerCase();
      const email = String(item?.user?.email || '').trim().toLowerCase();
      return safeKey === id || safeKey === email;
    }) || null;
  }

  function removeConnectedAccount(accountKey) {
    const safeKey = String(accountKey || '').trim().toLowerCase();
    if (!safeKey) return;
    const next = readConnectedAccounts().filter(item => {
      const id = String(item?.user?.id || '').trim().toLowerCase();
      const email = String(item?.user?.email || '').trim().toLowerCase();
      return safeKey !== id && safeKey !== email;
    });
    writeConnectedAccounts(next);
  }

  function upsertConnectedAccountFromSession() {
    const safeUser = sanitizeConnectedAccountUser(currentUser);
    if (!safeUser || !accessToken || !refreshToken) return;
    if (!tokenLooksLikeCurrentFormat(accessToken) || !tokenLooksLikeCurrentFormat(refreshToken)) return;

    const currentId = String(safeUser.id || '').trim().toLowerCase();
    const currentEmail = String(safeUser.email || '').trim().toLowerCase();
    const now = Date.now();

    const next = readConnectedAccounts()
      .filter(item => {
        const id = String(item?.user?.id || '').trim().toLowerCase();
        const email = String(item?.user?.email || '').trim().toLowerCase();
        if (currentId && id === currentId) return false;
        if (currentEmail && email === currentEmail) return false;
        return true;
      });

    next.unshift({
      user: safeUser,
      accessToken,
      refreshToken,
      lastUsedAt: now,
    });

    writeConnectedAccounts(next);
  }

  function listConnectedAccounts() {
    const currentId = String(currentUser?.id || '').trim().toLowerCase();
    const currentEmail = String(currentUser?.email || '').trim().toLowerCase();

    return readConnectedAccounts().map(item => {
      const user = sanitizeConnectedAccountUser(item.user) || {};
      const itemId = String(user.id || '').trim().toLowerCase();
      const itemEmail = String(user.email || '').trim().toLowerCase();
      const isCurrent = Boolean(
        (currentId && itemId && currentId === itemId)
        || (currentEmail && itemEmail && currentEmail === itemEmail),
      );

      return {
        ...user,
        is_current: isCurrent,
        last_used_at: Number(item.lastUsedAt || 0) || 0,
      };
    });
  }

  function readStoredSession() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function persistSession() {
    try {
      upsertConnectedAccountFromSession();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: currentUser,
        accessToken,
        refreshToken,
      }));
    } catch (error) {
      // no-op
    }
  }

  function clearStoredSession() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // no-op
    }
  }

  function setSession({ user, tokens }) {
    const normalizedTokens = normalizeAuthTokens(tokens);
    currentUser = user || null;
    accessToken = normalizedTokens?.access_token || null;
    refreshToken = normalizedTokens?.refresh_token || null;
    lastAccessValidationAtMs = 0;
    persistSession();
    return currentUser;
  }

  function restoreSession() {
    const stored = readStoredSession();
    if (!stored) return;
    currentUser = stored.user || null;
    accessToken = stored.accessToken || null;
    refreshToken = stored.refreshToken || null;
  }

  function sanitizeStoredTokens() {
    let changed = false;

    if (accessToken && !tokenLooksLikeCurrentFormat(accessToken)) {
      accessToken = null;
      changed = true;
    }
    if (refreshToken && !tokenLooksLikeCurrentFormat(refreshToken)) {
      refreshToken = null;
      changed = true;
    }

    if (changed) {
      currentUser = null;
      persistSession();
    }
  }

  function logoutLocalOnly() {
    currentUser = null;
    accessToken = null;
    refreshToken = null;
    lastAccessValidationAtMs = 0;
    clearStoredSession();
  }

  async function validateAccessToken() {
    if (!accessToken) return false;

    try {
      const user = await window.LizApi.getMe(accessToken);
      currentUser = user || currentUser;
      lastAccessValidationAtMs = Date.now();
      persistSession();
      return true;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const staleKey = String(currentUser?.id || currentUser?.email || '').trim();
        if (staleKey) {
          removeConnectedAccount(staleKey);
        }
        currentUser = null;
        accessToken = null;
        lastAccessValidationAtMs = 0;
        persistSession();
        return false;
      }
      throw error;
    }
  }

  async function renewSessionWithRefreshToken() {
    if (!refreshToken) return false;

    try {
      const refreshResponse = await window.LizApi.refreshSession(refreshToken);
      const tokens = readAuthTokensOrThrow(refreshResponse, 'refresh', { allowMissingRefresh: true });
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token || refreshToken;

      const user = await window.LizApi.getMe(accessToken);
      currentUser = user || currentUser;
      lastAccessValidationAtMs = Date.now();
      persistSession();
      return true;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const staleKey = String(currentUser?.id || currentUser?.email || '').trim();
        if (staleKey) {
          removeConnectedAccount(staleKey);
        }
        logoutLocalOnly();
        return false;
      }
      throw error;
    }
  }

  async function login(email, password) {
    const response = await window.LizApi.login({ email, password });
    const user = readAuthUserOrThrow(response, 'login');
    const tokens = readAuthTokensOrThrow(response, 'login');
    setSession({ user, tokens });
    return currentUser;
  }

  async function register(email, password, displayName) {
    const response = await window.LizApi.register({ email, password, displayName });
    const user = readAuthUserOrThrow(response, 'register');
    const tokens = readAuthTokensOrThrow(response, 'register');
    setSession({ user, tokens });
    return currentUser;
  }

  async function refresh() {
    if (!refreshToken) throw createAuthRequiredError();

    const refreshResponse = await window.LizApi.refreshSession(refreshToken);
    const tokens = readAuthTokensOrThrow(refreshResponse, 'refresh', { allowMissingRefresh: true });
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token || refreshToken;

    if (!currentUser && accessToken) {
      currentUser = await window.LizApi.getMe(accessToken);
    }

    persistSession();
    return tokens;
  }

  async function logout(options = {}) {
    const redirect = options.redirect !== false;

    try {
      if (refreshToken) {
        await window.LizApi.logout(refreshToken);
      }
    } catch (error) {
      // Ignored: local cleanup still required.
    } finally {
      logoutLocalOnly();
      if (redirect) {
        redirectToLogin();
      }
    }
  }

  async function ensureSession(options = {}) {
    const force = Boolean(options?.force);
    if (ensurePromise) return ensurePromise;

    ensurePromise = (async () => {
      restoreSession();
      sanitizeStoredTokens();
      const hasRecentValidation =
        lastAccessValidationAtMs > 0 &&
        (Date.now() - lastAccessValidationAtMs) < ACCESS_TOKEN_REVALIDATE_MS;
      const accessSeemsFresh = accessToken && !tokenIsNearExpiry(accessToken);

      if (!force && currentUser && accessSeemsFresh && hasRecentValidation) {
        return currentUser;
      }

      if (!force && accessSeemsFresh && !currentUser && hasRecentValidation) {
        const user = await window.LizApi.getMe(accessToken);
        currentUser = user || currentUser;
        lastAccessValidationAtMs = Date.now();
        persistSession();
        return currentUser;
      }

      if (accessToken) {
        try {
          const isValid = await validateAccessToken();
          if (isValid) return currentUser;
        } catch (error) {
          if (!force && hasUsableLocalSession() && isTransientSessionError(error)) {
            return currentUser;
          }
          throw error;
        }
      }

      let refreshed = false;
      try {
        refreshed = await renewSessionWithRefreshToken();
      } catch (error) {
        if (!force && hasUsableLocalSession() && isTransientSessionError(error)) {
          return currentUser;
        }
        throw error;
      }
      if (refreshed) {
        return currentUser;
      }

      throw createAuthRequiredError();
    })();

    try {
      return await ensurePromise;
    } finally {
      ensurePromise = null;
    }
  }

  function isAuthenticated() {
    return Boolean(currentUser && accessToken);
  }

  function getCurrentUser() {
    return currentUser;
  }

  function setCurrentUser(user) {
    if (!user || typeof user !== 'object') return currentUser;
    currentUser = {
      ...currentUser,
      ...user,
    };
    persistSession();
    return currentUser;
  }

  async function switchConnectedAccount(accountKey) {
    const safeKey = String(accountKey || '').trim();
    if (!safeKey) {
      const missingError = new Error('ACCOUNT_NOT_FOUND');
      missingError.code = 'ACCOUNT_NOT_FOUND';
      throw missingError;
    }

    const available = readConnectedAccounts();
    const target = findConnectedAccount(available, safeKey);
    if (!target) {
      const missingError = new Error('ACCOUNT_NOT_FOUND');
      missingError.code = 'ACCOUNT_NOT_FOUND';
      throw missingError;
    }

    const previousSession = {
      user: currentUser,
      accessToken,
      refreshToken,
    };

    currentUser = target.user || null;
    accessToken = target.accessToken || null;
    refreshToken = target.refreshToken || null;
    lastAccessValidationAtMs = 0;
    persistSession();

    try {
      await ensureSession({ force: true });
      persistSession();
      return currentUser;
    } catch (error) {
      removeConnectedAccount(safeKey);

      if (previousSession.user && previousSession.accessToken && previousSession.refreshToken) {
        currentUser = previousSession.user;
        accessToken = previousSession.accessToken;
        refreshToken = previousSession.refreshToken;
        lastAccessValidationAtMs = 0;
        persistSession();
      } else {
        logoutLocalOnly();
      }

      const switchError = new Error('ACCOUNT_SWITCH_FAILED');
      switchError.code = 'ACCOUNT_SWITCH_FAILED';
      switchError.cause = error;
      throw switchError;
    }
  }

  function getAccessToken() {
    return accessToken;
  }

  function isLoginPage() {
    const path = String(window.location.pathname || '').toLowerCase();
    return path.endsWith('/login.html') || path === '/login.html';
  }

  function normalizeSocialProvider(provider) {
    const safe = String(provider || '').trim().toLowerCase();
    return SUPPORTED_SOCIAL_PROVIDERS.has(safe) ? safe : '';
  }

  function resolveSupabaseUrl() {
    const runtime = String(window.__LIZ_RUNTIME?.supabaseUrl || '').trim();
    if (runtime) return runtime.replace(/\/+$/, '');

    const fromWindow = String(window.LIZ_SUPABASE_URL || '').trim();
    if (fromWindow) return fromWindow.replace(/\/+$/, '');

    const fromMeta = document
      ?.querySelector?.('meta[name="liz-supabase-url"]')
      ?.getAttribute?.('content');
    if (fromMeta) {
      return String(fromMeta).replace(/\/+$/, '').trim();
    }

    return '';
  }

  function savePendingSocialLogin(provider) {
    try {
      window.localStorage.setItem(
        SOCIAL_LOGIN_PENDING_KEY,
        JSON.stringify({
          provider,
          createdAt: Date.now(),
        }),
      );
    } catch (error) {
      // no-op
    }
  }

  function clearPendingSocialLogin() {
    try {
      window.localStorage.removeItem(SOCIAL_LOGIN_PENDING_KEY);
    } catch (error) {
      // no-op
    }
  }

  function readPendingSocialProvider() {
    try {
      const raw = window.localStorage.getItem(SOCIAL_LOGIN_PENDING_KEY);
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return '';

      const createdAt = Number(parsed.createdAt || 0);
      if (!Number.isFinite(createdAt) || (Date.now() - createdAt) > SOCIAL_LOGIN_PENDING_TTL_MS) {
        clearPendingSocialLogin();
        return '';
      }

      return normalizeSocialProvider(parsed.provider);
    } catch (error) {
      return '';
    }
  }

  function clearSocialCallbackUrlParams() {
    if (!window.history || typeof window.history.replaceState !== 'function') return;
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      url.searchParams.delete('oauth');
      url.searchParams.delete('oauth_provider');
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
    } catch (error) {
      // no-op
    }
  }

  function readSocialCallbackPayload() {
    const query = new URLSearchParams(window.location.search || '');
    const hash = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));

    const provider =
      normalizeSocialProvider(query.get('oauth_provider'))
      || normalizeSocialProvider(hash.get('provider'))
      || readPendingSocialProvider();

    const accessToken = String(hash.get('access_token') || query.get('access_token') || '').trim();
    const errorMessage = String(
      hash.get('error_description')
      || hash.get('error')
      || query.get('error_description')
      || query.get('error')
      || '',
    ).trim();

    const hasCallbackMarker = query.has('oauth')
      || query.has('oauth_provider')
      || hash.has('access_token')
      || hash.has('error');

    return {
      hasCallbackMarker,
      provider,
      accessToken,
      errorMessage,
    };
  }

  function getPostLoginTarget() {
    const params = new URLSearchParams(window.location.search || '');
    const next = params.get('next');
    if (!next) return 'index.html';

    try {
      const decoded = decodeURIComponent(next);
      if (!decoded || decoded.includes('login.html')) return 'index.html';
      return decoded;
    } catch (error) {
      return 'index.html';
    }
  }

  function redirectAfterLogin() {
    const target = getPostLoginTarget();
    window.location.href = target;
  }

  async function startSocialLogin(provider) {
    const safeProvider = normalizeSocialProvider(provider);
    if (!safeProvider) {
      const providerError = new Error('SOCIAL_PROVIDER_UNSUPPORTED');
      providerError.code = 'SOCIAL_PROVIDER_UNSUPPORTED';
      throw providerError;
    }

    const callbackUrl = new URL(window.location.href);
    callbackUrl.hash = '';
    callbackUrl.searchParams.set('oauth', '1');
    callbackUrl.searchParams.set('oauth_provider', safeProvider);

    let authorizeUrl = '';

    if (window.LizApi && typeof window.LizApi.getSocialAuthorizeUrl === 'function') {
      try {
        const response = await window.LizApi.getSocialAuthorizeUrl({
          provider: safeProvider,
          redirectTo: callbackUrl.toString(),
        });
        authorizeUrl = String(response && response.authorize_url || '').trim();
      } catch (error) {
        if (Number(error && error.status || 0) !== 404) {
          throw error;
        }
      }
    }

    if (!authorizeUrl) {
      const supabaseUrl = resolveSupabaseUrl();
      if (!supabaseUrl) {
        const configError = new Error('SOCIAL_LOGIN_UNAVAILABLE');
        configError.code = 'SOCIAL_LOGIN_UNAVAILABLE';
        throw configError;
      }
      const fallbackUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
      fallbackUrl.searchParams.set('provider', safeProvider);
      fallbackUrl.searchParams.set('redirect_to', callbackUrl.toString());
      authorizeUrl = fallbackUrl.toString();
    }

    savePendingSocialLogin(safeProvider);
    window.location.assign(authorizeUrl);
    return authorizeUrl;
  }

  async function consumeSocialCallback() {
    const payload = readSocialCallbackPayload();
    if (!payload.hasCallbackMarker) return null;

    clearSocialCallbackUrlParams();

    if (payload.errorMessage) {
      clearPendingSocialLogin();
      const oauthError = new Error(payload.errorMessage);
      oauthError.code = 'SOCIAL_OAUTH_ERROR';
      throw oauthError;
    }

    if (!payload.accessToken) {
      return null;
    }

    if (!payload.provider) {
      clearPendingSocialLogin();
      const providerError = new Error('SOCIAL_PROVIDER_UNSUPPORTED');
      providerError.code = 'SOCIAL_PROVIDER_UNSUPPORTED';
      throw providerError;
    }

    if (!window.LizApi || typeof window.LizApi.socialLogin !== 'function') {
      clearPendingSocialLogin();
      const apiError = new Error('SOCIAL_LOGIN_UNAVAILABLE');
      apiError.code = 'SOCIAL_LOGIN_UNAVAILABLE';
      throw apiError;
    }

    try {
      const response = await window.LizApi.socialLogin({
        provider: payload.provider,
        supabaseAccessToken: payload.accessToken,
      });
      const user = readAuthUserOrThrow(response, 'social_login');
      const tokens = readAuthTokensOrThrow(response, 'social_login');
      setSession({ user, tokens });
      return currentUser;
    } finally {
      clearPendingSocialLogin();
    }
  }

  function redirectToLogin() {
    if (isLoginPage()) return;
    const next = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    window.location.href = `${LOGIN_PAGE}?next=${next}`;
  }

  async function requireSessionOrRedirect(options = {}) {
    try {
      const user = await ensureSession(options);
      return user;
    } catch (error) {
      if (isAuthRequiredError(error)) {
        redirectToLogin();
        return null;
      }
      if (!options?.force && hasUsableLocalSession() && isTransientSessionError(error)) {
        return currentUser;
      }
      throw error;
    }
  }

  function bindLogoutButtons() {
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
    const quickSettingsLogoutBtn = document.getElementById('quickSettingsLogoutBtn');

    const onLogout = async event => {
      event.preventDefault();
      event.stopPropagation();
      await logout({ redirect: true });
    };

    profileLogoutBtn?.addEventListener('click', onLogout);
    settingsLogoutBtn?.addEventListener('click', onLogout);
    quickSettingsLogoutBtn?.addEventListener('click', onLogout);
    quickSettingsLogoutBtn?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      void onLogout(event);
    });
  }

  function initAuth() {
    if (initialized) return;
    restoreSession();
    sanitizeStoredTokens();
    persistSession();
    bindLogoutButtons();
    initialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

  window.LizAuth = {
    login,
    register,
    refresh,
    logout,
    ensureSession,
    requireSessionOrRedirect,
    redirectToLogin,
    redirectAfterLogin,
    startSocialLogin,
    consumeSocialCallback,
    isAuthRequiredError,
    isAuthenticated,
    getCurrentUser,
    setCurrentUser,
    listConnectedAccounts,
    switchConnectedAccount,
    getAccessToken,
  };
})();
