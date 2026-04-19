(function initUiModule() {
  const state = {
    sidebar: null,
    overlay: null,
    hamburger: null,
    closeBtn: null,
    input: null,
    sendBtn: null,
    sparkBtn: null,
    content: null,
    greeting: null,
    chatContainer: null,
    historyContainer: null,
    clearAllBtn: null,
    newChatBtn: null,
    profileWrapper: null,
    profileBtn: null,
    profileDropdown: null,
    profileDropdownMain: null,
    profileAccountsMenu: null,
    profileAvatarImage: null,
    profileAvatarFallback: null,
    profileAddAccountBtn: null,
    profileSwitchAccountBtn: null,
    profileAccountsBackBtn: null,
    profileAccountsTitle: null,
    profileAccountsList: null,
    profileAccountsEmpty: null,
    profileAccountsFeedback: null,
    profileAccountsAddBtn: null,
    profileSwitchingAccount: false,
    profileSaving: false,
    profileMyProfileBtn: null,
    profilePreferencesBtn: null,
    profileActivityBtn: null,
    profileUsageBtn: null,
    profileLogoutBtn: null,
    profileModal: null,
    closeProfilePanelBtn: null,
    profileForm: null,
    profileDisplayNameInput: null,
    profileUsernameInput: null,
    profileAvatarPreviewWrap: null,
    profileAvatarPreview: null,
    profileAvatarPreviewFallback: null,
    profileAvatarUploadBtn: null,
    profileAvatarRemoveBtn: null,
    profileAvatarFileInput: null,
    profileFormFeedback: null,
    saveProfileBtn: null,
    accountAvatarWrap: null,
    accountAvatarImage: null,
    accountAvatarFallback: null,
    accountDisplayName: null,
    accountUsername: null,
    accountPlanBadge: null,
    accountEmail: null,
    accountUserId: null,
    accountCreatedAt: null,
    accountSessionStatus: null,
    accountSessionExpiry: null,
    accountLastSync: null,
    accountRefreshBtn: null,
    accountEditProfileBtn: null,
    accountOpenActivityBtn: null,
    accountCopyEmailBtn: null,
    accountCopyIdBtn: null,
    accountFeedback: null,
    accountSyncing: false,
    billingProfile: null,
    billingSyncing: false,
    billingSyncPromise: null,
    billingLastFetchAtMs: 0,
    billingUsagePollTimer: null,
    usageSummary: null,
    settingsAppsGrid: null,
    settingsAppsRefreshBtn: null,
    settingsAppsLastSync: null,
    settingsAppsFeedback: null,
    settingsAppsConnectedCount: null,
    settingsAppsAvailableCount: null,
    settingsAppsSoonCount: null,
    settingsAppsState: null,
    settingsAppsLastSyncAt: null,
    settingsAppsSyncing: false,
    profileAvatarDraft: '',
    profileAvatarMarkedForRemoval: false,
    profileCacheStorageKey: 'liz_profile_cache_v1',
    settingsWrapper: null,
    settingsBtn: null,
    settingsDropdown: null,
    settingsUpgradeBtn: null,
    openSettingsPanelBtn: null,
    settingsPersonalizacaoBtn: null,
    settingsHelpBtn: null,
    settingsModal: null,
    closeSettingsPanelBtn: null,
    plansModal: null,
    closePlansPanelBtn: null,
    plansSelectButtons: [],
    plansFeedback: null,
    settingsThemeSelect: null,
    settingsAccentSelect: null,
    settingsLanguageSelect: null,
    settingsNotificationsSystemToggle: null,
    settingsNotificationFeedback: null,
    settingsPersonalModesWrap: null,
    settingsPersonalModeButtons: [],
    settingsPersonalGreetingInput: null,
    settingsPersonalUseNameToggle: null,
    settingsPersonalPreviewText: null,
    settingsPersonalSaveBtn: null,
    settingsPersonalFeedback: null,
    settingsGeneralState: null,
    settingsGeneralLoaded: false,
    settingsGeneralStorageKey: 'generalSettings',
    settingsGeneralLegacyStorageKeys: ['liz_ui_general_settings_v1'],
    settingsGeneralSaving: false,
    resolvedUiLanguage: 'pt-BR',
    systemThemeMediaQuery: null,
    systemThemeListener: null,
    activityModal: null,
    closeActivityPanelBtn: null,
    activitySummary: null,
    activityChart: null,
    usageModal: null,
    closeUsagePanelBtn: null,
    usageSubtitle: null,
    usagePlanValue: null,
    usageMetricOneLabel: null,
    usageMetricOneValue: null,
    usageMetricOneFill: null,
    usageMetricTwoLabel: null,
    usageMetricTwoValue: null,
    usageMetricTwoFill: null,
    usageNote: null,
    closeSecurityCardBtn: null,
    securityCard: null,
    settingsNavItems: [],
    settingsSections: [],
    settingsToggles: [],
    searchChatsBtn: null,
    imagesNavBtn: null,
    galleryNavBtn: null,
    appsNavBtn: null,
    sidebarNavItems: [],
    workspaceViews: [],
    searchInput: null,
    searchResults: null,
    imgPromptField: null,
    imgAttachmentTray: null,
    imgSendBtn: null,
    imgAttachBtn: null,
    imgFileInput: null,
    imgStyleSwitch: null,
    imgStyleBtn: null,
    imgStyleLabel: null,
    imgStyleDropdown: null,
    imgStyleOptions: [],
    imgChatList: null,
    imgPresetCards: [],
    imgDiscovery: null,
    stylesRow: null,
    recentImgsRow: null,
    galSearch: null,
    galUploadBtn: null,
    galFileInput: null,
    galColHeads: null,
    galList: null,
    galTabs: [],
    galViewBtns: [],
    galFilterBtn: null,
    galGridBtn: null,
    galListBtn: null,
    appsCardsGrid: null,
    currentWorkspace: 'chat',
    currentGalleryTab: 'tudo',
    currentGalleryView: 'list',
    currentGallerySourceFilter: 'all',
    galleryOwnerKey: 'guest',
    galleryRemoteSyncPromise: null,
    galleryRemoteSyncRequestId: 0,
    galleryRemoteLastOwnerKey: '',
    galleryRemoteLastSyncAt: 0,
    imageChatMessages: [],
    imgPendingAttachments: [],
    imgLoadingAttachments: false,
    imgFluxNegativePrompt: '',
    imgSessionBasePrompt: '',
    imgSessionBasePromptNorm: '',
    modelSwitches: [],
    modelUis: [],
    isFlashMode: false,
    modelBeforeFlash: 'Liz mini',
  };

  const IMAGE_PRESET_PROMPTS = {
    preset1: 'Um mundo surreal com um penhasco gigante contendo um rosto ancestral esculpido na pedra, cachoeiras descendo pelos lados, ceu cosmico cheio de esferas flutuantes, um sol flamejante iluminando tudo por tras, vegetacao densa e arvores tortas, sensacao de misterio e magia antiga, pintura digital fantastica, tons dourados e azul-esverdeados, ultra detalhado, atmospheric, mystical, masterpiece',
    preset2: {
      prompt:
        'Retrato fotorrealista, pessoa com cabelo escuro curto e olhos expressivos, segurando com as duas maos pequenos circuitos eletronicos e microchips, iluminacao suave de estudio, fundo neutro escuro desfocado, detalhes nítidos, pele natural, composicao central, fotografia profissional, alta qualidade',
      negativePrompt:
        'low quality, blurry, flat lighting, extra limbs, deformed anatomy, duplicated objects, bad composition, cropped subject, text, watermark, logo, oversaturated, low detail, noisy image, poorly drawn face',
    },
    preset3: 'square composition, centered sun, vertical waterfalls, painterly texture, fantasy concept art, mystical environment, soft glowing light, surreal cosmic nature',
    preset4: 'Uma paisagem surreal e fantastica, estilo pintura digital onirica e cinematografica, com um enorme sol flamejante no ceu, cercado por varios planetas e luas flutuando em diferentes tamanhos, ceu azul-esverdeado com nuvens suaves e atmosfera cosmica. No centro da cena, grandes penhascos escuros com varias cachoeiras brilhantes caindo verticalmente. Em uma das rochas, um rosto de caveira esculpido de forma misteriosa e sombria. Na parte inferior, uma figura humana solitaria em pe sobre uma pedra, observando a paisagem, transmitindo sensacao de misterio e descoberta. Arvores antigas e retorcidas nas laterais enquadrando a composicao, vegetacao densa, galhos sinuosos, flores em primeiro plano. Iluminacao dramatica, contraste entre tons quentes dourado/laranja do sol e tons frios azul/verde do ambiente, nevoa suave, particulas luminosas no ar, composicao epica, ultra detalhado, pintura fantastica, surrealismo, dreamlike, atmospheric, highly detailed, cinematic, magical realism, masterpiece, 4k',
  };

  function resolveImagePreset(presetKey) {
    const raw = IMAGE_PRESET_PROMPTS[presetKey];
    if (!raw) return null;
    if (typeof raw === 'string') {
      return { prompt: raw, negativePrompt: '' };
    }
    return {
      prompt: String(raw.prompt || '').trim(),
      negativePrompt: String(raw.negativePrompt || '').trim(),
    };
  }
  const galleryFiles = [];
  const GALLERY_CACHE_NAMESPACE = 'liz_gallery_cache_v1';
  const MAX_GALLERY_CACHE_ITEMS = 300;
  const GALLERY_IMAGE_EXTENSIONS = new Set([
    'PNG',
    'SVG',
    'JPG',
    'JPEG',
    'WEBP',
    'GIF',
    'BMP',
    'AVIF',
    'HEIC',
  ]);
  const SETTINGS_APPS_STORAGE_KEY = 'liz_settings_apps_v1';
  const SETTINGS_APPS_CATALOG = Object.freeze([
    {
      id: 'liz_mobile',
      name: 'Liz Mobile',
      badge: 'CORE',
      icon: 'L',
      description: 'Aplicativo oficial para continuar conversas no celular.',
      availability: 'locked',
      defaultEnabled: true,
    },
    {
      id: 'cloud_backup',
      name: 'Cloud Backup',
      badge: 'INTEGRACAO',
      icon: 'CB',
      description: 'Sincroniza arquivos e exportacoes importantes na nuvem.',
      availability: 'available',
      defaultEnabled: false,
    },
    {
      id: 'discord_webhook',
      name: 'Discord Webhook',
      badge: 'COMUNIDADE',
      icon: 'D',
      description: 'Dispara alertas de respostas para um canal de equipe.',
      availability: 'available',
      defaultEnabled: false,
    },
    {
      id: 'calendar_sync',
      name: 'Calendar Sync',
      badge: 'PRODUTIVIDADE',
      icon: 'CAL',
      description: 'Cria lembretes de tarefas citadas durante as conversas.',
      availability: 'available',
      defaultEnabled: false,
    },
    {
      id: 'dev_console',
      name: 'Dev Console',
      badge: 'BETA',
      icon: 'DEV',
      description: 'Ferramentas avancadas para automacoes e diagnostico.',
      availability: 'soon',
      defaultEnabled: false,
    },
  ]);

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

  const extColors = {
    PDF: '#f87171',
    PNG: '#34d399',
    JS: '#fbbf24',
    DOC: '#60a5fa',
    XLS: '#34d399',
    SVG: '#a78bfa',
    ZIP: '#f472b6',
    TXT: '#94a3b8',
  };

  const extBackgrounds = {
    PDF: '#2d1010',
    PNG: '#0d3d2e',
    JS: '#2d2010',
    DOC: '#102030',
    XLS: '#0d2e20',
    SVG: '#1a1030',
    ZIP: '#2d1028',
    TXT: '#18202a',
  };

  const DEFAULT_GENERAL_SETTINGS = {
    theme: 'system',
    accent_color: 'default',
    language: 'auto',
    notifications_enabled: true,
    personalization_mode: 'acolhedora',
    personalization_custom_greeting: '',
    personalization_use_name: true,
    model: 'mini',
    flash_mode: false,
  };

  const BILLING_ACTIVE_STATUSES = new Set(['active', 'trialing']);
  const BILLING_KNOWN_STATUSES = new Set([
    'active',
    'trialing',
    'pending',
    'past_due',
    'canceled',
    'refunded',
    'inactive',
  ]);
  const BILLING_KNOWN_PLANS = new Set(['free', 'pro', 'max', 'ultra']);
  const BILLING_CACHE_TTL_MS = 8_000;

  const USAGE_VISUAL_BY_PLAN = Object.freeze({
    free: {
      planLabel: 'Gratis',
      subtitle: 'Plano Free: 2.000 tokens para usar Liz 2.3 e Liz 2.5.',
      metricOneLabel: 'Tokens Liz 2.3/2.5',
      metricOneValue: '2000/2000',
      metricOneFillPercent: 100,
      metricTwoLabel: 'Recarga',
      metricTwoValue: 'A cada 5h apos zerar',
      metricTwoFillPercent: 100,
      note: 'Recarga automatica em 5 horas quando os tokens acabam.',
    },
    pro: {
      planLabel: 'Liz Pro',
      subtitle: 'Plano Pro: 240.000 tokens por ciclo mensal.',
      metricOneLabel: 'Tokens por mes',
      metricOneValue: '240.000',
      metricOneFillPercent: 25,
      metricTwoLabel: 'Recarga',
      metricTwoValue: 'Mensal',
      metricTwoFillPercent: 100,
      note: 'Ciclo de tokens mensal do plano Pro.',
    },
    max: {
      planLabel: 'Liz Max',
      subtitle: 'Plano Max: 300.000 tokens por ciclo mensal.',
      metricOneLabel: 'Tokens por mes',
      metricOneValue: '300.000',
      metricOneFillPercent: 58,
      metricTwoLabel: 'Recarga',
      metricTwoValue: 'Mensal',
      metricTwoFillPercent: 100,
      note: 'Ciclo de tokens mensal do plano Max.',
    },
    ultra: {
      planLabel: 'Liz Ultra',
      subtitle: 'Plano Ultra: 675.000 tokens e uso ate acabar.',
      metricOneLabel: 'Tokens Ultra',
      metricOneValue: '675.000',
      metricOneFillPercent: 100,
      metricTwoLabel: 'Recarga',
      metricTwoValue: 'Ate acabar',
      metricTwoFillPercent: 100,
      note: 'Mesmo sem assinatura ativa, os tokens Ultra continuam ate zerar.',
    },
  });

  const THEME_VALUES = new Set(['system', 'dark', 'light']);
  const ACCENT_VALUES = new Set(['default', 'purple_neon', 'lilac_soft', 'magenta']);
  const LANGUAGE_VALUES = new Set(['auto', 'pt-BR', 'en-US', 'es-ES']);
  const PERSONALIZATION_MODE_VALUES = new Set(['acolhedora', 'foco', 'criativa', 'direta']);

  const ACCENT_PALETTES = {
    default: {
      purple: '#8b5cf6',
      purpleLight: '#a78bfa',
      purpleGlow: 'rgba(139, 92, 246, 0.13)',
      purpleBorder: 'rgba(139, 92, 246, 0.22)',
      purpleBorderH: 'rgba(167, 139, 250, 0.5)',
      bgActive: 'rgba(139, 92, 246, 0.14)',
    },
    purple_neon: {
      purple: '#9333ea',
      purpleLight: '#c084fc',
      purpleGlow: 'rgba(147, 51, 234, 0.18)',
      purpleBorder: 'rgba(147, 51, 234, 0.28)',
      purpleBorderH: 'rgba(192, 132, 252, 0.62)',
      bgActive: 'rgba(147, 51, 234, 0.2)',
    },
    lilac_soft: {
      purple: '#a78bfa',
      purpleLight: '#d8b4fe',
      purpleGlow: 'rgba(167, 139, 250, 0.14)',
      purpleBorder: 'rgba(167, 139, 250, 0.24)',
      purpleBorderH: 'rgba(216, 180, 254, 0.56)',
      bgActive: 'rgba(167, 139, 250, 0.16)',
    },
    magenta: {
      purple: '#d946ef',
      purpleLight: '#f472b6',
      purpleGlow: 'rgba(217, 70, 239, 0.16)',
      purpleBorder: 'rgba(217, 70, 239, 0.28)',
      purpleBorderH: 'rgba(244, 114, 182, 0.56)',
      bgActive: 'rgba(217, 70, 239, 0.18)',
    },
  };

  const UI_LANGUAGE_PACKS = {
    'pt-BR': {
      documentTitle: 'Liz Brasil',
      sidebar: {
        newChat: 'Novo chat',
        search: 'Buscar em chats',
        images: 'Imagens',
        gallery: 'Galeria',
        apps: 'Aplicativos',
        conversations: 'Conversas',
        clearAll: 'limpar tudo',
        clearAllTitle: 'Limpar historico',
      },
      profileMenu: {
        addAccount: 'Adicionar outra conta',
        switchAccount: 'Trocar de conta',
        connectedAccounts: 'Contas conectadas',
        back: 'Voltar',
        myProfile: 'Meu perfil',
        preferences: 'Preferencias',
        activity: 'Atividade',
        usageLimits: 'Limites de uso',
        logout: 'Sair da conta',
      },
      settingsMenu: {
        upgrade: 'Fazer upgrade do plano',
        customization: 'Personalizacao',
        settings: 'Configuracoes',
        help: 'Ajuda',
        exit: 'Sair',
      },
      workspace: {
        greetingPrefix: 'No que voce esta ',
        greetingHighlight: 'trabalhando?',
        greetingVariants: [
          { prefix: 'No que voce esta ', highlight: 'trabalhando?' },
          { prefix: 'Qual ideia vamos ', highlight: 'tirar do papel hoje?' },
          { prefix: 'O que vamos ', highlight: 'construir agora?' },
          { prefix: 'Em que parte do projeto ', highlight: 'quer focar?' },
          { prefix: 'Qual tarefa quer ', highlight: 'destravar primeiro?' },
          { prefix: 'Pronto para mais um ', highlight: 'avanco hoje?' },
        ],
        searchTitle: 'Buscar em chats',
        imagesTitle: 'Imagens',
        galleryTitle: 'Galeria',
      },
      placeholders: {
        chatInput: 'Pergunte algo ou use /imagine sua ideia — ou "gera uma imagem ..."',
        searchInput: 'Buscar por palavra-chave...',
        imagePrompt: 'Descreva uma nova imagem',
        gallerySearch: 'Buscar',
      },
      gallery: {
        upload: 'Carregar',
        tabAll: 'Tudo',
        tabImages: 'Imagens',
        tabFiles: 'Arquivos',
        colName: 'Nome',
        colModified: 'Modificado',
        colSize: 'Tamanho',
      },
      settingsPanel: {
        panelTitle: 'Configuracoes',
        navGeneral: 'Geral',
        navNotifications: 'Notificacoes',
        navCustomization: 'Personalizacao',
        navApps: 'Aplicativos',
        navAccount: 'Conta',
        navHelp: 'Ajuda',
        generalTitle: 'Geral',
        protectTitle: 'Proteja sua conta',
        protectDesc: 'Adicione autenticacao multifator para ajudar a proteger sua conta ao entrar.',
        mfaButton: 'Configurar MFA',
        appearanceTitle: 'Aparencia',
        appearanceDesc: 'Escolha como a interface deve aparecer no sistema.',
        accentTitle: 'Cor de enfase',
        accentDesc: 'Define a cor usada nos destaques e botoes.',
        languageTitle: 'Idioma',
        languageDesc: 'Idioma principal da interface.',
        themeSystem: 'Sistema',
        themeDark: 'Escuro',
        themeLight: 'Claro',
        accentDefault: 'Padrao',
        accentPurpleNeon: 'Roxo neon',
        accentLilacSoft: 'Lilas suave',
        accentMagenta: 'Magenta',
        langAuto: 'Autodetectar',
        langPt: 'Portugues',
        langEn: 'English',
        langEs: 'Espanol',
      },
      activity: {
        title: 'Atividade',
        subtitle: 'Evolucao das suas interacoes mes a mes',
        loading: 'Carregando atividade...',
      },
      search: {
        emptyHistory: 'Sem conversas no historico.',
        emptyFiltered: 'Nenhuma conversa encontrada.',
        tag: 'chat',
      },
    },
    'en-US': {
      documentTitle: 'Liz Brazil',
      sidebar: {
        newChat: 'New chat',
        search: 'Search chats',
        images: 'Images',
        gallery: 'Gallery',
        apps: 'Apps',
        conversations: 'Conversations',
        clearAll: 'clear all',
        clearAllTitle: 'Clear history',
      },
      profileMenu: {
        addAccount: 'Add another account',
        switchAccount: 'Switch account',
        connectedAccounts: 'Connected accounts',
        back: 'Back',
        myProfile: 'My profile',
        preferences: 'Preferences',
        activity: 'Activity',
        usageLimits: 'Usage limits',
        logout: 'Sign out',
      },
      settingsMenu: {
        upgrade: 'Upgrade plan',
        customization: 'Customization',
        settings: 'Settings',
        help: 'Help',
        exit: 'Exit',
      },
      workspace: {
        greetingPrefix: 'What are you ',
        greetingHighlight: 'working on?',
        greetingVariants: [
          { prefix: 'What are you ', highlight: 'working on?' },
          { prefix: 'What should we ', highlight: 'build next?' },
          { prefix: 'Which task do you want to ', highlight: 'unlock first?' },
          { prefix: 'Ready to ship another ', highlight: 'strong result?' },
        ],
        searchTitle: 'Search chats',
        imagesTitle: 'Images',
        galleryTitle: 'Gallery',
      },
      placeholders: {
        chatInput: 'Ask anything, or /imagine your idea, or "create an image ..."',
        searchInput: 'Search by keyword...',
        imagePrompt: 'Describe a new image',
        gallerySearch: 'Search',
      },
      gallery: {
        upload: 'Upload',
        tabAll: 'All',
        tabImages: 'Images',
        tabFiles: 'Files',
        colName: 'Name',
        colModified: 'Modified',
        colSize: 'Size',
      },
      settingsPanel: {
        panelTitle: 'Settings',
        navGeneral: 'General',
        navNotifications: 'Notifications',
        navCustomization: 'Customization',
        navApps: 'Apps',
        navAccount: 'Account',
        navHelp: 'Help',
        generalTitle: 'General',
        protectTitle: 'Protect your account',
        protectDesc: 'Add multi-factor authentication to better protect your account when signing in.',
        mfaButton: 'Set up MFA',
        appearanceTitle: 'Appearance',
        appearanceDesc: 'Choose how the interface should appear in the system.',
        accentTitle: 'Accent color',
        accentDesc: 'Defines the color used on highlights and buttons.',
        languageTitle: 'Language',
        languageDesc: 'Main interface language.',
        themeSystem: 'System',
        themeDark: 'Dark',
        themeLight: 'Light',
        accentDefault: 'Default',
        accentPurpleNeon: 'Purple neon',
        accentLilacSoft: 'Soft lilac',
        accentMagenta: 'Magenta',
        langAuto: 'Auto detect',
        langPt: 'Portuguese',
        langEn: 'English',
        langEs: 'Spanish',
      },
      activity: {
        title: 'Activity',
        subtitle: 'Your interactions month by month',
        loading: 'Loading activity...',
      },
      search: {
        emptyHistory: 'No conversations in history.',
        emptyFiltered: 'No conversation found.',
        tag: 'chat',
      },
    },
    'es-ES': {
      documentTitle: 'Liz Brasil',
      sidebar: {
        newChat: 'Nuevo chat',
        search: 'Buscar en chats',
        images: 'Imagenes',
        gallery: 'Galeria',
        apps: 'Aplicaciones',
        conversations: 'Conversaciones',
        clearAll: 'limpiar todo',
        clearAllTitle: 'Limpiar historial',
      },
      profileMenu: {
        addAccount: 'Agregar otra cuenta',
        switchAccount: 'Cambiar cuenta',
        connectedAccounts: 'Cuentas conectadas',
        back: 'Volver',
        myProfile: 'Mi perfil',
        preferences: 'Preferencias',
        activity: 'Actividad',
        usageLimits: 'Limites de uso',
        logout: 'Cerrar sesion',
      },
      settingsMenu: {
        upgrade: 'Mejorar plan',
        customization: 'Personalizacion',
        settings: 'Configuraciones',
        help: 'Ayuda',
        exit: 'Salir',
      },
      workspace: {
        greetingPrefix: 'En que estas ',
        greetingHighlight: 'trabajando?',
        greetingVariants: [
          { prefix: 'En que estas ', highlight: 'trabajando?' },
          { prefix: 'Que idea vamos a ', highlight: 'construir ahora?' },
          { prefix: 'Que tarea quieres ', highlight: 'destrabar primero?' },
          { prefix: 'Listo para otro ', highlight: 'avance hoy?' },
        ],
        searchTitle: 'Buscar en chats',
        imagesTitle: 'Imagenes',
        galleryTitle: 'Galeria',
      },
      placeholders: {
        chatInput: 'Pregunta lo que quieras',
        searchInput: 'Buscar por palabra clave...',
        imagePrompt: 'Describe una nueva imagen',
        gallerySearch: 'Buscar',
      },
      gallery: {
        upload: 'Subir',
        tabAll: 'Todo',
        tabImages: 'Imagenes',
        tabFiles: 'Archivos',
        colName: 'Nombre',
        colModified: 'Modificado',
        colSize: 'Tamano',
      },
      settingsPanel: {
        panelTitle: 'Configuraciones',
        navGeneral: 'General',
        navNotifications: 'Notificaciones',
        navCustomization: 'Personalizacion',
        navApps: 'Aplicaciones',
        navAccount: 'Cuenta',
        navHelp: 'Ayuda',
        generalTitle: 'General',
        protectTitle: 'Protege tu cuenta',
        protectDesc: 'Agrega autenticacion multifactor para proteger mejor tu cuenta al iniciar sesion.',
        mfaButton: 'Configurar MFA',
        appearanceTitle: 'Apariencia',
        appearanceDesc: 'Elige como debe verse la interfaz en el sistema.',
        accentTitle: 'Color de enfasis',
        accentDesc: 'Define el color usado en destaques y botones.',
        languageTitle: 'Idioma',
        languageDesc: 'Idioma principal de la interfaz.',
        themeSystem: 'Sistema',
        themeDark: 'Oscuro',
        themeLight: 'Claro',
        accentDefault: 'Predeterminado',
        accentPurpleNeon: 'Purpura neon',
        accentLilacSoft: 'Lila suave',
        accentMagenta: 'Magenta',
        langAuto: 'Autodetectar',
        langPt: 'Portugues',
        langEn: 'English',
        langEs: 'Espanol',
      },
      activity: {
        title: 'Actividad',
        subtitle: 'Evolucion de tus interacciones mes a mes',
        loading: 'Cargando actividad...',
      },
      search: {
        emptyHistory: 'No hay conversaciones en el historial.',
        emptyFiltered: 'No se encontro ninguna conversacion.',
        tag: 'chat',
      },
    },
  };

  function normalizeTheme(value) {
    return THEME_VALUES.has(value) ? value : DEFAULT_GENERAL_SETTINGS.theme;
  }

  function normalizeAccent(value) {
    return ACCENT_VALUES.has(value) ? value : DEFAULT_GENERAL_SETTINGS.accent_color;
  }

  function normalizeLanguage(value) {
    return LANGUAGE_VALUES.has(value) ? value : DEFAULT_GENERAL_SETTINGS.language;
  }

  function normalizePersonalizationMode(value) {
    return PERSONALIZATION_MODE_VALUES.has(value)
      ? value
      : DEFAULT_GENERAL_SETTINGS.personalization_mode;
  }

  function normalizePersonalizationGreeting(value) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.slice(0, 120);
  }

  function escapeInlineHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentUserFirstName() {
    const user = window.LizAuth?.getCurrentUser?.();
    const displayName = String(user?.display_name || user?.displayName || '').trim();
    if (!displayName) return '';
    return displayName.split(/\s+/)[0].slice(0, 24);
  }

  function buildPersonalizedGreetingVariant(settingsInput = null) {
    const settings = normalizeGeneralSettings(
      settingsInput || state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS,
    );
    const mode = normalizePersonalizationMode(settings.personalization_mode);
    const custom = normalizePersonalizationGreeting(settings.personalization_custom_greeting);
    const useName = Boolean(settings.personalization_use_name);
    const firstName = useName ? getCurrentUserFirstName() : '';
    const namePrefix = firstName ? `${firstName}, ` : '';

    if (custom) {
      return {
        prefix: namePrefix,
        highlight: custom,
      };
    }

    if (mode === 'foco') {
      return {
        prefix: namePrefix,
        highlight: 'qual e a tarefa numero 1 agora?',
      };
    }

    if (mode === 'criativa') {
      return {
        prefix: namePrefix,
        highlight: 'vamos criar algo incrivel hoje?',
      };
    }

    if (mode === 'direta') {
      return {
        prefix: namePrefix,
        highlight: 'mande o objetivo e eu monto o plano.',
      };
    }

    if (!namePrefix) {
      return null;
    }

    return {
      prefix: namePrefix,
      highlight: `vamos avancar com calma e clareza hoje?`,
    };
  }

  function resolveUiLanguage(languageSetting) {
    const normalized = normalizeLanguage(languageSetting);
    if (normalized !== 'auto') {
      return normalized;
    }

    const browserLanguage = String(window.navigator?.language || '').toLowerCase();
    if (browserLanguage.startsWith('en')) return 'en-US';
    if (browserLanguage.startsWith('es')) return 'es-ES';
    return 'pt-BR';
  }

  function getCurrentLanguagePack() {
    return UI_LANGUAGE_PACKS[state.resolvedUiLanguage] || UI_LANGUAGE_PACKS['pt-BR'];
  }

  function setElementLabelText(element, text) {
    if (!element || text == null) return;
    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    const targetNode =
      textNodes.find(node => String(node.textContent || '').trim().length > 0) ||
      textNodes[textNodes.length - 1] ||
      null;
    const nextText = ` ${String(text)}`;
    if (targetNode) {
      targetNode.textContent = nextText;
    } else {
      element.appendChild(document.createTextNode(nextText));
    }
  }

  function setSettingRowText(selectId, title, description) {
    const select = document.getElementById(selectId);
    const row = select?.closest('.setting-row');
    if (!row) return;
    const titleEl = row.querySelector('.setting-label-title');
    const descEl = row.querySelector('.setting-label-desc');
    if (titleEl && title != null) {
      titleEl.textContent = String(title);
    }
    if (descEl && description != null) {
      descEl.textContent = String(description);
    }
  }

  function setSelectOptionLabel(selectEl, value, label) {
    if (!selectEl || value == null || label == null) return;
    const option = Array.from(selectEl.options || []).find(item => item.value === value);
    if (option) {
      option.textContent = String(label);
    }
  }

  function getWorkspaceGreetingVariant(pack, forceRandom = true) {
    const personalized = buildPersonalizedGreetingVariant();
    if (personalized?.highlight) {
      return personalized;
    }

    const workspace = pack?.workspace || {};
    const fallback = {
      prefix: String(workspace.greetingPrefix || ''),
      highlight: String(workspace.greetingHighlight || ''),
    };

    const variants = Array.isArray(workspace.greetingVariants)
      ? workspace.greetingVariants.filter(item => item && typeof item === 'object')
      : [];

    if (variants.length === 0) {
      return fallback;
    }

    const index = forceRandom ? Math.floor(Math.random() * variants.length) : 0;
    const selected = variants[index] || {};
    return {
      prefix: String(selected.prefix || fallback.prefix),
      highlight: String(selected.highlight || fallback.highlight),
    };
  }

  function renderWorkspaceGreeting(pack, forceRandom = true) {
    const greetingTitle = document.querySelector('.workspace-view-chat .greeting h1');
    if (!greetingTitle) return;

    const greeting = getWorkspaceGreetingVariant(pack, forceRandom);
    const safePrefix = escapeInlineHtml(greeting.prefix);
    const safeHighlight = escapeInlineHtml(greeting.highlight);
    greetingTitle.innerHTML = `${safePrefix}<span>${safeHighlight}</span>`;
  }

  function refreshGreeting() {
    renderWorkspaceGreeting(getCurrentLanguagePack(), true);
  }

  function applyUiTranslations(languageSetting) {
    const resolvedLanguage = resolveUiLanguage(languageSetting);
    const pack = UI_LANGUAGE_PACKS[resolvedLanguage] || UI_LANGUAGE_PACKS['pt-BR'];

    state.resolvedUiLanguage = resolvedLanguage;
    if (pack.documentTitle) {
      document.title = pack.documentTitle;
    }

    setElementLabelText(state.newChatBtn, pack.sidebar.newChat);
    setElementLabelText(state.searchChatsBtn, pack.sidebar.search);
    setElementLabelText(state.imagesNavBtn, pack.sidebar.images);
    setElementLabelText(state.galleryNavBtn, pack.sidebar.gallery);
    setElementLabelText(state.appsNavBtn, pack.sidebar.apps);

    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) sectionTitle.textContent = pack.sidebar.conversations;
    if (state.clearAllBtn) {
      state.clearAllBtn.textContent = pack.sidebar.clearAll;
      state.clearAllBtn.title = pack.sidebar.clearAllTitle;
    }

    setElementLabelText(state.profileAddAccountBtn, pack.profileMenu.addAccount);
    setElementLabelText(state.profileSwitchAccountBtn, pack.profileMenu.switchAccount || 'Trocar de conta');
    setElementLabelText(state.profileAccountsBackBtn, pack.profileMenu.back || 'Voltar');
    setElementLabelText(state.profileAccountsAddBtn, pack.profileMenu.addAccount);
    if (state.profileAccountsTitle) {
      state.profileAccountsTitle.textContent = pack.profileMenu.connectedAccounts || 'Contas conectadas';
    }
    setElementLabelText(state.profileMyProfileBtn, pack.profileMenu.myProfile);
    setElementLabelText(state.profilePreferencesBtn, pack.profileMenu.preferences);
    setElementLabelText(state.profileActivityBtn, pack.profileMenu.activity);
    setElementLabelText(state.profileUsageBtn, pack.profileMenu.usageLimits || 'Limites de uso');
    setElementLabelText(state.profileLogoutBtn, pack.profileMenu.logout);
    renderConnectedAccountsMenu();

    setElementLabelText(document.getElementById('sdUpgradePlan'), pack.settingsMenu.upgrade);
    setElementLabelText(document.getElementById('sdPersonalizacao'), pack.settingsMenu.customization);
    setElementLabelText(document.getElementById('openSettingsPanel'), pack.settingsMenu.settings);
    setElementLabelText(document.getElementById('sdHelp'), pack.settingsMenu.help);

    const quickSettingsItems = Array.from(document.querySelectorAll('#settingsDropdown .sd-item'));
    if (quickSettingsItems[quickSettingsItems.length - 1]) {
      setElementLabelText(quickSettingsItems[quickSettingsItems.length - 1], pack.settingsMenu.exit);
    }

    renderWorkspaceGreeting(pack, true);

    const searchHeaderTitle = document.querySelector('[data-workspace-view="search"] .search-header h2');
    if (searchHeaderTitle) searchHeaderTitle.textContent = pack.workspace.searchTitle;

    const imagesTitle = document.querySelector('[data-workspace-view="images"] .img-page-title');
    if (imagesTitle) imagesTitle.textContent = pack.workspace.imagesTitle;

    const galleryTitle = document.querySelector('[data-workspace-view="gallery"] .gal-topbar h2');
    if (galleryTitle) galleryTitle.textContent = pack.workspace.galleryTitle;

    if (state.input) state.input.placeholder = pack.placeholders.chatInput;
    if (state.searchInput) state.searchInput.placeholder = pack.placeholders.searchInput;
    if (state.imgPromptField) state.imgPromptField.placeholder = pack.placeholders.imagePrompt;
    if (state.galSearch) state.galSearch.placeholder = pack.placeholders.gallerySearch;

    const galUploadBtnText = document.querySelector('#galUploadBtn');
    if (galUploadBtnText) setElementLabelText(galUploadBtnText, pack.gallery.upload);

    const galTabs = Array.from(document.querySelectorAll('.gal-tab'));
    galTabs.forEach(tab => {
      if (tab.dataset.tab === 'tudo') tab.textContent = pack.gallery.tabAll;
      if (tab.dataset.tab === 'imagens') tab.textContent = pack.gallery.tabImages;
      if (tab.dataset.tab === 'arquivos') tab.textContent = pack.gallery.tabFiles;
    });

    const galHeads = Array.from(document.querySelectorAll('.gal-col-heads .gal-col-head'));
    if (galHeads[0]) galHeads[0].textContent = pack.gallery.colName;
    if (galHeads[1]) galHeads[1].textContent = pack.gallery.colModified;
    if (galHeads[2]) galHeads[2].textContent = pack.gallery.colSize;

    const settingsTitle = document.querySelector('.settings-title');
    if (settingsTitle) settingsTitle.textContent = pack.settingsPanel.panelTitle;

    setElementLabelText(document.querySelector('.settings-nav-item[data-tab="geral"]'), pack.settingsPanel.navGeneral);
    setElementLabelText(
      document.querySelector('.settings-nav-item[data-tab="notificacoes"]'),
      pack.settingsPanel.navNotifications,
    );
    setElementLabelText(
      document.querySelector('.settings-nav-item[data-tab="personalizacao"]'),
      pack.settingsPanel.navCustomization,
    );
    setElementLabelText(
      document.querySelector('.settings-nav-item[data-tab="aplicativos"]'),
      pack.settingsPanel.navApps,
    );
    setElementLabelText(document.querySelector('.settings-nav-item[data-tab="conta"]'), pack.settingsPanel.navAccount);
    setElementLabelText(document.querySelector('.settings-nav-item[data-tab="ajuda"]'), pack.settingsPanel.navHelp);

    const generalTitle = document.querySelector('#tab-geral h2');
    if (generalTitle) generalTitle.textContent = pack.settingsPanel.generalTitle;
    const protectTitle = document.querySelector('#tab-geral .security-card h3');
    if (protectTitle) protectTitle.textContent = pack.settingsPanel.protectTitle;
    const protectDesc = document.querySelector('#tab-geral .security-card p');
    if (protectDesc) protectDesc.textContent = pack.settingsPanel.protectDesc;
    const mfaButton = document.querySelector('#tab-geral .security-card .outline-btn');
    if (mfaButton) mfaButton.textContent = pack.settingsPanel.mfaButton;

    setSettingRowText(
      'settingsThemeSelect',
      pack.settingsPanel.appearanceTitle,
      pack.settingsPanel.appearanceDesc,
    );
    setSettingRowText('settingsAccentSelect', pack.settingsPanel.accentTitle, pack.settingsPanel.accentDesc);
    setSettingRowText(
      'settingsLanguageSelect',
      pack.settingsPanel.languageTitle,
      pack.settingsPanel.languageDesc,
    );

    setSelectOptionLabel(state.settingsThemeSelect, 'system', pack.settingsPanel.themeSystem);
    setSelectOptionLabel(state.settingsThemeSelect, 'dark', pack.settingsPanel.themeDark);
    setSelectOptionLabel(state.settingsThemeSelect, 'light', pack.settingsPanel.themeLight);
    setSelectOptionLabel(state.settingsAccentSelect, 'default', pack.settingsPanel.accentDefault);
    setSelectOptionLabel(state.settingsAccentSelect, 'purple_neon', pack.settingsPanel.accentPurpleNeon);
    setSelectOptionLabel(state.settingsAccentSelect, 'lilac_soft', pack.settingsPanel.accentLilacSoft);
    setSelectOptionLabel(state.settingsAccentSelect, 'magenta', pack.settingsPanel.accentMagenta);
    setSelectOptionLabel(state.settingsLanguageSelect, 'auto', pack.settingsPanel.langAuto);
    setSelectOptionLabel(state.settingsLanguageSelect, 'pt-BR', pack.settingsPanel.langPt);
    setSelectOptionLabel(state.settingsLanguageSelect, 'en-US', pack.settingsPanel.langEn);
    setSelectOptionLabel(state.settingsLanguageSelect, 'es-ES', pack.settingsPanel.langEs);

    if (state.settingsThemeSelect) {
      state.settingsThemeSelect.setAttribute('aria-label', pack.settingsPanel.appearanceTitle);
    }
    if (state.settingsAccentSelect) {
      state.settingsAccentSelect.setAttribute('aria-label', pack.settingsPanel.accentTitle);
    }
    if (state.settingsLanguageSelect) {
      state.settingsLanguageSelect.setAttribute('aria-label', pack.settingsPanel.languageTitle);
    }

    const activityTitle = document.querySelector('.activity-title');
    if (activityTitle) activityTitle.textContent = pack.activity.title;
    const activitySubtitle = document.querySelector('.activity-subtitle');
    if (activitySubtitle) activitySubtitle.textContent = pack.activity.subtitle;
  }

  function normalizeGeneralSettings(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const themeValue = source.theme ?? source.appearance;
    const accentValue = source.accent_color ?? source.accent ?? source.accentColor;
    const languageValue = source.language ?? source.ui_language ?? source.uiLanguage;
    const notificationsValue = source.notifications_enabled ?? source.notificationsEnabled;
    const personalizationModeValue =
      source.personalization_mode ?? source.personalizationMode;
    const personalizationCustomGreetingValue =
      source.personalization_custom_greeting
      ?? source.personalizationCustomGreeting
      ?? source.personalization_greeting;
    const personalizationUseNameValue =
      source.personalization_use_name ?? source.personalizationUseName;
    const modelValue = source.model ?? source.model_name ?? source.modelName;
    const flashModeValue = source.flash_mode ?? source.flashMode;

    const normalizedModel = mapModelLabelToApiValue(modelValue);
    return {
      ...DEFAULT_GENERAL_SETTINGS,
      ...source,
      theme: normalizeTheme(themeValue),
      accent_color: normalizeAccent(accentValue),
      language: normalizeLanguage(languageValue),
      notifications_enabled:
        typeof notificationsValue === 'boolean'
          ? notificationsValue
          : DEFAULT_GENERAL_SETTINGS.notifications_enabled,
      personalization_mode: normalizePersonalizationMode(personalizationModeValue),
      personalization_custom_greeting:
        normalizePersonalizationGreeting(personalizationCustomGreetingValue),
      personalization_use_name:
        typeof personalizationUseNameValue === 'boolean'
          ? personalizationUseNameValue
          : DEFAULT_GENERAL_SETTINGS.personalization_use_name,
      model: normalizedModel || DEFAULT_GENERAL_SETTINGS.model,
      flash_mode: Boolean(flashModeValue),
    };
  }

  function generalSettingsEquals(left, right) {
    const a = normalizeGeneralSettings(left);
    const b = normalizeGeneralSettings(right);
    const keys = Object.keys(DEFAULT_GENERAL_SETTINGS);
    return keys.every(key => a[key] === b[key]);
  }

  function readGeneralSettingsFromStorage() {
    const parseStorageValue = key => {
      if (!key) return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return normalizeGeneralSettings(JSON.parse(raw));
    };

    try {
      const current = parseStorageValue(state.settingsGeneralStorageKey);
      if (current) return current;

      for (const legacyKey of state.settingsGeneralLegacyStorageKeys) {
        const legacy = parseStorageValue(legacyKey);
        if (!legacy) continue;
        persistGeneralSettingsToStorage(legacy);
        window.localStorage.removeItem(legacyKey);
        return legacy;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  function persistGeneralSettingsToStorage(settings) {
    try {
      window.localStorage.setItem(
        state.settingsGeneralStorageKey,
        JSON.stringify(normalizeGeneralSettings(settings)),
      );
    } catch (error) {
      // no-op
    }
  }

  function syncGeneralSelectValues(settings) {
    if (state.settingsThemeSelect) {
      state.settingsThemeSelect.value = normalizeTheme(settings.theme);
    }
    if (state.settingsAccentSelect) {
      state.settingsAccentSelect.value = normalizeAccent(settings.accent_color);
    }
    if (state.settingsLanguageSelect) {
      state.settingsLanguageSelect.value = normalizeLanguage(settings.language);
    }
  }

  function setToggleState(toggleEl, isActive) {
    if (!toggleEl) return;
    const enabled = Boolean(isActive);
    toggleEl.classList.toggle('active', enabled);
    toggleEl.setAttribute('aria-pressed', String(enabled));
  }

  function setNotificationFeedback(message, type = '') {
    if (!state.settingsNotificationFeedback) return;
    state.settingsNotificationFeedback.textContent = String(message || '');
    state.settingsNotificationFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.settingsNotificationFeedback.classList.add(type);
    }
  }

  function setPersonalizationFeedback(message, type = '') {
    if (!state.settingsPersonalFeedback) return;
    state.settingsPersonalFeedback.textContent = String(message || '');
    state.settingsPersonalFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.settingsPersonalFeedback.classList.add(type);
    }
  }

  function renderPersonalizationPreview(settingsInput = null) {
    if (!state.settingsPersonalPreviewText) return;
    const settings = normalizeGeneralSettings(
      settingsInput || state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS,
    );
    const variant = buildPersonalizedGreetingVariant(settings);
    const safePrefix = escapeInlineHtml(String(variant?.prefix || ''));
    const safeHighlight = escapeInlineHtml(String(variant?.highlight || ''));
    state.settingsPersonalPreviewText.innerHTML = `${safePrefix}<span>${safeHighlight}</span>`;
  }

  function syncNotificationControls(settingsInput = null) {
    const settings = normalizeGeneralSettings(
      settingsInput || state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS,
    );
    setToggleState(state.settingsNotificationsSystemToggle, settings.notifications_enabled);
  }

  function syncPersonalizationControls(settingsInput = null) {
    const settings = normalizeGeneralSettings(
      settingsInput || state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS,
    );

    const mode = normalizePersonalizationMode(settings.personalization_mode);
    state.settingsPersonalModeButtons.forEach(button => {
      const isActive = String(button.dataset.personalizationMode || '') === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (
      state.settingsPersonalGreetingInput
      && document.activeElement !== state.settingsPersonalGreetingInput
    ) {
      state.settingsPersonalGreetingInput.value = normalizePersonalizationGreeting(
        settings.personalization_custom_greeting,
      );
    }

    setToggleState(state.settingsPersonalUseNameToggle, settings.personalization_use_name);
    renderPersonalizationPreview(settings);
  }

  function updatePersonalizationDataAttribute(settingsInput = null) {
    const settings = normalizeGeneralSettings(
      settingsInput || state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS,
    );
    document.documentElement.setAttribute(
      'data-liz-vibe',
      normalizePersonalizationMode(settings.personalization_mode),
    );
  }

  function clearSystemThemeListener() {
    if (state.systemThemeMediaQuery && state.systemThemeListener) {
      if (typeof state.systemThemeMediaQuery.removeEventListener === 'function') {
        state.systemThemeMediaQuery.removeEventListener('change', state.systemThemeListener);
      } else if (typeof state.systemThemeMediaQuery.removeListener === 'function') {
        state.systemThemeMediaQuery.removeListener(state.systemThemeListener);
      }
    }
    state.systemThemeMediaQuery = null;
    state.systemThemeListener = null;
  }

  function getSystemThemeValue() {
    try {
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch (error) {
      // no-op
    }
    return 'dark';
  }

  function applyThemeSetting(themeSetting) {
    const normalizedTheme = normalizeTheme(themeSetting);
    const root = document.documentElement;
    clearSystemThemeListener();

    if (normalizedTheme === 'system') {
      const applySystemTheme = () => {
        root.setAttribute('data-theme', getSystemThemeValue());
      };

      applySystemTheme();

      try {
        const mediaQuery = window.matchMedia?.('(prefers-color-scheme: light)');
        if (mediaQuery) {
          const listener = () => applySystemTheme();
          if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', listener);
          } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(listener);
          }
          state.systemThemeMediaQuery = mediaQuery;
          state.systemThemeListener = listener;
        }
      } catch (error) {
        // no-op
      }
      return;
    }

    root.setAttribute('data-theme', normalizedTheme);
  }

  function applyAccentSetting(accentSetting) {
    const root = document.documentElement;
    const palette = ACCENT_PALETTES[normalizeAccent(accentSetting)] || ACCENT_PALETTES.default;
    const hexToRgb = hex => {
      const normalized = String(hex || '').replace('#', '').trim();
      if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };
    const accentRgb = hexToRgb(palette.purple) || '139, 92, 246';
    const accentLightRgb = hexToRgb(palette.purpleLight) || '167, 139, 250';

    root.style.setProperty('--purple', palette.purple);
    root.style.setProperty('--purple-light', palette.purpleLight);
    root.style.setProperty('--accent-rgb', accentRgb);
    root.style.setProperty('--accent-light-rgb', accentLightRgb);
    root.style.setProperty('--accent-gradient', `linear-gradient(90deg, ${palette.purple}, ${palette.purpleLight})`);
    root.style.setProperty('--accent-shadow-soft', `rgba(${accentRgb}, 0.24)`);
    root.style.setProperty('--accent-shadow-strong', `rgba(${accentRgb}, 0.4)`);
    root.style.setProperty('--accent-shadow-light', `rgba(${accentLightRgb}, 0.55)`);
    root.style.setProperty('--purple-glow', palette.purpleGlow);
    root.style.setProperty('--purple-border', palette.purpleBorder);
    root.style.setProperty('--purple-border-h', palette.purpleBorderH);
    root.style.setProperty('--bg-active', palette.bgActive);
    root.setAttribute('data-accent', normalizeAccent(accentSetting));
  }

  function applyLanguageSettings(language) {
    const normalizedLanguage = normalizeLanguage(language);
    const resolvedUiLanguage = resolveUiLanguage(normalizedLanguage);
    document.documentElement.lang = resolvedUiLanguage;
    document.documentElement.setAttribute('data-ui-language', resolvedUiLanguage);
    document.documentElement.setAttribute('data-ui-language-setting', normalizedLanguage);
    state.resolvedUiLanguage = resolvedUiLanguage;
    applyUiTranslations(normalizedLanguage);
  }

  function applyGeneralSettings(settings, options = {}) {
    const normalized = normalizeGeneralSettings(settings);
    state.settingsGeneralState = normalized;

    applyThemeSetting(normalized.theme);
    applyAccentSetting(normalized.accent_color);
    applyLanguageSettings(normalized.language);
    updatePersonalizationDataAttribute(normalized);

    if (options.syncSelects !== false) {
      syncGeneralSelectValues(normalized);
    }
    syncNotificationControls(normalized);
    syncPersonalizationControls(normalized);

    if (options.persistStorage !== false) {
      persistGeneralSettingsToStorage(normalized);
    }

    if (options.refreshGreeting !== false) {
      renderWorkspaceGreeting(getCurrentLanguagePack(), true);
    }

    window.dispatchEvent(
      new CustomEvent('liz:general-settings-changed', {
        detail: { ...normalized, ui_language: state.resolvedUiLanguage },
      }),
    );

    return normalized;
  }

  async function ensureGeneralSettingsLoaded() {
    if (state.settingsGeneralLoaded && state.settingsGeneralState) {
      return state.settingsGeneralState;
    }

    const storageSettings = readGeneralSettingsFromStorage();
    const hadLocalSettings = Boolean(storageSettings);
    if (storageSettings) {
      applyGeneralSettings(storageSettings, {
        syncSelects: true,
        persistStorage: false,
      });
    } else if (!state.settingsGeneralState) {
      applyGeneralSettings(DEFAULT_GENERAL_SETTINGS, {
        syncSelects: true,
        persistStorage: true,
      });
    }

    try {
      if (window.LizAuth?.ensureSession && window.LizApi?.getSettings) {
        await window.LizAuth.ensureSession({ force: false });
        const token = window.LizAuth?.getAccessToken?.();
        if (token) {
          const remoteSettings = await window.LizApi.getSettings(token);
          if (remoteSettings && typeof remoteSettings === 'object') {
            const normalizedRemote = normalizeGeneralSettings(remoteSettings);
            const remoteLooksDefault = generalSettingsEquals(normalizedRemote, DEFAULT_GENERAL_SETTINGS);
            const localHasCustomSettings = hadLocalSettings
              && !generalSettingsEquals(storageSettings, DEFAULT_GENERAL_SETTINGS);

            // Quando o backend devolve apenas defaults sem storage real,
            // preserva configuracao local personalizada para nao "resetar" o usuario.
            if (!(remoteLooksDefault && localHasCustomSettings)) {
              const merged = normalizeGeneralSettings({
                ...(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS),
                ...remoteSettings,
              });
              applyGeneralSettings(merged, {
                syncSelects: true,
                persistStorage: true,
                refreshGreeting: false,
              });
            }
          }
        }
      }
    } catch (error) {
      // Nao bloqueia interface se backend de settings falhar.
    }

    state.settingsGeneralLoaded = true;
    return state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS;
  }

  async function syncSettingsPatchToBackend(patch, options = {}) {
    const silent = options.silent !== false;
    if (!window.LizApi?.updateSettings) return null;
    if (!patch || typeof patch !== 'object') return null;

    const payload = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(payload).length === 0) return null;

    try {
      if (window.LizAuth?.ensureSession) {
        await window.LizAuth.ensureSession({ force: false });
      }
      const token = window.LizAuth?.getAccessToken?.();
      if (!token) return null;

      const response = await window.LizApi.updateSettings({ token, patch: payload });
      if (response && typeof response === 'object') {
        const merged = normalizeGeneralSettings({
          ...(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS),
          ...response,
        });
        applyGeneralSettings(merged, {
          syncSelects: true,
          persistStorage: true,
          refreshGreeting: false,
        });
      }
      return response || null;
    } catch (error) {
      if (!silent) {
        console.warn('[Liz] nao foi possivel sincronizar settings no backend.', error);
      }
      return null;
    }
  }

  function getLanguagePreferences() {
    const settings = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    const uiLanguage = resolveUiLanguage(settings.language);
    return {
      language_setting: settings.language,
      ui_language: uiLanguage,
    };
  }

  function handleGeneralSettingChange(field, value) {
    const current = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    const next = { ...current };

    if (field === 'theme') {
      next.theme = normalizeTheme(value);
    } else if (field === 'accent_color') {
      next.accent_color = normalizeAccent(value);
    } else if (field === 'language') {
      next.language = normalizeLanguage(value);
    } else {
      return;
    }

    if (next[field] === current[field]) {
      return;
    }

    applyGeneralSettings(next, {
      syncSelects: true,
      persistStorage: true,
    });
    void syncSettingsPatchToBackend({ [field]: next[field] }, { silent: true });
  }

  function mapModelLabelToApiValue(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === '2.3' || normalized === 'liz 2.3' || normalized === 'liz-2.3') return '2.3';
    if (normalized === 'flash' || normalized === 'liz flash' || normalized === 'liz-flash') return 'flash';
    if (normalized === '2.5' || normalized === 'liz 2.5' || normalized === 'liz-2.5') return '2.5';
    return 'mini';
  }

  function mapModelApiValueToLabel(value) {
    const normalized = mapModelLabelToApiValue(value);
    if (normalized === '2.3') return 'Liz 2.3';
    if (normalized === 'flash') return 'Liz Flash';
    if (normalized === '2.5') return 'Liz 2.5';
    return 'Liz mini';
  }

  function setDropdownState(modelUi, isOpen) {
    if (!modelUi?.switchEl || !modelUi?.trigger || !modelUi?.dropdown) return;
    const open = Boolean(isOpen);
    modelUi.switchEl.classList.toggle('open', open);
    modelUi.trigger.setAttribute('aria-expanded', String(open));
    modelUi.dropdown.setAttribute('aria-hidden', String(!open));
  }

  function closeAllModelDropdowns() {
    state.modelUis.forEach(modelUi => setDropdownState(modelUi, false));
  }

  function getCurrentModelSelection() {
    return String(state.currentModelSelection || state.modelBeforeFlash || 'Liz mini');
  }

  function getCurrentModelApiValue() {
    return mapModelLabelToApiValue(getCurrentModelSelection());
  }

  function setModelSelection(modelLabel) {
    const apiModel = mapModelLabelToApiValue(modelLabel);
    const nextLabel = mapModelApiValueToLabel(apiModel);
    const selectedOptionLabel = nextLabel;
    state.currentModelSelection = nextLabel;
    if (!state.isFlashMode) {
      state.modelBeforeFlash = nextLabel;
    }

    state.modelUis.forEach(modelUi => {
      if (!modelUi?.current) return;
      modelUi.current.textContent = nextLabel;
      modelUi.options.forEach(option => {
        const optionLabel = String(option.dataset.model || '').trim();
        const selected = optionLabel === selectedOptionLabel;
        option.classList.toggle('selected', selected);
      });
    });
  }

  function restoreModelStateFromSettings() {
    const settings = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    setModelSelection(mapModelApiValueToLabel(settings.model));
    applyFlashModeState(Boolean(settings.flash_mode), {
      syncBackend: false,
      persistSettings: false,
      restoreModel: false,
    });
  }

  function applyFlashModeState(enabled, options = {}) {
    const nextState = Boolean(enabled);
    const shouldPersistSettings = options.persistSettings !== false;
    const shouldRestoreModel = options.restoreModel !== false;

    if (nextState && !state.isFlashMode) {
      state.modelBeforeFlash = getCurrentModelSelection();
    }

    state.isFlashMode = nextState;
    if (state.sparkBtn) {
      state.sparkBtn.classList.toggle('active', nextState);
      state.sparkBtn.setAttribute('aria-pressed', String(nextState));
      state.sparkBtn.setAttribute('aria-label', nextState ? 'Desativar modo Liz Flash' : 'Ativar modo Liz Flash');
      state.sparkBtn.title = nextState ? 'Modo Liz Flash ativo' : 'Ativar modo Liz Flash';
    }

    if (nextState) {
      setModelSelection('Liz Flash');
      closeAllModelDropdowns();
    } else if (shouldRestoreModel) {
      setModelSelection(state.modelBeforeFlash || 'Liz mini');
    }

    if (!shouldPersistSettings) return;

    const currentSettings = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    if (currentSettings.flash_mode === nextState) return;

    const merged = {
      ...currentSettings,
      flash_mode: nextState,
    };
    applyGeneralSettings(merged, {
      syncSelects: true,
      persistStorage: true,
      refreshGreeting: false,
    });
  }

  function bindFlashEvents() {
    if (!state.sparkBtn) return;
    state.sparkBtn.setAttribute('aria-pressed', String(Boolean(state.isFlashMode)));
    state.sparkBtn.addEventListener('click', event => {
      event.preventDefault();
      applyFlashModeState(!state.isFlashMode, {
        syncBackend: true,
        persistSettings: true,
        restoreModel: true,
      });
    });
  }

  function readProfileCache() {
    try {
      const raw = window.localStorage.getItem(state.profileCacheStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeProfileCache(user) {
    try {
      if (!user || typeof user !== 'object') {
        window.localStorage.removeItem(state.profileCacheStorageKey);
        return;
      }
      window.localStorage.setItem(state.profileCacheStorageKey, JSON.stringify(user));
    } catch (error) {
      // no-op
    }
  }

  function extractApiErrorMessage(error, fallbackMessage = 'Nao foi possivel concluir agora.') {
    const validationError =
      (Array.isArray(error?.payload?.error?.details) && error.payload.error.details[0]) ||
      (Array.isArray(error?.payload?.detail) && error.payload.detail[0]) ||
      null;
    const validationMessage = validationError?.msg || validationError?.message || '';
    return String(
      validationMessage
      || error?.payload?.error?.message
      || error?.payload?.detail
      || error?.message
      || fallbackMessage,
    ).trim();
  }

  function sanitizeAvatarUrl(value) {
    const avatarUrl = String(value || '').trim();
    if (!avatarUrl) return '';
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    if (avatarUrl.startsWith('/')) return avatarUrl;
    if (/^data:image\//i.test(avatarUrl) && avatarUrl.length <= 3000000) {
      return avatarUrl;
    }
    return '';
  }

  function getUserEmail(userInput = null) {
    const user = userInput || state.currentUser || {};
    return String(user.email || '').trim();
  }

  function getUserDisplayName(userInput = null) {
    const user = userInput || state.currentUser || {};
    const displayName = String(user.display_name || user.displayName || '').trim();
    if (displayName) return displayName;
    const username = String(user.username || '').trim();
    if (username) return username.replace(/^@+/, '');
    const email = getUserEmail(user);
    if (email) return email.split('@')[0];
    return 'Conta Liz';
  }

  function getUserUsername(userInput = null) {
    const user = userInput || state.currentUser || {};
    const usernameRaw = String(user.username || user.user_name || '').trim();
    if (!usernameRaw) return '@usuario';
    return usernameRaw.startsWith('@') ? usernameRaw : `@${usernameRaw}`;
  }

  function getUserInitials(userInput = null) {
    const displayName = getUserDisplayName(userInput);
    const parts = displayName
      .replace(/[^A-Za-z0-9À-ÿ\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return 'L';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  }

  function formatDateTimeLabel(value) {
    const safeValue = String(value || '').trim();
    if (!safeValue) return '-';
    const parsed = new Date(safeValue);
    if (!Number.isFinite(parsed.getTime())) return '-';
    try {
      return parsed.toLocaleString(state.resolvedUiLanguage || 'pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      return parsed.toISOString();
    }
  }

  function decodeJwtPayload(token) {
    const safeToken = String(token || '').trim();
    if (!safeToken) return null;
    const parts = safeToken.split('.');
    if (parts.length < 2) return null;
    try {
      const normalized = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
      const decoded = window.atob(normalized);
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function formatSessionExpiryFromToken(accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const exp = Number(payload?.exp || 0);
    if (!Number.isFinite(exp) || exp <= 0) return '-';
    return formatDateTimeLabel(new Date(exp * 1000).toISOString());
  }

  function setProfileFormFeedback(message, type = '') {
    if (!state.profileFormFeedback) return;
    state.profileFormFeedback.textContent = String(message || '');
    state.profileFormFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.profileFormFeedback.classList.add(type);
    }
  }

  function setProfileAccountsFeedback(message, type = '') {
    if (!state.profileAccountsFeedback) return;
    state.profileAccountsFeedback.textContent = String(message || '');
    state.profileAccountsFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.profileAccountsFeedback.classList.add(type);
    }
  }

  function setAccountFeedback(message, type = '') {
    if (!state.accountFeedback) return;
    state.accountFeedback.textContent = String(message || '');
    state.accountFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.accountFeedback.classList.add(type);
    }
  }

  function setProfileDropdownView(viewName = 'main') {
    const showAccounts = viewName === 'accounts';
    if (state.profileDropdownMain) {
      state.profileDropdownMain.hidden = showAccounts;
      state.profileDropdownMain.classList.toggle('is-active', !showAccounts);
    }
    if (state.profileAccountsMenu) {
      state.profileAccountsMenu.hidden = !showAccounts;
      state.profileAccountsMenu.classList.toggle('is-active', showAccounts);
    }
  }

  function setProfileButtonAvatar(avatarUrl) {
    if (!state.profileBtn) return;
    const safeAvatarUrl = sanitizeAvatarUrl(avatarUrl);
    const hasAvatar = Boolean(safeAvatarUrl);
    if (state.profileAvatarImage) {
      if (hasAvatar) {
        state.profileAvatarImage.src = safeAvatarUrl;
        state.profileAvatarImage.hidden = false;
      } else {
        state.profileAvatarImage.removeAttribute('src');
        state.profileAvatarImage.hidden = true;
      }
    }
    if (state.profileAvatarFallback) {
      state.profileAvatarFallback.hidden = hasAvatar;
    }
    state.profileBtn.classList.toggle('has-avatar', hasAvatar);
  }

  function setAccountCardAvatar(avatarUrl, initials) {
    const safeAvatarUrl = sanitizeAvatarUrl(avatarUrl);
    const hasAvatar = Boolean(safeAvatarUrl);
    if (state.accountAvatarImage) {
      if (hasAvatar) {
        state.accountAvatarImage.src = safeAvatarUrl;
      } else {
        state.accountAvatarImage.removeAttribute('src');
      }
    }
    if (state.accountAvatarWrap) {
      state.accountAvatarWrap.classList.toggle('has-image', hasAvatar);
    }
    if (state.accountAvatarFallback) {
      state.accountAvatarFallback.textContent = initials || 'L';
      state.accountAvatarFallback.hidden = hasAvatar;
    }
  }

  function setProfilePreviewAvatar(avatarUrl) {
    const safeAvatarUrl = sanitizeAvatarUrl(avatarUrl);
    const hasAvatar = Boolean(safeAvatarUrl);
    if (state.profileAvatarPreview) {
      if (hasAvatar) {
        state.profileAvatarPreview.src = safeAvatarUrl;
      } else {
        state.profileAvatarPreview.removeAttribute('src');
      }
    }
    if (state.profileAvatarPreviewWrap) {
      state.profileAvatarPreviewWrap.classList.toggle('has-image', hasAvatar);
    }
    if (state.profileAvatarPreviewFallback) {
      state.profileAvatarPreviewFallback.hidden = hasAvatar;
    }
  }

  function normalizeConnectedAccounts() {
    const list = window.LizAuth?.listConnectedAccounts?.();
    const normalized = Array.isArray(list) ? list.filter(item => item && typeof item === 'object') : [];
    if (normalized.length > 0) return normalized;

    if (state.currentUser && typeof state.currentUser === 'object') {
      return [{
        id: state.currentUser.id,
        email: state.currentUser.email,
        display_name: state.currentUser.display_name || state.currentUser.displayName,
        username: state.currentUser.username,
        avatar_url: state.currentUser.avatar_url || state.currentUser.avatarUrl,
        is_current: true,
      }];
    }
    return [];
  }

  function buildConnectedAccountKey(account) {
    const id = String(account?.id || '').trim();
    const email = String(account?.email || '').trim().toLowerCase();
    return id || email;
  }

  function setProfileFormSaving(isSaving) {
    state.profileSaving = Boolean(isSaving);
    if (state.saveProfileBtn) {
      state.saveProfileBtn.disabled = state.profileSaving;
      state.saveProfileBtn.textContent = state.profileSaving ? 'Salvando...' : 'Salvar perfil';
    }
  }

  async function readImageFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
      reader.readAsDataURL(file);
    });
  }

  function bindMenuItemAction(element, handler) {
    if (!element || typeof handler !== 'function') return;
    element.addEventListener('click', event => {
      event.preventDefault();
      handler(event);
    });
    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handler(event);
    });
  }

  async function switchConnectedAccountFromMenu(accountKey) {
    const safeKey = String(accountKey || '').trim();
    if (!safeKey || state.profileSwitchingAccount) return;
    if (!window.LizAuth?.switchConnectedAccount) {
      setProfileAccountsFeedback('Troca de conta indisponivel agora.', 'error');
      return;
    }

    state.profileSwitchingAccount = true;
    setProfileAccountsFeedback('Trocando de conta...', '');
    renderConnectedAccountsMenu();

    try {
      const nextUser = await window.LizAuth.switchConnectedAccount(safeKey);
      if (nextUser && typeof nextUser === 'object') {
        window.LizAuth?.setCurrentUser?.(nextUser);
      }
      applyCurrentUser(nextUser || window.LizAuth?.getCurrentUser?.() || null);
      setProfileAccountsFeedback('Conta trocada. Recarregando interface...', 'success');
      window.setTimeout(() => {
        window.location.reload();
      }, 260);
    } catch (error) {
      let message = 'Nao foi possivel trocar de conta agora.';
      if (error?.code === 'ACCOUNT_NOT_FOUND') {
        message = 'Conta nao encontrada nesta sessao.';
      } else if (error?.code === 'ACCOUNT_SWITCH_FAILED') {
        message = 'Falha ao validar a conta selecionada.';
      } else {
        message = extractApiErrorMessage(error, message);
      }
      setProfileAccountsFeedback(message, 'error');
    } finally {
      state.profileSwitchingAccount = false;
      renderConnectedAccountsMenu();
    }
  }

  async function syncCurrentUserFromBackend(options = {}) {
    if (state.accountSyncing) return state.currentUser || null;
    if (!window.LizApi?.getMe) return state.currentUser || null;

    const showFeedback = options.showFeedback !== false;
    state.accountSyncing = true;

    if (showFeedback) {
      setAccountFeedback('Atualizando dados da conta...', '');
    }

    try {
      if (window.LizAuth?.ensureSession) {
        await window.LizAuth.ensureSession({ force: Boolean(options.force) });
      }
      const token = window.LizAuth?.getAccessToken?.();
      if (!token) {
        throw new Error('TOKEN_UNAVAILABLE');
      }

      const remoteUser = await window.LizApi.getMe(token);
      if (remoteUser && typeof remoteUser === 'object') {
        window.LizAuth?.setCurrentUser?.(remoteUser);
        applyCurrentUser(remoteUser);
      }

      if (showFeedback) {
        setAccountFeedback('Dados atualizados com sucesso.', 'success');
      }
      return remoteUser || state.currentUser || null;
    } catch (error) {
      if (showFeedback) {
        setAccountFeedback(
          extractApiErrorMessage(error, 'Falha ao atualizar dados da conta no backend.'),
          'error',
        );
      }
      return state.currentUser || null;
    } finally {
      state.accountSyncing = false;
    }
  }

  async function saveProfileChanges() {
    if (state.profileSaving) return;
    if (!window.LizApi?.updateMe) {
      setProfileFormFeedback('Atualizacao de perfil indisponivel no momento.', 'error');
      return;
    }

    const rawDisplayName = String(state.profileDisplayNameInput?.value || '').trim();
    const rawUsername = String(state.profileUsernameInput?.value || '').trim();
    const sanitizedUsername = rawUsername.replace(/^@+/, '').trim().toLowerCase();
    const fallbackDisplayName = getUserDisplayName(state.currentUser);
    const fallbackUsername = String(state.currentUser?.username || '').trim().replace(/^@+/, '').toLowerCase();

    const displayName = rawDisplayName || fallbackDisplayName;
    const username = sanitizedUsername || fallbackUsername || undefined;
    if (displayName.length < 2) {
      setProfileFormFeedback('O nome precisa ter pelo menos 2 caracteres.', 'error');
      return;
    }

    const token = window.LizAuth?.getAccessToken?.();
    if (!token) {
      setProfileFormFeedback('Sessao invalida. Entre novamente para atualizar o perfil.', 'error');
      return;
    }

    const avatarUrl = state.profileAvatarMarkedForRemoval
      ? null
      : sanitizeAvatarUrl(state.profileAvatarDraft);

    setProfileFormSaving(true);
    setProfileFormFeedback('Salvando perfil...', '');
    try {
      const updatedUser = await window.LizApi.updateMe({
        token,
        displayName,
        username,
        avatarUrl,
      });
      const nextUser = window.LizAuth?.setCurrentUser?.(updatedUser) || updatedUser;
      state.profileAvatarDraft = sanitizeAvatarUrl(nextUser?.avatar_url || nextUser?.avatarUrl || '');
      state.profileAvatarMarkedForRemoval = false;
      applyCurrentUser(nextUser);
      renderConnectedAccountsMenu();
      setProfileFormFeedback('Perfil atualizado com sucesso.', 'success');
      setAccountFeedback('Perfil sincronizado no banco com sucesso.', 'success');
    } catch (error) {
      setProfileFormFeedback(
        extractApiErrorMessage(error, 'Nao foi possivel salvar seu perfil agora.'),
        'error',
      );
    } finally {
      setProfileFormSaving(false);
    }
  }

  async function copyTextToClipboard(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // fallback below
    }

    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      area.style.pointerEvents = 'none';
      document.body.appendChild(area);
      area.focus();
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return Boolean(copied);
    } catch (error) {
      return false;
    }
  }

  function applyCurrentUser(user) {
    state.currentUser = user && typeof user === 'object' ? { ...user } : null;
    writeProfileCache(state.currentUser);

    const currentUser = state.currentUser || {};
    const displayName = getUserDisplayName(currentUser);
    const username = getUserUsername(currentUser);
    const email = getUserEmail(currentUser) || '-';
    const avatarUrl = sanitizeAvatarUrl(currentUser.avatar_url || currentUser.avatarUrl || '');
    const initials = getUserInitials(currentUser);

    setProfileButtonAvatar(avatarUrl);
    setAccountCardAvatar(avatarUrl, initials);

    if (state.profileDisplayNameInput) {
      state.profileDisplayNameInput.value = String(currentUser.display_name || displayName);
    }
    if (state.profileUsernameInput) {
      state.profileUsernameInput.value = String(currentUser.username || '').replace(/^@+/, '');
    }

    if (!state.profileModal?.classList.contains('show')) {
      state.profileAvatarDraft = avatarUrl;
      state.profileAvatarMarkedForRemoval = false;
    }
    setProfilePreviewAvatar(
      state.profileAvatarMarkedForRemoval ? '' : (state.profileAvatarDraft || avatarUrl),
    );

    if (state.accountDisplayName) state.accountDisplayName.textContent = displayName;
    if (state.accountUsername) state.accountUsername.textContent = username;
    if (state.accountEmail) state.accountEmail.textContent = email;
    if (state.accountUserId) state.accountUserId.textContent = String(currentUser.id || '-');
    if (state.accountCreatedAt) state.accountCreatedAt.textContent = formatDateTimeLabel(currentUser.created_at);

    const tierRaw = String(currentUser.tier || state.billingProfile?.activePlan || 'free').trim().toLowerCase();
    const planLabelByTier = {
      free: 'Plano Free',
      pro: 'Plano Pro',
      max: 'Plano Max',
      ultra: 'Plano Ultra',
    };
    if (state.accountPlanBadge) {
      state.accountPlanBadge.textContent = planLabelByTier[tierRaw] || 'Plano Free';
    }

    const accessToken = window.LizAuth?.getAccessToken?.() || '';
    if (state.accountSessionStatus) {
      state.accountSessionStatus.textContent = accessToken ? 'Sessao ativa' : 'Sessao local indisponivel';
    }
    if (state.accountSessionExpiry) {
      state.accountSessionExpiry.textContent = formatSessionExpiryFromToken(accessToken);
    }
    if (state.accountLastSync) {
      state.accountLastSync.textContent = formatDateTimeLabel(new Date().toISOString());
    }

    setProfileFormFeedback('', '');
    renderConnectedAccountsMenu();
    renderWorkspaceGreeting(getCurrentLanguagePack(), false);
    window.dispatchEvent(
      new CustomEvent('liz:user-updated', {
        detail: {
          user: state.currentUser ? { ...state.currentUser } : null,
        },
      }),
    );
  }

  function isAnyModalOpen() {
    return Boolean(
      state.settingsModal?.classList.contains('show')
      || state.plansModal?.classList.contains('show')
      || state.profileModal?.classList.contains('show')
      || state.activityModal?.classList.contains('show')
      || state.usageModal?.classList.contains('show'),
    );
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.hidden = false;
    modalEl.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('show');
    modalEl.hidden = true;
    if (!isAnyModalOpen()) {
      document.body.style.overflow = '';
    }
  }

  function openSettingsPanel() {
    closeSettingsDropdown();
    closeProfileDropdown();
    openModal(state.settingsModal);
  }

  function closeSettingsPanel() {
    closeModal(state.settingsModal);
  }

  function getPlansPageUrl() {
    try {
      return new URL('planos.html', window.location.href).toString();
    } catch (error) {
      return 'planos.html';
    }
  }

  function openPlansPanel() {
    closeSettingsDropdown();
    closeProfileDropdown();
    const plansPageUrl = getPlansPageUrl();
    if (plansPageUrl) {
      try {
        window.location.assign(plansPageUrl);
        return;
      } catch (error) {
        // Fallback para ambientes que bloquearem navegacao por URL.
      }
    }
    if (state.plansModal) {
      openModal(state.plansModal);
    } else {
      openUsagePanel();
    }
  }

  function closePlansPanel() {
    closeModal(state.plansModal);
  }

  function openProfilePanel() {
    closeProfileDropdown();
    openModal(state.profileModal);
  }

  function closeProfilePanel() {
    closeModal(state.profileModal);
  }

  function openActivityPanel() {
    closeProfileDropdown();
    openModal(state.activityModal);
  }

  function closeActivityPanel() {
    closeModal(state.activityModal);
  }

  function openUsagePanel() {
    closeProfileDropdown();
    openModal(state.usageModal);
  }

  function closeUsagePanel() {
    closeModal(state.usageModal);
  }

  function openSettingsDropdown() {
    if (!state.settingsDropdown || !state.settingsBtn) return;
    state.settingsDropdown.classList.add('open');
    state.settingsDropdown.setAttribute('aria-hidden', 'false');
    state.settingsBtn.setAttribute('aria-expanded', 'true');
    state.settingsBtn.classList.add('active');
  }

  function closeSettingsDropdown() {
    if (!state.settingsDropdown || !state.settingsBtn) return;
    state.settingsDropdown.classList.remove('open');
    state.settingsDropdown.setAttribute('aria-hidden', 'true');
    state.settingsBtn.setAttribute('aria-expanded', 'false');
    state.settingsBtn.classList.remove('active');
  }

  function openProfileDropdown() {
    if (!state.profileDropdown || !state.profileBtn) return;
    setProfileDropdownView('main');
    setProfileAccountsFeedback('', '');
    renderConnectedAccountsMenu();
    state.profileDropdown.classList.add('open');
    state.profileDropdown.setAttribute('aria-hidden', 'false');
    state.profileBtn.setAttribute('aria-expanded', 'true');
    state.profileBtn.classList.add('active');
  }

  function closeProfileDropdown() {
    if (!state.profileDropdown || !state.profileBtn) return;
    state.profileDropdown.classList.remove('open');
    state.profileDropdown.setAttribute('aria-hidden', 'true');
    state.profileBtn.setAttribute('aria-expanded', 'false');
    state.profileBtn.classList.remove('active');
    setProfileDropdownView('main');
    setProfileAccountsFeedback('', '');
  }

  function bindSidebarEvents() {
    state.hamburger?.addEventListener('click', openSidebar);
    state.closeBtn?.addEventListener('click', closeSidebar);
    state.overlay?.addEventListener('click', closeSidebar);
    state.sidebarNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = String(item.dataset.sidebarAction || '').trim();
        if (!action) return;
        handleSidebarAction(action);
      });
    });
  }

  function bindProfileEvents() {
    state.profileBtn?.addEventListener('click', event => {
      event.stopPropagation();
      const isOpen = state.profileDropdown?.classList.contains('open');
      closeSettingsDropdown();
      if (isOpen) {
        closeProfileDropdown();
      } else {
        openProfileDropdown();
      }
    });

    const redirectToLoginForNewAccount = () => {
      closeProfileDropdown();
      if (window.LizAuth?.redirectToLogin) {
        window.LizAuth.redirectToLogin();
        return;
      }
      const next = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      window.location.href = `login.html?next=${next}`;
    };

    bindMenuItemAction(state.profileAddAccountBtn, () => {
      redirectToLoginForNewAccount();
    });
    bindMenuItemAction(state.profileAccountsAddBtn, () => {
      redirectToLoginForNewAccount();
    });

    bindMenuItemAction(state.profileSwitchAccountBtn, () => {
      renderConnectedAccountsMenu();
      setProfileAccountsFeedback('', '');
      setProfileDropdownView('accounts');
    });

    bindMenuItemAction(state.profileAccountsBackBtn, () => {
      setProfileAccountsFeedback('', '');
      setProfileDropdownView('main');
    });

    bindMenuItemAction(state.profileMyProfileBtn, () => {
      closeProfileDropdown();
      openProfilePanel();
    });
    bindMenuItemAction(state.profilePreferencesBtn, () => {
      closeProfileDropdown();
      openSettingsPanel();
    });
    bindMenuItemAction(state.profileActivityBtn, () => {
      closeProfileDropdown();
      openActivityPanel();
    });
    bindMenuItemAction(state.profileUsageBtn, () => {
      closeProfileDropdown();
      openUsagePanel();
    });

    state.profileLogoutBtn?.addEventListener('click', () => {
      closeProfileDropdown();
    });
    state.profileLogoutBtn?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      state.profileLogoutBtn.click();
    });
  }

  function bindProfilePanelEvents() {
    state.closeProfilePanelBtn?.addEventListener('click', closeProfilePanel);
    state.profileModal?.addEventListener('click', event => {
      if (event.target === state.profileModal) {
        closeProfilePanel();
      }
    });

    state.profileAvatarUploadBtn?.addEventListener('click', () => {
      state.profileAvatarFileInput?.click();
    });

    state.profileAvatarFileInput?.addEventListener('change', event => {
      const input = event.target;
      const file = input?.files?.[0];
      if (!file) return;
      if (!String(file.type || '').startsWith('image/')) {
        setProfileFormFeedback('Selecione um arquivo de imagem valido.', 'error');
        input.value = '';
        return;
      }
      if (Number(file.size || 0) > 4 * 1024 * 1024) {
        setProfileFormFeedback('A imagem deve ter no maximo 4MB.', 'error');
        input.value = '';
        return;
      }

      void readImageFileAsDataUrl(file)
        .then(dataUrl => {
          state.profileAvatarDraft = sanitizeAvatarUrl(dataUrl);
          state.profileAvatarMarkedForRemoval = false;
          setProfilePreviewAvatar(state.profileAvatarDraft);
          setProfileFormFeedback('Nova foto pronta para salvar.', '');
        })
        .catch(() => {
          setProfileFormFeedback('Nao foi possivel ler essa imagem.', 'error');
        })
        .finally(() => {
          input.value = '';
        });
    });

    state.profileAvatarRemoveBtn?.addEventListener('click', () => {
      state.profileAvatarMarkedForRemoval = true;
      state.profileAvatarDraft = '';
      setProfilePreviewAvatar('');
      setProfileFormFeedback('Foto removida. Clique em salvar para confirmar.', '');
    });

    state.profileForm?.addEventListener('submit', event => {
      event.preventDefault();
      void saveProfileChanges();
    });
  }

  function bindAccountEvents() {
    state.accountEditProfileBtn?.addEventListener('click', () => {
      openProfilePanel();
    });
    state.accountOpenActivityBtn?.addEventListener('click', () => {
      openActivityPanel();
    });
    state.accountRefreshBtn?.addEventListener('click', () => {
      void syncCurrentUserFromBackend({ showFeedback: true, force: true });
    });
    state.accountCopyEmailBtn?.addEventListener('click', () => {
      const email = getUserEmail(state.currentUser);
      void copyTextToClipboard(email).then(ok => {
        setAccountFeedback(ok ? 'Email copiado.' : 'Nao foi possivel copiar o email.', ok ? 'success' : 'error');
      });
    });
    state.accountCopyIdBtn?.addEventListener('click', () => {
      const userId = String(state.currentUser?.id || '').trim();
      void copyTextToClipboard(userId).then(ok => {
        setAccountFeedback(ok ? 'ID copiado.' : 'Nao foi possivel copiar o ID.', ok ? 'success' : 'error');
      });
    });
  }

  function bindSettingsEvents() {
    state.settingsBtn?.addEventListener('click', event => {
      event.stopPropagation();
      closeProfileDropdown();
      const isOpen = state.settingsDropdown?.classList.contains('open');
      if (isOpen) {
        closeSettingsDropdown();
      } else {
        openSettingsDropdown();
      }
    });

    state.openSettingsPanelBtn?.addEventListener('click', () => {
      openSettingsPanel();
      openSettingsTab('geral');
    });
    state.settingsPersonalizacaoBtn?.addEventListener('click', () => {
      openSettingsPanel();
      openSettingsTab('personalizacao');
    });
    state.settingsHelpBtn?.addEventListener('click', () => {
      openSettingsPanel();
      openSettingsTab('ajuda');
    });
    state.settingsUpgradeBtn?.addEventListener('click', () => {
      openPlansPanel();
    });
    state.closeSettingsPanelBtn?.addEventListener('click', closeSettingsPanel);
    state.closePlansPanelBtn?.addEventListener('click', closePlansPanel);

    state.settingsModal?.addEventListener('click', event => {
      if (event.target === state.settingsModal) {
        closeSettingsPanel();
      }
    });
    state.plansModal?.addEventListener('click', event => {
      if (event.target === state.plansModal) {
        closePlansPanel();
      }
    });

    state.settingsThemeSelect?.addEventListener('change', () => {
      handleGeneralSettingChange('theme', state.settingsThemeSelect.value);
    });
    state.settingsAccentSelect?.addEventListener('change', () => {
      handleGeneralSettingChange('accent_color', state.settingsAccentSelect.value);
    });
    state.settingsLanguageSelect?.addEventListener('change', () => {
      handleGeneralSettingChange('language', state.settingsLanguageSelect.value);
    });

    state.settingsNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = String(item.dataset.tab || '').trim();
        if (!tab) return;
        openSettingsTab(tab);
      });
    });

    state.closeSecurityCardBtn?.addEventListener('click', () => {
      state.securityCard?.remove();
    });
  }

  function setPersonalizationSaving(isSaving) {
    if (!state.settingsPersonalSaveBtn) return;
    state.settingsPersonalSaveBtn.disabled = Boolean(isSaving);
  }

  function syncUsageSummary(options = {}) {
    const shouldRender = options.render !== false;
    if (!window.LizApi?.getUsageSummary) {
      return Promise.resolve(state.usageSummary || null);
    }

    return (async () => {
      try {
        if (window.LizAuth?.ensureSession) {
          await window.LizAuth.ensureSession({ force: Boolean(options.force) });
        }
        const token = window.LizAuth?.getAccessToken?.();
        if (!token) return state.usageSummary || null;

        const summary = await window.LizApi.getUsageSummary({
          token,
          timeoutMs: 12000,
        });
        if (!summary || typeof summary !== 'object') {
          return state.usageSummary || null;
        }

        const safePlan = String(
          summary.plan || state.billingProfile?.activePlan || 'free',
        ).trim().toLowerCase();
        const visual = USAGE_VISUAL_BY_PLAN[safePlan] || USAGE_VISUAL_BY_PLAN.free;
        const monthLabel = (() => {
          const year = Number(summary.year);
          const month = Number(summary.month);
          if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
            return '';
          }
          try {
            const monthDate = new Date(year, month - 1, 1);
            return monthDate.toLocaleDateString(state.resolvedUiLanguage || 'pt-BR', {
              month: 'long',
              year: 'numeric',
            });
          } catch (error) {
            return `${String(month).padStart(2, '0')}/${year}`;
          }
        })();

        const messagesUsed = Math.max(0, Number(summary.messages_used) || 0);
        const messagesLimit = Math.max(0, Number(summary.messages_limit) || 0);
        const imagesUsed = Math.max(0, Number(summary.images_used) || 0);
        const imagesLimit = Math.max(0, Number(summary.images_limit) || 0);
        const tokenPoolTotal = Math.max(
          0,
          Number(summary.token_pool_total)
          || Number(summary.free_tokens_total)
          || 0,
        );
        const tokenPoolRemaining = Math.max(
          0,
          Number(summary.token_pool_remaining)
          || Number(summary.free_tokens_remaining)
          || 0,
        );
        const tokenPoolUsed = Math.max(
          0,
          Number(summary.token_pool_used)
          || Number(summary.free_tokens_used)
          || Math.max(0, tokenPoolTotal - tokenPoolRemaining),
        );
        const tokenPoolResetKind = String(summary.token_pool_reset_kind || '').trim().toLowerCase();
        const tokenPoolRegenHours = Math.max(
          0,
          Number(summary.token_pool_regen_hours)
          || Number(summary.free_tokens_regen_hours)
          || 0,
        );
        const tokenPoolResetAt = String(
          summary.token_pool_reset_at
          || summary.free_tokens_reset_at
          || '',
        ).trim();
        const tokenPoolDepletedAt = String(summary.free_tokens_depleted_at || '').trim();
        const messagesPercent = messagesLimit > 0
          ? Math.max(0, Math.min(100, (messagesUsed / messagesLimit) * 100))
          : visual.metricOneFillPercent;
        const imagesPercent = imagesLimit > 0
          ? Math.max(0, Math.min(100, (imagesUsed / imagesLimit) * 100))
          : visual.metricTwoFillPercent;

        state.usageSummary = {
          ...summary,
          plan: safePlan,
          messages_used: messagesUsed,
          messages_limit: messagesLimit,
          images_used: imagesUsed,
          images_limit: imagesLimit,
          token_pool_total: tokenPoolTotal,
          token_pool_used: tokenPoolUsed,
          token_pool_remaining: tokenPoolRemaining,
          token_pool_reset_kind: tokenPoolResetKind || null,
          token_pool_regen_hours: tokenPoolRegenHours,
          token_pool_reset_at: tokenPoolResetAt || null,
          token_pool_depleted_at: tokenPoolDepletedAt || null,
          free_tokens_total: summary.free_tokens_total,
          free_tokens_used: summary.free_tokens_used,
          free_tokens_remaining: summary.free_tokens_remaining,
          free_tokens_regen_hours: summary.free_tokens_regen_hours,
          free_tokens_reset_at: summary.free_tokens_reset_at,
          free_tokens_depleted_at: summary.free_tokens_depleted_at,
        };

        if (!shouldRender) {
          return state.usageSummary;
        }

        const formatDurationShort = ms => {
          const safeMs = Math.max(0, Math.floor(Number(ms) || 0));
          const totalMinutes = Math.ceil(safeMs / 60000);
          if (totalMinutes <= 1) return '1 min';
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          if (h <= 0) return `${m} min`;
          if (m <= 0) return `${h}h`;
          return `${h}h ${m}min`;
        };

        const hasTokenPanel = tokenPoolTotal > 0;
        if (hasTokenPanel) {
          const nowMs = Date.now();
          const resetAtMs = tokenPoolResetAt ? Date.parse(tokenPoolResetAt) : NaN;
          const depletedAtMs = tokenPoolDepletedAt ? Date.parse(tokenPoolDepletedAt) : NaN;
          const hasCountdown = Number.isFinite(resetAtMs)
            && resetAtMs > nowMs
            && tokenPoolRemaining <= 0;
          const tokenFillPercent = tokenPoolTotal > 0
            ? Math.max(0, Math.min(100, (tokenPoolRemaining / tokenPoolTotal) * 100))
            : visual.metricOneFillPercent;

          let rechargeValue = 'Sem recarga automatica';
          let rechargeFill = 100;
          if (tokenPoolResetKind === 'regen') {
            rechargeValue = tokenPoolRegenHours > 0
              ? `A cada ${tokenPoolRegenHours}h`
              : 'Recarga automatica';
            if (hasCountdown) {
              rechargeValue = `em ${formatDurationShort(resetAtMs - nowMs)}`;
              if (Number.isFinite(depletedAtMs) && depletedAtMs < resetAtMs) {
                rechargeFill = Math.max(
                  0,
                  Math.min(100, ((nowMs - depletedAtMs) / (resetAtMs - depletedAtMs)) * 100),
                );
              } else {
                rechargeFill = 0;
              }
            }
          } else if (tokenPoolResetKind === 'monthly') {
            rechargeValue = hasCountdown
              ? `em ${formatDurationShort(resetAtMs - nowMs)}`
              : 'Mensal';
            rechargeFill = hasCountdown ? 0 : 100;
          } else if (safePlan === 'ultra') {
            rechargeValue = 'Ate acabar';
            rechargeFill = 100;
          }

          if (state.usageSubtitle) {
            if (hasCountdown && tokenPoolRemaining <= 0) {
              state.usageSubtitle.textContent = `Tokens esgotados. Recarga ${rechargeValue}.`;
            } else {
              state.usageSubtitle.textContent = visual.subtitle;
            }
          }
          if (state.usagePlanValue) state.usagePlanValue.textContent = visual.planLabel;
          if (state.usageMetricOneLabel) {
            state.usageMetricOneLabel.textContent = safePlan === 'free'
              ? 'Tokens Liz 2.3/2.5'
              : `Tokens ${visual.planLabel}`;
          }
          if (state.usageMetricOneValue) {
            state.usageMetricOneValue.textContent = `${tokenPoolRemaining}/${tokenPoolTotal}`;
          }
          if (state.usageMetricOneFill) {
            state.usageMetricOneFill.style.width = `${tokenFillPercent}%`;
          }
          if (state.usageMetricTwoLabel) state.usageMetricTwoLabel.textContent = 'Recarga';
          if (state.usageMetricTwoValue) state.usageMetricTwoValue.textContent = rechargeValue;
          if (state.usageMetricTwoFill) {
            state.usageMetricTwoFill.style.width = `${rechargeFill}%`;
          }
          if (state.usageNote) {
            const nextResetLabel = Number.isFinite(resetAtMs)
              ? ` | Proxima recarga: ${formatDateTimeLabel(tokenPoolResetAt)}`
              : '';
            state.usageNote.textContent = `Atualizado em ${formatDateTimeLabel(new Date().toISOString())}${nextResetLabel}`;
          }
          return state.usageSummary;
        }

        if (state.usageSubtitle) {
          state.usageSubtitle.textContent = monthLabel
            ? `Consumo de ${monthLabel}.`
            : visual.subtitle;
        }
        if (state.usagePlanValue) state.usagePlanValue.textContent = visual.planLabel;
        if (state.usageMetricOneLabel) state.usageMetricOneLabel.textContent = 'Mensagens';
        if (state.usageMetricOneValue) {
          state.usageMetricOneValue.textContent = `${messagesUsed}/${messagesLimit || 0}`;
        }
        if (state.usageMetricOneFill) {
          state.usageMetricOneFill.style.width = `${messagesPercent}%`;
        }
        if (state.usageMetricTwoLabel) state.usageMetricTwoLabel.textContent = 'Imagens';
        if (state.usageMetricTwoValue) {
          state.usageMetricTwoValue.textContent = `${imagesUsed}/${imagesLimit || 0}`;
        }
        if (state.usageMetricTwoFill) {
          state.usageMetricTwoFill.style.width = `${imagesPercent}%`;
        }
        if (state.usageNote) {
          state.usageNote.textContent = `Atualizado em ${formatDateTimeLabel(new Date().toISOString())}`;
        }

        return state.usageSummary;
      } catch (error) {
        return state.usageSummary || null;
      }
    })();
  }

  function renderSearchResults(searchText = '') {
    if (!state.searchResults) return;
    const query = String(searchText || '').trim().toLowerCase();
    const entries = getSearchData();
    const filtered = !query
      ? entries
      : entries.filter(entry => (
        String(entry.title || '').toLowerCase().includes(query)
        || String(entry.time || '').toLowerCase().includes(query)
      ));

    state.searchResults.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-search';
      empty.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <div>Nenhum resultado encontrado.</div>
      `;
      state.searchResults.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(entry => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'result-item';

      const icon = document.createElement('div');
      icon.className = 'result-icon';
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <rect x="4" y="5" width="16" height="14" rx="2"></rect>
          <path d="M8 10h8M8 14h6"></path>
        </svg>
      `;

      const info = document.createElement('div');
      info.className = 'result-info';

      const title = document.createElement('div');
      title.className = 'result-title';
      title.textContent = String(entry.title || 'Conversa');

      const time = document.createElement('div');
      time.className = 'result-time';
      time.textContent = String(entry.time || '-');

      const tag = document.createElement('div');
      tag.className = 'result-tag';
      tag.textContent = 'Chat';

      info.appendChild(title);
      info.appendChild(time);
      item.appendChild(icon);
      item.appendChild(info);
      item.appendChild(tag);

      item.addEventListener('click', () => {
        const conversationId = String(entry.id || '').trim();
        if (!conversationId) return;
        const opened = window.LizChat?.openConversationById?.(conversationId);
        if (opened) {
          setWorkspaceView('chat');
        }
      });
      fragment.appendChild(item);
    });
    state.searchResults.appendChild(fragment);
  }

  function ensureImagesSection() {
    const imagesView = getImagesView();
    if (!imagesView) return;

    if (!imagesReady) {
      const nextAttachmentId = () => `img-att-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

      const renderImageAttachmentTray = () => {
        if (!state.imgAttachmentTray) return;
        state.imgAttachmentTray.innerHTML = '';
        const attachments = Array.isArray(state.imgPendingAttachments)
          ? state.imgPendingAttachments
          : [];
        state.imgAttachmentTray.classList.toggle('has-files', attachments.length > 0);
        if (attachments.length === 0) return;

        const fragment = document.createDocumentFragment();
        attachments.forEach(attachment => {
          const item = document.createElement('div');
          item.className = 'img-attachment-item';
          item.dataset.attachmentId = String(attachment.id || '');

          const thumb = document.createElement('img');
          thumb.className = 'img-attachment-thumb';
          thumb.src = String(attachment.dataUrl || '');
          thumb.alt = String(attachment.name || 'Imagem anexada');
          thumb.loading = 'lazy';
          thumb.addEventListener('click', () => {
            openSharedImagePreview(thumb.src, thumb.alt);
          });

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'img-attachment-remove';
          removeBtn.setAttribute('aria-label', 'Remover anexo');
          removeBtn.textContent = 'x';
          removeBtn.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const attId = String(attachment.id || '');
            state.imgPendingAttachments = (state.imgPendingAttachments || []).filter(itemData => itemData.id !== attId);
            renderImageAttachmentTray();
          });

          item.appendChild(thumb);
          item.appendChild(removeBtn);
          fragment.appendChild(item);
        });
        state.imgAttachmentTray.appendChild(fragment);
      };

      const appendImageChatMessage = message => {
        if (!message || typeof message !== 'object') return;
        state.imageChatMessages = Array.isArray(state.imageChatMessages) ? state.imageChatMessages : [];
        state.imageChatMessages.push(message);
      };

      const IMAGE_PROMPT_STOPWORDS = new Set([
        'um',
        'uma',
        'uns',
        'umas',
        'de',
        'do',
        'da',
        'dos',
        'das',
        'e',
        'ou',
        'a',
        'o',
        'os',
        'as',
        'no',
        'na',
        'nos',
        'nas',
        'com',
        'sem',
        'para',
        'por',
        'que',
        'quero',
        'faz',
        'fazer',
        'gera',
        'gerar',
        'imagem',
        'foto',
      ]);

      const normalizeImagePromptText = value => String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const tokenizeImagePrompt = value => normalizeImagePromptText(value)
        .split(' ')
        .map(token => token.trim())
        .filter(token => token.length >= 3 && !IMAGE_PROMPT_STOPWORDS.has(token));

      const hasExplicitImageTopicReset = value => {
        const normalized = normalizeImagePromptText(value);
        if (!normalized) return false;
        return /\b(novo assunto|outro assunto|novo tema|outro tema|mudar assunto|trocar assunto|ignora o anterior|ignorar o anterior|do zero|comeca do zero|nova ideia|quero outra coisa|outra coisa|troca tudo)\b/.test(normalized);
      };

      const isImageRefinementPrompt = value => {
        const normalized = normalizeImagePromptText(value);
        if (!normalized) return false;
        if (/\b(nao gostei|nao curti|outra|mais uma|de novo|novamente|mesmo tema|mesma imagem|igual a anterior|baseado na anterior|mantenha|mantem|so muda|apenas muda|faz isso|faz igual)\b/.test(normalized)) {
          return true;
        }
        const startsWithEditVerb = /^(muda|troca|ajusta|altera|refaz|deixa)\b/.test(normalized);
        const hasReferenceWord = /\b(anterior|primeira|mesma|mesmo|isso|essa|esse|tema)\b/.test(normalized);
        const hasAdjustmentWord = /\b(mais|menos|cor|cores|luz|iluminacao|estilo|fundo|detalhe|detalhes|angulo|camera|zoom)\b/.test(normalized);
        return startsWithEditVerb && (hasReferenceWord || hasAdjustmentWord);
      };

      const isSameImageTopic = (candidatePrompt, basePrompt) => {
        const candidateTokens = tokenizeImagePrompt(candidatePrompt);
        const baseTokens = tokenizeImagePrompt(basePrompt);
        if (candidateTokens.length === 0 || baseTokens.length === 0) return false;
        const baseSet = new Set(baseTokens);
        let overlap = 0;
        candidateTokens.forEach(token => {
          if (baseSet.has(token)) overlap += 1;
        });
        const ratioCandidate = overlap / candidateTokens.length;
        const ratioBase = overlap / baseSet.size;
        return ratioCandidate >= 0.28 || ratioBase >= 0.2;
      };

      const buildImageStrictPrompt = ({
        userPrompt,
        basePrompt,
        adjustmentPrompt,
        useBaseContext,
        styleLabel,
      }) => {
        const styleLine = styleLabel && styleLabel !== 'Estilo'
          ? `ESTILO OBRIGATORIO: ${styleLabel}.`
          : '';
        const mbLines = [
          'MB - REGRAS OBRIGATORIAS DE GERACAO:',
          '1) Siga exatamente o pedido do usuario.',
          '2) Nao troque tema, sujeito, objeto principal, ambiente ou acao sem pedido explicito.',
          '3) Nao adicione elementos principais nao solicitados.',
          '4) Se faltar detalhe, complete com variacao minima e coerente ao pedido.',
        ];
        if (useBaseContext) {
          return [
            ...mbLines,
            styleLine,
            `PROMPT BASE (MANTER): ${basePrompt || userPrompt || 'Gerar imagem coerente com o contexto anterior.'}`,
            `AJUSTES DO USUARIO NESTA RODADA: ${adjustmentPrompt || 'Gerar outra variacao mantendo o tema base.'}`,
            'RESULTADO OBRIGATORIO: manter o tema base e alterar somente o que foi pedido nos ajustes.',
          ]
            .filter(Boolean)
            .join('\n');
        }
        return [
          ...mbLines,
          styleLine,
          `PROMPT PRINCIPAL DO USUARIO: ${userPrompt || 'Gerar imagem baseada nas referencias anexadas.'}`,
          'RESULTADO OBRIGATORIO: obedecer fielmente o prompt principal.',
        ]
          .filter(Boolean)
          .join('\n');
      };

      const createImageChatActions = (message, images) => {
        const actions = document.createElement('div');
        actions.className = 'img-chat-message-actions message-actions message-actions--ai';

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'message-action-btn message-copy-btn';
        copyBtn.setAttribute('aria-label', 'Copiar resposta');
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <rect x="9" y="9" width="11" height="11" rx="2"></rect>
            <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
          </svg>
        `;
        copyBtn.addEventListener('click', () => {
          const text = String(message?.text || '').trim();
          void copyTextToClipboard(text).then(ok => {
            copyBtn.classList.remove('copied', 'copy-error');
            copyBtn.classList.add(ok ? 'copied' : 'copy-error');
            window.setTimeout(() => {
              copyBtn.classList.remove('copied', 'copy-error');
            }, 1200);
          });
        });

        const downloadBtn = document.createElement('button');
        downloadBtn.type = 'button';
        downloadBtn.className = 'message-action-btn';
        downloadBtn.setAttribute('aria-label', 'Baixar imagens');
        downloadBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <path d="M12 3v12"></path>
            <path d="m7 10 5 5 5-5"></path>
            <path d="M5 21h14"></path>
          </svg>
        `;
        downloadBtn.disabled = !Array.isArray(images) || images.length === 0;
        downloadBtn.addEventListener('click', () => {
          if (!Array.isArray(images) || images.length === 0) return;
          images.forEach((imgItem, index) => {
            const href = String(imgItem.dataUrl || imgItem.url || '').trim();
            if (!href) return;
            const link = document.createElement('a');
            link.href = href;
            link.download = String(imgItem.name || `imagem-${index + 1}.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          });
        });

        actions.appendChild(copyBtn);
        actions.appendChild(downloadBtn);
        return actions;
      };

      const renderImageMessageMedia = (container, images) => {
        const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
        if (safeImages.length === 0) return;
        const grid = document.createElement('div');
        grid.className = 'img-chat-media-grid';
        safeImages.forEach((image, index) => {
          const source = String(image.dataUrl || image.url || '').trim();
          if (!source) return;
          const item = document.createElement('div');
          item.className = 'img-chat-media-item';

          const imageEl = document.createElement('img');
          imageEl.className = 'img-chat-media-img';
          imageEl.src = source;
          imageEl.alt = String(image.name || `Imagem ${index + 1}`);
          imageEl.loading = 'lazy';
          imageEl.addEventListener('click', () => {
            openSharedImagePreview(source, imageEl.alt);
          });

          item.appendChild(imageEl);
          grid.appendChild(item);
        });
        if (grid.childElementCount > 0) {
          container.appendChild(grid);
        }
      };

      const renderImageChatMessages = () => {
        if (!state.imgChatList) return;
        state.imgChatList.innerHTML = '';
        const messages = Array.isArray(state.imageChatMessages) ? state.imageChatMessages : [];
        const hasMessages = messages.length > 0;
        imagesView.classList.toggle('image-chat-active', hasMessages);
        if (!hasMessages) {
          imagesView.classList.remove('image-chat-enter');
          return;
        }

        const fragment = document.createDocumentFragment();
        messages.forEach(message => {
          const role = String(message.role || 'ai').toLowerCase() === 'user' ? 'user' : 'ai';
          const row = document.createElement('div');
          row.className = `img-chat-msg ${role}`;

          const bubble = document.createElement('div');
          bubble.className = 'img-chat-bubble';
          if (message.pending) {
            bubble.classList.add('pending');
          }

          const text = String(message.text || '').trim();
          if (text) {
            if (role === 'ai') {
              bubble.innerHTML = renderMarkdownText(text);
            } else {
              bubble.textContent = text;
            }
          }

          const images = Array.isArray(message.images) ? message.images : [];
          if (images.length > 0 && !text) {
            bubble.classList.add('media-only');
          }
          renderImageMessageMedia(bubble, images);

          const attachments = Array.isArray(message.attachments) ? message.attachments : [];
          if (attachments.length > 0) {
            const preview = document.createElement('div');
            preview.className = 'img-chat-preview';
            const label = document.createElement('div');
            label.className = 'img-chat-preview-label';
            label.textContent = `${attachments.length} anexo(s)`;
            preview.appendChild(label);
            bubble.appendChild(preview);
          }

          if (message.status) {
            const status = document.createElement('div');
            status.className = 'img-chat-status';
            status.textContent = String(message.status);
            bubble.appendChild(status);
          }

          row.appendChild(bubble);
          if (role === 'ai') {
            row.appendChild(createImageChatActions(message, images));
          }
          fragment.appendChild(row);
        });

        state.imgChatList.appendChild(fragment);
        state.imgChatList.scrollTop = state.imgChatList.scrollHeight;
        imagesView.classList.remove('image-chat-enter');
        window.clearTimeout(imageChatEnterTimer);
        imageChatEnterTimer = window.setTimeout(() => {
          imagesView.classList.add('image-chat-enter');
        }, 18);
      };

      const ingestImageFiles = files => {
        const safeFiles = getImageFiles(files);
        if (safeFiles.length === 0) return Promise.resolve();
        const current = Array.isArray(state.imgPendingAttachments) ? state.imgPendingAttachments : [];
        const freeSlots = Math.max(0, 6 - current.length);
        const selection = safeFiles.slice(0, freeSlots);
        if (selection.length === 0) return Promise.resolve();
        state.imgLoadingAttachments = true;
        return Promise.all(selection.map(file => readImageFileAsDataUrl(file)
          .then(dataUrl => ({
            id: nextAttachmentId(),
            name: String(file.name || 'imagem'),
            dataUrl: String(dataUrl || ''),
            mimeType: String(file.type || 'image/png'),
            sizeBytes: Number(file.size || 0),
          }))
          .catch(() => null)))
          .then(results => {
            const next = results.filter(Boolean).filter(item => item.dataUrl);
            state.imgPendingAttachments = [...current, ...next].slice(0, 6);
            renderImageAttachmentTray();
          })
          .finally(() => {
            state.imgLoadingAttachments = false;
          });
      };

      const setImagesSending = isSending => {
        if (!state.imgSendBtn) return;
        state.imgSendBtn.disabled = Boolean(isSending);
      };

      const sendImagesPrompt = async () => {
        const prompt = String(state.imgPromptField?.value || '').trim();
        const attachments = Array.isArray(state.imgPendingAttachments)
          ? state.imgPendingAttachments.slice()
          : [];
        if (!prompt && attachments.length === 0) return;
        if (!window.LizApi?.generateFluxImage) return;
        let quotaBlockedMessage = '';
        const tokenForQuota = window.LizAuth?.getAccessToken?.() || '';
        if (tokenForQuota && window.LizApi?.getUsageSummary) {
          try {
            const summary = await window.LizApi.getUsageSummary({
              token: tokenForQuota,
              timeoutMs: 6000,
            });
            const planRemaining = Number(summary?.token_pool_remaining);
            const freeRemaining = Number(summary?.free_tokens_remaining);
            const remaining = Number.isFinite(planRemaining) ? planRemaining : freeRemaining;
            const imageCost = Number(summary?.token_activity_costs?.image_generation)
              || Number(summary?.free_tokens_activity_costs?.image_generation)
              || 250;
            if (Number.isFinite(remaining) && remaining < imageCost) {
              quotaBlockedMessage = 'Tokens insuficientes para gerar imagem agora.';
            }
          } catch (error) {
            // segue fluxo normal se consulta de uso falhar
          }
        }

        const style = String(state.imgStyleLabel?.textContent || '').trim();
        const basePrompt = String(state.imgSessionBasePrompt || '').trim();
        const hasBasePrompt = Boolean(basePrompt);
        const explicitTopicReset = prompt ? hasExplicitImageTopicReset(prompt) : false;
        const refinementRequest = prompt ? isImageRefinementPrompt(prompt) : false;
        const sameTopicRequest = prompt && hasBasePrompt
          ? isSameImageTopic(prompt, basePrompt)
          : false;
        const useBaseContext = hasBasePrompt && !explicitTopicReset
          ? (refinementRequest || sameTopicRequest || !prompt)
          : false;
        const nextBasePrompt = useBaseContext
          ? basePrompt
          : (prompt || basePrompt || 'Gerar imagem baseada nas referencias anexadas.');
        state.imgSessionBasePrompt = nextBasePrompt;
        state.imgSessionBasePromptNorm = normalizeImagePromptText(nextBasePrompt);
        const strictPrompt = buildImageStrictPrompt({
          userPrompt: prompt,
          basePrompt: state.imgSessionBasePrompt,
          adjustmentPrompt: useBaseContext ? prompt : '',
          useBaseContext,
          styleLabel: style,
        });
        const galleryPromptSummary = useBaseContext
          ? `${state.imgSessionBasePrompt}${prompt ? ` | ajustes: ${prompt}` : ' | ajustes: nova variacao'}`
          : (prompt || state.imgSessionBasePrompt);
        const pendingMessageId = `img-msg-${Date.now()}`;

        appendImageChatMessage({
          id: `${pendingMessageId}-user`,
          role: 'user',
          text: prompt || 'Gerar imagem',
          attachments,
          createdAt: new Date().toISOString(),
        });
        if (quotaBlockedMessage) {
          appendImageChatMessage({
            id: `${pendingMessageId}-ai`,
            role: 'ai',
            text: quotaBlockedMessage,
            pending: false,
            status: 'Recarga de tokens necessaria.',
            images: [],
            createdAt: new Date().toISOString(),
          });
          if (state.imgPromptField) {
            state.imgPromptField.value = '';
            state.imgPromptField.style.height = 'auto';
          }
          state.imgPendingAttachments = [];
          renderImageAttachmentTray();
          renderImageChatMessages();
          void syncUsageSummary({ render: true, force: true });
          return;
        }
        appendImageChatMessage({
          id: `${pendingMessageId}-ai`,
          role: 'ai',
          text: 'Gerando imagem...',
          pending: true,
          status: 'Aguardando resposta do gerador...',
          images: [],
          createdAt: new Date().toISOString(),
        });

        if (state.imgPromptField) {
          state.imgPromptField.value = '';
          state.imgPromptField.style.height = 'auto';
        }
        state.imgPendingAttachments = [];
        renderImageAttachmentTray();
        renderImageChatMessages();
        setImagesSending(true);

        try {
          const token = window.LizAuth?.getAccessToken?.() || '';
          const generated = await window.LizApi.generateFluxImage({
            prompt: strictPrompt,
            attachments,
            token,
            timeoutMs: 65000,
            negativePrompt: state.imgFluxNegativePrompt || '',
          });
          const images = Array.isArray(generated?.images) ? generated.images : [];
          const replyText = String(generated?.text || '').trim() || 'Imagem pronta.';
          const idx = state.imageChatMessages.findIndex(item => item.id === `${pendingMessageId}-ai`);
          if (idx >= 0) {
            state.imageChatMessages[idx] = {
              ...state.imageChatMessages[idx],
              pending: false,
              text: replyText,
              status: images.length > 0 ? '' : 'A API retornou sem imagem.',
              images,
            };
          }

          if (images.length > 0) {
            addGeneratedImagesToGallery(images, {
              source: 'images',
              prompt: galleryPromptSummary,
            });
            if (token && window.LizApi?.uploadFile) {
              const uploads = await Promise.allSettled(
                images.slice(0, 6).map((image, index) => {
                  const fileName = String(image?.name || `liz-imagina-${Date.now()}-${index + 1}.png`).trim();
                  const dataUrl = String(image?.dataUrl || image?.url || '').trim();
                  if (!dataUrl) return Promise.resolve(null);
                  return window.LizApi.uploadFile({
                    token,
                    fileName,
                    dataUrl,
                    timeoutMs: 45000,
                  });
                }),
              );
              uploads.forEach(result => {
                if (result.status !== 'fulfilled' || !result.value) return;
                upsertGalleryItem(result.value, {
                  source: 'remote',
                  ownerKey: resolveGalleryOwnerKey(),
                });
              });
            }
            if (token && window.LizApi?.consumeImagesUsage) {
              try {
                await window.LizApi.consumeImagesUsage({ token, count: 1 });
              } catch (error) {
                // continua mesmo se atualizacao de uso falhar
              }
            }
            void syncUsageSummary({ render: true, force: true });
          }
        } catch (error) {
          const idx = state.imageChatMessages.findIndex(item => item.id === `${pendingMessageId}-ai`);
          if (idx >= 0) {
            state.imageChatMessages[idx] = {
              ...state.imageChatMessages[idx],
              pending: false,
              text: String(error?.message || '').trim() || 'Nao foi possivel gerar imagem agora.',
              status: 'Falha ao gerar imagem.',
              images: [],
            };
          }
        } finally {
          setImagesSending(false);
          renderImageChatMessages();
        }
      };

      state.imgStyleBtn?.addEventListener('click', event => {
        event.stopPropagation();
        const isOpen = state.imgStyleSwitch?.classList.contains('open');
        setImageStyleDropdownState(!isOpen);
      });

      state.imgStyleOptions.forEach(option => {
        option.addEventListener('click', event => {
          event.preventDefault();
          const styleName = String(option.dataset.style || '').trim() || 'Estilo';
          setImageStyleSelection(styleName);
          closeImageStyleDropdown();
        });
      });

      state.imgPresetCards.forEach(card => {
        card.addEventListener('click', () => {
          const presetKey = String(card.dataset.imgPreset || '').trim();
          const preset = resolveImagePreset(presetKey);
          if (!preset || !state.imgPromptField) return;
          state.imgPromptField.value = String(preset.prompt || '');
          state.imgFluxNegativePrompt = String(preset.negativePrompt || '').trim();
          state.imgPromptField.focus();
          state.imgPromptField.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });

      state.imgAttachBtn?.addEventListener('click', () => {
        state.imgFileInput?.click();
      });
      state.imgFileInput?.addEventListener('change', event => {
        const input = event.target;
        void ingestImageFiles(input?.files || []).finally(() => {
          if (input) input.value = '';
        });
      });

      state.imgPromptField?.addEventListener('input', () => {
        state.imgPromptField.style.height = 'auto';
        state.imgPromptField.style.height = `${Math.min(state.imgPromptField.scrollHeight, 140)}px`;
      });
      state.imgPromptField?.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          void sendImagesPrompt();
        }
      });
      state.imgPromptField?.addEventListener('paste', event => {
        const files = getImageFilesFromClipboard(event);
        if (files.length === 0) return;
        event.preventDefault();
        void ingestImageFiles(files);
      });
      state.imgSendBtn?.addEventListener('click', () => {
        void sendImagesPrompt();
      });

      renderImageAttachmentTray();
      state.__renderImageChatMessages = renderImageChatMessages;
      imagesReady = true;
    }

    renderImageChat();
  }

  function renderImageChat() {
    if (typeof state.__renderImageChatMessages === 'function') {
      state.__renderImageChatMessages();
    }
  }

  function ensureAppsSection() {
    if (!state.appsCardsGrid) return;

    const settingsState = state.settingsAppsState || {};
    state.appsCardsGrid.innerHTML = '';

    const fragment = document.createDocumentFragment();
    SETTINGS_APPS_CATALOG.forEach(app => {
      const enabled = Boolean(settingsState[app.id]?.enabled ?? app.defaultEnabled);
      const card = document.createElement('article');
      card.className = `liz-app-card${app.availability === 'soon' ? ' soon' : ''}`;
      card.dataset.appId = app.id;

      if (app.availability === 'soon') {
        card.innerHTML = `
          <div class="liz-app-soon-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v5l3 3"></path>
            </svg>
          </div>
          <div class="liz-app-soon-title">${app.name}</div>
          <div class="liz-app-soon-desc">${app.description}</div>
        `;
      } else {
        const actionLabel = app.availability === 'locked'
          ? 'Sempre ativo'
          : (enabled ? 'Configurado' : 'Configurar');
        card.innerHTML = `
          <div class="liz-app-crown">
            <img class="liz-app-crown-icon" src="img/crown-logo.png?v=2" alt="" />
          </div>
          <div class="liz-app-name">${app.name}</div>
          <div class="liz-app-desc">${app.description}</div>
          <button class="liz-dl-btn" type="button" data-open-settings-app="${app.id}">
            ${actionLabel}
          </button>
        `;
      }
      fragment.appendChild(card);
    });
    state.appsCardsGrid.appendChild(fragment);

    if (!appsReady) {
      state.appsCardsGrid.addEventListener('click', event => {
        const trigger = event.target.closest('[data-open-settings-app]');
        if (!trigger) return;
        openSettingsPanel();
        openSettingsTab('aplicativos');
      });
      appsReady = true;
    }
  }

  function formatGallerySize(sizeBytes) {
    const bytes = Number(sizeBytes || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const fixed = value >= 10 || unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(fixed)} ${units[unitIndex]}`;
  }

  function resolveGalleryExtension(fileName, mimeType) {
    const name = String(fileName || '').trim();
    const fromName = name.match(/\.([a-z0-9]{2,6})(?:$|\?)/i);
    if (fromName && fromName[1]) return fromName[1].toUpperCase();
    const mime = String(mimeType || '').toLowerCase();
    if (mime.includes('jpeg')) return 'JPG';
    if (mime.includes('png')) return 'PNG';
    if (mime.includes('webp')) return 'WEBP';
    if (mime.includes('gif')) return 'GIF';
    if (mime.includes('svg')) return 'SVG';
    if (mime.includes('pdf')) return 'PDF';
    return 'TXT';
  }

  function isGalleryImage(fileName, mimeType) {
    const mime = String(mimeType || '').toLowerCase();
    if (mime.startsWith('image/')) return true;
    const extension = resolveGalleryExtension(fileName, mimeType);
    return GALLERY_IMAGE_EXTENSIONS.has(extension);
  }

  function resolveGalleryOwnerKey() {
    const user = state.currentUser || window.LizAuth?.getCurrentUser?.() || null;
    const userId = String(user?.id || '').trim();
    if (userId) return userId;
    const email = String(user?.email || '').trim().toLowerCase();
    if (email) return email;
    return 'guest';
  }

  function buildGalleryCacheKey(ownerKey) {
    return `${GALLERY_CACHE_NAMESPACE}:${String(ownerKey || 'guest')}`;
  }

  function normalizeGalleryItem(rawItem, options = {}) {
    const source = String(options.source || rawItem?.source || 'generated').trim().toLowerCase() || 'generated';
    const fileName = String(rawItem?.file_name || rawItem?.name || 'arquivo').trim() || 'arquivo';
    const mimeType = String(rawItem?.mime_type || rawItem?.mimeType || '').trim() || 'application/octet-stream';
    const sizeBytes = Math.max(0, Number(rawItem?.size_bytes || rawItem?.sizeBytes || 0) || 0);
    const storagePath = String(rawItem?.storage_path || rawItem?.storagePath || '').trim();
    const fileUrl = String(rawItem?.file_url || rawItem?.fileUrl || '').trim();
    const dataUrl = String(rawItem?.data_url || rawItem?.dataUrl || '').trim();
    const uploadedAt = String(rawItem?.uploaded_at || rawItem?.uploadedAt || new Date().toISOString()).trim();
    const id = String(
      rawItem?.id
      || (storagePath ? `remote:${storagePath}` : `${source}:${uploadedAt}:${fileName}`),
    ).trim();
    const ownerKey = String(options.ownerKey || rawItem?.ownerKey || state.galleryOwnerKey || 'guest');
    const isImage = isGalleryImage(fileName, mimeType);
    return {
      id,
      source,
      ownerKey,
      fileName,
      mimeType,
      sizeBytes,
      storagePath,
      fileUrl,
      dataUrl,
      uploadedAt,
      isImage,
      extension: resolveGalleryExtension(fileName, mimeType),
      prompt: String(rawItem?.prompt || '').trim(),
      conversationId: String(rawItem?.conversationId || '').trim(),
      conversationTitle: String(rawItem?.conversationTitle || '').trim(),
    };
  }

  function sortGalleryItemsInPlace() {
    galleryFiles.sort((a, b) => {
      const aTime = new Date(a.uploadedAt || 0).getTime();
      const bTime = new Date(b.uploadedAt || 0).getTime();
      return bTime - aTime;
    });
    if (galleryFiles.length > MAX_GALLERY_CACHE_ITEMS) {
      galleryFiles.splice(MAX_GALLERY_CACHE_ITEMS);
    }
  }

  function persistGalleryCache() {
    try {
      const key = buildGalleryCacheKey(state.galleryOwnerKey);
      const serializable = galleryFiles
        .filter(item => item.ownerKey === state.galleryOwnerKey)
        .map(item => ({
          id: item.id,
          source: item.source,
          ownerKey: item.ownerKey,
          file_name: item.fileName,
          mime_type: item.mimeType,
          size_bytes: item.sizeBytes,
          storage_path: item.storagePath,
          file_url: item.fileUrl,
          data_url: item.dataUrl && item.dataUrl.length <= 450000 ? item.dataUrl : '',
          uploaded_at: item.uploadedAt,
          prompt: item.prompt,
          conversationId: item.conversationId,
          conversationTitle: item.conversationTitle,
        }));
      window.localStorage.setItem(key, JSON.stringify(serializable));
    } catch (error) {
      // cache local opcional
    }
  }

  function loadGalleryFromCache(ownerKey) {
    try {
      const raw = window.localStorage.getItem(buildGalleryCacheKey(ownerKey));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      galleryFiles.length = 0;
      parsed
        .map(item => normalizeGalleryItem(item, { ownerKey }))
        .forEach(item => galleryFiles.push(item));
      sortGalleryItemsInPlace();
    } catch (error) {
      galleryFiles.length = 0;
    }
  }

  function ensureGalleryOwnerScope() {
    const ownerKey = resolveGalleryOwnerKey();
    if (ownerKey === state.galleryOwnerKey && galleryFiles.length > 0) {
      return;
    }
    state.galleryOwnerKey = ownerKey;
    loadGalleryFromCache(ownerKey);
    state.galleryRemoteLastOwnerKey = '';
    state.galleryRemoteLastSyncAt = 0;
  }

  function upsertGalleryItem(rawItem, options = {}) {
    const nextItem = normalizeGalleryItem(rawItem, {
      source: options.source,
      ownerKey: state.galleryOwnerKey,
    });
    const existingIndex = galleryFiles.findIndex(item => (
      item.id === nextItem.id
      || (nextItem.storagePath && item.storagePath && item.storagePath === nextItem.storagePath)
    ));
    if (existingIndex >= 0) {
      galleryFiles[existingIndex] = {
        ...galleryFiles[existingIndex],
        ...nextItem,
      };
    } else {
      galleryFiles.push(nextItem);
    }
    sortGalleryItemsInPlace();
    persistGalleryCache();
    return nextItem;
  }

  async function syncGalleryFromBackend(options = {}) {
    const force = Boolean(options.force);
    const silent = options.silent !== false;
    ensureGalleryOwnerScope();

    const now = Date.now();
    if (
      !force
      && state.galleryRemoteLastOwnerKey === state.galleryOwnerKey
      && (now - state.galleryRemoteLastSyncAt) < 12_000
    ) {
      return null;
    }
    if (state.galleryRemoteSyncPromise && !force) {
      return state.galleryRemoteSyncPromise;
    }

    const requestId = ++state.galleryRemoteSyncRequestId;
    state.galleryRemoteSyncPromise = (async () => {
      try {
        if (window.LizAuth?.ensureSession) {
          await window.LizAuth.ensureSession({ force: false });
        }
        const token = window.LizAuth?.getAccessToken?.();
        if (!token || !window.LizApi?.listFiles) return null;
        const response = await window.LizApi.listFiles({
          token,
          limit: 300,
          timeoutMs: 25000,
        });
        if (requestId !== state.galleryRemoteSyncRequestId) return null;
        const items = Array.isArray(response?.items) ? response.items : [];

        for (let index = galleryFiles.length - 1; index >= 0; index -= 1) {
          if (galleryFiles[index].source === 'remote') {
            galleryFiles.splice(index, 1);
          }
        }

        items.forEach(item => {
          galleryFiles.push(normalizeGalleryItem(item, {
            source: 'remote',
            ownerKey: state.galleryOwnerKey,
          }));
        });
        sortGalleryItemsInPlace();
        persistGalleryCache();
        state.galleryRemoteLastOwnerKey = state.galleryOwnerKey;
        state.galleryRemoteLastSyncAt = Date.now();
        renderGalleryList();
        return items.length;
      } catch (error) {
        if (!silent) {
          console.warn('[Liz] falha ao sincronizar galeria remota.', error);
        }
        return null;
      } finally {
        if (requestId === state.galleryRemoteSyncRequestId) {
          state.galleryRemoteSyncPromise = null;
        }
      }
    })();

    return state.galleryRemoteSyncPromise;
  }

  function getGalleryVisibleItems() {
    const query = String(state.galSearch?.value || '').trim().toLowerCase();
    return galleryFiles.filter(item => {
      if (item.ownerKey !== state.galleryOwnerKey) return false;
      if (state.currentGalleryTab === 'imagens' && !item.isImage) return false;
      if (state.currentGalleryTab === 'arquivos' && item.isImage) return false;
      if (state.currentGallerySourceFilter !== 'all' && item.source !== state.currentGallerySourceFilter) {
        return false;
      }
      if (!query) return true;
      return (
        String(item.fileName || '').toLowerCase().includes(query)
        || String(item.prompt || '').toLowerCase().includes(query)
        || String(item.conversationTitle || '').toLowerCase().includes(query)
      );
    });
  }

  function buildGalleryDownloadUrl(storagePath) {
    const base = String(window.LizApi?.getApiBase?.() || '').replace(/\/+$/, '');
    const safePath = String(storagePath || '')
      .split('/')
      .filter(Boolean)
      .map(part => encodeURIComponent(part))
      .join('/');
    if (!base || !safePath) return '';
    return `${base}/files/download/${safePath}`;
  }

  function downloadDataUrl(dataUrl, fileName) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName || 'arquivo';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function downloadGalleryItem(item) {
    if (!item) return;
    if (item.dataUrl) {
      downloadDataUrl(item.dataUrl, item.fileName);
      return;
    }

    const remoteUrl = item.fileUrl || buildGalleryDownloadUrl(item.storagePath);
    if (!remoteUrl) return;
    const token = window.LizAuth?.getAccessToken?.() || '';
    if (!token) {
      window.open(remoteUrl, '_blank', 'noopener');
      return;
    }

    try {
      const response = await fetch(remoteUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = item.fileName || 'arquivo';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1200);
    } catch (error) {
      console.warn('[Liz] falha ao baixar arquivo da galeria.', error);
    }
  }

  function removeGalleryItem(itemId) {
    const id = String(itemId || '').trim();
    if (!id) return;
    const index = galleryFiles.findIndex(item => item.id === id);
    if (index < 0) return;
    galleryFiles.splice(index, 1);
    persistGalleryCache();
    renderGalleryList();
  }

  function renderGalleryList() {
    if (!state.galList) return;
    ensureGalleryOwnerScope();
    const items = getGalleryVisibleItems();
    state.galList.innerHTML = '';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'tab-placeholder';
      empty.textContent = 'Nenhum arquivo encontrado na galeria.';
      state.galList.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'gal-row';
        row.dataset.galleryId = item.id;
        if (state.currentGalleryView === 'grid' && item.isImage) {
          row.classList.add('gal-row-grid-image');
        }

        const fileCell = document.createElement('div');
        fileCell.className = 'gal-file-cell';

        if (state.currentGalleryView === 'grid') {
          const preview = document.createElement('div');
          preview.className = 'gal-grid-preview';
          if (item.isImage && item.dataUrl) {
            const img = document.createElement('img');
            img.className = 'gal-grid-preview-img';
            img.src = item.dataUrl;
            img.alt = item.fileName;
            img.loading = 'lazy';
            preview.appendChild(img);
          } else {
            const fallback = document.createElement('span');
            fallback.className = 'gal-grid-preview-fallback';
            fallback.textContent = item.extension;
            preview.appendChild(fallback);
          }
          fileCell.appendChild(preview);
        } else {
          const icon = document.createElement('div');
          icon.className = 'gal-file-icon';
          icon.textContent = item.extension;
          icon.style.color = extColors[item.extension] || '#a78bfa';
          icon.style.background = extBackgrounds[item.extension] || 'rgba(167, 139, 250, 0.14)';
          icon.style.borderColor = 'var(--purple-border)';
          fileCell.appendChild(icon);
        }

        const info = document.createElement('div');
        info.className = 'gal-file-info';
        const name = document.createElement('div');
        name.className = 'gal-file-name';
        name.textContent = item.fileName;
        const location = document.createElement('div');
        location.className = 'gal-file-location';
        location.textContent = item.source === 'remote'
          ? (item.storagePath || 'Servidor')
          : (item.prompt || item.conversationTitle || 'Gerado localmente');
        info.appendChild(name);
        info.appendChild(location);
        fileCell.appendChild(info);
        row.appendChild(fileCell);

        const modified = document.createElement('div');
        modified.className = 'gal-cell-text';
        modified.textContent = formatDateTimeLabel(item.uploadedAt);
        row.appendChild(modified);

        const size = document.createElement('div');
        size.className = 'gal-cell-text gal-row-size';
        size.textContent = formatGallerySize(item.sizeBytes);
        row.appendChild(size);

        const actions = document.createElement('div');
        actions.className = 'gal-row-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.type = 'button';
        downloadBtn.className = 'gal-action-btn dl';
        downloadBtn.dataset.galleryAction = 'download';
        downloadBtn.dataset.galleryId = item.id;
        downloadBtn.setAttribute('aria-label', 'Baixar');
        downloadBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <path d="M12 3v12"></path>
            <path d="m7 10 5 5 5-5"></path>
            <path d="M5 21h14"></path>
          </svg>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'gal-action-btn del';
        deleteBtn.dataset.galleryAction = 'delete';
        deleteBtn.dataset.galleryId = item.id;
        deleteBtn.setAttribute('aria-label', 'Remover');
        deleteBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="M7 6l1 14h8l1-14"></path>
          </svg>
        `;

        actions.appendChild(downloadBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);

        if (item.isImage && item.dataUrl) {
          row.addEventListener('click', event => {
            if (event.target.closest('.gal-action-btn')) return;
            openSharedImagePreview(item.dataUrl, item.fileName);
          });
        }
        fragment.appendChild(row);
      });
      state.galList.appendChild(fragment);
    }

    state.galList.classList.remove('gallery-mode-list', 'gallery-mode-grid');
    state.galList.classList.add(state.currentGalleryView === 'grid' ? 'gallery-mode-grid' : 'gallery-mode-list');

    void syncGalleryFromBackend({ force: false, silent: true });
  }

  function updateGalleryViewControls() {
    if (!state.galList) return;

    state.galTabs.forEach(tab => {
      const tabKey = String(tab.dataset.tab || 'tudo').trim();
      const active = tabKey === state.currentGalleryTab;
      tab.classList.toggle('active', active);
      if (!tab.dataset.boundGalleryTab) {
        tab.dataset.boundGalleryTab = '1';
        tab.addEventListener('click', () => {
          state.currentGalleryTab = tabKey || 'tudo';
          updateGalleryViewControls();
          renderGalleryList();
        });
      }
    });

    state.galViewBtns.forEach(button => {
      const mode = String(button.dataset.galleryViewBtn || '').trim();
      const active = (
        (mode === 'list' && state.currentGalleryView === 'list')
        || (mode === 'grid' && state.currentGalleryView === 'grid')
        || (mode === 'filter' && state.currentGallerySourceFilter !== 'all')
      );
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));

      if (!button.dataset.boundGalleryViewBtn) {
        button.dataset.boundGalleryViewBtn = '1';
        button.addEventListener('click', () => {
          if (mode === 'list') {
            state.currentGalleryView = 'list';
          } else if (mode === 'grid') {
            state.currentGalleryView = 'grid';
          } else if (mode === 'filter') {
            if (state.currentGallerySourceFilter === 'all') {
              state.currentGallerySourceFilter = 'remote';
            } else if (state.currentGallerySourceFilter === 'remote') {
              state.currentGallerySourceFilter = 'generated';
            } else {
              state.currentGallerySourceFilter = 'all';
            }
          }
          updateGalleryViewControls();
          renderGalleryList();
        });
      }
    });

    const filterLabelByMode = {
      all: 'todos os arquivos',
      remote: 'somente servidor',
      generated: 'somente gerados',
    };
    if (state.galFilterBtn) {
      const filterLabel = filterLabelByMode[state.currentGallerySourceFilter] || filterLabelByMode.all;
      state.galFilterBtn.title = `Filtrar: ${filterLabel}`;
    }
    state.galColHeads?.classList.toggle('is-hidden', state.currentGalleryView === 'grid');

    if (!state.galSearch?.dataset.boundGallerySearch) {
      state.galSearch.dataset.boundGallerySearch = '1';
      state.galSearch.addEventListener('input', () => {
        renderGalleryList();
      });
    }

    if (!state.galUploadBtn?.dataset.boundGalleryUploadBtn) {
      state.galUploadBtn.dataset.boundGalleryUploadBtn = '1';
      state.galUploadBtn.addEventListener('click', () => {
        state.galFileInput?.click();
      });
    }

    if (!state.galFileInput?.dataset.boundGalleryInput) {
      state.galFileInput.dataset.boundGalleryInput = '1';
      state.galFileInput.addEventListener('change', event => {
        const input = event.target;
        const files = Array.from(input?.files || []);
        if (files.length === 0) return;
        void (async () => {
          let token = window.LizAuth?.getAccessToken?.() || '';
          if (!token && window.LizAuth?.ensureSession) {
            try {
              await window.LizAuth.ensureSession({ force: false });
              token = window.LizAuth.getAccessToken?.() || '';
            } catch (error) {
              token = '';
            }
          }

          for (const file of files.slice(0, 30)) {
            try {
              const dataUrl = await readImageFileAsDataUrl(file);
              if (token && window.LizApi?.uploadFile) {
                const uploaded = await window.LizApi.uploadFile({
                  token,
                  fileName: String(file.name || 'arquivo'),
                  dataUrl: String(dataUrl || ''),
                  timeoutMs: 35000,
                });
                upsertGalleryItem(uploaded, { source: 'remote' });
              } else {
                upsertGalleryItem({
                  id: `local:${Date.now()}:${file.name}`,
                  file_name: String(file.name || 'arquivo'),
                  mime_type: String(file.type || 'application/octet-stream'),
                  size_bytes: Number(file.size || 0),
                  data_url: String(dataUrl || ''),
                  uploaded_at: new Date().toISOString(),
                }, { source: 'generated' });
              }
            } catch (error) {
              console.warn('[Liz] falha no upload de arquivo da galeria.', error);
            }
          }

          renderGalleryList();
        })().finally(() => {
          if (input) input.value = '';
        });
      });
    }

    if (!state.galList.dataset.boundGalleryActions) {
      state.galList.dataset.boundGalleryActions = '1';
      state.galList.addEventListener('click', event => {
        const actionBtn = event.target.closest('[data-gallery-action]');
        if (!actionBtn) return;
        event.preventDefault();
        event.stopPropagation();
        const itemId = String(actionBtn.dataset.galleryId || '').trim();
        const action = String(actionBtn.dataset.galleryAction || '').trim();
        if (!itemId || !action) return;
        const item = galleryFiles.find(fileItem => fileItem.id === itemId);
        if (!item) return;
        if (action === 'download') {
          void downloadGalleryItem(item);
        } else if (action === 'delete') {
          removeGalleryItem(itemId);
        }
      });
    }
  }

  function renderConnectedAccountsMenu() {
    if (!state.profileAccountsList) return;

    const accounts = normalizeConnectedAccounts();
    state.profileAccountsList.innerHTML = '';

    const hasAccounts = accounts.length > 0;
    if (state.profileSwitchAccountBtn) {
      state.profileSwitchAccountBtn.classList.toggle('disabled', accounts.length <= 1);
      state.profileSwitchAccountBtn.setAttribute('aria-disabled', String(accounts.length <= 1));
    }
    if (state.profileAccountsEmpty) {
      state.profileAccountsEmpty.hidden = hasAccounts;
    }

    if (!hasAccounts) {
      return;
    }

    const fragment = document.createDocumentFragment();
    const activeLabelByLanguage = {
      'pt-BR': 'Atual',
      'en-US': 'Current',
      'es-ES': 'Actual',
    };
    const activeLabel = activeLabelByLanguage[state.resolvedUiLanguage] || activeLabelByLanguage['pt-BR'];

    accounts.forEach(account => {
      const accountKey = buildConnectedAccountKey(account);
      if (!accountKey) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'profile-account-item';
      if (account.is_current) {
        button.classList.add('is-current');
      }
      button.disabled = Boolean(state.profileSwitchingAccount);
      button.dataset.accountKey = accountKey;

      const avatarWrap = document.createElement('span');
      avatarWrap.className = 'profile-account-avatar';
      const avatarUrl = sanitizeAvatarUrl(account.avatar_url || account.avatarUrl || '');
      if (avatarUrl) {
        const image = document.createElement('img');
        image.src = avatarUrl;
        image.alt = '';
        image.loading = 'lazy';
        avatarWrap.appendChild(image);
      } else {
        avatarWrap.textContent = getUserInitials(account);
      }

      const content = document.createElement('span');
      content.className = 'profile-account-content';

      const name = document.createElement('span');
      name.className = 'profile-account-name';
      name.textContent = getUserDisplayName(account);

      const email = document.createElement('span');
      email.className = 'profile-account-email';
      email.textContent = String(account.email || '').trim() || '-';

      content.appendChild(name);
      content.appendChild(email);

      button.appendChild(avatarWrap);
      button.appendChild(content);

      if (account.is_current) {
        const badge = document.createElement('span');
        badge.className = 'profile-account-current-badge';
        badge.textContent = activeLabel;
        button.appendChild(badge);
      }

      button.addEventListener('click', () => {
        if (state.profileSwitchingAccount || !accountKey) return;
        if (account.is_current) {
          setProfileAccountsFeedback('Essa conta ja esta ativa.', '');
          return;
        }
        void switchConnectedAccountFromMenu(accountKey);
      });

      fragment.appendChild(button);
    });

    state.profileAccountsList.appendChild(fragment);
  }

  function readSettingsAppsStateFromStorage() {
    const ownerKey = resolveGalleryOwnerKey();
    const fallback = {};
    SETTINGS_APPS_CATALOG.forEach(app => {
      fallback[app.id] = {
        enabled: Boolean(app.defaultEnabled),
      };
    });

    try {
      const raw = window.localStorage.getItem(`${SETTINGS_APPS_STORAGE_KEY}:${ownerKey}`);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;
      const next = { ...fallback };
      SETTINGS_APPS_CATALOG.forEach(app => {
        if (parsed[app.id] && typeof parsed[app.id] === 'object') {
          next[app.id] = {
            enabled: Boolean(parsed[app.id].enabled),
          };
        }
      });
      return next;
    } catch (error) {
      return fallback;
    }
  }

  function persistSettingsAppsState() {
    try {
      const ownerKey = resolveGalleryOwnerKey();
      window.localStorage.setItem(
        `${SETTINGS_APPS_STORAGE_KEY}:${ownerKey}`,
        JSON.stringify(state.settingsAppsState || {}),
      );
    } catch (error) {
      // armazenamento local opcional
    }
  }

  function setSettingsAppsFeedback(message, type = '') {
    if (!state.settingsAppsFeedback) return;
    state.settingsAppsFeedback.textContent = String(message || '');
    state.settingsAppsFeedback.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') {
      state.settingsAppsFeedback.classList.add(type);
    }
  }

  function openSettingsTab(tabName = 'geral') {
    const requestedTab = String(tabName || 'geral').trim() || 'geral';
    const availableTabs = new Set(
      state.settingsSections.map(section => String(section.id || '').replace(/^tab-/, '')),
    );
    const targetTab = availableTabs.has(requestedTab) ? requestedTab : 'geral';
    state.settingsNavItems.forEach(item => {
      const isActive = String(item.dataset.tab || '').trim() === targetTab;
      item.classList.toggle('active', isActive);
    });
    state.settingsSections.forEach(section => {
      const sectionTab = String(section.id || '').replace(/^tab-/, '');
      const isActive = sectionTab === targetTab;
      section.classList.toggle('active', isActive);
    });
  }

  function renderSettingsAppsTab() {
    if (!state.settingsAppsGrid) return;
    if (!state.settingsAppsState || typeof state.settingsAppsState !== 'object') {
      state.settingsAppsState = readSettingsAppsStateFromStorage();
    }

    state.settingsAppsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    let connectedCount = 0;
    let availableCount = 0;
    let soonCount = 0;

    SETTINGS_APPS_CATALOG.forEach(app => {
      const enabled = Boolean(state.settingsAppsState?.[app.id]?.enabled ?? app.defaultEnabled);
      const isSoon = app.availability === 'soon';
      const isLocked = app.availability === 'locked';
      if (isSoon) {
        soonCount += 1;
      } else {
        availableCount += 1;
      }
      if (enabled && !isSoon) {
        connectedCount += 1;
      }

      const statusClass = isSoon ? 'soon' : (enabled ? 'connected' : 'idle');
      const statusLabel = isSoon ? 'Em breve' : (enabled ? 'Conectado' : 'Desativado');
      const actionLabel = isSoon
        ? 'Em breve'
        : (isLocked ? 'Sempre ativo' : (enabled ? 'Desativar' : 'Ativar'));
      const actionDisabled = isSoon || isLocked;

      const card = document.createElement('article');
      card.className = 'settings-app-card';
      card.dataset.appId = app.id;
      card.innerHTML = `
        <div class="settings-app-head">
          <div class="settings-app-icon">${String(app.icon || app.name || 'APP').slice(0, 3).toUpperCase()}</div>
          <div class="settings-app-meta">
            <div class="settings-app-title">
              <div class="settings-app-name">${app.name}</div>
              <div class="settings-app-badge">${app.badge}</div>
            </div>
            <div class="settings-app-desc">${app.description}</div>
          </div>
        </div>
        <div class="settings-app-foot">
          <div class="settings-app-status ${statusClass}">${statusLabel}</div>
          <button
            class="outline-btn settings-app-action"
            type="button"
            data-app-action="toggle"
            data-app-id="${app.id}"
            ${actionDisabled ? 'disabled' : ''}
          >
            ${actionLabel}
          </button>
        </div>
      `;
      fragment.appendChild(card);
    });
    state.settingsAppsGrid.appendChild(fragment);

    if (state.settingsAppsConnectedCount) state.settingsAppsConnectedCount.textContent = String(connectedCount);
    if (state.settingsAppsAvailableCount) state.settingsAppsAvailableCount.textContent = String(availableCount);
    if (state.settingsAppsSoonCount) state.settingsAppsSoonCount.textContent = String(soonCount);
    if (state.settingsAppsLastSync) {
      state.settingsAppsLastSync.textContent = `Ultima sync: ${formatDateTimeLabel(new Date().toISOString())}`;
    }

    ensureAppsSection();
  }

  function refreshSettingsAppsPanel(options = {}) {
    if (state.settingsAppsSyncing) {
      return Promise.resolve(state.settingsAppsState || null);
    }
    state.settingsAppsSyncing = true;
    if (state.settingsAppsRefreshBtn) {
      state.settingsAppsRefreshBtn.disabled = true;
    }
    if (options.silent === false) {
      setSettingsAppsFeedback('Atualizando painel de aplicativos...', '');
    }

    return Promise.resolve()
      .then(() => {
        state.settingsAppsState = readSettingsAppsStateFromStorage();
        renderSettingsAppsTab();
        if (options.silent === false) {
          setSettingsAppsFeedback('Painel atualizado com sucesso.', 'success');
        }
        return state.settingsAppsState;
      })
      .finally(() => {
        state.settingsAppsSyncing = false;
        if (state.settingsAppsRefreshBtn) {
          state.settingsAppsRefreshBtn.disabled = false;
        }
      });
  }

  function toggleSettingsApp(appId) {
    const safeAppId = String(appId || '').trim();
    if (!safeAppId) return;
    const app = SETTINGS_APPS_CATALOG.find(item => item.id === safeAppId);
    if (!app) return;
    if (app.availability === 'soon' || app.availability === 'locked') return;

    if (!state.settingsAppsState || typeof state.settingsAppsState !== 'object') {
      state.settingsAppsState = readSettingsAppsStateFromStorage();
    }
    const current = Boolean(state.settingsAppsState?.[safeAppId]?.enabled ?? app.defaultEnabled);
    state.settingsAppsState = {
      ...state.settingsAppsState,
      [safeAppId]: {
        enabled: !current,
      },
    };
    persistSettingsAppsState();
    renderSettingsAppsTab();
    setSettingsAppsFeedback(
      !current
        ? `${app.name} ativado com sucesso.`
        : `${app.name} desativado com sucesso.`,
      'success',
    );
  }

  function syncBillingProfile(options = {}) {
    const force = Boolean(options.force);
    const shouldRenderUsage = options.render !== false;
    const now = Date.now();
    if (
      !force
      && state.billingProfile
      && (now - Number(state.billingLastFetchAtMs || 0)) < BILLING_CACHE_TTL_MS
    ) {
      if (shouldRenderUsage) {
        void syncUsageSummary({ render: true, force: false });
      }
      return Promise.resolve(state.billingProfile);
    }
    if (state.billingSyncPromise && !force) {
      return state.billingSyncPromise;
    }

    state.billingSyncPromise = (async () => {
      if (state.billingSyncing) return state.billingProfile || null;
      state.billingSyncing = true;
      try {
        if (window.LizAuth?.ensureSession) {
          await window.LizAuth.ensureSession({ force: false });
        }
        const token = window.LizAuth?.getAccessToken?.();
        if (!token || !window.LizApi?.getBillingMe) {
          return state.billingProfile || null;
        }

        const payload = await window.LizApi.getBillingMe({ token });
        const activePlan = String(payload?.active_plan || 'free').trim().toLowerCase();
        const status = String(payload?.status || 'inactive').trim().toLowerCase();
        state.billingProfile = {
          activePlan: BILLING_KNOWN_PLANS.has(activePlan) ? activePlan : 'free',
          status: BILLING_KNOWN_STATUSES.has(status) ? status : 'inactive',
          subscription: payload?.subscription || null,
        };
        state.billingLastFetchAtMs = Date.now();

        if (state.currentUser && typeof state.currentUser === 'object') {
          applyCurrentUser({
            ...state.currentUser,
            tier: state.billingProfile.activePlan,
          });
        }
        if (shouldRenderUsage) {
          void syncUsageSummary({ render: true, force: true });
        }
        return state.billingProfile;
      } catch (error) {
        return state.billingProfile || null;
      } finally {
        state.billingSyncing = false;
      }
    })().finally(() => {
      state.billingSyncPromise = null;
    });

    return state.billingSyncPromise;
  }

  function clearAllGalleryFileObjectUrls() {
    galleryFiles.forEach(item => {
      if (item && typeof item.fileUrl === 'string' && item.fileUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(item.fileUrl);
        } catch (error) {
          // no-op
        }
      }
    });
  }

  function addGeneratedDocsFileToGallery(payload = {}) {
    ensureGalleryOwnerScope();
    const replyText = String(payload.replyText || '').trim();
    if (!replyText) return false;

    const match = replyText.match(/```([a-z0-9_-]+)?\n([\s\S]*?)```/i);
    const body = String(match?.[2] || replyText).trim();
    if (!body) return false;

    const basePrompt = String(payload.requestText || payload.docsSourceText || 'documento').trim();
    const safeBase = basePrompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 54) || 'documento';
    const fileName = `${safeBase}-${Date.now()}.txt`;
    const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;

    upsertGalleryItem({
      id: `generated-doc:${Date.now()}:${safeBase}`,
      file_name: fileName,
      mime_type: 'text/plain',
      size_bytes: body.length,
      data_url: dataUrl,
      uploaded_at: new Date().toISOString(),
      prompt: String(payload.requestText || '').trim(),
      conversationId: String(payload.conversationId || '').trim(),
      conversationTitle: String(payload.conversationTitle || '').trim(),
    }, { source: 'generated' });
    renderGalleryList();
    return true;
  }

  function addGeneratedImagesToGallery(images = [], context = {}) {
    ensureGalleryOwnerScope();
    const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (safeImages.length === 0) return 0;

    let added = 0;
    safeImages.forEach((image, index) => {
      const dataUrl = String(image.dataUrl || image.url || '').trim();
      if (!dataUrl) return;
      const fileName = String(image.name || `imagem-${Date.now()}-${index + 1}.png`).trim() || `imagem-${Date.now()}.png`;
      const mimeType = String(image.mimeType || image.mime_type || 'image/png').trim() || 'image/png';
      upsertGalleryItem({
        id: String(image.id || `generated-image:${Date.now()}:${index}`),
        file_name: fileName,
        mime_type: mimeType,
        size_bytes: Math.max(0, Number(image.sizeBytes || 0) || Math.floor((dataUrl.length * 3) / 4)),
        data_url: dataUrl,
        uploaded_at: new Date().toISOString(),
        prompt: String(context.prompt || '').trim(),
        conversationId: String(context.conversationId || '').trim(),
        conversationTitle: String(context.conversationTitle || '').trim(),
      }, { source: 'generated' });
      added += 1;
    });
    if (added > 0) {
      renderGalleryList();
    }
    return added;
  }

  let initialized = false;
  let imagesReady = false;
  let appsReady = false;
  let imageChatEnterTimer = null;

  function cacheElements() {
    state.sidebar = document.getElementById('sidebar');
    state.overlay = document.getElementById('overlay');
    state.hamburger = document.getElementById('hamburger');
    state.closeBtn = document.getElementById('closeBtn');
    state.input = document.getElementById('inputField');
    state.sendBtn = document.querySelector('.send-btn');
    state.sparkBtn = document.getElementById('sparkBtn');
    state.content = document.querySelector('.content');
    state.greeting = document.querySelector('.greeting');
    state.chatContainer = document.getElementById('chatContainer');
    state.historyContainer = document.getElementById('historyContainer');
    state.clearAllBtn = document.getElementById('clearAll');
    state.newChatBtn = document.getElementById('newChatBtn');
    state.profileWrapper = document.getElementById('profileWrapper');
    state.profileBtn = document.getElementById('profileBtn');
    state.profileDropdown = document.getElementById('profileDropdown');
    state.profileDropdownMain = document.getElementById('profileDropdownMain');
    state.profileAccountsMenu = document.getElementById('profileAccountsMenu');
    state.profileAvatarImage = document.getElementById('profileAvatarImage');
    state.profileAvatarFallback = document.getElementById('profileAvatarFallback');
    state.profileAddAccountBtn = document.getElementById('profileAddAccountBtn');
    state.profileSwitchAccountBtn = document.getElementById('profileSwitchAccountBtn');
    state.profileAccountsBackBtn = document.getElementById('profileAccountsBackBtn');
    state.profileAccountsTitle = document.getElementById('profileAccountsTitle');
    state.profileAccountsList = document.getElementById('profileAccountsList');
    state.profileAccountsEmpty = document.getElementById('profileAccountsEmpty');
    state.profileAccountsFeedback = document.getElementById('profileAccountsFeedback');
    state.profileAccountsAddBtn = document.getElementById('profileAccountsAddBtn');
    state.profileMyProfileBtn = document.getElementById('profileMyProfileBtn');
    state.profilePreferencesBtn = document.getElementById('profilePreferencesBtn');
    state.profileActivityBtn = document.getElementById('profileActivityBtn');
    state.profileUsageBtn = document.getElementById('profileUsageBtn');
    state.profileLogoutBtn = document.getElementById('profileLogoutBtn');
    state.profileModal = document.getElementById('profileModal');
    state.closeProfilePanelBtn = document.getElementById('closeProfilePanel');
    state.profileForm = document.getElementById('profileForm');
    state.profileDisplayNameInput = document.getElementById('profileDisplayNameInput');
    state.profileUsernameInput = document.getElementById('profileUsernameInput');
    state.profileAvatarPreviewWrap = document.getElementById('profileAvatarPreviewWrap');
    state.profileAvatarPreview = document.getElementById('profileAvatarPreview');
    state.profileAvatarPreviewFallback = document.getElementById('profileAvatarPreviewFallback');
    state.profileAvatarUploadBtn = document.getElementById('profileAvatarUploadBtn');
    state.profileAvatarRemoveBtn = document.getElementById('profileAvatarRemoveBtn');
    state.profileAvatarFileInput = document.getElementById('profileAvatarFileInput');
    state.profileFormFeedback = document.getElementById('profileFormFeedback');
    state.saveProfileBtn = document.getElementById('saveProfileBtn');
    state.accountAvatarWrap = document.getElementById('accountAvatarWrap');
    state.accountAvatarImage = document.getElementById('accountAvatarImage');
    state.accountAvatarFallback = document.getElementById('accountAvatarFallback');
    state.accountDisplayName = document.getElementById('accountDisplayName');
    state.accountUsername = document.getElementById('accountUsername');
    state.accountPlanBadge = document.getElementById('accountPlanBadge');
    state.accountEmail = document.getElementById('accountEmail');
    state.accountUserId = document.getElementById('accountUserId');
    state.accountCreatedAt = document.getElementById('accountCreatedAt');
    state.accountSessionStatus = document.getElementById('accountSessionStatus');
    state.accountSessionExpiry = document.getElementById('accountSessionExpiry');
    state.accountLastSync = document.getElementById('accountLastSync');
    state.accountRefreshBtn = document.getElementById('accountRefreshBtn');
    state.accountEditProfileBtn = document.getElementById('accountEditProfileBtn');
    state.accountOpenActivityBtn = document.getElementById('accountOpenActivityBtn');
    state.accountCopyEmailBtn = document.getElementById('accountCopyEmailBtn');
    state.accountCopyIdBtn = document.getElementById('accountCopyIdBtn');
    state.accountFeedback = document.getElementById('accountFeedback');
    state.settingsAppsGrid = document.getElementById('settingsAppsGrid');
    state.settingsAppsRefreshBtn = document.getElementById('settingsAppsRefreshBtn');
    state.settingsAppsLastSync = document.getElementById('settingsAppsLastSync');
    state.settingsAppsFeedback = document.getElementById('settingsAppsFeedback');
    state.settingsAppsConnectedCount = document.getElementById('settingsAppsConnectedCount');
    state.settingsAppsAvailableCount = document.getElementById('settingsAppsAvailableCount');
    state.settingsAppsSoonCount = document.getElementById('settingsAppsSoonCount');
    state.settingsWrapper = document.getElementById('settingsWrapper');
    state.settingsBtn = document.getElementById('settingsBtn');
    state.settingsDropdown = document.getElementById('settingsDropdown');
    state.settingsUpgradeBtn = document.getElementById('sdUpgradePlan');
    state.openSettingsPanelBtn = document.getElementById('openSettingsPanel');
    state.settingsPersonalizacaoBtn = document.getElementById('sdPersonalizacao');
    state.settingsHelpBtn = document.getElementById('sdHelp');
    state.settingsModal = document.getElementById('settingsModal');
    state.closeSettingsPanelBtn = document.getElementById('closeSettingsPanel');
    state.plansModal = document.getElementById('plansModal');
    state.closePlansPanelBtn = document.getElementById('closePlansPanel');
    state.plansSelectButtons = Array.from(document.querySelectorAll('[data-plan-select]'));
    state.plansFeedback = document.getElementById('plansFeedback');
    state.settingsThemeSelect = document.getElementById('settingsThemeSelect');
    state.settingsAccentSelect = document.getElementById('settingsAccentSelect');
    state.settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
    state.settingsNotificationsSystemToggle = document.getElementById('settingsNotificationsSystemToggle');
    state.settingsNotificationFeedback = document.getElementById('settingsNotificationFeedback');
    state.settingsPersonalModesWrap = document.getElementById('settingsPersonalModes');
    state.settingsPersonalModeButtons = Array.from(
      document.querySelectorAll('[data-personalization-mode]'),
    );
    state.settingsPersonalGreetingInput = document.getElementById('settingsPersonalGreetingInput');
    state.settingsPersonalUseNameToggle = document.getElementById('settingsPersonalUseNameToggle');
    state.settingsPersonalPreviewText = document.getElementById('settingsPersonalPreviewText');
    state.settingsPersonalSaveBtn = document.getElementById('settingsPersonalSaveBtn');
    state.settingsPersonalFeedback = document.getElementById('settingsPersonalFeedback');
    state.activityModal = document.getElementById('activityModal');
    state.closeActivityPanelBtn = document.getElementById('closeActivityPanel');
    state.activitySummary = document.getElementById('activitySummary');
    state.activityChart = document.getElementById('activityChart');
    state.usageModal = document.getElementById('usageModal');
    state.closeUsagePanelBtn = document.getElementById('closeUsagePanel');
    state.usageSubtitle = document.getElementById('usageSubtitle');
    state.usagePlanValue = document.getElementById('usagePlanValue');
    state.usageMetricOneLabel = document.getElementById('usageMetricOneLabel');
    state.usageMetricOneValue = document.getElementById('usageMetricOneValue');
    state.usageMetricOneFill = document.getElementById('usageMetricOneFill');
    state.usageMetricTwoLabel = document.getElementById('usageMetricTwoLabel');
    state.usageMetricTwoValue = document.getElementById('usageMetricTwoValue');
    state.usageMetricTwoFill = document.getElementById('usageMetricTwoFill');
    state.usageNote = document.getElementById('usageNote');
    state.closeSecurityCardBtn = document.getElementById('closeSecurityCard');
    state.securityCard = document.getElementById('securityCard');
    state.settingsNavItems = Array.from(document.querySelectorAll('.settings-nav-item'));
    state.settingsSections = Array.from(document.querySelectorAll('.settings-section'));
    state.settingsToggles = Array.from(document.querySelectorAll('.toggle'));

    state.searchChatsBtn = document.getElementById('searchChatsBtn');
    state.imagesNavBtn = document.getElementById('imagesNavBtn');
    state.galleryNavBtn = document.getElementById('galleryNavBtn');
    state.appsNavBtn = document.getElementById('appsNavBtn');
    state.sidebarNavItems = Array.from(document.querySelectorAll('.nav .nav-item[data-sidebar-action]'));
    state.workspaceViews = Array.from(document.querySelectorAll('[data-workspace-view]'));

    state.searchInput = document.getElementById('searchInput');
    state.searchResults = document.getElementById('searchResults');

    state.imgPromptField = document.getElementById('imgPromptField');
    state.imgAttachmentTray = document.getElementById('imgAttachmentTray');
    state.imgSendBtn = document.getElementById('imgSendBtn');
    state.imgAttachBtn = document.getElementById('imgAttachBtn');
    state.imgFileInput = document.getElementById('imgFileInput');
    state.imgStyleSwitch = document.getElementById('imgStyleSwitch');
    state.imgStyleBtn = document.getElementById('imgStyleBtn');
    state.imgStyleLabel = document.getElementById('imgStyleLabel');
    state.imgStyleDropdown = document.getElementById('imgStyleDropdown');
    state.imgStyleOptions = Array.from(document.querySelectorAll('[data-img-style-option]'));
    state.imgChatList = document.getElementById('imgChatList');
    state.imgPresetCards = Array.from(document.querySelectorAll('[data-img-preset]'));
    state.imgDiscovery = document.getElementById('imgDiscovery');
    state.stylesRow = document.getElementById('stylesRow');
    state.recentImgsRow = document.getElementById('recentImgsRow');

    state.galSearch = document.getElementById('galSearch');
    state.galUploadBtn = document.getElementById('galUploadBtn');
    state.galFileInput = document.getElementById('galFileInput');
    state.galColHeads = document.querySelector('.gal-col-heads');
    state.galList = document.getElementById('galList');
    state.galTabs = Array.from(document.querySelectorAll('.gal-tab'));
    state.galViewBtns = Array.from(document.querySelectorAll('[data-gallery-view-btn]'));
    state.galFilterBtn = document.getElementById('galFilterBtn');
    state.galGridBtn = document.getElementById('galGridBtn');
    state.galListBtn = document.getElementById('galListBtn');

    state.appsCardsGrid = document.getElementById('appsCardsGrid');

    state.modelSwitches = Array.from(document.querySelectorAll('[data-model-switch]'));
    state.modelUis = state.modelSwitches
      .map(switchEl => {
        const trigger = switchEl.querySelector('[data-model-trigger]');
        const current = switchEl.querySelector('[data-model-current]');
        const dropdown = switchEl.querySelector('[data-model-dropdown]');
        const options = Array.from(switchEl.querySelectorAll('[data-model-option]'));
        if (!trigger || !current || !dropdown || options.length === 0) return null;
        return { switchEl, trigger, current, dropdown, options };
      })
      .filter(Boolean);

    if (!state.billingProfile) {
      state.billingProfile = {
        activePlan: 'free',
        status: 'inactive',
        subscription: null,
      };
    }
  }

  function openSidebar() {
    if (!state.sidebar || !state.overlay) return;
    closeAllModelDropdowns();
    state.sidebar.classList.add('open');
    state.overlay.classList.add('show');
    document.body.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!state.sidebar || !state.overlay) return;
    state.sidebar.classList.remove('open');
    state.overlay.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    const settingsOpen = Boolean(state.settingsModal && state.settingsModal.classList.contains('show'));
    const activityOpen = Boolean(state.activityModal && state.activityModal.classList.contains('show'));
    const profileOpen = Boolean(state.profileModal && state.profileModal.classList.contains('show'));
    const plansOpen = Boolean(state.plansModal && state.plansModal.classList.contains('show'));
    const usageOpen = Boolean(state.usageModal && state.usageModal.classList.contains('show'));
    if (!settingsOpen && !activityOpen && !profileOpen && !plansOpen && !usageOpen) {
      document.body.style.overflow = '';
    }
  }

  function setActiveSidebarAction(action) {
    state.sidebarNavItems.forEach(item => {
      const isActive = item.dataset.sidebarAction === action;
      item.classList.toggle('active', isActive);
    });
  }

  function setWorkspaceView(action) {
    if (!state.content) return;
    const validActions = ['chat', 'search', 'images', 'gallery', 'apps'];
    if (!validActions.includes(action)) return;

    state.currentWorkspace = action;
    setActiveSidebarAction(action);

    state.workspaceViews.forEach(view => {
      const isActive = view.dataset.workspaceView === action;
      view.classList.toggle('active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
      view.hidden = !isActive;

      if (!isActive) {
        view.style.display = 'none';
        view.style.flexDirection = '';
      } else if (view.classList.contains('workspace-view-chat')) {
        view.style.display = 'flex';
        view.style.flexDirection = 'column';
      } else if (view.dataset.workspaceView === 'images') {
        view.style.display = 'flex';
        view.style.flexDirection = 'column';
      } else {
        view.style.display = 'block';
        view.style.flexDirection = '';
      }
    });

    const modeClasses = [
      'workspace-mode-chat',
      'workspace-mode-search',
      'workspace-mode-images',
      'workspace-mode-gallery',
      'workspace-mode-apps',
    ];
    modeClasses.forEach(modeClass => state.content.classList.remove(modeClass));
    state.content.classList.add(`workspace-mode-${action}`);

    const shouldShowInput = action === 'chat';
    state.content.classList.toggle('has-input', shouldShowInput);

    if (action !== 'chat') {
      state.content.classList.remove('chat-active');
    }

    if (action === 'search') {
      renderSearchResults(state.searchInput?.value || '');
      state.searchInput?.focus();
    }

    if (action === 'images') {
      ensureImagesSection();
      renderImageChat();
    }

    if (action === 'gallery') {
      renderGalleryList();
    }

    if (action === 'apps') {
      ensureAppsSection();
    }

    if (window.innerWidth <= 900) {
      closeSidebar();
    }
  }

  function handleSidebarAction(action) {
    if (action === 'chat') {
      setWorkspaceView('chat');
      window.LizChat?.startNewChat?.();
      return;
    }

    setWorkspaceView(action);
  }

  function getConversationSummaries() {
    return window.LizChat?.getConversationSummaries?.() || [];
  }

  function getSearchData() {
    return getConversationSummaries().map(item => ({
      type: 'conversation',
      id: item.id,
      title: item.title,
      time: `${item.period} - ${item.timeLabel}`,
    }));
  }

  function getImagesView() {
    return state.workspaceViews.find(view => view.dataset.workspaceView === 'images') || null;
  }

  function setImageStyleDropdownState(isOpen) {
    if (!state.imgStyleSwitch || !state.imgStyleBtn || !state.imgStyleDropdown) return;
    state.imgStyleSwitch.classList.toggle('open', isOpen);
    state.imgStyleBtn.setAttribute('aria-expanded', String(isOpen));
    state.imgStyleDropdown.setAttribute('aria-hidden', String(!isOpen));
  }

  function closeImageStyleDropdown() {
    setImageStyleDropdownState(false);
  }

  function setImageStyleSelection(styleName) {
    const normalized = String(styleName || 'Estilo').trim() || 'Estilo';
    if (state.imgStyleLabel) {
      state.imgStyleLabel.textContent = normalized;
    }

    state.imgStyleOptions.forEach(option => {
      const isSelected = option.dataset.style === normalized;
      option.classList.toggle('selected', isSelected);
      option.setAttribute('aria-selected', String(isSelected));
    });
  }

  function openSharedImagePreview(dataUrl, altText = 'Preview da imagem') {
    if (!dataUrl) return;
    const modal = document.getElementById('chatImageModal');
    const modalImg = document.getElementById('chatImageModalImg');
    if (!modal || !modalImg) return;

    modalImg.src = dataUrl;
    modalImg.alt = altText;
    modal.hidden = false;
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

  function handleNotificationsToggleChange(fieldName) {
    const current = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    let next = { ...current };
    if (fieldName === 'notifications_enabled') {
      next.notifications_enabled = !current.notifications_enabled;
    } else {
      return;
    }

    applyGeneralSettings(next, {
      syncSelects: true,
      persistStorage: true,
    });
    void syncSettingsPatchToBackend({ [fieldName]: next[fieldName] }, { silent: true });
  }

  function updatePersonalizationDraft(patch) {
    const current = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    const next = normalizeGeneralSettings({
      ...current,
      ...(patch || {}),
    });
    applyGeneralSettings(next, {
      syncSelects: true,
      persistStorage: true,
    });
  }

  async function handleSavePersonalization() {
    const current = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
    setPersonalizationSaving(true);
    setPersonalizationFeedback('Salvando personalizacao...', '');

    try {
      const synced = await syncSettingsPatchToBackend(
        {
          personalization_mode: current.personalization_mode,
          personalization_custom_greeting: current.personalization_custom_greeting || null,
          personalization_use_name: current.personalization_use_name,
        },
        { silent: false },
      );
      if (synced) {
        setPersonalizationFeedback('Personalizacao salva com sucesso.', 'success');
      } else {
        setPersonalizationFeedback(
          'Personalizacao salva localmente. A sincronizacao com backend falhou.',
          'error',
        );
      }
    } catch (error) {
      setPersonalizationFeedback('Nao foi possivel salvar personalizacao agora.', 'error');
    } finally {
      setPersonalizationSaving(false);
    }
  }

  function bindSettingsNotificationsEvents() {
    state.settingsNotificationsSystemToggle?.addEventListener('click', () => {
      handleNotificationsToggleChange('notifications_enabled');
    });
  }

  function bindSettingsPersonalizationEvents() {
    state.settingsPersonalModeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mode = String(button.dataset.personalizationMode || '').trim();
        if (!mode) return;
        updatePersonalizationDraft({ personalization_mode: mode });
        setPersonalizationFeedback('Modo atualizado. Clique em salvar para sincronizar.', '');
      });
    });

    state.settingsPersonalGreetingInput?.addEventListener('input', () => {
      const clean = normalizePersonalizationGreeting(state.settingsPersonalGreetingInput.value);
      if (clean !== state.settingsPersonalGreetingInput.value) {
        state.settingsPersonalGreetingInput.value = clean;
      }
      updatePersonalizationDraft({
        personalization_custom_greeting: clean,
      });
    });

    state.settingsPersonalUseNameToggle?.addEventListener('click', () => {
      const current = normalizeGeneralSettings(state.settingsGeneralState || DEFAULT_GENERAL_SETTINGS);
      updatePersonalizationDraft({
        personalization_use_name: !current.personalization_use_name,
      });
    });

    state.settingsPersonalSaveBtn?.addEventListener('click', () => {
      void handleSavePersonalization();
    });
  }

  function bindSettingsAppsEvents() {
    state.settingsAppsRefreshBtn?.addEventListener('click', () => {
      void refreshSettingsAppsPanel({ force: true, silent: false });
    });

    state.settingsAppsGrid?.addEventListener('click', event => {
      const button = event.target.closest('[data-app-action="toggle"]');
      if (!button) return;
      const appId = String(button.dataset.appId || '').trim();
      if (!appId) return;
      toggleSettingsApp(appId);
    });
  }

  function bindActivityEvents() {
    state.closeActivityPanelBtn?.addEventListener('click', closeActivityPanel);

    state.activityModal?.addEventListener('click', event => {
      if (event.target === state.activityModal) {
        closeActivityPanel();
      }
    });
  }

  function bindUsageEvents() {
    state.closeUsagePanelBtn?.addEventListener('click', closeUsagePanel);

    state.usageModal?.addEventListener('click', event => {
      if (event.target === state.usageModal) {
        closeUsagePanel();
      }
    });
  }

  function bindModelEvents() {
    state.modelUis.forEach(modelUi => {
      setDropdownState(modelUi, false);

      modelUi.trigger.addEventListener('click', event => {
        event.stopPropagation();
        if (state.isFlashMode) {
          setDropdownState(modelUi, false);
          return;
        }
        closeProfileDropdown();
        closeSettingsDropdown();
        closeImageStyleDropdown();

        const shouldOpen = !modelUi.switchEl.classList.contains('open');
        closeAllModelDropdowns();
        if (shouldOpen) {
          setDropdownState(modelUi, true);
        }
      });

      modelUi.options.forEach(option => {
        option.addEventListener('click', event => {
          event.stopPropagation();
          if (state.isFlashMode) return;
          setModelSelection(option.dataset.model || 'Liz mini');
          closeAllModelDropdowns();
        });
      });
    });

    const initiallySelectedOption = state.modelUis
      .flatMap(modelUi => modelUi.options)
      .find(option => option.classList.contains('selected'));

    setModelSelection(initiallySelectedOption?.dataset.model || 'Liz mini');
  }

  function bindGlobalUiEvents() {
    window.addEventListener('beforeunload', () => {
      clearAllGalleryFileObjectUrls();
    });

    document.addEventListener('click', event => {
      const clickedInsideModelSwitch = state.modelUis.some(modelUi => modelUi.switchEl.contains(event.target));
      if (!clickedInsideModelSwitch) {
        closeAllModelDropdowns();
      }

      if (!state.imgStyleSwitch?.contains(event.target)) {
        closeImageStyleDropdown();
      }

      if (!state.profileWrapper?.contains(event.target)) {
        closeProfileDropdown();
      }

      if (!state.settingsWrapper?.contains(event.target)) {
        closeSettingsDropdown();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;

      if (state.profileModal?.classList.contains('show')) {
        closeProfilePanel();
        return;
      }

      if (state.activityModal?.classList.contains('show')) {
        closeActivityPanel();
        return;
      }

      if (state.usageModal?.classList.contains('show')) {
        closeUsagePanel();
        return;
      }

      if (state.plansModal?.classList.contains('show')) {
        closePlansPanel();
        return;
      }

      if (state.settingsModal?.classList.contains('show')) {
        closeSettingsPanel();
        return;
      }

      closeAllModelDropdowns();
      closeImageStyleDropdown();
      closeProfileDropdown();
      closeSettingsDropdown();
    });
  }

  function initUI() {
    if (initialized) return state;

    cacheElements();
    const localGeneralSettings = readGeneralSettingsFromStorage();
    applyGeneralSettings(localGeneralSettings || DEFAULT_GENERAL_SETTINGS, {
      syncSelects: true,
      persistStorage: !localGeneralSettings,
    });
    void ensureGeneralSettingsLoaded();

    bindSidebarEvents();
    bindProfileEvents();
    bindProfilePanelEvents();
    bindAccountEvents();
    bindSettingsAppsEvents();
    bindSettingsNotificationsEvents();
    bindSettingsPersonalizationEvents();
    bindActivityEvents();
    bindUsageEvents();
    bindSettingsEvents();
    bindModelEvents();
    bindFlashEvents();
    bindGlobalUiEvents();

    ensureImagesSection();
    ensureAppsSection();
    updateGalleryViewControls();
    renderGalleryList();
    renderSearchResults('');
    if (state.searchInput && !state.searchInput.dataset.boundSearchInput) {
      state.searchInput.dataset.boundSearchInput = '1';
      state.searchInput.addEventListener('input', () => {
        renderSearchResults(state.searchInput.value || '');
      });
    }
    openSettingsTab('geral');
    setWorkspaceView('chat');
    restoreModelStateFromSettings();
    const bootstrapUser = window.LizAuth?.getCurrentUser?.() || readProfileCache() || null;
    if (bootstrapUser) {
      window.LizAuth?.setCurrentUser?.(bootstrapUser);
    }
    applyCurrentUser(bootstrapUser);
    renderConnectedAccountsMenu();
    void syncCurrentUserFromBackend({ showFeedback: false, force: false });
    void syncBillingProfile({ force: false, render: true });
    renderSettingsAppsTab();

    initialized = true;
    return state;
  }

  function getState() {
    return state;
  }

  window.LizUI = {
    initUI,
    getState,
    openSidebar,
    closeSidebar,
    openSettingsPanel,
    closeSettingsPanel,
    openPlansPanel,
    closePlansPanel,
    openProfilePanel,
    closeProfilePanel,
    openActivityPanel,
    closeActivityPanel,
    openUsagePanel,
    closeUsagePanel,
    syncUsageSummary,
    closeSettingsDropdown,
    closeAllModelDropdowns,
    setModelSelection,
    getCurrentModelSelection,
    getCurrentModelApiValue,
    getLanguagePreferences,
    refreshGreeting,
    setWorkspaceView,
    applyCurrentUser,
    addGeneratedDocsFileToGallery,
    addGeneratedImagesToGallery,
  };
})();

