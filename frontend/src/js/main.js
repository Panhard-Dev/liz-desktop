(function initMainModule() {
  function isTransientBootstrapError(error) {
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

  async function bootstrap() {
    if (!window.LizAuth?.requireSessionOrRedirect) {
      console.error('[Liz] modulo Auth nao carregado.');
      return;
    }

    let user = null;
    try {
      user = await window.LizAuth.requireSessionOrRedirect();
    } catch (error) {
      const cachedUser = window.LizAuth?.getCurrentUser?.() || null;
      if (cachedUser && isTransientBootstrapError(error)) {
        console.warn('[Liz] falha temporaria ao validar sessao. Usando cache local.', error);
        user = cachedUser;
      } else {
        console.error('[Liz] falha ao iniciar sessao.', error);
        window.LizAuth?.redirectToLogin?.();
        return;
      }
    }

    if (!user) {
      return;
    }

    if (!window.LizUI) {
      console.error('[Liz] modulo UI nao carregado.');
      return;
    }

    try {
      window.LizUI.initUI();
      window.LizUI.applyCurrentUser?.(user);
    } catch (error) {
      console.error('[Liz] falha ao inicializar UI.', error);
      return;
    }

    if (window.LizChat) {
      window.LizChat.initChat();
    } else {
      console.error('[Liz] modulo Chat nao carregado.');
    }

    if (window.LizHelp) {
      window.LizHelp.initHelp();
    } else {
      console.error('[Liz] modulo Help nao carregado.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
