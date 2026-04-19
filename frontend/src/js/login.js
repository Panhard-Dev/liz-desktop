(function initLoginPage() {
  function byId(id) {
    return document.getElementById(id);
  }

  var form = byId('loginForm');
  var emailInput = byId('loginEmail');
  var passInput = byId('loginPassword');
  var submitBtn = byId('loginSubmit');
  var feedback = byId('loginFeedback');
  var socialButtons = Array.prototype.slice.call(document.querySelectorAll('[data-social-provider]'));
  var passwordToggles = Array.prototype.slice.call(document.querySelectorAll('[data-password-toggle]'));

  function setFeedback(msg, type) {
    if (!feedback) return;
    feedback.textContent = msg || '';
    feedback.classList.remove('error');
    if (type === 'error') feedback.classList.add('error');
  }

  function setSubmitting(on) {
    if (!submitBtn) return;
    submitBtn.disabled = Boolean(on);
    submitBtn.textContent = on ? 'Entrando...' : 'Acessar Painel';
  }

  function getErrorMessage(err) {
    var backendMessage = err && err.payload && ((err.payload.error && err.payload.error.message) || err.payload.detail);
    if (backendMessage) return String(backendMessage);

    var rawMessage = String((err && err.message) || '').toLowerCase();
    if (rawMessage.indexOf('failed to fetch') !== -1 || rawMessage.indexOf('network') !== -1 || rawMessage.indexOf('internet') !== -1) {
      return 'Sem conexao com a internet. Verifique sua rede e tente novamente.';
    }

    var status = Number((err && err.status) || 0);
    if (status === 401) return 'Email ou senha invalidos.';
    if (status === 429) return 'Muitas tentativas. Aguarde e tente novamente.';
    return (err && err.message) || 'Nao foi possivel entrar agora.';
  }

  function getSocialErrorMessage(err) {
    var code = String((err && err.code) || '').trim();
    if (code === 'SOCIAL_LOGIN_UNAVAILABLE') {
      return 'Login social indisponivel. Verifique a configuracao do servidor.';
    }
    if (code === 'SOCIAL_PROVIDER_UNSUPPORTED') {
      return 'Provedor social nao suportado.';
    }
    if (code === 'SOCIAL_OAUTH_ERROR') {
      return (err && err.message) || 'Falha no login social.';
    }

    var backendMessage = err && err.payload && ((err.payload.error && err.payload.error.message) || err.payload.detail);
    if (backendMessage) return String(backendMessage);

    var status = Number((err && err.status) || 0);
    if (status === 401) return 'Falha no login social. Tente novamente.';
    if (status === 429) return 'Muitas tentativas. Aguarde e tente novamente.';
    return (err && err.message) || 'Nao foi possivel entrar com login social.';
  }

  function isAddAccountMode() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      return String(params.get('add_account') || '').trim() === '1';
    } catch (err) {
      return false;
    }
  }

  function getAddAccountQueryString() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      if (String(params.get('add_account') || '').trim() !== '1') return '';
      var out = new URLSearchParams();
      out.set('add_account', '1');
      var next = String(params.get('next') || '').trim();
      if (next) out.set('next', next);
      return out.toString();
    } catch (err) {
      return '';
    }
  }

  function preserveAddAccountLinks() {
    var query = getAddAccountQueryString();
    if (!query) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href="register.html"]'));
    links.forEach(function eachLink(link) {
      link.setAttribute('href', 'register.html?' + query);
    });
  }

  async function tryRedirect() {
    if (isAddAccountMode()) return;
    if (!window.LizAuth || !window.LizAuth.ensureSession || !window.LizAuth.redirectAfterLogin) return;
    try {
      await window.LizAuth.ensureSession();
      window.LizAuth.redirectAfterLogin();
    } catch (err) {
      if (window.LizAuth.isAuthRequiredError && window.LizAuth.isAuthRequiredError(err)) return;
      setFeedback('Falha ao verificar sessao.', 'error');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!window.LizAuth || !window.LizAuth.login || !window.LizAuth.redirectAfterLogin) {
      setFeedback('Modulo de autenticacao indisponivel.', 'error');
      return;
    }

    var email = String((emailInput && emailInput.value) || '').trim();
    var pass = String((passInput && passInput.value) || '');

    if (!email || !pass) {
      setFeedback('Informe email e senha para continuar.', 'error');
      return;
    }

    setFeedback('');
    setSubmitting(true);

    try {
      await window.LizAuth.login(email, pass);
      window.LizAuth.redirectAfterLogin();
    } catch (err) {
      setFeedback(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function bindSocialButtons() {
    if (!socialButtons.length) return;

    socialButtons.forEach(function eachBtn(btn) {
      btn.addEventListener('click', async function onSocialClick() {
        if (!window.LizAuth || typeof window.LizAuth.startSocialLogin !== 'function') {
          setFeedback('Login social indisponivel no momento.', 'error');
          return;
        }

        var provider = String(btn.getAttribute('data-social-provider') || '').toLowerCase();
        var label = provider === 'google'
          ? 'Google'
          : provider === 'github'
            ? 'GitHub'
            : 'provedor social';

        btn.disabled = true;
        setFeedback('Redirecionando para login com ' + label + '...', '');
        try {
          await window.LizAuth.startSocialLogin(provider);
        } catch (err) {
          btn.disabled = false;
          setFeedback(getSocialErrorMessage(err), 'error');
        }
      });
    });
  }

  async function consumeSocialCallbackIfNeeded() {
    if (!window.LizAuth || typeof window.LizAuth.consumeSocialCallback !== 'function') return false;
    if (!window.LizAuth.redirectAfterLogin) return false;

    try {
      var user = await window.LizAuth.consumeSocialCallback();
      if (!user) return false;
      window.LizAuth.redirectAfterLogin();
      return true;
    } catch (err) {
      setFeedback(getSocialErrorMessage(err), 'error');
      return false;
    }
  }

  function bindPasswordToggles() {
    if (!passwordToggles.length) return;

    passwordToggles.forEach(function eachToggle(btn) {
      var targetId = String(btn.getAttribute('data-target') || '');
      if (!targetId) return;

      var input = byId(targetId);
      if (!input) return;

      btn.addEventListener('click', function onToggleClick() {
        var shouldShow = input.type === 'password';
        input.type = shouldShow ? 'text' : 'password';
        btn.classList.toggle('is-visible', shouldShow);
        btn.setAttribute('aria-pressed', shouldShow ? 'true' : 'false');
        btn.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');

        if (typeof input.focus === 'function') {
          input.focus();
        }
      });
    });
  }

  async function bootstrap() {
    if (!form) return;
    preserveAddAccountLinks();
    bindPasswordToggles();
    bindSocialButtons();
    form.addEventListener('submit', onSubmit);
    var didRedirect = await consumeSocialCallbackIfNeeded();
    if (didRedirect) return;
    tryRedirect();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
