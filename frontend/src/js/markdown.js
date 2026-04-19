(function initMarkdownModule() {
  const MAX_RECURSION_DEPTH = 6;
  const TOKEN_PREFIX = '\u0000LIZ_CODE_TOKEN_';
  const TOKEN_SUFFIX = '_END\u0000';
  const MATH_TOKEN_PREFIX = '\u0000LIZ_MATH_TOKEN_';
  const MATH_TOKEN_SUFFIX = '_END\u0000';
  let copyEventsBound = false;
  const DOWNLOAD_LANGUAGE_MAP = Object.freeze({
    codigo: { extension: 'txt', mime: 'text/plain;charset=utf-8' },
    txt: { extension: 'txt', mime: 'text/plain;charset=utf-8' },
    text: { extension: 'txt', mime: 'text/plain;charset=utf-8' },
    md: { extension: 'md', mime: 'text/markdown;charset=utf-8' },
    markdown: { extension: 'md', mime: 'text/markdown;charset=utf-8' },
    html: { extension: 'html', mime: 'text/html;charset=utf-8' },
    css: { extension: 'css', mime: 'text/css;charset=utf-8' },
    js: { extension: 'js', mime: 'text/javascript;charset=utf-8' },
    javascript: { extension: 'js', mime: 'text/javascript;charset=utf-8' },
    ts: { extension: 'ts', mime: 'text/plain;charset=utf-8' },
    tsx: { extension: 'tsx', mime: 'text/plain;charset=utf-8' },
    jsx: { extension: 'jsx', mime: 'text/plain;charset=utf-8' },
    json: { extension: 'json', mime: 'application/json;charset=utf-8' },
    xml: { extension: 'xml', mime: 'application/xml;charset=utf-8' },
    yaml: { extension: 'yaml', mime: 'text/yaml;charset=utf-8' },
    yml: { extension: 'yml', mime: 'text/yaml;charset=utf-8' },
    pdf: { extension: 'pdf', mime: 'application/pdf' },
    sql: { extension: 'sql', mime: 'text/plain;charset=utf-8' },
    py: { extension: 'py', mime: 'text/x-python;charset=utf-8' },
    python: { extension: 'py', mime: 'text/x-python;charset=utf-8' },
    sh: { extension: 'sh', mime: 'text/x-shellscript;charset=utf-8' },
    bash: { extension: 'sh', mime: 'text/x-shellscript;charset=utf-8' },
    csv: { extension: 'csv', mime: 'text/csv;charset=utf-8' },
    c: { extension: 'c', mime: 'text/plain;charset=utf-8' },
    cpp: { extension: 'cpp', mime: 'text/plain;charset=utf-8' },
    cs: { extension: 'cs', mime: 'text/plain;charset=utf-8' },
    java: { extension: 'java', mime: 'text/plain;charset=utf-8' },
    go: { extension: 'go', mime: 'text/plain;charset=utf-8' },
    rs: { extension: 'rs', mime: 'text/plain;charset=utf-8' },
  });
  const DOWNLOAD_FORMAT_OPTIONS = Object.freeze([
    { value: 'pdf', label: 'PDF' },
    { value: 'txt', label: 'TXT' },
    { value: 'md', label: 'MD' },
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'html', label: 'HTML' },
  ]);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function sanitizeUrl(rawUrl, options = {}) {
    const allowDataImage = Boolean(options.allowDataImage);
    const candidate = String(rawUrl || '').trim();
    if (!candidate) return null;

    if (/^(\/|\.\/|\.\.\/)/.test(candidate)) {
      return escapeAttribute(candidate);
    }

    if (
      allowDataImage &&
      /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+$/.test(candidate)
    ) {
      return candidate.replace(/\s+/g, '');
    }

    try {
      const parsed = new URL(candidate);
      const protocol = parsed.protocol.toLowerCase();
      if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:') {
        return escapeAttribute(parsed.toString());
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function restoreTokens(text, tokens, prefix, suffix) {
    let rendered = text;
    tokens.forEach((tokenHtml, index) => {
      const marker = `${prefix}${index}${suffix}`;
      rendered = rendered.split(marker).join(tokenHtml);
    });
    return rendered;
  }

  function restoreCodeTokens(text, codeTokens) {
    return restoreTokens(text, codeTokens, TOKEN_PREFIX, TOKEN_SUFFIX);
  }

  function restoreMathTokens(text, mathTokens) {
    return restoreTokens(text, mathTokens, MATH_TOKEN_PREFIX, MATH_TOKEN_SUFFIX);
  }

  function normalizeEquationDisplayText(value) {
    let normalized = String(value || '').trim();
    if (!normalized) return '';

    normalized = normalized
      .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\left/g, '')
      .replace(/\\right/g, '')
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, ' ')
      .replace(/\\!/g, '')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\{([^{}]+)\}/g, '$1')
      .replace(/\\([a-zA-Z]+)\b/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return normalized;
  }

  function isLikelyMathExpression(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    if (/^\d+(?:[.,]\d+)?$/.test(text)) return false;
    return /[=+\-*/^]|\\[a-zA-Z]+|\d+\s*[a-zA-Z]|[a-zA-Z]\s*=\s*\d/.test(text);
  }

  function normalizeLanguageLabel(language) {
    const clean = String(language || '')
      .trim()
      .toLowerCase()
      .replace(/[^\w+-]/g, '');
    if (!clean) return 'codigo';
    return clean.slice(0, 24);
  }

  function isDocsModeActive() {
    return Boolean(window.LizChat?.isDocsModeActive?.());
  }

  function getCodeBlockActionMeta() {
    if (isDocsModeActive()) {
      return {
        action: 'download',
        label: 'Baixar',
        ariaLabel: 'Baixar codigo',
      };
    }
    return {
      action: 'copy',
      label: 'Copiar',
      ariaLabel: 'Copiar codigo',
    };
  }

  function resolveDownloadConfig(language) {
    const normalized = normalizeLanguageLabel(language);
    return DOWNLOAD_LANGUAGE_MAP[normalized] || {
      extension: normalized !== 'codigo' ? normalized : 'txt',
      mime: 'text/plain;charset=utf-8',
    };
  }

  function getDownloadFormatOptions(language) {
    const preferredExtension = resolveDownloadConfig(language).extension;
    const options = DOWNLOAD_FORMAT_OPTIONS.map(option => ({ ...option }));
    const preferredIndex = options.findIndex(option => option.value === preferredExtension);
    if (preferredIndex > 0) {
      const preferred = options.splice(preferredIndex, 1)[0];
      options.unshift(preferred);
    } else if (preferredIndex < 0 && preferredExtension) {
      options.unshift({
        value: preferredExtension,
        label: String(preferredExtension).toUpperCase(),
      });
    }
    return options.slice(0, 8);
  }

  function buildDownloadFilename(extension) {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const datePart = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
    ].join('');
    const timePart = [
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join('');
    return `liz-docs-${datePart}-${timePart}.${extension}`;
  }

  function normalizeDownloadText(text) {
    return String(text || '')
      .replace(/\u0000/g, '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u2028\u2029]/g, '\n')
      .trim();
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

  function extractTextFromRawPdfSyntax(rawText) {
    const source = normalizeDownloadText(rawText);
    if (!source) return '';

    const snippets = [];
    const pushSnippet = value => {
      const clean = normalizeDownloadText(value);
      if (!clean) return;
      snippets.push(clean);
    };

    const literalRegex = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
    let literalMatch;
    while ((literalMatch = literalRegex.exec(source)) !== null) {
      pushSnippet(decodePdfLiteralText(literalMatch[1]));
      if (snippets.length >= 2000) break;
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
      if (snippets.length >= 2000) break;
    }

    return normalizeDownloadText(snippets.join('\n'));
  }

  function normalizePdfContentForDownload(text) {
    const source = normalizeDownloadText(text);
    if (!source) return 'Documento';

    const looksLikeRawPdf =
      /^%PDF-\d/i.test(source)
      || /(?:^|\n)\d+\s+\d+\s+obj(?:\n|$)/i.test(source)
      || /(?:^|\n)(xref|trailer|startxref|%%EOF)(?:\n|$)/i.test(source);

    let normalized = source;
    if (looksLikeRawPdf) {
      const extracted = extractTextFromRawPdfSyntax(source);
      if (extracted) {
        normalized = extracted;
      }
    }

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
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return normalized || 'Documento';
  }

  function buildTextBlobFromText(codeText, mimeType) {
    const normalized = normalizeDownloadText(codeText);
    const windowsLines = normalized.replace(/\n/g, '\r\n');
    const shouldUseBom =
      /^text\//i.test(String(mimeType || ''))
      || /json|xml|yaml|javascript|typescript|csv/i.test(String(mimeType || ''));
    const payload = shouldUseBom ? `\uFEFF${windowsLines}` : windowsLines;
    return new Blob([payload], { type: mimeType });
  }

  const WIN_ANSI_EXTENDED_MAP = Object.freeze({
    '€': 0x80,
    '‚': 0x82,
    'ƒ': 0x83,
    '„': 0x84,
    '…': 0x85,
    '†': 0x86,
    '‡': 0x87,
    'ˆ': 0x88,
    '‰': 0x89,
    'Š': 0x8A,
    '‹': 0x8B,
    'Œ': 0x8C,
    'Ž': 0x8E,
    '‘': 0x91,
    '’': 0x92,
    '“': 0x93,
    '”': 0x94,
    '•': 0x95,
    '–': 0x96,
    '—': 0x97,
    '˜': 0x98,
    '™': 0x99,
    'š': 0x9A,
    '›': 0x9B,
    'œ': 0x9C,
    'ž': 0x9E,
    'Ÿ': 0x9F,
  });

  function normalizePdfLine(line) {
    return String(line || '')
      .replace(/\r/g, '')
      .replace(/\t/g, '    ')
      .replace(/\u00A0/g, ' ');
  }

  function encodeWinAnsiByte(char) {
    const codePoint = String(char || '').codePointAt(0);
    if (typeof codePoint !== 'number') return 0x3F;
    if (codePoint <= 0x7F) return codePoint;
    if (codePoint >= 0xA0 && codePoint <= 0xFF) return codePoint;
    const mapped = WIN_ANSI_EXTENDED_MAP[char];
    return typeof mapped === 'number' ? mapped : 0x3F;
  }

  function encodePdfTextAsHex(text) {
    const bytes = [];
    for (const char of String(text || '')) {
      bytes.push(encodeWinAnsiByte(char));
    }
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function splitPdfLine(line, maxChars = 92) {
    const safeLine = normalizePdfLine(line);
    if (safeLine.length <= maxChars) return [safeLine];

    const chunks = [];
    let remaining = safeLine;
    while (remaining.length > maxChars) {
      const candidate = remaining.slice(0, maxChars);
      const breakAt = Math.max(candidate.lastIndexOf(' '), candidate.lastIndexOf('\t'));
      if (breakAt > 50) {
        chunks.push(candidate.slice(0, breakAt));
        remaining = remaining.slice(breakAt + 1);
      } else {
        chunks.push(candidate);
        remaining = remaining.slice(maxChars);
      }
    }
    chunks.push(remaining);
    return chunks;
  }

  function buildPdfBlobFromText(codeText) {
    const sourceLines = String(codeText || '')
      .replace(/\r\n?/g, '\n')
      .split('\n');
    const wrappedLines = sourceLines.flatMap(line => splitPdfLine(line, 92));
    const lines = wrappedLines.length > 0 ? wrappedLines : [''];
    const linesPerPage = 46;

    const pages = [];
    for (let index = 0; index < lines.length; index += linesPerPage) {
      pages.push(lines.slice(index, index + linesPerPage));
    }

    const encoder = new TextEncoder();
    const objectById = {};
    const pageIds = [];
    const contentIds = [];
    let nextId = 3;

    pages.forEach(() => {
      pageIds.push(nextId);
      contentIds.push(nextId + 1);
      nextId += 2;
    });

    const fontId = nextId;
    objectById[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    objectById[2] = `2 0 obj\n<< /Type /Pages /Kids [ ${pageIds.map(id => `${id} 0 R`).join(' ')} ] /Count ${pages.length} >>\nendobj\n`;

    pages.forEach((pageLines, pageIndex) => {
      const pageId = pageIds[pageIndex];
      const contentId = contentIds[pageIndex];

      const contentOps = [
        'BT',
        '/F1 11 Tf',
        '1 0 0 1 44 760 Tm',
        '14 TL',
      ];
      pageLines.forEach(line => {
        contentOps.push(`<${encodePdfTextAsHex(line)}> Tj`);
        contentOps.push('T*');
      });
      contentOps.push('ET');

      const streamContent = contentOps.join('\n');
      const streamLength = encoder.encode(streamContent).length;
      objectById[contentId] = `${contentId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
      objectById[pageId] = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`;
    });

    objectById[fontId] = `${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;

    const header = '%PDF-1.4\n';
    let body = '';
    const offsets = new Array(fontId + 1).fill(0);
    let currentOffset = encoder.encode(header).length;
    for (let objectId = 1; objectId <= fontId; objectId += 1) {
      const objectText = objectById[objectId] || `${objectId} 0 obj\n<< >>\nendobj\n`;
      offsets[objectId] = currentOffset;
      body += objectText;
      currentOffset += encoder.encode(objectText).length;
    }

    const xrefOffset = currentOffset;
    let xref = `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`;
    for (let objectId = 1; objectId <= fontId; objectId += 1) {
      xref += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([header, body, xref, trailer], { type: 'application/pdf' });
  }

  function downloadCodeText(codeText, language, forcedFormat = '') {
    const artifact = createDownloadArtifact(codeText, language, forcedFormat);
    const blob = artifact.blob;
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = artifact.fileName;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 800);
  }

  function createDownloadArtifact(codeText, language, forcedFormat = '', options = {}) {
    const selectedFormat = String(forcedFormat || '').trim();
    const config = resolveDownloadConfig(selectedFormat || language);
    const normalizedCodeText = normalizeDownloadText(codeText);
    const blob = config.extension === 'pdf'
      ? buildPdfBlobFromText(normalizePdfContentForDownload(normalizedCodeText))
      : buildTextBlobFromText(normalizedCodeText, config.mime);
    const requestedName = String(options?.fileName || '').trim();
    const fileName = requestedName || buildDownloadFilename(config.extension);
    return {
      blob,
      fileName,
      extension: config.extension,
      mimeType: config.mime || blob.type || 'application/octet-stream',
    };
  }

  function renderDownloadAction(actionMeta, languageLabel) {
    const options = getDownloadFormatOptions(languageLabel);
    const optionsHtml = options
      .map(option => (
        `<button type="button" class="liz-md-download-option" role="menuitem" data-md-format="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</button>`
      ))
      .join('');

    return [
      '<span class="liz-md-download-wrap">',
      `  <button type="button" class="liz-md-copy-btn" data-md-action="${actionMeta.action}" data-md-language="${escapeAttribute(languageLabel)}" aria-label="${actionMeta.ariaLabel}" aria-haspopup="menu" aria-expanded="false">${actionMeta.label}</button>`,
      `  <span class="liz-md-download-menu" role="menu" aria-hidden="true">${optionsHtml}</span>`,
      '</span>',
    ].join('');
  }

  function renderCodeFenceBlock(codeLines, language) {
    const languageLabel = normalizeLanguageLabel(language);
    const codeClass = languageLabel !== 'codigo'
      ? `liz-md-code language-${languageLabel}`
      : 'liz-md-code';
    const actionMeta = getCodeBlockActionMeta();
    const actionHtml = actionMeta.action === 'download'
      ? renderDownloadAction(actionMeta, languageLabel)
      : `<button type="button" class="liz-md-copy-btn" data-md-action="${actionMeta.action}" data-md-language="${escapeAttribute(languageLabel)}" aria-label="${actionMeta.ariaLabel}">${actionMeta.label}</button>`;

    return [
      '<div class="liz-md-codeblock">',
      '  <div class="liz-md-codeblock-head">',
      `    <span class="liz-md-code-lang">${escapeHtml(languageLabel)}</span>`,
      `    ${actionHtml}`,
      '  </div>',
      `  <pre class="liz-md-pre"><code class="${codeClass}">${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      '</div>',
    ].join('');
  }

  function closeDownloadMenus() {
    const openedMenus = document.querySelectorAll('.liz-md-download-menu.show');
    openedMenus.forEach(menu => {
      menu.classList.remove('show');
      menu.setAttribute('aria-hidden', 'true');
      const parent = menu.closest('.liz-md-download-wrap');
      const button = parent?.querySelector('.liz-md-copy-btn[data-md-action="download"]');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function toggleDownloadMenu(button) {
    const wrap = button?.closest('.liz-md-download-wrap');
    const menu = wrap?.querySelector('.liz-md-download-menu');
    if (!menu) return;

    const shouldOpen = !menu.classList.contains('show');
    closeDownloadMenus();
    if (!shouldOpen) return;

    menu.classList.add('show');
    menu.setAttribute('aria-hidden', 'false');
    button.setAttribute('aria-expanded', 'true');
  }

  function bindCopyEvents() {
    if (copyEventsBound) return;
    copyEventsBound = true;

    document.addEventListener('click', async event => {
      const downloadOption = event.target.closest('.liz-md-download-option');
      if (downloadOption) {
        const codeBlock = downloadOption.closest('.liz-md-codeblock');
        const codeNode = codeBlock?.querySelector('.liz-md-code');
        const button = codeBlock?.querySelector('.liz-md-copy-btn[data-md-action="download"]');
        if (!codeNode || !button) {
          closeDownloadMenus();
          return;
        }

        const codeText = String(codeNode.textContent || '');
        if (!codeText) {
          closeDownloadMenus();
          return;
        }

        const selectedFormat = normalizeLanguageLabel(downloadOption.dataset.mdFormat || 'txt');
        const language = String(button.dataset.mdLanguage || '').trim()
          || String(codeBlock?.querySelector('.liz-md-code-lang')?.textContent || '').trim();
        const defaultText = button.dataset.defaultLabel || String(button.textContent || '').trim() || 'Baixar';
        button.dataset.defaultLabel = defaultText;

        const markState = state => {
          button.classList.remove('copied', 'copy-error');
          if (state) {
            button.classList.add(state);
          }
        };

        try {
          downloadCodeText(codeText, language, selectedFormat);
          markState('copied');
          button.textContent = 'Baixado';
        } catch (error) {
          markState('copy-error');
          button.textContent = 'Falhou';
        }

        closeDownloadMenus();
        window.setTimeout(() => {
          markState('');
          button.textContent = defaultText;
        }, 1350);
        return;
      }

      const button = event.target.closest('.liz-md-copy-btn');
      if (!button) {
        closeDownloadMenus();
        return;
      }

      const codeBlock = button.closest('.liz-md-codeblock');
      const codeNode = codeBlock?.querySelector('.liz-md-code');
      if (!codeNode) return;

      const codeText = String(codeNode.textContent || '');
      if (!codeText) return;

      const defaultText = button.dataset.defaultLabel || String(button.textContent || '').trim() || 'Copiar';
      button.dataset.defaultLabel = defaultText;
      const action = String(button.dataset.mdAction || 'copy').trim().toLowerCase();
      const language = String(button.dataset.mdLanguage || '').trim() || String(codeBlock?.querySelector('.liz-md-code-lang')?.textContent || '').trim();

      const markState = state => {
        button.classList.remove('copied', 'copy-error');
        if (state) {
          button.classList.add(state);
        }
      };

      try {
        if (action === 'download') {
          toggleDownloadMenu(button);
          return;
        } else {
          closeDownloadMenus();
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(codeText);
          } else {
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            textArea.setAttribute('readonly', 'readonly');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            textArea.style.pointerEvents = 'none';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          markState('copied');
          button.textContent = 'Copiado';
        }
      } catch (error) {
        markState('copy-error');
        button.textContent = 'Falhou';
      }

      window.setTimeout(() => {
        markState('');
        button.textContent = defaultText;
      }, 1350);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeDownloadMenus();
      }
    });
  }

  function renderInline(markdownText) {
    let rendered = escapeHtml(markdownText);
    const codeTokens = [];
    const mathTokens = [];

    rendered = rendered.replace(/`([^`\n]+?)`/g, (_, codeContent) => {
      const tokenHtml = `<code class="liz-md-inline-code">${escapeHtml(codeContent)}</code>`;
      const tokenIndex = codeTokens.push(tokenHtml) - 1;
      return `${TOKEN_PREFIX}${tokenIndex}${TOKEN_SUFFIX}`;
    });

    rendered = rendered.replace(/\$\$([^$\n]+?)\$\$/g, (_, rawEquation) => {
      const normalizedEquation = normalizeEquationDisplayText(rawEquation);
      if (!normalizedEquation) {
        return `$$${rawEquation}$$`;
      }
      const tokenHtml = `<span class="liz-md-inline-equation">${escapeHtml(normalizedEquation)}</span>`;
      const tokenIndex = mathTokens.push(tokenHtml) - 1;
      return `${MATH_TOKEN_PREFIX}${tokenIndex}${MATH_TOKEN_SUFFIX}`;
    });

    rendered = rendered.replace(/(^|[^$\\])\$([^$\n]+)\$(?!\$)/g, (fullMatch, prefix, rawEquation) => {
      const normalizedEquation = normalizeEquationDisplayText(rawEquation);
      if (!isLikelyMathExpression(normalizedEquation)) {
        return fullMatch;
      }
      const tokenHtml = `<span class="liz-md-inline-equation">${escapeHtml(normalizedEquation)}</span>`;
      const tokenIndex = mathTokens.push(tokenHtml) - 1;
      return `${prefix}${MATH_TOKEN_PREFIX}${tokenIndex}${MATH_TOKEN_SUFFIX}`;
    });

    rendered = rendered.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, altText, urlText) => {
      const safeUrl = sanitizeUrl(urlText, { allowDataImage: true });
      if (!safeUrl) return `![${altText}](${urlText})`;
      const alt = String(altText || '').trim();
      const isIcon = /^icon(?:\s*:.*)?$/i.test(alt) || /^logo\s*:/i.test(alt);
      const className = isIcon ? 'liz-md-image liz-md-image-icon' : 'liz-md-image';
      return `<img class="${className}" src="${safeUrl}" alt="${escapeAttribute(altText)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none'">`;
    });

    rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, urlText) => {
      const safeUrl = sanitizeUrl(urlText);
      if (!safeUrl) return `[${label}](${urlText})`;
      return `<a class="liz-md-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

    rendered = rendered.replace(/~~([^~]+?)~~/g, '<del>$1</del>');
    rendered = rendered.replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    rendered = rendered.replace(/___([^_]+?)___/g, '<strong><em>$1</em></strong>');
    rendered = rendered.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    rendered = rendered.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    rendered = rendered.replace(/(^|[^\\w])\*([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
    rendered = rendered.replace(/(^|[^\\w])_([^_\n]+?)_(?!\w)/g, '$1<em>$2</em>');

    rendered = restoreMathTokens(rendered, mathTokens);
    rendered = restoreCodeTokens(rendered, codeTokens);
    return rendered.replace(/\n/g, '<br>');
  }

  function collectList(lines, startIndex, isOrdered) {
    const items = [];
    let pointer = startIndex;
    const listPattern = isOrdered
      ? /^\s*\d+\.\s+(.+)$/
      : /^\s*[-+*]\s+(.+)$/;

    while (pointer < lines.length) {
      const line = lines[pointer];
      const match = line.match(listPattern);
      if (!match) break;
      items.push(match[1]);
      pointer += 1;
    }

    return { items, nextIndex: pointer };
  }

  function collectEquation(lines, startIndex) {
    const startLine = String(lines[startIndex] || '');
    const trimmedStart = startLine.trim();
    if (!trimmedStart.startsWith('$$')) {
      return null;
    }

    const remainder = trimmedStart.slice(2);
    const closeIdx = remainder.indexOf('$$');
    if (closeIdx >= 0) {
      const content = remainder.slice(0, closeIdx).trim();
      return {
        content,
        nextIndex: startIndex + 1,
      };
    }

    const equationLines = [];
    if (remainder.trim()) {
      equationLines.push(remainder);
    }

    let pointer = startIndex + 1;
    while (pointer < lines.length) {
      const probeLine = String(lines[pointer] || '');
      const probeTrimmed = probeLine.trim();
      const probeCloseIdx = probeTrimmed.indexOf('$$');
      if (probeCloseIdx >= 0) {
        const beforeClose = probeTrimmed.slice(0, probeCloseIdx);
        if (beforeClose.trim()) {
          equationLines.push(beforeClose);
        }
        pointer += 1;
        break;
      }
      equationLines.push(probeLine);
      pointer += 1;
    }

    return {
      content: equationLines.join('\n').trim(),
      nextIndex: pointer,
    };
  }

  function renderEquationBlock(equationContent) {
    const content = String(equationContent || '').trim();
    if (!content) return '';
    const normalizedEquation = normalizeEquationDisplayText(content);
    const safeHtml = escapeHtml(normalizedEquation || content).replace(/\n/g, '<br>');
    return [
      '<div class="liz-md-equation-wrap">',
      `  <div class="liz-md-equation">${safeHtml}</div>`,
      '</div>',
    ].join('');
  }

  function renderBlocks(lines, depth = 0) {
    if (depth > MAX_RECURSION_DEPTH) {
      return `<p>${renderInline(lines.join('\n'))}</p>`;
    }

    const html = [];
    let index = 0;

    while (index < lines.length) {
      const currentLine = lines[index];
      const trimmed = currentLine.trim();

      if (!trimmed) {
        index += 1;
        continue;
      }

      const codeFence = trimmed.match(/^```([\w+-]+)?\s*$/);
      if (codeFence) {
        const language = escapeAttribute(codeFence[1] || '');
        const codeLines = [];
        index += 1;
        while (index < lines.length && !lines[index].trim().match(/^```/)) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) {
          index += 1;
        }
        html.push(renderCodeFenceBlock(codeLines, language));
        continue;
      }

      if (/^\$\$/.test(trimmed)) {
        const equation = collectEquation(lines, index);
        if (equation) {
          const equationHtml = renderEquationBlock(equation.content);
          if (equationHtml) {
            html.push(equationHtml);
          }
          index = equation.nextIndex;
          continue;
        }
      }

      if (/^(\*\*\*|---|___)\s*$/.test(trimmed)) {
        html.push('<hr class="liz-md-hr">');
        index += 1;
        continue;
      }

      const heading = currentLine.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^>\s?/.test(currentLine)) {
        const quoteLines = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^>\s?/, ''));
          index += 1;
        }
        html.push(`<blockquote class="liz-md-quote">${renderBlocks(quoteLines, depth + 1)}</blockquote>`);
        continue;
      }

      if (/^\s*[-+*]\s+/.test(currentLine)) {
        const collected = collectList(lines, index, false);
        const listItems = collected.items
          .map(item => `<li>${renderInline(item.trim())}</li>`)
          .join('');
        html.push(`<ul class="liz-md-list">${listItems}</ul>`);
        index = collected.nextIndex;
        continue;
      }

      if (/^\s*\d+\.\s+/.test(currentLine)) {
        const collected = collectList(lines, index, true);
        const listItems = collected.items
          .map(item => `<li>${renderInline(item.trim())}</li>`)
          .join('');
        html.push(`<ol class="liz-md-list">${listItems}</ol>`);
        index = collected.nextIndex;
        continue;
      }

      const paragraphLines = [];
      while (index < lines.length) {
        const probe = lines[index];
        const probeTrimmed = probe.trim();
        if (!probeTrimmed) break;
        if (
          probeTrimmed.match(/^```/) ||
          probeTrimmed.match(/^\$\$/) ||
          probeTrimmed.match(/^(\*\*\*|---|___)$/) ||
          probe.match(/^(#{1,6})\s+/) ||
          probe.match(/^>\s?/) ||
          probe.match(/^\s*[-+*]\s+/) ||
          probe.match(/^\s*\d+\.\s+/)
        ) {
          break;
        }
        paragraphLines.push(probe);
        index += 1;
      }

      html.push(`<p>${renderInline(paragraphLines.join('\n'))}</p>`);
    }

    return html.join('');
  }

  function render(markdownText) {
    bindCopyEvents();
    const normalized = String(markdownText || '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) return '';
    return renderBlocks(normalized.split('\n'));
  }

  window.LizMarkdown = {
    render,
    escapeHtml,
    createDownloadArtifact,
  };
})();
