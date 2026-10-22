/**
 * Urdu PhotoCraft Studio 2.0 - Main Application Controller with i18n
 */

import { themeManager, THEMES } from './apptheme/theme.js';
import { appState } from './core/state.js';
import { eventBus } from './core/event_bus.js';
import { historyManager } from './core/history_manager.js';
import { i18n, t, LANGUAGES } from './core/i18n.js';

import { CanvasView } from './features/canvas/canvas_view.js';
import { CANVAS_PRESETS } from './features/canvas/canvas_presets.js';

import { createTextLayer } from './features/text_editor/text_layer.js';
import { URDU_FONTS, TEXT_ALIGNMENTS } from './features/text_editor/text_styling.js';
import { TEXT_EFFECT_PRESETS } from './features/text_editor/text_effects.js';
import { UrduKeyboard } from './features/text_editor/urdu_keyboard.js';

import { PoetryModal } from './features/poetry_library/poetry_modal.js';
import { BG_SOLID_PALETTES, BG_GRADIENTS } from './features/background_manager/bg_colors.js';
import { handleBackgroundImageUpload } from './features/background_manager/bg_uploader.js';
import { updateBackgroundFilter } from './features/background_manager/bg_filters.js';

import { CALLIGRAPHY_STAMPS, addCalligraphyStamp } from './features/stickers_frames/calligraphy_stamps.js';
import { addDecorativeDivider, addDecorativeFrame, addBackdropRibbon } from './features/stickers_frames/decorative_borders.js';

import { LayerPanel } from './features/layer_panel/layer_list.js';
import { ExportModal } from './features/export_share/export_modal.js';

class UrduPhotoCraftApp {
  constructor() {
    this.currentTool = 'text';
    this.activeInspectorTab = 'properties';
    this.poetryModal = null;
    this.exportModal = null;
    this.urduKeyboard = null;
    this.canvasView = null;
    this.layerPanel = null;
  }

  init() {
    console.log('Initializing Urdu PhotoCraft Studio 2.0...');

    // 1. Initialize Canvas & Viewport
    const container = document.getElementById('viewportContainer');
    const canvas = document.getElementById('studioCanvas');
    this.canvasView = new CanvasView(container, canvas);

    // 2. Initialize Modals
    this.poetryModal = new PoetryModal();
    this.poetryModal.init();

    this.exportModal = new ExportModal();
    this.exportModal.init();

    // 3. Initialize Layer Panel
    const layerContainer = document.getElementById('layerListContainer');
    this.layerPanel = new LayerPanel(layerContainer);

    // 4. Initialize Virtual Keyboard
    const kbdMount = document.getElementById('urduKeyboardMount');
    this.urduKeyboard = new UrduKeyboard('#propUrduTextInput');
    this.urduKeyboard.render(kbdMount);

    // 5. Populate Canvas Presets Dropdown
    this.populatePresets();

    // 6. Bind Topbar & Global Events
    this.bindTopbarEvents();
    this.bindInspectorTabEvents();
    this.bindLeftToolbarEvents();
    this.bindZoomEvents();

    // 7. Subscribe to State & Language Changes
    eventBus.on('layer:selected', (layer) => {
      const active = layer || appState.getActiveLayer();
      if (active && active.type === 'text') {
        this.currentTool = 'text';
        document.querySelectorAll('.tool-tab-btn').forEach(b => {
          if (b.getAttribute('data-tool') === 'text') b.classList.add('active');
          else if (b.id !== 'toggleUrduKbdBtn') b.classList.remove('active');
        });
      }
      this.renderPropertiesInspector();
    });
    eventBus.on('layer:updated', () => this.syncPropertiesInputs());
    eventBus.on('background:changed', () => {
      if (this.currentTool === 'background') this.renderPropertiesInspector();
    });
    eventBus.on('viewport:transformed', (data) => {
      const zoomLbl = document.getElementById('zoomLevelIndicator');
      if (zoomLbl) zoomLbl.textContent = Math.round(data.zoom * 100) + '%';
    });

    eventBus.on('language:changed', () => {
      this.updateStaticI18nLabels();
      this.populatePresets();
      this.renderPropertiesInspector();
    });

    // 8. Create Starter Design
    this.createStarterDesign();

    // Apply i18n labels
    this.updateStaticI18nLabels();

    // Render inspector initially
    this.renderPropertiesInspector();

    // History initial snapshot
    setTimeout(() => {
      historyManager.saveSnapshot();
    }, 150);

    console.log('Urdu PhotoCraft Studio Ready!');
  }

  updateStaticI18nLabels() {
    // Translate all elements with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // Translate attributes with [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.title = t(key);
      }
    });

    // Update language toggle button label
    const langBtn = document.getElementById('langSwitchLabel');
    if (langBtn) {
      langBtn.textContent = (i18n.getLanguage() === LANGUAGES.UR) ? '🌐 English' : '🌐 اردو';
    }

    // Update theme label in active language
    this.updateThemeLabel();
  }

  populatePresets() {
    const sel = document.getElementById('canvasPresetSelector');
    if (!sel) return;

    const presetNames = {
      '1:1': t('presetSquare'),
      '9:16': t('presetStory'),
      '16:9': t('presetThumbnail'),
      '4:3': t('presetPoetryCard'),
      '3:4': t('presetPortrait'),
      'custom': t('presetCustom'),
    };

    const curVal = sel.value || appState.canvas.aspectRatio || '1:1';
    sel.innerHTML = CANVAS_PRESETS.map(p => `
      <option value="${p.id}" ${p.id === curVal ? 'selected' : ''}>${presetNames[p.id] || p.name}</option>
    `).join('');

    sel.onchange = (e) => {
      const preset = CANVAS_PRESETS.find(p => p.id === e.target.value);
      if (preset && preset.id !== 'custom') {
        appState.canvas.width = preset.width;
        appState.canvas.height = preset.height;
        appState.canvas.aspectRatio = preset.id;
        eventBus.emit('canvas:resize');
        eventBus.emit('state:modified');
      }
    };
  }

  updateThemeLabel() {
    const themeLabel = document.getElementById('themeNameLabel');
    if (!themeLabel) return;
    const cur = themeManager.getCurrentTheme();
    if (cur === THEMES.GOLD) themeLabel.textContent = t('themeGold');
    else if (cur === THEMES.EMERALD) themeLabel.textContent = t('themeEmerald');
    else themeLabel.textContent = t('themeStudio');
  }

  bindTopbarEvents() {
    // Language Switcher Button
    const langBtn = document.getElementById('langSwitchBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        i18n.toggleLanguage();
      });
    }

    // Theme Switcher Button
    const themeBtn = document.getElementById('themeSwitchBtn');
    this.updateThemeLabel();

    themeBtn.addEventListener('click', () => {
      themeManager.cycleTheme();
      this.updateThemeLabel();
      eventBus.emit('canvas:request_render');
    });

    // Undo & Redo
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    undoBtn.addEventListener('click', () => historyManager.undo());
    redoBtn.addEventListener('click', () => historyManager.redo());

    eventBus.on('history:status', (status) => {
      undoBtn.disabled = !status.canUndo;
      redoBtn.disabled = !status.canRedo;
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) historyManager.redo();
        else historyManager.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        historyManager.redo();
      }
    });

    // Quick Action Buttons
    document.getElementById('openPoetryBtn').addEventListener('click', () => {
      this.poetryModal.open();
    });

    document.getElementById('addTextQuickBtn').addEventListener('click', () => {
      createTextLayer(i18n.getLanguage() === LANGUAGES.UR ? 'نیا اردو متن' : 'New Urdu Text');
      this.switchTool('text');
    });

    document.getElementById('openExportBtn').addEventListener('click', () => {
      this.exportModal.open();
    });
  }

  bindInspectorTabEvents() {
    const propBtn = document.getElementById('tabBtnProperties');
    const layerBtn = document.getElementById('tabBtnLayers');
    const propView = document.getElementById('inspectorPropertiesView');
    const layerView = document.getElementById('inspectorLayersView');

    propBtn.addEventListener('click', () => {
      propBtn.classList.add('active');
      layerBtn.classList.remove('active');
      propView.style.display = 'block';
      layerView.style.display = 'none';
      this.activeInspectorTab = 'properties';
    });

    layerBtn.addEventListener('click', () => {
      layerBtn.classList.add('active');
      propBtn.classList.remove('active');
      propView.style.display = 'none';
      layerView.style.display = 'block';
      this.activeInspectorTab = 'layers';
      this.layerPanel.render();
    });
  }

  bindLeftToolbarEvents() {
    const toolbar = document.getElementById('studioLeftToolbar');
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool-tab-btn');
      if (!btn || btn.id === 'toggleUrduKbdBtn') return;

      const tool = btn.getAttribute('data-tool');
      if (tool) {
        this.switchTool(tool);
      }
    });

    document.getElementById('toggleUrduKbdBtn').addEventListener('click', () => {
      this.urduKeyboard.toggle();
    });
  }

  switchTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.tool-tab-btn').forEach(b => {
      if (b.getAttribute('data-tool') === tool) b.classList.add('active');
      else if (b.id !== 'toggleUrduKbdBtn') b.classList.remove('active');
    });

    if (tool === 'poetry') {
      this.poetryModal.open();
      return;
    }

    document.getElementById('tabBtnProperties').click();
    this.renderPropertiesInspector();
  }

  bindZoomEvents() {
    document.getElementById('zoomInBtn').addEventListener('click', () => {
      this.canvasView.setZoom(appState.canvas.zoom + 0.1);
    });
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
      this.canvasView.setZoom(appState.canvas.zoom - 0.1);
    });
    document.getElementById('zoomFitBtn').addEventListener('click', () => {
      this.canvasView.centerViewport();
    });
  }

  createStarterDesign() {
    const couplet = createTextLayer('ستاروں سے آگے جہاں اور بھی ہیں\nابھی عشق کے امتحان اور بھی ہیں', {
      name: 'شعرِ اقبال',
      fontSize: 54,
      y: 470,
      gradient: { enabled: true, start: '#f5c97a', end: '#ffffff' },
      stroke: { enabled: true, color: '#000000', width: 5 },
      shadow: { enabled: true, color: 'rgba(0, 0, 0, 0.9)', blur: 20, x: 0, y: 6 },
    });

    createTextLayer('علامہ محمد اقبالؒ', {
      name: 'شاعر کا نام',
      fontSize: 32,
      fontFamily: "'Amiri', serif",
      color: '#f5c97a',
      y: 630,
      stroke: { enabled: true, color: '#000000', width: 3 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 12, x: 0, y: 4 },
    });

    addDecorativeDivider();

    appState.setActiveLayer(couplet.id);
  }

  renderPropertiesInspector() {
    const container = document.getElementById('inspectorPropertiesView');
    if (!container) return;

    if (this.currentTool === 'background') {
      this.renderBackgroundInspector(container);
      return;
    }

    if (this.currentTool === 'calligraphy') {
      this.renderCalligraphyInspector(container);
      return;
    }

    if (this.currentTool === 'shapes') {
      this.renderShapesInspector(container);
      return;
    }

    const activeLayer = appState.getActiveLayer();
    if (!activeLayer) {
      container.innerHTML = `
        <div class="empty-layers-msg">
          <p>${t('noLayerSelected')}</p>
          <button class="btn btn-primary" id="addTextFromInspBtn" style="margin-top:12px;">${t('addTextPrompt')}</button>
        </div>
      `;
      const btn = container.querySelector('#addTextFromInspBtn');
      if (btn) btn.addEventListener('click', () => createTextLayer(i18n.getLanguage() === LANGUAGES.UR ? 'نیا اردو متن' : 'New Urdu Text'));
      return;
    }

    if (activeLayer.type === 'text') {
      this.renderTextInspector(container, activeLayer);
    } else {
      this.renderGenericLayerInspector(container, activeLayer);
    }
  }

  renderTextInspector(container, layer) {
    const alignments = [
      { id: 'right', label: t('propAlignRight') },
      { id: 'center', label: t('propAlignCenter') },
      { id: 'left', label: t('propAlignLeft') }
    ];

    container.innerHTML = `
      <!-- Text Area -->
      <div class="form-group">
        <label class="form-label">
          <span>${t('propUrduTextLabel')}</span>
          <span class="val-tag">${layer.fontFamily.split(',')[0].replace(/'/g, '')}</span>
        </label>
        <textarea class="input-textarea urdu-area" id="propUrduTextInput" rows="3">${layer.text || ''}</textarea>
      </div>

      <!-- Presets / Quick Styles -->
      <div class="form-group">
        <label class="form-label">${t('propPresetsLabel')}</label>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${TEXT_EFFECT_PRESETS.map((p, i) => `
            <button class="btn btn-secondary btn-sm preset-style-btn" data-index="${i}">${p.name}</button>
          `).join('')}
        </div>
      </div>

      <!-- Font Selector -->
      <div class="form-group">
        <label class="form-label">${t('propFontLabel')}</label>
        <select class="input-select" id="propFontFamily">
          ${URDU_FONTS.map(f => `
            <option value="${f.id}" ${layer.fontFamily === f.id ? 'selected' : ''}>${f.name}</option>
          `).join('')}
        </select>
      </div>

      <!-- Font Size Controls: Stepper, Direct Number Input, Expanded Slider & Presets -->
      <div class="form-group">
        <div class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('propFontSizeLabel')}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="number" id="propFontSizeNum" class="input-text-compact" min="14" max="360" value="${layer.fontSize}" style="width:64px; padding:2px 6px; text-align:center; font-weight:700; font-family:monospace; font-size:13px; border-radius:4px; height:26px;">
            <span class="val-tag" id="valFontSize" style="font-size:11px;">${layer.fontSize}px</span>
          </div>
        </div>
        <div class="slider-container" style="margin-top:6px; display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary btn-icon-sm" id="btnFontSizeDec" title="چھوٹا کریں (A-)" style="width:32px; height:32px; font-weight:bold; font-size:16px; flex-shrink:0; padding:0;">−</button>
          <input type="range" id="propFontSize" min="14" max="320" value="${layer.fontSize}" style="flex:1;">
          <button class="btn btn-secondary btn-icon-sm" id="btnFontSizeInc" title="بڑا کریں (A+)" style="width:32px; height:32px; font-weight:bold; font-size:16px; flex-shrink:0; padding:0;">+</button>
        </div>
        <!-- Quick Size Presets -->
        <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-xs preset-size-btn" data-size="32">کوچک 32</button>
          <button class="btn btn-secondary btn-xs preset-size-btn" data-size="48">عام 48</button>
          <button class="btn btn-secondary btn-xs preset-size-btn" data-size="72">بڑا 72</button>
          <button class="btn btn-secondary btn-xs preset-size-btn" data-size="100">جلی 100</button>
          <button class="btn btn-secondary btn-xs preset-size-btn" data-size="140">عنوان 140</button>
        </div>
      </div>

      <!-- Alignment & Color Row -->
      <div class="form-group">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="flex:1;">
            <label class="form-label">${t('propAlignmentLabel')}</label>
            <div class="segmented-control" id="propTextAlign">
              ${alignments.map(a => `
                <button class="segmented-btn ${layer.textAlign === a.id ? 'active' : ''}" data-align="${a.id}">${a.label}</button>
              `).join('')}
            </div>
          </div>
          <div>
            <label class="form-label">${t('propColorLabel')}</label>
            <input type="color" class="color-swatch-input" id="propTextColor" value="${layer.color || '#ffffff'}">
          </div>
        </div>
      </div>

      <!-- Stroke / Outline Section -->
      <div class="tool-section" style="padding: 12px 0;">
        <div class="tool-section-title">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="propStrokeEnabled" ${layer.stroke && layer.stroke.enabled ? 'checked' : ''}>
            <span>${t('propStrokeSection')}</span>
          </label>
          <input type="color" class="color-swatch-input" id="propStrokeColor" value="${layer.stroke ? layer.stroke.color : '#000000'}" style="width:28px; height:28px;">
        </div>
        <div class="form-group" id="strokeWidthGroup" style="${layer.stroke && layer.stroke.enabled ? '' : 'display:none;'}">
          <div class="form-label">
            <span>${t('propStrokeWidthLabel')}</span>
            <span class="val-tag" id="valStrokeWidth">${layer.stroke ? layer.stroke.width : 4}px</span>
          </div>
          <input type="range" id="propStrokeWidth" min="1" max="25" value="${layer.stroke ? layer.stroke.width : 4}">
        </div>
      </div>

      <!-- Drop Shadow Section -->
      <div class="tool-section" style="padding: 12px 0;">
        <div class="tool-section-title">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="propShadowEnabled" ${layer.shadow && layer.shadow.enabled ? 'checked' : ''}>
            <span>${t('propShadowSection')}</span>
          </label>
        </div>
        <div id="shadowControlsGroup" style="${layer.shadow && layer.shadow.enabled ? '' : 'display:none;'}">
          <div class="form-group">
            <div class="form-label">
              <span>${t('propShadowBlurLabel')}</span>
              <span class="val-tag" id="valShadowBlur">${layer.shadow ? layer.shadow.blur : 14}px</span>
            </div>
            <input type="range" id="propShadowBlur" min="0" max="50" value="${layer.shadow ? layer.shadow.blur : 14}">
          </div>
        </div>
      </div>

      <!-- Gradient Fill Section -->
      <div class="tool-section" style="padding: 12px 0;">
        <div class="tool-section-title">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="propGradEnabled" ${layer.gradient && layer.gradient.enabled ? 'checked' : ''}>
            <span>${t('propGradientSection')}</span>
          </label>
        </div>
        <div id="gradControlsGroup" style="${layer.gradient && layer.gradient.enabled ? '' : 'display:none;'}">
          <div style="display:flex; gap:10px; align-items:center;">
            <div>
              <span style="font-size:11px; color:var(--text-secondary);">${t('propGradStart')}</span>
              <input type="color" class="color-swatch-input" id="propGradStart" value="${layer.gradient && layer.gradient.start ? layer.gradient.start : '#f5c97a'}">
            </div>
            <div>
              <span style="font-size:11px; color:var(--text-secondary);">${t('propGradEnd')}</span>
              <input type="color" class="color-swatch-input" id="propGradEnd" value="${layer.gradient && layer.gradient.end ? layer.gradient.end : '#ffffff'}">
            </div>
          </div>
        </div>
      </div>

      <!-- Delete / Duplicate Actions -->
      <div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn btn-secondary" id="propDupBtn" style="flex:1;">${t('propDuplicateBtn')}</button>
        <button class="btn btn-danger" id="propDelBtn">${t('propDeleteBtn')}</button>
      </div>
    `;

    this.bindTextInspectorEvents(layer);
  }

  bindTextInspectorEvents(layer) {
    const txtInput = document.getElementById('propUrduTextInput');
    txtInput.addEventListener('input', (e) => {
      appState.updateLayer(layer.id, { text: e.target.value });
    });

    document.getElementById('propFontFamily').addEventListener('change', (e) => {
      appState.updateLayer(layer.id, { fontFamily: e.target.value });
    });

    const sizeInput = document.getElementById('propFontSize');
    const sizeNum = document.getElementById('propFontSizeNum');
    const sizeLbl = document.getElementById('valFontSize');

    const updateSize = (newVal) => {
      const clamped = Math.max(14, Math.min(360, parseInt(newVal, 10) || 54));
      if (sizeInput) sizeInput.value = clamped;
      if (sizeNum) sizeNum.value = clamped;
      if (sizeLbl) sizeLbl.textContent = clamped + 'px';
      appState.updateLayer(layer.id, { fontSize: clamped });
    };

    if (sizeInput) {
      sizeInput.addEventListener('input', (e) => updateSize(e.target.value));
    }
    if (sizeNum) {
      sizeNum.addEventListener('input', (e) => updateSize(e.target.value));
      sizeNum.addEventListener('change', (e) => updateSize(e.target.value));
    }

    const btnInc = document.getElementById('btnFontSizeInc');
    if (btnInc) {
      btnInc.addEventListener('click', () => {
        const current = parseInt(layer.fontSize || 54, 10);
        updateSize(current + 4);
      });
    }

    const btnDec = document.getElementById('btnFontSizeDec');
    if (btnDec) {
      btnDec.addEventListener('click', () => {
        const current = parseInt(layer.fontSize || 54, 10);
        updateSize(current - 4);
      });
    }

    document.querySelectorAll('.preset-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sz = parseInt(btn.getAttribute('data-size'), 10);
        if (sz) updateSize(sz);
      });
    });

    document.getElementById('propTextAlign').addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-btn');
      if (!btn) return;
      const align = btn.getAttribute('data-align');
      appState.updateLayer(layer.id, { textAlign: align });
      this.renderPropertiesInspector();
    });

    document.getElementById('propTextColor').addEventListener('input', (e) => {
      appState.updateLayer(layer.id, { color: e.target.value });
    });

    const strokeChk = document.getElementById('propStrokeEnabled');
    const strokeWidthGroup = document.getElementById('strokeWidthGroup');
    const strokeColor = document.getElementById('propStrokeColor');
    const strokeWidth = document.getElementById('propStrokeWidth');
    const strokeWidthVal = document.getElementById('valStrokeWidth');

    strokeChk.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      strokeWidthGroup.style.display = enabled ? 'block' : 'none';
      const stroke = layer.stroke || { color: '#000000', width: 4 };
      stroke.enabled = enabled;
      appState.updateLayer(layer.id, { stroke });
    });

    strokeColor.addEventListener('input', (e) => {
      const stroke = layer.stroke || { enabled: true, width: 4 };
      stroke.color = e.target.value;
      appState.updateLayer(layer.id, { stroke });
    });

    strokeWidth.addEventListener('input', (e) => {
      const w = parseInt(e.target.value, 10);
      strokeWidthVal.textContent = w + 'px';
      const stroke = layer.stroke || { enabled: true, color: '#000' };
      stroke.width = w;
      appState.updateLayer(layer.id, { stroke });
    });

    const shadowChk = document.getElementById('propShadowEnabled');
    const shadowControls = document.getElementById('shadowControlsGroup');
    const shadowBlur = document.getElementById('propShadowBlur');
    const shadowBlurVal = document.getElementById('valShadowBlur');

    shadowChk.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      shadowControls.style.display = enabled ? 'block' : 'none';
      const shadow = layer.shadow || { blur: 14, x: 0, y: 6, color: 'rgba(0,0,0,0.85)' };
      shadow.enabled = enabled;
      appState.updateLayer(layer.id, { shadow });
    });

    shadowBlur.addEventListener('input', (e) => {
      const b = parseInt(e.target.value, 10);
      shadowBlurVal.textContent = b + 'px';
      const shadow = layer.shadow || { enabled: true, x: 0, y: 6, color: 'rgba(0,0,0,0.85)' };
      shadow.blur = b;
      appState.updateLayer(layer.id, { shadow });
    });

    const gradChk = document.getElementById('propGradEnabled');
    const gradControls = document.getElementById('gradControlsGroup');
    const gradStart = document.getElementById('propGradStart');
    const gradEnd = document.getElementById('propGradEnd');

    gradChk.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      gradControls.style.display = enabled ? 'block' : 'none';
      const gradient = layer.gradient || { start: '#f5c97a', end: '#ffffff' };
      gradient.enabled = enabled;
      appState.updateLayer(layer.id, { gradient });
    });

    gradStart.addEventListener('input', (e) => {
      const gradient = layer.gradient || { enabled: true, end: '#ffffff' };
      gradient.start = e.target.value;
      appState.updateLayer(layer.id, { gradient });
    });

    gradEnd.addEventListener('input', (e) => {
      const gradient = layer.gradient || { enabled: true, start: '#f5c97a' };
      gradient.end = e.target.value;
      appState.updateLayer(layer.id, { gradient });
    });

    document.querySelectorAll('.preset-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const preset = TEXT_EFFECT_PRESETS[idx];
        if (preset) {
          appState.updateLayer(layer.id, {
            color: preset.color,
            stroke: JSON.parse(JSON.stringify(preset.stroke)),
            shadow: JSON.parse(JSON.stringify(preset.shadow)),
            gradient: JSON.parse(JSON.stringify(preset.gradient)),
          });
          this.renderPropertiesInspector();
        }
      });
    });

    document.getElementById('propDupBtn').addEventListener('click', () => {
      appState.duplicateLayer(layer.id);
    });
    document.getElementById('propDelBtn').addEventListener('click', () => {
      appState.removeLayer(layer.id);
    });
  }

  renderBackgroundInspector(container) {
    const bg = appState.background;
    container.innerHTML = `
      <div class="tool-section-title" style="margin-bottom:16px;">
        <span>${t('bgSettingsTitle')}</span>
      </div>

      <!-- Background Type -->
      <div class="form-group">
        <label class="form-label">${t('bgTypeLabel')}</label>
        <div class="segmented-control" id="bgTypeControl">
          <button class="segmented-btn ${bg.type === 'gradient' ? 'active' : ''}" data-type="gradient">${t('bgTypeGradient')}</button>
          <button class="segmented-btn ${bg.type === 'color' ? 'active' : ''}" data-type="color">${t('bgTypeSolid')}</button>
          <button class="segmented-btn ${bg.type === 'image' ? 'active' : ''}" data-type="image">${t('bgTypeImage')}</button>
        </div>
      </div>

      <!-- Gradient Presets -->
      <div class="form-group" id="bgGradSection" style="${bg.type === 'gradient' ? '' : 'display:none;'}">
        <label class="form-label">${t('bgCuratedGrads')}</label>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${BG_GRADIENTS.map((g, i) => `
            <button class="btn btn-secondary bg-grad-select-btn" data-index="${i}" style="justify-content:flex-start;">
              ✨ ${g.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Solid Color Presets -->
      <div class="form-group" id="bgColorSection" style="${bg.type === 'color' ? '' : 'display:none;'}">
        <label class="form-label">${t('bgSolidPalette')}</label>
        <div class="color-palette-presets" style="margin-bottom:10px;">
          ${BG_SOLID_PALETTES.map(p => `
            <div class="color-preset-dot" data-color="${p.color}" title="${p.name}" style="background:${p.color};"></div>
          `).join('')}
        </div>
        <div class="color-picker-row">
          <span style="font-size:12px; color:var(--text-secondary);">${t('bgCustomColor')}</span>
          <input type="color" class="color-swatch-input" id="bgCustomColor" value="${bg.color}">
        </div>
      </div>

      <!-- Image Upload Section -->
      <div class="form-group" id="bgImageSection" style="${bg.type === 'image' ? '' : 'display:none;'}">
        <label class="form-label">${t('bgUploadLabel')}</label>
        <input type="file" id="bgFileInput" accept="image/*" class="input-text" style="padding:6px;">
      </div>

      <!-- Image Adjustments & Overlay -->
      <div class="tool-section" style="padding: 16px 0;">
        <div class="tool-section-title">
          <span>${t('bgAdjustmentsTitle')}</span>
        </div>

        <div class="form-group">
          <div class="form-label">
            <span>${t('bgOverlayLabel')}</span>
            <span class="val-tag" id="valBgOverlay">${Math.round(bg.overlayOpacity * 100)}%</span>
          </div>
          <input type="range" id="bgOverlaySlider" min="0" max="95" value="${Math.round(bg.overlayOpacity * 100)}">
          <span style="font-size:11px; color:var(--text-muted); margin-top:3px;">
            ${t('bgOverlayNote')}
          </span>
        </div>

        <div class="form-group">
          <div class="form-label">
            <span>${t('bgBlurLabel')}</span>
            <span class="val-tag" id="valBgBlur">${bg.blur}px</span>
          </div>
          <input type="range" id="bgBlurSlider" min="0" max="25" value="${bg.blur}">
        </div>

        <div class="form-group">
          <div class="form-label">
            <span>${t('bgVignetteLabel')}</span>
            <span class="val-tag" id="valBgVignette">${bg.vignette}%</span>
          </div>
          <input type="range" id="bgVignetteSlider" min="0" max="100" value="${bg.vignette}">
        </div>
      </div>
    `;

    this.bindBackgroundInspectorEvents();
  }

  bindBackgroundInspectorEvents() {
    const bg = appState.background;

    const typeCtrl = document.getElementById('bgTypeControl');
    typeCtrl.addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-btn');
      if (!btn) return;
      const type = btn.getAttribute('data-type');
      bg.type = type;
      eventBus.emit('background:changed', bg);
      eventBus.emit('state:modified');
      this.renderPropertiesInspector();
    });

    document.querySelectorAll('.bg-grad-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        bg.type = 'gradient';
        bg.gradient = JSON.parse(JSON.stringify(BG_GRADIENTS[idx]));
        eventBus.emit('background:changed', bg);
        eventBus.emit('state:modified');
      });
    });

    document.querySelectorAll('.color-preset-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        bg.type = 'color';
        bg.color = dot.getAttribute('data-color');
        eventBus.emit('background:changed', bg);
        eventBus.emit('state:modified');
      });
    });

    const customColor = document.getElementById('bgCustomColor');
    if (customColor) {
      customColor.addEventListener('input', (e) => {
        bg.type = 'color';
        bg.color = e.target.value;
        eventBus.emit('background:changed', bg);
        eventBus.emit('state:modified');
      });
    }

    const fileInput = document.getElementById('bgFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleBackgroundImageUpload(e.target.files[0]);
        }
      });
    }

    const overlaySlider = document.getElementById('bgOverlaySlider');
    const overlayVal = document.getElementById('valBgOverlay');
    overlaySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      overlayVal.textContent = val + '%';
      updateBackgroundFilter('overlayOpacity', val / 100);
    });

    const blurSlider = document.getElementById('bgBlurSlider');
    const blurVal = document.getElementById('valBgBlur');
    blurSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      blurVal.textContent = val + 'px';
      updateBackgroundFilter('blur', val);
    });

    const vigSlider = document.getElementById('bgVignetteSlider');
    const vigVal = document.getElementById('valBgVignette');
    vigSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      vigVal.textContent = val + '%';
      updateBackgroundFilter('vignette', val);
    });
  }

  renderCalligraphyInspector(container) {
    container.innerHTML = `
      <div class="tool-section-title" style="margin-bottom:16px;">
        <span>${t('calligraphyTitle')}</span>
      </div>
      <p style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
        ${t('calligraphyDesc')}
      </p>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${CALLIGRAPHY_STAMPS.map(stamp => `
          <button class="btn btn-secondary insert-stamp-btn" data-id="${stamp.id}" style="padding:12px; font-size:16px; font-family:'Amiri', serif; justify-content:space-between;">
            <span>${stamp.text}</span>
            <span style="font-size:11px; color:var(--accent-gold);">${stamp.title}</span>
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.insert-stamp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stampId = btn.getAttribute('data-id');
        const stamp = CALLIGRAPHY_STAMPS.find(s => s.id === stampId);
        if (stamp) {
          addCalligraphyStamp(stamp);
          this.switchTool('text');
        }
      });
    });
  }

  renderShapesInspector(container) {
    container.innerHTML = `
      <div class="tool-section-title" style="margin-bottom:16px;">
        <span>${t('shapesTitle')}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn btn-secondary" id="addDividerBtn" style="padding:14px;">
          ${t('addDividerBtn')}
        </button>

        <button class="btn btn-secondary" id="addFrameBtn" style="padding:14px;">
          ${t('addFrameBtn')}
        </button>

        <button class="btn btn-secondary" id="addRibbonBtn" style="padding:14px;">
          ${t('addRibbonBtn')}
        </button>
      </div>
    `;

    container.querySelector('#addDividerBtn').addEventListener('click', () => {
      addDecorativeDivider();
      this.switchTool('text');
    });

    container.querySelector('#addFrameBtn').addEventListener('click', () => {
      addDecorativeFrame();
      this.switchTool('text');
    });

    container.querySelector('#addRibbonBtn').addEventListener('click', () => {
      addBackdropRibbon();
      this.switchTool('text');
    });
  }

  renderGenericLayerInspector(container, layer) {
    container.innerHTML = `
      <div class="tool-section-title">
        <span>${layer.name}</span>
      </div>

      <div class="form-group">
        <div class="form-label">
          <span>Opacity</span>
          <span class="val-tag">${Math.round(layer.opacity * 100)}%</span>
        </div>
        <input type="range" id="genericOpacity" min="10" max="100" value="${Math.round(layer.opacity * 100)}">
      </div>

      <div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn btn-secondary" id="genDupBtn" style="flex:1;">${t('propDuplicateBtn')}</button>
        <button class="btn btn-danger" id="genDelBtn">${t('propDeleteBtn')}</button>
      </div>
    `;

    document.getElementById('genericOpacity').addEventListener('input', (e) => {
      appState.updateLayer(layer.id, { opacity: parseInt(e.target.value, 10) / 100 });
    });

    document.getElementById('genDupBtn').addEventListener('click', () => appState.duplicateLayer(layer.id));
    document.getElementById('genDelBtn').addEventListener('click', () => appState.removeLayer(layer.id));
  }

  syncPropertiesInputs() {
    const active = appState.getActiveLayer();
    if (!active || active.type !== 'text') return;
    const txtInput = document.getElementById('propUrduTextInput');
    if (txtInput && document.activeElement !== txtInput) {
      txtInput.value = active.text || '';
    }
    const sizeSlider = document.getElementById('propFontSize');
    if (sizeSlider && document.activeElement !== sizeSlider) {
      sizeSlider.value = active.fontSize || 54;
    }
    const sizeNum = document.getElementById('propFontSizeNum');
    if (sizeNum && document.activeElement !== sizeNum) {
      sizeNum.value = active.fontSize || 54;
    }
    const sizeLbl = document.getElementById('valFontSize');
    if (sizeLbl) {
      sizeLbl.textContent = (active.fontSize || 54) + 'px';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new UrduPhotoCraftApp();
  app.init();
});
