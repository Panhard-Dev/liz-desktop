(function initRegisterPage() {
  function byId(id) {
    return document.getElementById(id);
  }

  var form = byId('registerForm');
  var nameInput = byId('registerName');
  var emailInput = byId('registerEmail');
  var passInput = byId('registerPassword');
  var passConfirmInput = byId('registerPasswordConfirm');
  var submitBtn = byId('registerSubmit');
  var feedback = byId('registerFeedback');
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
    submitBtn.textContent = on ? 'Criando conta...' : 'Criar Conta';
  }

  function getErrorMessage(err) {
    function extractValidationDetail() {
      var details = err && err.payload && err.payload.error && err.payload.error.details;
      if (!Array.isArray(details) || !details.length) return '';

      var first = details[0] || {};
      var loc = Array.isArray(first.loc) ? first.loc.map(String).join('.') : '';
      var msg = String(first.msg || '').toLowerCase();
      var type = String(first.type || '').toLowerCase();

      if (loc.indexOf('password') !== -1) {
        return 'Senha invalida. Use 12+ caracteres com maiuscula, minuscula, numero e simbolo.';
      }
      if (loc.indexOf('email') !== -1) {
        return 'Email invalido. Revise o formato.';
      }
      if (loc.indexOf('display_name') !== -1 || loc.indexOf('name') !== -1) {
        return 'Nome invalido. Use entre 2 e 60 caracteres.';
      }
      if (msg.includes('field required')) {
        return 'Preencha todos os campos obrigatorios.';
      }
      if (type.includes('string_too_short')) {
        return 'Algum campo esta curto demais.';
      }
      return '';
    }

    var backendMessage = err && err.payload && ((err.payload.error && err.payload.error.message) || err.payload.detail);
    var status = Number((err && err.status) || 0);
    if (status === 422) {
      var validationMessage = extractValidationDetail();
      if (validationMessage) return validationMessage;
      return 'Dados invalidos. Revise os campos do cadastro.';
    }

    if (backendMessage) return String(backendMessage);

    var rawMessage = String((err && err.message) || '').toLowerCase();
    if (rawMessage.indexOf('failed to fetch') !== -1 || rawMessage.indexOf('network') !== -1 || rawMessage.indexOf('internet') !== -1) {
      return 'Sem conexao com a internet. Verifique sua rede e tente novamente.';
    }

    if (status === 409) return 'Este email ja esta em uso.';
    if (status === 400) return 'Dados invalidos. Revise os campos.';
    if (status === 429) return 'Muitas tentativas. Aguarde e tente novamente.';
    return (err && err.message) || 'Nao foi possivel criar a conta agora.';
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
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href="login.html"]'));
    links.forEach(function eachLink(link) {
      link.setAttribute('href', 'login.html?' + query);
    });
  }

  function validateInputs(name, email, pass, passConfirm) {
    if (!name || !email || !pass || !passConfirm) {
      return 'Preencha todos os campos.';
    }
    if (pass.length < 12) {
      return 'A senha precisa ter pelo menos 12 caracteres.';
    }
    if (pass.toLowerCase() === pass || pass.toUpperCase() === pass) {
      return 'Use letras maiusculas e minusculas na senha.';
    }
    if (!/\d/.test(pass)) {
      return 'A senha precisa ter pelo menos um numero.';
    }
    if (!/[^A-Za-z0-9]/.test(pass)) {
      return 'A senha precisa ter pelo menos um simbolo.';
    }
    if (pass !== passConfirm) {
      return 'A confirmacao de senha nao confere.';
    }
    return '';
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

    if (!window.LizAuth || !window.LizAuth.register || !window.LizAuth.redirectAfterLogin) {
      setFeedback('Modulo de autenticacao indisponivel.', 'error');
      return;
    }

    var name = String((nameInput && nameInput.value) || '').trim();
    var email = String((emailInput && emailInput.value) || '').trim();
    var pass = String((passInput && passInput.value) || '');
    var passConfirm = String((passConfirmInput && passConfirmInput.value) || '');

    var validationError = validateInputs(name, email, pass, passConfirm);
    if (validationError) {
      setFeedback(validationError, 'error');
      return;
    }

    setFeedback('');
    setSubmitting(true);

    try {
      await window.LizAuth.register(email, pass, name);
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
