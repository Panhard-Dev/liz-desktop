(function initCrownStream() {
  var wallEl = document.getElementById('streamWall');
  var resizeTimer = null;

  var textSets = [
    ['Liz Brasil', 'Coroa Mode', 'Prompt First', 'Fluxo Inteligente', 'Identidade de Marca', 'Resposta com Contexto'],
    ['Análise Profunda', 'Contexto Primeiro', 'Clareza de Prompt', 'Entrega com Padrão', 'Decisão Técnica', 'Precisão no Texto'],
    ['Linguagem Viva', 'Conhecimento Ativo', 'Exemplos Reais', 'Correção Contínua', 'Marca Consistente', 'Produtividade Alta'],
    ['Resultado de Verdade', 'Sem Enrolação', 'Padrão Profissional', 'Operação Estável', 'Performance no Dia a Dia', 'Fluxo Escalável'],
    ['Prompt Bem Feito', 'Controle de Contexto', 'Resposta Objetiva', 'Estrutura Forte', 'Assistência Inteligente', 'Tom Consistente'],
    ['Cadeia de Pensamento', 'Leitura de Requisito', 'Execução Segura', 'Qualidade de Entrega', 'Decisão por Dados', 'Iteração Rápida'],
  ];

  function laneCountFromViewport() {
    var viewportHeight = window.innerHeight || 720;
    return Math.max(10, Math.ceil(viewportHeight / 50));
  }

  function laneDuration(index) {
    var base = 26;
    var variance = (index % 6) * 3;
    return (base + variance) + 's';
  }

  function createLane(index) {
    var lane = document.createElement('div');
    lane.className = 'stream-lane';

    var track = document.createElement('div');
    track.className = 'stream-track' + (index % 2 === 1 ? ' reverse' : '');
    track.style.setProperty('--stream-duration', laneDuration(index));

    var crown = '/img/crown-logo.png';
    var set = textSets[index % textSets.length];
    var items = set.concat(set).concat(set).concat(set);

    track.innerHTML = items.map(function mapItem(item) {
      return '<span class="stream-pill"><img src="' + crown + '" alt="coroa">' + item + '</span>';
    }).join('');

    lane.appendChild(track);
    return lane;
  }

  function buildWall() {
    if (!wallEl) return;

    var count = laneCountFromViewport();
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < count; i += 1) {
      fragment.appendChild(createLane(i));
    }

    wallEl.innerHTML = '';
    wallEl.appendChild(fragment);
  }

  function scheduleRebuild() {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(buildWall, 120);
  }

  function bootstrap() {
    buildWall();
    window.addEventListener('resize', scheduleRebuild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
