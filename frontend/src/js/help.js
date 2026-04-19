(function initHelpModule() {
  const SUPPORT_EMAIL = 'suporte.liz.oficiall@gmail.com';
  const MAX_MESSAGE_CHARS = 1500;
  const MIN_MESSAGE_CHARS = 8;

  const state = {
    root: null,
    feedback: null,
    actionButtons: [],
    supportEmailInput: null,
    supportMessageInput: null,
    supportSendBtn: null,
    supportCount: null,
  };

  let initialized = false;

  function cacheElements() {
    state.root = document.getElementById('helpRoot');
    state.feedback = document.getElementById('helpFeedback');
    state.actionButtons = Array.from(document.querySelectorAll('[data-help-action]'));
    state.supportEmailInput = document.getElementById('helpSupportEmail');
    state.supportMessageInput = document.getElementById('helpSupportMessage');
    state.supportSendBtn = document.getElementById('helpSupportSendBtn');
    state.supportCount = document.getElementById('helpSupportCount');
  }

  function getActionMessage(action) {
    switch (action) {
      case 'faq':
        return 'FAQ: voce pode enviar sua duvida no campo abaixo e o suporte responde pelo email.';
      case 'suporte':
        return 'Suporte: escreva sua mensagem e clique em "Enviar para suporte".';
      case 'status':
        return 'Status: no momento, os servicos principais estao operando normalmente.';
      default:
        return 'Ajuda carregada.';
    }
  }

  function setFeedback(message, type = '') {
    if (!state.feedback) return;
    state.feedback.textContent = message;
    state.feedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.feedback.classList.add(type);
    }
  }

  function getCurrentUserEmail() {
    const user = window.LizAuth?.getCurrentUser?.();
    return String(user?.email || '').trim();
  }

  function syncSupportEmail() {
    if (!state.supportEmailInput) return;
    state.supportEmailInput.value = getCurrentUserEmail();
  }

  function updateMessageCount() {
    if (!state.supportMessageInput || !state.supportCount) return;
    const count = String(state.supportMessageInput.value || '').length;
    state.supportCount.textContent = `${count}/${MAX_MESSAGE_CHARS}`;
  }

  function applyTemplate(action) {
    if (!state.supportMessageInput) return;
    if (action === 'faq') {
      state.supportMessageInput.value = 'Ola suporte! Tenho uma duvida sobre: ';
    } else if (action === 'status') {
      state.supportMessageInput.value = 'Ola suporte! Estou verificando o status da plataforma e percebi: ';
    }
    updateMessageCount();
    state.supportMessageInput.focus();
    state.supportMessageInput.setSelectionRange(
      state.supportMessageInput.value.length,
      state.supportMessageInput.value.length,
    );
  }

  function setSendingState(isSending) {
    if (!state.supportSendBtn) return;
    state.supportSendBtn.disabled = Boolean(isSending);
    state.supportSendBtn.textContent = isSending ? 'Enviando...' : 'Enviar para suporte';
  }

  async function sendSupportMessage() {
    const fromEmail = getCurrentUserEmail();
    const message = String(state.supportMessageInput?.value || '').trim();
    const token = window.LizAuth?.getAccessToken?.();

    if (!fromEmail) {
      setFeedback('Nao foi possivel identificar o email da conta. Faca login novamente.', 'error');
      return;
    }
    if (!token) {
      setFeedback('Sua sessao expirou. Entre novamente para falar com o suporte.', 'error');
      return;
    }

    if (message.length < MIN_MESSAGE_CHARS) {
      setFeedback('Escreva uma mensagem com pelo menos 8 caracteres.', 'error');
      return;
    }

    if (!window.LizApi?.sendSupportMessage) {
      setFeedback('Modulo de suporte indisponivel no frontend.', 'error');
      return;
    }

    setSendingState(true);
    setFeedback('Enviando sua mensagem para o suporte...', '');

    try {
      const response = await window.LizApi.sendSupportMessage({
        token,
        message: message.slice(0, MAX_MESSAGE_CHARS),
      });
      const deliveredTo = String(response?.delivered_to || SUPPORT_EMAIL).trim() || SUPPORT_EMAIL;
      if (state.supportMessageInput) {
        state.supportMessageInput.value = '';
      }
      updateMessageCount();
      setFeedback(`Mensagem enviada com sucesso para ${deliveredTo}.`, 'success');
    } catch (error) {
      const detail = String(error?.message || 'Nao foi possivel enviar sua mensagem agora.');
      setFeedback(detail, 'error');
    } finally {
      setSendingState(false);
    }
  }

  function bindEvents() {
    state.actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.helpAction || '';
        setFeedback(getActionMessage(action), '');
        if (action === 'faq' || action === 'status') {
          applyTemplate(action);
        }
        if (action === 'suporte') {
          state.supportMessageInput?.focus();
        }
      });
    });

    state.supportMessageInput?.addEventListener('input', updateMessageCount);
    state.supportSendBtn?.addEventListener('click', sendSupportMessage);

    window.addEventListener('liz:user-updated', syncSupportEmail);
  }

  function initHelp() {
    if (initialized) return;
    cacheElements();
    syncSupportEmail();
    updateMessageCount();
    bindEvents();
    setFeedback('');
    initialized = true;
  }

  window.LizHelp = {
    initHelp,
  };
})();
