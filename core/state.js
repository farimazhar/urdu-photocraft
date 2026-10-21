/**
 * Urdu PhotoCraft - Central Application State
 */
import { eventBus } from './event_bus.js';

export class AppState {
  constructor() {
    this.canvas = {
      width: 1080,
      height: 1080,
      aspectRatio: '1:1',
      zoom: 1,
      panX: 0,
      panY: 0,
    };

    this.background = {
      type: 'gradient', // 'color', 'gradient', 'image'
      color: '#0f172a',
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { color: '#090d16', offset: 0 },
          { color: '#162238', offset: 0.5 },
          { color: '#0d131f', offset: 1.0 }
        ]
      },
      image: null,
      imageElement: null,
      blur: 0,
      brightness: 100,
      contrast: 100,
      vignette: 20,
      overlayColor: '#000000',
      overlayOpacity: 0.35,
    };

    this.layers = [];
    this.activeLayerId = null;
    this.nextLayerId = 1;
  }

  addLayer(layerData) {
    const id = 'layer_' + Date.now() + '_' + (this.nextLayerId++);
    const newLayer = {
      id,
      name: layerData.name || 'نیا عنصر',
      type: layerData.type || 'text', // 'text', 'sticker', 'shape'
      x: layerData.x !== undefined ? layerData.x : this.canvas.width / 2,
      y: layerData.y !== undefined ? layerData.y : this.canvas.height / 2,
      rotation: layerData.rotation || 0,
      scaleX: layerData.scaleX || 1,
      scaleY: layerData.scaleY || 1,
      opacity: layerData.opacity !== undefined ? layerData.opacity : 1,
      visible: layerData.visible !== undefined ? layerData.visible : true,
      locked: layerData.locked || false,
      ...layerData,
    };

    this.layers.push(newLayer);
    this.activeLayerId = id;
    eventBus.emit('layer:added', newLayer);
    eventBus.emit('layer:selected', newLayer);
    eventBus.emit('state:modified');
    return newLayer;
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId) || null;
  }

  setActiveLayer(id) {
    if (this.activeLayerId === id) return;
    this.activeLayerId = id;
    const active = this.getActiveLayer();
    eventBus.emit('layer:selected', active);
    eventBus.emit('state:modified');
  }

  updateLayer(id, updates) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer || layer.locked) return;
    Object.assign(layer, updates);
    eventBus.emit('layer:updated', layer);
    eventBus.emit('state:modified');
  }

  removeLayer(id) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    const [removed] = this.layers.splice(idx, 1);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers.length > 0 ? this.layers[this.layers.length - 1].id : null;
    }
    eventBus.emit('layer:removed', removed);
    eventBus.emit('layer:selected', this.getActiveLayer());
    eventBus.emit('state:modified');
  }

  reorderLayer(id, direction) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    
    if (direction === 'up' && idx < this.layers.length - 1) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx + 1];
      this.layers[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx - 1];
      this.layers[idx - 1] = temp;
    } else if (direction === 'top') {
      const [layer] = this.layers.splice(idx, 1);
      this.layers.push(layer);
    } else if (direction === 'bottom') {
      const [layer] = this.layers.splice(idx, 1);
      this.layers.unshift(layer);
    }
    eventBus.emit('layers:reordered', this.layers);
    eventBus.emit('state:modified');
  }

  duplicateLayer(id) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;
    const clone = JSON.parse(JSON.stringify(layer));
    clone.id = 'layer_' + Date.now() + '_' + (this.nextLayerId++);
    clone.name = (clone.name || 'عنصر') + ' (نقل)';
    clone.x += 30;
    clone.y += 30;
    this.layers.push(clone);
    this.activeLayerId = clone.id;
    eventBus.emit('layer:added', clone);
    eventBus.emit('layer:selected', clone);
    eventBus.emit('state:modified');
    return clone;
  }

  serialize() {
    return {
      canvas: { ...this.canvas },
      background: {
        type: this.background.type,
        color: this.background.color,
        gradient: this.background.gradient,
        image: this.background.image,
        blur: this.background.blur,
        brightness: this.background.brightness,
        contrast: this.background.contrast,
        vignette: this.background.vignette,
        overlayColor: this.background.overlayColor,
        overlayOpacity: this.background.overlayOpacity,
      },
      layers: JSON.parse(JSON.stringify(this.layers)),
      activeLayerId: this.activeLayerId
    };
  }

  restore(data) {
    if (!data) return;
    this.canvas.width = data.canvas.width;
    this.canvas.height = data.canvas.height;
    this.canvas.aspectRatio = data.canvas.aspectRatio;
    
    Object.assign(this.background, data.background);
    if (this.background.image && !this.background.imageElement) {
      const img = new Image();
      img.src = this.background.image;
      img.onload = () => {
        this.background.imageElement = img;
        eventBus.emit('canvas:request_render');
      };
    }
    
    this.layers = data.layers || [];
    this.activeLayerId = data.activeLayerId;
    eventBus.emit('layers:reloaded', this.layers);
    eventBus.emit('layer:selected', this.getActiveLayer());
    eventBus.emit('canvas:request_render');
  }
}

export const appState = new AppState();
