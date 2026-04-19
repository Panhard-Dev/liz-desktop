(function initPlansPage() {
  const AUTH_STORAGE_KEY = 'liz_auth_session_v3';
  const PLAN_IDS = ['pro', 'max', 'ultra'];

  const DEFAULT_PLANS = {
    pro: {
      id: 'pro',
      name: 'Liz Pro',
      monthlyPrice: 'R$ 19,90',
      yearlyPrice: 'R$ 15,92',
      checkout: { monthly: 'https://pay.cakto.com.br/k7nskeb_773256', yearly: '' },
    },
    max: {
      id: 'max',
      name: 'Liz Max',
      monthlyPrice: 'R$ 49,90',
      yearlyPrice: 'R$ 39,92',
      checkout: { monthly: 'https://pay.cakto.com.br/82xyjeu_773335', yearly: '' },
    },
    ultra: {
      id: 'ultra',
      name: 'Liz Ultra',
      monthlyPrice: 'R$ 99,90',
      yearlyPrice: 'R$ 79,92',
      checkout: { monthly: 'https://pay.cakto.com.br/gitfe2d_844972', yearly: '' },
    },
  };

  const state = {
    billingMode: 'monthly',
    plansById: new Map(),
    authToken: '',
    toggleTrack: null,
    monthlyLabel: null,
    yearlyLabel: null,
    feedback: null,
    userChip: null,
    chooseButtons: [],
    planCards: [],
    mobilePlanButtons: [],
    desktopPlanButtons: [],
    visiblePlanId: 'pro',
  };

  function normalizePlanId(rawPlanId) {
    const safePlanId = String(rawPlanId || '').trim().toLowerCase();
    if (PLAN_IDS.includes(safePlanId)) return safePlanId;
    return 'pro';
  }

  /** Mesma logica do app (ui.js): API pode devolver rotulos tipo "Liz PRO" ou "PRO LA". */
  function normalizeBillingPlanFromApi(raw) {
    const plan = String(raw || '').trim().toLowerCase();
    if (!plan || plan === 'free') return 'free';
    if (plan === 'pro' || plan === 'max' || plan === 'ultra') return plan;
    if (plan.includes('ultra')) return 'ultra';
    if (plan.includes('max')) return 'max';
    if (plan.includes('pro') || plan.includes('team')) return 'pro';
    return 'free';
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 700px)').matches;
  }

  function setVisiblePlan(planId) {
    const safePlanId = normalizePlanId(planId);
    state.visiblePlanId = safePlanId;

    state.mobilePlanButtons.forEach(button => {
      const isActive = String(button.dataset.mobilePlan || '').trim().toLowerCase() === safePlanId;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    state.desktopPlanButtons.forEach(button => {
      const isActive = String(button.dataset.desktopPlan || '').trim().toLowerCase() === safePlanId;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    state.planCards.forEach(card => {
      const isVisible = String(card.dataset.planCard || '').trim().toLowerCase() === safePlanId;
      card.classList.toggle('mobile-active', isVisible);
      card.classList.toggle('desktop-active', isVisible);
    });
  }

  function setFeedback(message, type) {
    if (!state.feedback) return;
    state.feedback.textContent = String(message || '');
    state.feedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.feedback.classList.add(type);
    }
  }

  function readStoredSession() {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function readAccessToken() {
    const session = readStoredSession();
    return String(session?.accessToken || '').trim();
  }

  function readAccountEmail() {
    const session = readStoredSession();
    return String(session?.user?.email || '').trim();
  }

  function readAccountName() {
    const session = readStoredSession();
    const candidates = [
      session?.user?.name,
      session?.user?.full_name,
      session?.user?.display_name,
      session?.user?.user_metadata?.name,
      session?.user?.user_metadata?.full_name,
    ];
    for (const candidate of candidates) {
      const value = String(candidate || '').trim();
      if (value) return value;
    }
    return '';
  }

  function setSearchParamIfMissing(url, key, value) {
    const safeKey = String(key || '').trim();
    const safeValue = String(value || '').trim();
    if (!safeKey || !safeValue) return;
    if (url.searchParams.has(safeKey)) return;
    url.searchParams.set(safeKey, safeValue);
  }

  function buildCheckoutUrl(baseUrl) {
    const rawBaseUrl = String(baseUrl || '').trim();
    if (!rawBaseUrl) return '';

    try {
      const checkoutUrl = new URL(rawBaseUrl);
      const email = readAccountEmail();
      const name = readAccountName();

      if (email) {
        // Variacoes comuns de prefill em checkout para aumentar compatibilidade.
        setSearchParamIfMissing(checkoutUrl, 'email', email);
        setSearchParamIfMissing(checkoutUrl, 'customer_email', email);
        setSearchParamIfMissing(checkoutUrl, 'customer[email]', email);
      }

      if (name) {
        setSearchParamIfMissing(checkoutUrl, 'name', name);
        setSearchParamIfMissing(checkoutUrl, 'customer[name]', name);
      }

      return checkoutUrl.toString();
    } catch (error) {
      return rawBaseUrl;
    }
  }

  function syncUserChip() {
    if (!state.userChip) return;
    const email = readAccountEmail();
    state.userChip.textContent = email ? `Conta: ${email}` : 'Conta: visitante';
  }

  function normalizePrice(rawValue, fallbackPrice) {
    const fallback = String(fallbackPrice || '').trim() || 'R$ 0,00';
    const value = String(rawValue || '').trim();
    if (!value) return fallback;

    if (value.toLowerCase().startsWith('r$')) {
      return value.replace(/\s+/g, ' ').replace('R$', 'R$ ').trim();
    }

    const plainNumber = value.match(/^\d+([.,]\d{1,2})?$/);
    if (plainNumber) {
      return `R$ ${value.replace('.', ',')}`;
    }

    return fallback;
  }

  function clonePlanConfig(basePlan) {
    return {
      id: basePlan.id,
      name: basePlan.name,
      monthlyPrice: basePlan.monthlyPrice,
      yearlyPrice: basePlan.yearlyPrice,
      checkout: {
        monthly: String(basePlan.checkout?.monthly || '').trim(),
        yearly: String(basePlan.checkout?.yearly || '').trim(),
      },
    };
  }

  function hydrateDefaults() {
    PLAN_IDS.forEach(planId => {
      state.plansById.set(planId, clonePlanConfig(DEFAULT_PLANS[planId]));
    });
  }

  function hydrateFromApi(plans) {
    hydrateDefaults();
    if (!Array.isArray(plans)) return;

    plans.forEach(plan => {
      const planId = String(plan?.id || '').trim().toLowerCase();
      if (!PLAN_IDS.includes(planId)) return;

      const current = state.plansById.get(planId) || clonePlanConfig(DEFAULT_PLANS[planId]);
      const monthlyPrice = normalizePrice(plan?.monthly_price_brl, current.monthlyPrice);
      const yearlyPrice = normalizePrice(plan?.yearly_price_brl, current.yearlyPrice);
      const monthlyCheckout = String(plan?.checkout?.monthly || '').trim();
      const yearlyCheckout = String(plan?.checkout?.yearly || '').trim();

      current.monthlyPrice = monthlyPrice;
      current.yearlyPrice = yearlyPrice;
      current.checkout = {
        monthly: monthlyCheckout,
        yearly: yearlyCheckout,
      };
      state.plansById.set(planId, current);
    });
  }

  function getPlanConfig(planId) {
    return state.plansById.get(planId) || clonePlanConfig(DEFAULT_PLANS[planId]);
  }

  function updatePriceTexts() {
    PLAN_IDS.forEach(planId => {
      const plan = getPlanConfig(planId);
      const valueEl = document.querySelector(`[data-price-value="${planId}"]`);
      const oldEl = document.querySelector(`[data-old-price="${planId}"]`);
      if (valueEl) {
        valueEl.textContent = state.billingMode === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
      }
      if (oldEl) {
        oldEl.textContent = plan.monthlyPrice;
        oldEl.classList.toggle('show', state.billingMode === 'yearly');
      }
    });
  }

  function resolveCheckoutUrl(planId) {
    const safePlanId = String(planId || '').trim().toLowerCase();
    const plan = getPlanConfig(safePlanId);
    const preferred = state.billingMode === 'yearly' ? 'yearly' : 'monthly';
    const preferredUrl = String(plan?.checkout?.[preferred] || '').trim();
    if (preferredUrl) return preferredUrl;
    return String(plan?.checkout?.monthly || '').trim();
  }

  function updateChooseButtonsAvailability() {
    state.chooseButtons.forEach(button => {
      const planId = String(button.dataset.choosePlan || '').trim().toLowerCase();
      const hasCheckout = Boolean(resolveCheckoutUrl(planId));
      button.disabled = !hasCheckout;
      button.classList.toggle('is-disabled', !hasCheckout);
      button.title = hasCheckout ? '' : 'Checkout indisponivel para este plano.';
    });
  }

  function updateToggleUI() {
    const yearly = state.billingMode === 'yearly';
    if (state.toggleTrack) state.toggleTrack.classList.toggle('on', yearly);
    if (state.monthlyLabel) state.monthlyLabel.classList.toggle('on', !yearly);
    if (state.yearlyLabel) state.yearlyLabel.classList.toggle('on', yearly);
  }

  function setBillingMode(mode) {
    state.billingMode = mode === 'yearly' ? 'yearly' : 'monthly';
    updateToggleUI();
    updatePriceTexts();
    updateChooseButtonsAvailability();
  }

  function markCurrentPlan(planId) {
    const safePlanId = String(planId || '').trim().toLowerCase();
    state.planCards.forEach(card => {
      const isCurrent = card.dataset.planCard === safePlanId;
      card.classList.toggle('is-current', isCurrent);
    });
    if (PLAN_IDS.includes(safePlanId)) {
      setVisiblePlan(safePlanId);
    }
  }

  function selectPlan(planId) {
    const safePlanId = String(planId || '').trim().toLowerCase();
    const plan = getPlanConfig(safePlanId);
    const checkoutUrl = buildCheckoutUrl(resolveCheckoutUrl(safePlanId));
    if (!checkoutUrl) {
      setFeedback(`${plan.name} ainda nao possui checkout ativo neste ciclo.`, 'error');
      return;
    }

    const billingLabel = state.billingMode === 'yearly' ? 'anual' : 'mensal';
    setFeedback(`Redirecionando para checkout ${billingLabel} de ${plan.name}...`, 'success');
    window.location.href = checkoutUrl;
  }

  function bindEvents() {
    if (state.toggleTrack) {
      state.toggleTrack.addEventListener('click', () => {
        const nextMode = state.billingMode === 'monthly' ? 'yearly' : 'monthly';
        setBillingMode(nextMode);
      });
    }

    if (state.monthlyLabel) {
      state.monthlyLabel.addEventListener('click', () => setBillingMode('monthly'));
    }

    if (state.yearlyLabel) {
      state.yearlyLabel.addEventListener('click', () => setBillingMode('yearly'));
    }

    state.mobilePlanButtons.forEach(button => {
      button.addEventListener('click', () => {
        setVisiblePlan(button.dataset.mobilePlan || 'pro');
      });
    });

    state.desktopPlanButtons.forEach(button => {
      button.addEventListener('click', () => {
        setVisiblePlan(button.dataset.desktopPlan || 'pro');
      });
    });

    state.chooseButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectPlan(button.dataset.choosePlan || '');
      });
    });

    window.addEventListener('resize', () => {
      if (isMobileViewport()) {
        setVisiblePlan(state.visiblePlanId || 'pro');
      }
    });
  }

  async function loadBillingPlans() {
    const api = window.LizApi;
    if (!api || typeof api.getBillingPlans !== 'function') {
      setFeedback('Modulo de billing indisponivel no frontend.', 'error');
      hydrateDefaults();
      updatePriceTexts();
      updateChooseButtonsAvailability();
      return;
    }

    try {
      const payload = await api.getBillingPlans();
      hydrateFromApi(payload?.plans || []);
      updatePriceTexts();
      updateChooseButtonsAvailability();
    } catch (error) {
      hydrateDefaults();
      updatePriceTexts();
      updateChooseButtonsAvailability();
      setFeedback('Nao foi possivel carregar planos agora.', 'error');
    }
  }

  function formatPlanName(planId) {
    const mapping = {
      pro: 'Liz Pro',
      max: 'Liz Max',
      ultra: 'Liz Ultra',
      free: 'Free',
    };
    return mapping[String(planId || '').trim().toLowerCase()] || 'Free';
  }

  async function loadMyPlan() {
    if (!state.authToken) return;
    const api = window.LizApi;
    if (!api || typeof api.getBillingMe !== 'function') return;

    try {
      const payload = await api.getBillingMe({ token: state.authToken });
      const activePlan = normalizeBillingPlanFromApi(payload?.active_plan || 'free');
      if (PLAN_IDS.includes(activePlan)) {
        markCurrentPlan(activePlan);
      }
      setFeedback(`Plano atual: ${formatPlanName(activePlan)}.`, 'success');
    } catch (error) {
      // Mantem tela funcional mesmo se perfil de assinatura falhar.
    }
  }

  function cacheElements() {
    state.toggleTrack = document.getElementById('billingToggleTrack');
    state.monthlyLabel = document.getElementById('billingLabelMonthly');
    state.yearlyLabel = document.getElementById('billingLabelYearly');
    state.feedback = document.getElementById('plansPageFeedback');
    state.userChip = document.getElementById('plansUserChip');
    state.chooseButtons = Array.from(document.querySelectorAll('[data-choose-plan]'));
    state.planCards = Array.from(document.querySelectorAll('[data-plan-card]'));
    state.mobilePlanButtons = Array.from(document.querySelectorAll('[data-mobile-plan]'));
    state.desktopPlanButtons = Array.from(document.querySelectorAll('[data-desktop-plan]'));
  }

  function init() {
    cacheElements();
    state.authToken = readAccessToken();
    syncUserChip();
    bindEvents();
    hydrateDefaults();
    setBillingMode('monthly');
    setVisiblePlan('pro');
    setFeedback('');
    void loadBillingPlans();
    void loadMyPlan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
