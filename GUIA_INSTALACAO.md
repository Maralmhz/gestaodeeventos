# 🚀 Guia de Instalação - Novas Funcionalidades

## 📝 Introdução

Este guia explica como integrar as 16 novas funcionalidades ao sistema de gestão de eventos.

## ⚙️ Passos de Instalação

### Passo 1: Adicionar Arquivos CSS

No `<head>` do `index.html`, adicione:

```html
<link href="features.css" rel="stylesheet" />
```

### Passo 2: Adicionar Biblioteca XLSX (para Excel)

No `<head>` do `index.html`, adicione:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

### Passo 3: Adicionar Barra de Busca

APÓS a abertura do `<main class="content">`, adicione:

```html
<!-- BARRA DE BUSCA FIXA -->
<div class="search-bar-container">
  <input type="text" id="smart-search-input" placeholder="🔍 Busca inteligente em todos os campos...">
  <button id="smart-search-btn">🔎 Buscar</button>
  <button id="clear-search-btn">❌ Limpar</button>
  <span id="search-counter"></span>
</div>
```

### Passo 4: Adicionar Botões na Topbar

DENTRO do segundo `<div class="flex items-center gap-2 flex-wrap">` da `.topbar`, adicione:

```html
<!-- CONTADOR DE LINHAS -->
<div id="row-counter" class="row-counter">📊 0 eventos</div>

<!-- ATALHOS -->
<button class="action-button btn-primary" onclick="showKeyboardShortcutsHelp()" title="Atalhos de Teclado">
  ⌨️
</button>

<!-- CALCULADORA -->
<button class="action-button btn-primary" onclick="showCostCalculator()" title="Calculadora de Custos">
  💰
</button>

<!-- EXPORTAR EXCEL -->
<button class="action-button btn-success" onclick="exportFormattedExcel()" title="Exportar Excel">
  📥 Excel
</button>

<!-- NOTIFICAÇÕES -->
<div class="notification-icon" onclick="showNotificationPanel()" title="Notificações">
  🔔
  <span id="notification-badge" style="display:none;">0</span>
</div>

<!-- MODO ESCURO -->
<button class="action-button btn-warning" onclick="toggleDarkMode()" title="Alternar Modo Escuro">
  <span id="dark-mode-icon">🌙</span>
</button>
```

### Passo 5: Adicionar Filtros Rápidos

APÓS a `.topbar`, adicione:

```html
<!-- FILTROS RÁPIDOS VISUAIS -->
<div class="quick-filters" style="padding: 0 24px;">
  <div class="filter-chip" style="background: #3b82f6; color: white;" onclick="kpiFilter('all')">
    📦 Todos
  </div>
  <div class="filter-chip" style="background: #a855f7; color: white;" onclick="kpiFilter('roubo')">
    🚨 Roubo/Furto
  </div>
  <div class="filter-chip" style="background: #06b6d4; color: white;" onclick="kpiFilter('vidros')">
    💎 Vidros
  </div>
  <div class="filter-chip" style="background: #10b981; color: white;" onclick="kpiFilter('finalizados')">
    ✅ Finalizados
  </div>
  <div class="filter-chip" style="background: #f59e0b; color: white;" onclick="kpiFilter('open')">
    ⏳ Em Aberto
  </div>
</div>
```

### Passo 6: Adicionar Botões de Ação na Página de Dados

APÓS o `<div id="spreadsheet"></div>` da seção `page-data`, adicione:

```html
<!-- BOTÕES DE AÇÃO NA TABELA -->
<div class="flex gap-2 mt-4">
  <button class="btn btn-primary" onclick="duplicateCurrentEvent()">
    📋 Duplicar Linha
  </button>
  <button class="btn btn-primary" onclick="addCommentToCurrentRow()">
    💬 Adicionar Comentário
  </button>
  <button class="btn btn-primary" onclick="addTagToCurrentRow()">
    🏷️ Adicionar Tag
  </button>
</div>
```

### Passo 7: Adicionar Botão Flutuante do Mapa

ANTES do fechamento do `</main>`, adicione:

```html
<!-- MAPA DE OFICINAS -->
<div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
  <button class="btn btn-primary" onclick="showOficinasMap()" title="Mapa de Oficinas">
    🗺️ Mapa
  </button>
</div>
```

### Passo 8: Adicionar Scripts JavaScript

ANTES do fechamento do `</body>`, adicione:

```html
<script src="features.js"></script>

<script>
  // Inicializa as novas funcionalidades
  setTimeout(() => {
    if (typeof initAllFeatures === 'function') {
      initAllFeatures();
      console.log('✅ Novas funcionalidades inicializadas!');
    }
  }, 500);
</script>
```

### Passo 9: Adicionar Alerta de Dicas na Página de Dados

SUBSTITUA o alerta existente na seção `page-data` por:

```html
<div class="alert alert-info" style="background:#dbeafe; border-left:4px solid #3b82f6; padding:16px; border-radius:8px; margin-bottom:16px;">
  💡 <b>DICAS:</b> Use <kbd>Ctrl+D</kbd> para duplicar, <kbd>Ctrl+Shift+C</kbd> para comentários, <kbd>Ctrl+Shift+T</kbd> para tags
</div>
```

## ✅ Verificação

Após a instalação:

1. Abra o DevTools (F12)
2. Verifique se não há erros no console
3. Verifique se aparece: `✅ Novas funcionalidades inicializadas!`
4. Teste os atalhos de teclado (pressione algum para ver se funciona)
5. Teste a busca digitando algo na barra de busca
6. Alterne o modo escuro

## 🎯 Teste das Funcionalidades

### Testar Busca
1. Digite algo na barra de busca
2. Clique em "Buscar"
3. Verifique se os resultados aparecem

### Testar Modo Escuro
1. Clique no botão 🌙/☀️
2. Verifique se o tema muda
3. Recarregue a página - deve manter a preferência

### Testar Atalhos
1. Pressione `Ctrl + S` para salvar
2. Pressione `Ctrl + F` para focar na busca
3. Selecione uma linha e pressione `Ctrl + D` para duplicar

### Testar Comentários
1. Selecione uma linha com placa
2. Pressione `Ctrl + Shift + C`
3. Digite um comentário
4. Verifique se foi salvo

### Testar Tags
1. Selecione uma linha com placa
2. Pressione `Ctrl + Shift + T`
3. Selecione ou crie tags
4. Verifique se foram salvas

### Testar Calculadora
1. Clique no botão 💰
2. Digite valores
3. Verifique se o total é calculado
4. Insira na linha selecionada

### Testar Exportar Excel
1. Clique em "📥 Excel"
2. Verifique se o arquivo é baixado
3. Abra no Excel para verificar a formatação

## 🐛 Solução de Problemas

### Problema: "initAllFeatures is not a function"
**Solução:** Verifique se o arquivo `features.js` foi carregado corretamente.

### Problema: Estilos não aplicados
**Solução:** Verifique se o arquivo `features.css` foi carregado.

### Problema: Atalhos não funcionam
**Solução:** 
1. Verifique se não há outro script interceptando os eventos
2. Teste em uma aba anônima do navegador
3. Limpe o cache

### Problema: Modo escuro não persiste
**Solução:** Verifique se o localStorage está habilitado no navegador.

### Problema: Busca não encontra nada
**Solução:** 
1. Verifique se há dados na tabela
2. Teste com termos mais simples
3. Verifique se `hot` (Handsontable) está inicializado

## 📝 Notas Finais

- Todas as funcionalidades são **compatíveis** com o código existente
- Dados de comentários e tags são salvos no **localStorage**
- O modo escuro persiste entre sessões
- Todas as funcionalidades são **responsivas**

## 🔗 Links Úteis

- [README_FEATURES.md](README_FEATURES.md) - Documentação completa
- [features.js](features.js) - Código JavaScript
- [features.css](features.css) - Estilos CSS

---

**Desenvolvido para Porto Mais com ❤️**