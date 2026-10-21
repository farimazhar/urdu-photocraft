/**
 * Layer Management UI Panel with i18n
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';
import { t } from '../../core/i18n.js';

export class LayerPanel {
  constructor(containerEl) {
    this.container = containerEl;
    this.init();
  }

  init() {
    this.render();
    
    eventBus.on('layer:added', () => this.render());
    eventBus.on('layer:removed', () => this.render());
    eventBus.on('layer:selected', () => this.render());
    eventBus.on('layers:reordered', () => this.render());
    eventBus.on('layers:reloaded', () => this.render());
    eventBus.on('layer:updated', () => this.render());
    eventBus.on('language:changed', () => this.render());
  }

  render() {
    if (!this.container) return;

    const layers = [...appState.layers].reverse();
    const activeId = appState.activeLayerId;

    if (layers.length === 0) {
      this.container.innerHTML = `
        <div class="empty-layers-msg">
          <p>${t('emptyLayersMsg')}</p>
        </div>
      `;
      return;
    }

    let html = '<div class="layer-items-list">';
    layers.forEach(layer => {
      const isActive = layer.id === activeId;
      const icon = layer.type === 'text' ? '🔤' : (layer.type === 'shape' ? '🔷' : '✨');
      const name = layer.name || (layer.type === 'text' ? (layer.text.slice(0, 15) || 'متن') : 'عنصر');

      html += `
        <div class="layer-item-row ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''} ${!layer.visible ? 'hidden' : ''}" data-layer-id="${layer.id}">
          <div class="layer-item-main">
            <span class="layer-type-badge">${icon}</span>
            <span class="layer-item-name" title="${name}">${name}</span>
          </div>

          <div class="layer-item-actions">
            <!-- Visibility -->
            <button class="layer-action-btn toggle-vis-btn" title="${t('layerVisToggle')}" data-action="toggle-vis">
              ${layer.visible ? '👁️' : '🙈'}
            </button>
            
            <!-- Lock -->
            <button class="layer-action-btn toggle-lock-btn ${layer.locked ? 'active' : ''}" title="${t('layerLockToggle')}" data-action="toggle-lock">
              ${layer.locked ? '🔒' : '🔓'}
            </button>

            <!-- Move Up -->
            <button class="layer-action-btn" title="${t('layerMoveUp')}" data-action="move-up">▲</button>

            <!-- Move Down -->
            <button class="layer-action-btn" title="${t('layerMoveDown')}" data-action="move-down">▼</button>

            <!-- Duplicate -->
            <button class="layer-action-btn" title="${t('layerDuplicate')}" data-action="duplicate">❐</button>

            <!-- Delete -->
            <button class="layer-action-btn btn-del" title="${t('layerDelete')}" data-action="delete">🗑️</button>
          </div>
        </div>
      `;
    });
    html += '</div>';

    this.container.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.layer-item-row').forEach(row => {
      const layerId = row.getAttribute('data-layer-id');

      row.addEventListener('click', (e) => {
        if (e.target.closest('.layer-action-btn')) return;
        appState.setActiveLayer(layerId);
      });

      row.querySelectorAll('.layer-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const layer = appState.layers.find(l => l.id === layerId);
          if (!layer) return;

          if (action === 'toggle-vis') {
            appState.updateLayer(layerId, { visible: !layer.visible });
          } else if (action === 'toggle-lock') {
            layer.locked = !layer.locked;
            eventBus.emit('layer:updated', layer);
            eventBus.emit('state:modified');
          } else if (action === 'move-up') {
            appState.reorderLayer(layerId, 'up');
          } else if (action === 'move-down') {
            appState.reorderLayer(layerId, 'down');
          } else if (action === 'duplicate') {
            appState.duplicateLayer(layerId);
          } else if (action === 'delete') {
            appState.removeLayer(layerId);
          }
        });
      });
    });
  }
}
