/**
 * Interactive Canvas Viewport Controller
 * Manages natural scrolling, smooth panning, cursor-centered zoom, selection, and drag
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';
import { CanvasRenderer } from './canvas_renderer.js';

export class CanvasView {
  constructor(containerEl, canvasEl) {
    this.container = containerEl;
    this.canvas = canvasEl;
    this.renderer = new CanvasRenderer(canvasEl);

    this.isDraggingLayer = false;
    this.isPanning = false;
    this.spacePressed = false;
    this.hasInitialCentered = false;

    this.mouseStart = { x: 0, y: 0 };
    this.layerStartPos = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.updateCanvasDimensions();
    this.bindEvents();

    // Use ResizeObserver to ensure precision centering as soon as container dimensions are resolved
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 100 && entry.contentRect.height > 100) {
            if (!this.hasInitialCentered) {
              this.hasInitialCentered = true;
              this.centerViewport();
              this.requestRender();
            }
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }

    // Centering timeouts for immediate and font-loaded stabilization
    this.centerViewport();
    setTimeout(() => {
      this.centerViewport();
      this.requestRender();
    }, 80);
    setTimeout(() => {
      this.centerViewport();
      this.requestRender();
    }, 350);

    // Render loop triggered by events
    eventBus.on('state:modified', () => this.requestRender());
    eventBus.on('canvas:request_render', () => this.requestRender());
    eventBus.on('canvas:resize', () => {
      this.updateCanvasDimensions();
      this.centerViewport();
      this.requestRender();
    });
  }

  updateCanvasDimensions() {
    const { width, height } = appState.canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  centerViewport() {
    const containerW = this.container.clientWidth;
    const containerH = this.container.clientHeight;
    if (!containerW || !containerH) return;

    const { width, height } = appState.canvas;

    // Generous padding so canvas sits comfortably centered above the bottom floating zoom bar
    const padX = 100;
    const padY = 130;
    const scaleX = (containerW - padX) / width;
    const scaleY = (containerH - padY) / height;
    const zoom = Math.min(scaleX, scaleY, 0.72);

    appState.canvas.zoom = Math.max(0.15, Math.min(3.0, zoom));
    
    // Perfectly center both horizontally and vertically
    appState.canvas.panX = Math.round((containerW - width * appState.canvas.zoom) / 2);
    appState.canvas.panY = Math.round((containerH - height * appState.canvas.zoom) / 2);

    this.applyTransform();
  }

  applyTransform() {
    const { zoom, panX, panY } = appState.canvas;
    this.canvas.style.transform = "translate3d(" + panX + "px, " + panY + "px, 0) scale(" + zoom + ")";
    this.canvas.style.transformOrigin = '0 0';
    eventBus.emit('viewport:transformed', { zoom, panX, panY });
  }

  setZoom(newZoom, originX = null, originY = null) {
    const oldZoom = appState.canvas.zoom;
    const clampedZoom = Math.max(0.15, Math.min(3.0, newZoom));
    if (Math.abs(oldZoom - clampedZoom) < 0.001) return;

    if (originX === null || originY === null) {
      const containerW = this.container.clientWidth || 800;
      const containerH = this.container.clientHeight || 600;
      originX = containerW / 2;
      originY = containerH / 2;
    }

    const scaleRatio = clampedZoom / oldZoom;
    appState.canvas.panX = Math.round(originX - (originX - appState.canvas.panX) * scaleRatio);
    appState.canvas.panY = Math.round(originY - (originY - appState.canvas.panY) * scaleRatio);
    appState.canvas.zoom = clampedZoom;

    this.applyTransform();
  }

  requestRender() {
    requestAnimationFrame(() => {
      this.renderer.render(appState);
    });
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.centerViewport();
    });

    // Space key for panning
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        this.spacePressed = true;
        this.container.style.cursor = 'grab';
      }
      // Nudge active layer with arrow keys
      const active = appState.getActiveLayer();
      if (active && !e.target.matches('input, textarea')) {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowUp') { active.y -= step; eventBus.emit('state:modified'); }
        if (e.key === 'ArrowDown') { active.y += step; eventBus.emit('state:modified'); }
        if (e.key === 'ArrowLeft') { active.x -= step; eventBus.emit('state:modified'); }
        if (e.key === 'ArrowRight') { active.x += step; eventBus.emit('state:modified'); }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          appState.removeLayer(active.id);
        }
        // Font size shortcuts: Ctrl+] to enlarge, Ctrl+[ to shrink
        if (active.type === 'text') {
          if ((e.ctrlKey || e.metaKey) && (e.key === ']' || e.key === '>')) {
            e.preventDefault();
            active.fontSize = Math.min(360, (active.fontSize || 54) + 4);
            eventBus.emit('layer:updated', active);
            eventBus.emit('state:modified');
            this.requestRender();
          } else if ((e.ctrlKey || e.metaKey) && (e.key === '[' || e.key === '<')) {
            e.preventDefault();
            active.fontSize = Math.max(14, (active.fontSize || 54) - 4);
            eventBus.emit('layer:updated', active);
            eventBus.emit('state:modified');
            this.requestRender();
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        this.container.style.cursor = 'default';
      }
    });

    // ==========================================
    // MOUSE WHEEL: NATURAL SCROLL & ZOOM
    // ==========================================
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Ctrl + Wheel: Zoom centered at cursor position
        const rect = this.container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
        this.setZoom(appState.canvas.zoom + zoomDelta, cursorX, cursorY);
      } else {
        // Normal Wheel: Natural scroll down / up / left / right!
        if (e.shiftKey) {
          appState.canvas.panX -= e.deltaY;
        } else {
          appState.canvas.panY -= e.deltaY;
          if (e.deltaX) {
            appState.canvas.panX -= e.deltaX;
          }
        }
        this.applyTransform();
      }
    }, { passive: false });

    // ==========================================
    // MOUSE DOWN: HANDLE RESIZE / ROTATE / DRAG / PAN
    // ==========================================
    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2 || this.spacePressed) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - appState.canvas.panX, y: e.clientY - appState.canvas.panY };
        this.container.style.cursor = 'grabbing';
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;

      const pt = this.clientToCanvas(e.clientX, e.clientY);

      // 1. Check if clicking on active layer's selection handles or border
      const handleHit = this.hitTestActiveLayerHandles(pt);
      const active = appState.getActiveLayer();

      if (handleHit && active) {
        if (handleHit.handle === 'rot') {
          this.interactionMode = 'rotate';
          this.activeHandle = 'rot';
          this.container.style.cursor = 'grabbing';
        } else {
          this.interactionMode = 'resize';
          this.activeHandle = handleHit.handle;
          const bounds = this.renderer.getLayerLocalBounds(active, 1);
          this.resizeStart = {
            mouseCanvas: pt,
            startLocalX: handleHit.localX,
            startLocalY: handleHit.localY,
            startDist: Math.max(12, Math.hypot(handleHit.localX, handleHit.localY)),
            startFontSize: active.fontSize || 54,
            startWidth: active.width || bounds.width,
            startHeight: active.height || bounds.height,
            layerX: active.x,
            layerY: active.y
          };
          this.container.style.cursor = handleHit.cursor;
        }

        this.renderer.setInteractionState({
          activeHandle: this.activeHandle,
          hoveredHandle: this.activeHandle,
          isResizing: this.interactionMode === 'resize',
          isRotating: this.interactionMode === 'rotate'
        });
        this.requestRender();
        e.preventDefault();
        return;
      }

      // 2. Check if clicking on any layer body
      const clickedLayer = this.hitTest(pt.x, pt.y);

      if (clickedLayer) {
        appState.setActiveLayer(clickedLayer.id);
        this.interactionMode = 'drag-layer';
        this.isDraggingLayer = true;
        this.mouseStart = { x: pt.x, y: pt.y };
        this.layerStartPos = { x: clickedLayer.x, y: clickedLayer.y };
        this.container.style.cursor = 'move';
      } else {
        appState.setActiveLayer(null);
        this.interactionMode = 'pan';
        this.isPanning = true;
        this.panStart = { x: e.clientX - appState.canvas.panX, y: e.clientY - appState.canvas.panY };
        this.container.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      // 1. Viewport Pan
      if (this.isPanning) {
        appState.canvas.panX = Math.round(e.clientX - this.panStart.x);
        appState.canvas.panY = Math.round(e.clientY - this.panStart.y);
        this.applyTransform();
        return;
      }

      // 2. Handle Drag Resizing (Text Font Size or Element Dimension)
      if (this.interactionMode === 'resize') {
        const active = appState.getActiveLayer();
        if (!active || active.locked) return;

        const pt = this.clientToCanvas(e.clientX, e.clientY);
        const dx = pt.x - active.x;
        const dy = pt.y - active.y;
        const rad = -(active.rotation || 0) * Math.PI / 180;
        const currLocalX = (dx * Math.cos(rad) - dy * Math.sin(rad)) / (active.scaleX || 1);
        const currLocalY = (dx * Math.sin(rad) + dy * Math.cos(rad)) / (active.scaleY || 1);

        // Corner handles (tl, tr, bl, br): uniform proportional scaling from center
        if (['tl', 'tr', 'bl', 'br'].includes(this.activeHandle)) {
          const currDist = Math.hypot(currLocalX, currLocalY);
          const ratio = Math.max(0.1, currDist / this.resizeStart.startDist);

          if (active.type === 'text') {
            const newFontSize = Math.round(Math.max(14, Math.min(360, this.resizeStart.startFontSize * ratio)));
            active.fontSize = newFontSize;
          } else {
            active.width = Math.round(Math.max(20, this.resizeStart.startWidth * ratio));
            active.height = Math.round(Math.max(20, this.resizeStart.startHeight * ratio));
          }
        }
        // Horizontal edge handles (ml, mr)
        else if (['ml', 'mr'].includes(this.activeHandle)) {
          const ratioX = Math.max(0.1, Math.abs(currLocalX) / Math.max(10, Math.abs(this.resizeStart.startLocalX)));
          if (active.type === 'text') {
            active.fontSize = Math.round(Math.max(14, Math.min(360, this.resizeStart.startFontSize * ratioX)));
          } else {
            active.width = Math.round(Math.max(20, this.resizeStart.startWidth * ratioX));
          }
        }
        // Vertical edge handles (tc, bc)
        else if (['tc', 'bc'].includes(this.activeHandle)) {
          const ratioY = Math.max(0.1, Math.abs(currLocalY) / Math.max(10, Math.abs(this.resizeStart.startLocalY)));
          if (active.type === 'text') {
            active.fontSize = Math.round(Math.max(14, Math.min(360, this.resizeStart.startFontSize * ratioY)));
          } else {
            active.height = Math.round(Math.max(20, this.resizeStart.startHeight * ratioY));
          }
        }

        this.renderer.setInteractionState({
          activeHandle: this.activeHandle,
          hoveredHandle: this.activeHandle,
          isResizing: true,
          isRotating: false
        });

        eventBus.emit('layer:updated', active);
        this.requestRender();
        return;
      }

      // 3. Rotation Handle Dragging
      if (this.interactionMode === 'rotate') {
        const active = appState.getActiveLayer();
        if (!active || active.locked) return;

        const pt = this.clientToCanvas(e.clientX, e.clientY);
        const angleRad = Math.atan2(pt.y - active.y, pt.x - active.x);
        let degrees = Math.round(angleRad * 180 / Math.PI + 90);

        while (degrees > 180) degrees -= 360;
        while (degrees < -180) degrees += 360;

        // Angle snapping
        if (e.shiftKey) {
          degrees = Math.round(degrees / 15) * 15;
        } else if (Math.abs(degrees) < 4) {
          degrees = 0;
        } else if (Math.abs(degrees - 90) < 4) {
          degrees = 90;
        } else if (Math.abs(degrees + 90) < 4) {
          degrees = -90;
        } else if (Math.abs(degrees - 180) < 4 || Math.abs(degrees + 180) < 4) {
          degrees = 180;
        }

        active.rotation = degrees;

        this.renderer.setInteractionState({
          activeHandle: 'rot',
          hoveredHandle: 'rot',
          isResizing: false,
          isRotating: true
        });

        eventBus.emit('layer:updated', active);
        this.requestRender();
        return;
      }

      // 4. Layer Dragging
      if (this.interactionMode === 'drag-layer' || this.isDraggingLayer) {
        const active = appState.getActiveLayer();
        if (!active || active.locked) return;

        const pt = this.clientToCanvas(e.clientX, e.clientY);
        const dx = pt.x - this.mouseStart.x;
        const dy = pt.y - this.mouseStart.y;

        active.x = Math.round(this.layerStartPos.x + dx);
        active.y = Math.round(this.layerStartPos.y + dy);

        eventBus.emit('layer:updated', active);
        this.requestRender();
        return;
      }

      // 5. Idle Hover: Dynamic Cursors on Handles, Border & Layers
      if (!this.spacePressed) {
        const pt = this.clientToCanvas(e.clientX, e.clientY);
        const handleHit = this.hitTestActiveLayerHandles(pt);

        if (handleHit) {
          this.container.style.cursor = handleHit.cursor;
          if (this.hoveredHandle !== handleHit.handle) {
            this.hoveredHandle = handleHit.handle;
            this.renderer.setInteractionState({ hoveredHandle: this.hoveredHandle });
            this.requestRender();
          }
          return;
        }

        if (this.hoveredHandle !== null) {
          this.hoveredHandle = null;
          this.renderer.setInteractionState(null);
          this.requestRender();
        }

        const hoveredLayer = this.hitTest(pt.x, pt.y);
        if (hoveredLayer) {
          this.container.style.cursor = (hoveredLayer.id === appState.activeLayerId) ? 'move' : 'pointer';
        } else {
          this.container.style.cursor = 'default';
        }
      }
    });

    window.addEventListener('mouseup', () => {
      const wasInteracting = (this.interactionMode === 'resize' || this.interactionMode === 'rotate' || this.isDraggingLayer);
      
      this.interactionMode = null;
      this.activeHandle = null;
      this.isDraggingLayer = false;
      this.renderer.setInteractionState(null);

      if (wasInteracting) {
        eventBus.emit('state:modified');
        this.requestRender();
      }

      if (this.isPanning) {
        this.isPanning = false;
        this.container.style.cursor = this.spacePressed ? 'grab' : 'default';
      }
    });

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.container.addEventListener('dblclick', (e) => {
      if (!e.target.closest('.canvas-element')) {
        this.centerViewport();
      }
    });
  }

  getHandleCursor(handleKey, rotation = 0) {
    if (handleKey === 'rot') return 'grab';

    const baseAngles = {
      tl: 225,
      tr: 315,
      bl: 135,
      br: 45,
      tc: 270,
      bc: 90,
      ml: 180,
      mr: 0
    };

    const baseAngle = baseAngles[handleKey];
    if (baseAngle === undefined) return 'default';

    const netAngle = ((baseAngle + rotation) % 360 + 360) % 360;

    if ((netAngle >= 337.5 || netAngle < 22.5) || (netAngle >= 157.5 && netAngle < 202.5)) {
      return 'ew-resize';
    } else if ((netAngle >= 22.5 && netAngle < 67.5) || (netAngle >= 202.5 && netAngle < 247.5)) {
      return 'nwse-resize';
    } else if ((netAngle >= 67.5 && netAngle < 112.5) || (netAngle >= 247.5 && netAngle < 292.5)) {
      return 'ns-resize';
    } else {
      return 'nesw-resize';
    }
  }

  hitTestActiveLayerHandles(pt) {
    const active = appState.getActiveLayer();
    if (!active || !active.visible || active.locked) return null;

    const metrics = this.renderer.getLayerHandleMetrics(active, 1);
    const { corners, edges, rot, bx, by, bw, bh } = metrics;

    const dx = pt.x - active.x;
    const dy = pt.y - active.y;
    const rad = -(active.rotation || 0) * Math.PI / 180;
    const localX = (dx * Math.cos(rad) - dy * Math.sin(rad)) / (active.scaleX || 1);
    const localY = (dx * Math.sin(rad) + dy * Math.cos(rad)) / (active.scaleY || 1);

    const zoom = appState.canvas.zoom || 1;
    const handleHitRadius = Math.max(14, 16 / zoom);

    // 1. Top Rotation Handle
    if (Math.hypot(localX - rot.x, localY - rot.y) <= handleHitRadius + 4) {
      return { handle: 'rot', cursor: 'grab', localX, localY };
    }

    // 2. Corner Handles
    for (const [key, c] of Object.entries(corners)) {
      if (Math.hypot(localX - c.x, localY - c.y) <= handleHitRadius) {
        return {
          handle: key,
          cursor: this.getHandleCursor(key, active.rotation || 0),
          localX,
          localY
        };
      }
    }

    // 3. Edge Midpoint Handles
    for (const [key, e] of Object.entries(edges)) {
      if (Math.hypot(localX - e.x, localY - e.y) <= handleHitRadius) {
        return {
          handle: key,
          cursor: this.getHandleCursor(key, active.rotation || 0),
          localX,
          localY
        };
      }
    }

    // 4. Border Lines (Tolerance around rectangle boundary)
    const borderTolerance = Math.max(7, 8 / zoom);
    const nearLeft = Math.abs(localX - bx) <= borderTolerance && localY >= by && localY <= by + bh;
    const nearRight = Math.abs(localX - (bx + bw)) <= borderTolerance && localY >= by && localY <= by + bh;
    const nearTop = Math.abs(localY - by) <= borderTolerance && localX >= bx && localX <= bx + bw;
    const nearBottom = Math.abs(localY - (by + bh)) <= borderTolerance && localX >= bx && localX <= bx + bw;

    if (nearLeft) return { handle: 'ml', cursor: this.getHandleCursor('ml', active.rotation || 0), localX, localY };
    if (nearRight) return { handle: 'mr', cursor: this.getHandleCursor('mr', active.rotation || 0), localX, localY };
    if (nearTop) return { handle: 'tc', cursor: this.getHandleCursor('tc', active.rotation || 0), localX, localY };
    if (nearBottom) return { handle: 'bc', cursor: this.getHandleCursor('bc', active.rotation || 0), localX, localY };

    return null;
  }

  clientToCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const { zoom } = appState.canvas;
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  }

  hitTest(x, y) {
    const layers = [...appState.layers].reverse();
    for (const layer of layers) {
      if (!layer.visible || layer.locked) continue;
      const bounds = this.renderer.getLayerLocalBounds(layer);
      
      const dx = x - layer.x;
      const dy = y - layer.y;
      const rad = -(layer.rotation || 0) * Math.PI / 180;
      const localX = (dx * Math.cos(rad) - dy * Math.sin(rad)) / (layer.scaleX || 1);
      const localY = (dx * Math.sin(rad) + dy * Math.cos(rad)) / (layer.scaleY || 1);

      const pad = 15;
      if (
        localX >= bounds.x - pad &&
        localX <= bounds.x + bounds.width + pad &&
        localY >= bounds.y - pad &&
        localY <= bounds.y + bounds.height + pad
      ) {
        return layer;
      }
    }
    return null;
  }
}
