/* ============================================
   NOVAS FUNCIONALIDADES - JAVASCRIPT COMPLETO
   ============================================ */

// ========== VARIÁVEIS GLOBAIS ==========
let darkModeEnabled = localStorage.getItem('darkMode') === 'true';
let eventComments = JSON.parse(localStorage.getItem('eventComments') || '{}');
let eventTags = JSON.parse(localStorage.getItem('eventTags') || '{}');
let notificationQueue = [];
let searchTimeout = null;

// ========== 1. BUSCA INTELIGENTE ==========
function initSmartSearch() {
  const container = document.querySelector('.topbar');
  
  const searchHTML = `
    <div class="search-bar-container">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          id="smart-search-input" 
          class="search-input" 
          placeholder="Buscar por placa, veículo, oficina, beneficiário..."
        />
        <button class="search-clear" id="search-clear-btn">×</button>
      </div>
      <div class="quick-filters" id="quick-filters"></div>
    </div>
  `;
  
  container.insertAdjacentHTML('afterend', searchHTML);
  
  const input = document.getElementById('smart-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  
  input.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    clearBtn.classList.toggle('active', value.length > 0);
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSmartSearch(value);
    }, 300);
  });
  
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('active');
    clearSearch();
  });
  
  updateQuickFilters();
}

function performSmartSearch(query) {
  if (!query) {
    clearSearch();
    return;
  }
  
  const data = hot.getData();
  const matches = [];
  const searchLower = query.toLowerCase();
  
  data.forEach((row, idx) => {
    if (!row[0]) return;
    
    const searchableText = [
      row[4],  // Placa
      row[3],  // Veículo
      row[6],  // Oficina
      row[1],  // Beneficiário
      row[0],  // Associação
      row[2],  // Evento Tipo
      row[12], // Situação
      row[17]  // Observações
    ].join(' ').toLowerCase();
    
    if (searchableText.includes(searchLower)) {
      matches.push(idx);
    }
  });
  
  if (matches.length > 0) {
    highlightSearchResults(matches);
    showNotification('success', 'Busca concluída', `${matches.length} resultado(s) encontrado(s)`);
  } else {
    showNotification('warning', 'Nenhum resultado', 'Tente outros termos de busca');
  }
}

function highlightSearchResults(matches) {
  if (matches.length > 0) {
    hot.selectCell(matches[0], 0);
    hot.scrollViewportTo(matches[0], 0);
  }
}

function clearSearch() {
  hot.deselectCell();
  hot.render();
}

// ========== 2. DESTAQUE DE LINHA ==========
function initRowHighlight() {
  if (!hot) return;
  
  hot.addHook('afterSelection', function(row, col) {
    // Remove highlight anterior
    document.querySelectorAll('.current-row').forEach(el => {
      el.classList.remove('current-row');
    });
    
    // Adiciona highlight na linha atual
    const tableRows = document.querySelectorAll('.handsontable tbody tr');
    if (tableRows[row]) {
      tableRows[row].classList.add('current-row');
    }
  });
}

// ========== 3. ATALHOS DE TECLADO ==========
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S = Salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentMonthWithChecks();
      showNotification('success', 'Salvo!', 'Dados salvos com sucesso');
    }
    
    // Ctrl/Cmd + F = Buscar
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('smart-search-input')?.focus();
    }
    
    // Ctrl/Cmd + D = Duplicar linha
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      duplicateCurrentRow();
    }
    
    // Ctrl/Cmd + K = Calculadora
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showCostCalculator();
    }
    
    // Esc = Limpar busca
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('smart-search-input');
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        document.getElementById('search-clear-btn')?.classList.remove('active');
        clearSearch();
      }
    }
    
    // F1 = Ajuda/Atalhos
    if (e.key === 'F1') {
      e.preventDefault();
      toggleShortcutsPanel();
    }
  });
  
  createShortcutsPanel();
}

function createShortcutsPanel() {
  const panel = document.createElement('div');
  panel.className = 'shortcuts-panel';
  panel.id = 'shortcuts-panel';
  panel.innerHTML = `
    <h4 style="font-weight: 800; margin-bottom: 12px; color: #1e293b;">⌨️ Atalhos de Teclado</h4>
    <div class="shortcut-item">
      <span class="shortcut-label">Salvar</span>
      <span class="shortcut-key">Ctrl + S</span>
    </div>
    <div class="shortcut-item">
      <span class="shortcut-label">Buscar</span>
      <span class="shortcut-key">Ctrl + F</span>
    </div>
    <div class="shortcut-item">
      <span class="shortcut-label">Duplicar linha</span>
      <span class="shortcut-key">Ctrl + D</span>
    </div>
    <div class="shortcut-item">
      <span class="shortcut-label">Calculadora</span>
      <span class="shortcut-key">Ctrl + K</span>
    </div>
    <div class="shortcut-item">
      <span class="shortcut-label">Limpar busca</span>
      <span class="shortcut-key">Esc</span>
    </div>
    <div class="shortcut-item">
      <span class="shortcut-label">Esta ajuda</span>
      <span class="shortcut-key">F1</span>
    </div>
  `;
  document.body.appendChild(panel);
}

function toggleShortcutsPanel() {
  const panel = document.getElementById('shortcuts-panel');
  if (panel) {
    panel.classList.toggle('visible');
  }
}

// ========== 4. CONTADOR DE LINHAS ==========
function initLineCounter() {
  const counter = document.createElement('div');
  counter.className = 'line-counter';
  counter.id = 'line-counter';
  counter.innerHTML = '<span class="icon">📊</span><span id="line-count">0 linhas</span>';
  document.body.appendChild(counter);
  
  counter.addEventListener('click', () => {
    showLineStats();
  });
  
  updateLineCounter();
}

function updateLineCounter() {
  const data = hot?.getData() || [];
  const totalLines = data.filter(row => row[0]).length;
  const counter = document.getElementById('line-count');
  if (counter) {
    counter.textContent = `${totalLines} linha${totalLines !== 1 ? 's' : ''}`;
  }
}

function showLineStats() {
  const data = hot?.getData() || [];
  const total = data.filter(row => row[0]).length;
  const finalizados = data.filter(row => row[0] && (row[12] || '').toUpperCase() === 'FINALIZADO').length;
  const emAndamento = data.filter(row => row[0] && (row[12] || '').toUpperCase() === 'EM ANDAMENTO').length;
  const pendentes = data.filter(row => row[0] && (row[12] || '').toUpperCase() === 'PENDENTE').length;
  
  Swal.fire({
    title: '📊 Estatísticas',
    html: `
      <div style="text-align: left;">
        <p><b>Total:</b> ${total} eventos</p>
        <p><b>Finalizados:</b> ${finalizados}</p>
        <p><b>Em andamento:</b> ${emAndamento}</p>
        <p><b>Pendentes:</b> ${pendentes}</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'OK'
  });
}

// ========== 5. FILTROS RÁPIDOS ==========
function updateQuickFilters() {
  const container = document.getElementById('quick-filters');
  if (!container) return;
  
  const data = hot?.getData() || [];
  const filters = [
    { label: 'Todos', value: 'all', icon: '📋' },
    { label: 'Finalizado', value: 'finalizado', icon: '✅' },
    { label: 'Em Andamento', value: 'em-andamento', icon: '🔄' },
    { label: 'Pendente', value: 'pendente', icon: '⏳' },
    { label: 'Vidros', value: 'vidros', icon: '🪟' },
    { label: 'Roubo/Furto', value: 'roubo', icon: '🚨' },
    { label: '3º Causador', value: 'terceiro', icon: '⚖️' }
  ];
  
  const counts = {
    all: data.filter(r => r[0]).length,
    finalizado: data.filter(r => r[0] && (r[12] || '').toUpperCase() === 'FINALIZADO').length,
    'em-andamento': data.filter(r => r[0] && (r[12] || '').toUpperCase() === 'EM ANDAMENTO').length,
    pendente: data.filter(r => r[0] && (r[12] || '').toUpperCase() === 'PENDENTE').length,
    vidros: data.filter(r => r[0] && (r[2] || '').toUpperCase() === 'VIDROS').length,
    roubo: data.filter(r => r[0] && (r[2] || '').toUpperCase() === 'ROUBO/FURTO').length,
    terceiro: data.filter(r => r[0] && (r[13] || '').toUpperCase() === 'TERCEIRO').length
  };
  
  container.innerHTML = filters.map(f => `
    <div class="filter-chip" onclick="applyQuickFilter('${f.value}')">
      <span>${f.icon}</span>
      <span>${f.label}</span>
      <span class="count">${counts[f.value] || 0}</span>
    </div>
  `).join('');
}

function applyQuickFilter(filterType) {
  let predicate;
  
  switch(filterType) {
    case 'all':
      predicate = () => true;
      break;
    case 'finalizado':
      predicate = r => (r[12] || '').toUpperCase() === 'FINALIZADO';
      break;
    case 'em-andamento':
      predicate = r => (r[12] || '').toUpperCase() === 'EM ANDAMENTO';
      break;
    case 'pendente':
      predicate = r => (r[12] || '').toUpperCase() === 'PENDENTE';
      break;
    case 'vidros':
      predicate = r => (r[2] || '').toUpperCase() === 'VIDROS';
      break;
    case 'roubo':
      predicate = r => (r[2] || '').toUpperCase() === 'ROUBO/FURTO';
      break;
    case 'terceiro':
      predicate = r => (r[13] || '').toUpperCase() === 'TERCEIRO';
      break;
    default:
      predicate = () => true;
  }
  
  applyFilter(predicate);
  
  // Highlight do filtro ativo
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  event.target.closest('.filter-chip')?.classList.add('active');
}

// ========== 6. MODO ESCURO ==========
function initDarkMode() {
  const toggle = document.createElement('button');
  toggle.className = 'dark-mode-toggle';
  toggle.innerHTML = darkModeEnabled ? '☀️' : '🌙';
  toggle.addEventListener('click', toggleDarkMode);
  document.body.appendChild(toggle);
  
  if (darkModeEnabled) {
    document.body.classList.add('dark-mode');
  }
}

function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  localStorage.setItem('darkMode', darkModeEnabled);
  document.body.classList.toggle('dark-mode');
  
  const toggle = document.querySelector('.dark-mode-toggle');
  if (toggle) {
    toggle.innerHTML = darkModeEnabled ? '☀️' : '🌙';
  }
  
  showNotification(
    'success',
    'Modo alterado',
    `Modo ${darkModeEnabled ? 'escuro' : 'claro'} ativado`
  );
}

// ========== 7. NOTIFICAÇÕES PUSH ==========
function initNotifications() {
  const container = document.createElement('div');
  container.className = 'notification-container';
  container.id = 'notification-container';
  document.body.appendChild(container);
}

function showNotification(type = 'info', title, message, duration = 4000) {
  const container = document.getElementById('notification-container');
  if (!container) return;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">×</button>
  `;
  
  container.appendChild(notification);
  
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  if (duration > 0) {
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// ========== 8. AUTOCOMPLETE INTELIGENTE ==========
function initAutocomplete() {
  if (!hot) return;
  
  // Adiciona autocomplete para oficinas baseado no histórico
  const oficinasUsadas = new Set();
  const data = hot.getData();
  
  data.forEach(row => {
    if (row[6]) oficinasUsadas.add(row[6]);
  });
  
  // Atualizar sugestões de oficinas
  const oficinasArray = Array.from(oficinasUsadas).sort();
  // O Handsontable já tem isso configurado no dropdown
}

// ========== 9. EXPORTAR EXCEL FORMATADO ==========
function exportFormattedExcel() {
  showNotification('info', 'Exportando...', 'Gerando arquivo Excel formatado');
  
  const data = hot.getData();
  const headers = hot.getColHeader();
  
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Criar worksheet com headers
  const wsData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Aplicar estilos (cores, bordas, etc)
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  // Estilizar header
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = {
      fill: { fgColor: { rgb: "3B82F6" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center" }
    };
  }
  
  XLSX.utils.book_append_sheet(wb, ws, "Eventos");
  
  // Download
  const filename = `eventos_${monthLabel(currentYear, currentMonth).replace(/ /g, '_')}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  
  showNotification('success', 'Exportado!', 'Excel gerado com sucesso');
}

// ========== 10. COMENTÁRIOS POR EVENTO ==========
function showEventComments(rowIndex) {
  const row = hot.getDataAtRow(rowIndex);
  const placa = row[4] || 'Sem placa';
  const eventId = `${currentYear}_${currentMonth}_${rowIndex}`;
  const comments = eventComments[eventId] || [];
  
  Swal.fire({
    title: `💬 Comentários - ${placa}`,
    html: `
      <div class="comments-section">
        ${comments.length === 0 ? '<p style="color: #94a3b8; text-align: center;">Sem comentários ainda</p>' : ''}
        ${comments.map((c, idx) => `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-author">${c.author || 'Usuário'}</span>
              <span class="comment-date">${c.date}</span>
            </div>
            <div class="comment-text">${c.text}</div>
          </div>
        `).join('')}
      </div>
      <textarea class="comment-input" id="new-comment" placeholder="Adicionar comentário..."></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: '💾 Adicionar',
    cancelButtonText: 'Fechar',
    preConfirm: () => {
      const text = document.getElementById('new-comment').value.trim();
      if (text) {
        if (!eventComments[eventId]) eventComments[eventId] = [];
        eventComments[eventId].push({
          text: text,
          author: 'Usuário',
          date: new Date().toLocaleString('pt-BR')
        });
        localStorage.setItem('eventComments', JSON.stringify(eventComments));
        showNotification('success', 'Comentário adicionado', 'Comentário salvo com sucesso');
      }
    }
  });
}

// ========== 11. DUPLICAR EVENTO ==========
function duplicateCurrentRow() {
  const selected = hot.getSelected();
  if (!selected || !selected[0]) {
    showNotification('warning', 'Selecione uma linha', 'Clique em uma linha para duplicar');
    return;
  }
  
  const rowIndex = selected[0][0];
  const rowData = hot.getDataAtRow(rowIndex);
  
  if (!rowData[0]) {
    showNotification('warning', 'Linha vazia', 'Selecione uma linha com dados');
    return;
  }
  
  // Inserir linha duplicada abaixo
  hot.alter('insert_row_below', rowIndex, 1);
  
  // Copiar dados (exceto placa para evitar duplicatas)
  const newData = [...rowData];
  newData[4] = ''; // Limpar placa
  newData[12] = 'PENDENTE'; // Status inicial
  
  hot.populateFromArray(rowIndex + 1, 0, [newData]);
  hot.selectCell(rowIndex + 1, 0);
  
  showNotification('success', 'Evento duplicado', 'Linha copiada com sucesso');
  updateLineCounter();
}

// ========== 12. CALCULADORA DE CUSTOS ==========
function showCostCalculator() {
  const selected = hot.getSelected();
  if (!selected || !selected[0]) {
    calculateAllCosts();
    return;
  }
  
  const rowIndex = selected[0][0];
  const row = hot.getDataAtRow(rowIndex);
  
  const cota = parseFloat(row[7]) || 0;
  const maoObra = parseFloat(row[8]) || 0;
  const pecas = parseFloat(row[9]) || 0;
  const outras = parseFloat(row[10]) || 0;
  const total = cota + maoObra + pecas + outras;
  
  Swal.fire({
    title: '💰 Calculadora de Custos',
    html: `
      <div class="cost-calculator">
        <div class="calc-item">
          <span class="calc-label">Cota:</span>
          <span class="calc-value">R$ ${cota.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Mão de Obra:</span>
          <span class="calc-value">R$ ${maoObra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Peças:</span>
          <span class="calc-value">R$ ${pecas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Outras Despesas:</span>
          <span class="calc-value">R$ ${outras.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item calc-total">
          <span class="calc-label">TOTAL:</span>
          <span class="calc-value">R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    `,
    confirmButtonText: 'OK'
  });
}

function calculateAllCosts() {
  const data = hot.getData();
  let totalGeral = 0;
  let totalCota = 0;
  let totalMaoObra = 0;
  let totalPecas = 0;
  let totalOutras = 0;
  
  data.forEach(row => {
    if (!row[0]) return;
    totalCota += parseFloat(row[7]) || 0;
    totalMaoObra += parseFloat(row[8]) || 0;
    totalPecas += parseFloat(row[9]) || 0;
    totalOutras += parseFloat(row[10]) || 0;
  });
  
  totalGeral = totalCota + totalMaoObra + totalPecas + totalOutras;
  
  Swal.fire({
    title: '💰 Custos Totais do Mês',
    html: `
      <div class="cost-calculator">
        <div class="calc-item">
          <span class="calc-label">Total Cota:</span>
          <span class="calc-value">R$ ${totalCota.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Total Mão de Obra:</span>
          <span class="calc-value">R$ ${totalMaoObra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Total Peças:</span>
          <span class="calc-value">R$ ${totalPecas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">Total Outras:</span>
          <span class="calc-value">R$ ${totalOutras.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="calc-item calc-total">
          <span class="calc-label">TOTAL GERAL:</span>
          <span class="calc-value">R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    `,
    confirmButtonText: 'OK'
  });
}

// ========== 13. TAGS PERSONALIZADAS ==========
function showEventTags(rowIndex) {
  const row = hot.getDataAtRow(rowIndex);
  const placa = row[4] || 'Sem placa';
  const eventId = `${currentYear}_${currentMonth}_${rowIndex}`;
  const tags = eventTags[eventId] || [];
  
  Swal.fire({
    title: `🏷️ Tags - ${placa}`,
    html: `
      <div class="tags-container" id="tags-display">
        ${tags.map((tag, idx) => `
          <span class="tag" style="background: ${tag.color}; color: white;">
            ${tag.label}
            <button class="tag-remove" onclick="removeTag('${eventId}', ${idx})">×</button>
          </span>
        `).join('')}
        <button class="tag-input" onclick="addNewTag('${eventId}')">+ Adicionar Tag</button>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true
  });
}

function addNewTag(eventId) {
  Swal.fire({
    title: 'Nova Tag',
    input: 'text',
    inputPlaceholder: 'Nome da tag',
    showCancelButton: true,
    confirmButtonText: 'Adicionar',
    preConfirm: (label) => {
      if (!label) return;
      
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      if (!eventTags[eventId]) eventTags[eventId] = [];
      eventTags[eventId].push({ label, color });
      localStorage.setItem('eventTags', JSON.stringify(eventTags));
      
      showNotification('success', 'Tag adicionada', label);
    }
  });
}

function removeTag(eventId, tagIndex) {
  if (eventTags[eventId]) {
    eventTags[eventId].splice(tagIndex, 1);
    localStorage.setItem('eventTags', JSON.stringify(eventTags));
    showNotification('info', 'Tag removida', 'Tag excluída com sucesso');
  }
}

// ========== 14. MAPA DE OFICINAS ==========
function showOficinasMap() {
  Swal.fire({
    title: '🗺️ Mapa de Oficinas',
    html: `
      <div class="map-container" id="oficinas-map">
        <p style="padding: 40px; text-align: center; color: #64748b;">
          Integração com Google Maps ou Leaflet seria implementada aqui.<br>
          <small>Requer API Key e coordenadas das oficinas.</small>
        </p>
      </div>
      <div style="margin-top: 16px; font-size: 13px; color: #64748b;">
        💡 <b>Próximos passos:</b>
        <ul style="text-align: left; margin-top: 8px;">
          <li>Adicionar coordenadas (latitude/longitude) no cadastro de oficinas</li>
          <li>Integrar Google Maps API ou Leaflet</li>
          <li>Exibir marcadores clicáveis com info das oficinas</li>
        </ul>
      </div>
    `,
    width: 800,
    confirmButtonText: 'Entendi'
  });
}

// ========== INICIALIZAÇÃO ==========
function initAllFeatures() {
  setTimeout(() => {
    initSmartSearch();
    initRowHighlight();
    initKeyboardShortcuts();
    initLineCounter();
    initDarkMode();
    initNotifications();
    initAutocomplete();
    
    // Adicionar botões extras na topbar
    addExtraButtons();
    
    // Hook para atualizar contador quando dados mudarem
    if (hot) {
      hot.addHook('afterChange', () => {
        updateLineCounter();
        updateQuickFilters();
      });
    }
    
    // Notificação de boas-vindas
    setTimeout(() => {
      showNotification(
        'success',
        '🎉 Novas funcionalidades!',
        '16 recursos foram adicionados. Pressione F1 para ver os atalhos.',
        6000
      );
    }, 1000);
  }, 500);
}

function addExtraButtons() {
  const topbar = document.querySelector('.topbar .flex.items-center.gap-2');
  if (!topbar) return;
  
  const buttons = [
    { label: '💾 Excel', onclick: 'exportFormattedExcel()', title: 'Exportar Excel formatado' },
    { label: '🗺️ Mapa', onclick: 'showOficinasMap()', title: 'Ver mapa de oficinas' },
    { label: '💬', onclick: 'showEventCommentsForSelected()', title: 'Comentários' },
    { label: '🏷️', onclick: 'showEventTagsForSelected()', title: 'Tags' }
  ];
  
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = 'btn btn-sm';
    button.innerHTML = btn.label;
    button.onclick = () => eval(btn.onclick);
    button.title = btn.title;
    button.style.cssText = 'padding: 8px 12px; font-size: 13px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.2s ease;';
    button.onmouseover = () => button.style.transform = 'translateY(-2px)';
    button.onmouseout = () => button.style.transform = 'translateY(0)';
    topbar.appendChild(button);
  });
}

function showEventCommentsForSelected() {
  const selected = hot.getSelected();
  if (!selected || !selected[0]) {
    showNotification('warning', 'Selecione uma linha', 'Clique em um evento primeiro');
    return;
  }
  showEventComments(selected[0][0]);
}

function showEventTagsForSelected() {
  const selected = hot.getSelected();
  if (!selected || !selected[0]) {
    showNotification('warning', 'Selecione uma linha', 'Clique em um evento primeiro');
    return;
  }
  showEventTags(selected[0][0]);
}

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllFeatures);
} else {
  initAllFeatures();
}