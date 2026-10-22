/**
 * High-Performance High-DPI Canvas Rendering Engine
 */
export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(state, options = {}) {
    const { canvas: cvsState, background, layers, activeLayerId } = state;
    const showSelection = options.showSelection !== false;
    const exportScale = options.exportScale || 1;

    const ctx = this.ctx;
    const width = cvsState.width * exportScale;
    const height = cvsState.height * exportScale;

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 1. Draw Background
    this.drawBackground(ctx, background, width, height, exportScale);

    // 2. Draw Layers in order
    layers.forEach(layer => {
      if (!layer.visible) return;
      ctx.save();

      // Transform Layer
      const lx = layer.x * exportScale;
      const ly = layer.y * exportScale;
      ctx.translate(lx, ly);
      ctx.rotate((layer.rotation || 0) * Math.PI / 180);
      ctx.scale(layer.scaleX || 1, layer.scaleY || 1);
      ctx.globalAlpha = (layer.opacity !== undefined ? layer.opacity : 1);

      if (layer.type === 'text') {
        this.drawTextLayer(ctx, layer, exportScale);
      } else if (layer.type === 'sticker') {
        this.drawStickerLayer(ctx, layer, exportScale);
      } else if (layer.type === 'shape') {
        this.drawShapeLayer(ctx, layer, exportScale);
      }

      ctx.restore();
    });

    // 3. Draw Active Layer Selection Handles (Only during interactive editing)
    if (showSelection && activeLayerId) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer && activeLayer.visible) {
        this.drawSelectionHandles(ctx, activeLayer, exportScale);
      }
    }
  }

  drawBackground(ctx, bg, width, height, scale) {
    ctx.save();

    if (bg.type === 'color') {
      ctx.fillStyle = bg.color || '#0b0f19';
      ctx.fillRect(0, 0, width, height);
    } else if (bg.type === 'gradient' && bg.gradient) {
      const grad = bg.gradient;
      let canvasGrad;
      if (grad.type === 'radial') {
        canvasGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.5);
      } else {
        const rad = (grad.angle || 135) * Math.PI / 180;
        const x1 = width / 2 - Math.cos(rad) * width / 2;
        const y1 = height / 2 - Math.sin(rad) * height / 2;
        const x2 = width / 2 + Math.cos(rad) * width / 2;
        const y2 = height / 2 + Math.sin(rad) * height / 2;
        canvasGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      }

      grad.stops.forEach(s => canvasGrad.addColorStop(s.offset, s.color));
      ctx.fillStyle = canvasGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (bg.type === 'image' && bg.imageElement) {
      // Draw background image cover
      const img = bg.imageElement;
      const imgAspect = img.width / img.height;
      const cvsAspect = width / height;
      let dw, dh, dx, dy;

      if (imgAspect > cvsAspect) {
        dh = height;
        dw = height * imgAspect;
        dx = (width - dw) / 2;
        dy = 0;
      } else {
        dw = width;
        dh = width / imgAspect;
        dx = 0;
        dy = (height - dh) / 2;
      }

      ctx.filter = `blur(${bg.blur * scale}px) brightness(${bg.brightness}%) contrast(${bg.contrast}%)`;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    // Vignette
    if (bg.vignette > 0) {
      const vigRadius = Math.max(width, height) * 0.75;
      const vigGrad = ctx.createRadialGradient(width / 2, height / 2, vigRadius * 0.4, width / 2, height / 2, vigRadius);
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${bg.vignette / 100 * 0.8})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Darkness Overlay (Crucial for Urdu poetry readability)
    if (bg.overlayOpacity > 0) {
      ctx.fillStyle = bg.overlayColor || '#000000';
      ctx.globalAlpha = bg.overlayOpacity;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  drawTextLayer(ctx, layer, scale) {
    const fontSize = (layer.fontSize || 54) * scale;
    const fontFamily = layer.fontFamily || "'Noto Nastaliq Urdu', serif";
    const fontWeight = layer.fontWeight || 'bold';
    const textAlign = layer.textAlign || 'center';
    const lineHeight = (layer.lineHeight || 1.8) * fontSize;
    const text = layer.text || 'اردو فوٹو کرافٹ';
    const lines = text.split('\n');

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const totalHeight = lines.length * lineHeight;
    const startY = -totalHeight / 2 + lineHeight / 2;

    // Optional Ribbon / Background Box behind text
    if (layer.bgBox && layer.bgBox.enabled) {
      ctx.save();
      ctx.fillStyle = layer.bgBox.color || 'rgba(0, 0, 0, 0.6)';
      const padding = (layer.bgBox.padding || 16) * scale;
      const radius = (layer.bgBox.radius || 12) * scale;

      // Measure widest line
      let maxLineWidth = 0;
      lines.forEach(line => {
        const w = ctx.measureText(line).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });

      const boxW = maxLineWidth + padding * 2;
      const boxH = totalHeight + padding * 2;
      const boxX = -boxW / 2;
      const boxY = -boxH / 2;

      this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
      ctx.fill();
      ctx.restore();
    }

    lines.forEach((line, i) => {
      const y = startY + (i * lineHeight);

      // Shadow
      if (layer.shadow && layer.shadow.enabled) {
        ctx.save();
        ctx.shadowColor = layer.shadow.color || 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = (layer.shadow.blur || 12) * scale;
        ctx.shadowOffsetX = (layer.shadow.x || 0) * scale;
        ctx.shadowOffsetY = (layer.shadow.y || 4) * scale;
      }

      // Stroke / Outline
      if (layer.stroke && layer.stroke.enabled) {
        ctx.lineWidth = (layer.stroke.width || 4) * scale;
        ctx.strokeStyle = layer.stroke.color || '#000000';
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, 0, y);
      }

      // Fill (Solid or Gradient)
      if (layer.gradient && layer.gradient.enabled) {
        const textWidth = ctx.measureText(line).width;
        const grad = ctx.createLinearGradient(-textWidth / 2, 0, textWidth / 2, 0);
        grad.addColorStop(0, layer.gradient.start || '#f5c97a');
        grad.addColorStop(1, layer.gradient.end || '#ffffff');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = layer.color || '#ffffff';
      }

      ctx.fillText(line, 0, y);

      if (layer.shadow && layer.shadow.enabled) {
        ctx.restore();
      }
    });
  }

  drawStickerLayer(ctx, layer, scale) {
    if (layer.svgImage && layer.svgImage.complete) {
      const w = (layer.width || 200) * scale;
      const h = (layer.height || 100) * scale;
      ctx.drawImage(layer.svgImage, -w / 2, -h / 2, w, h);
    } else if (layer.renderCalligraphy) {
      layer.renderCalligraphy(ctx, layer, scale);
    }
  }

  drawShapeLayer(ctx, layer, scale) {
    const w = (layer.width || 300) * scale;
    const h = (layer.height || 60) * scale;
    const radius = (layer.radius || 10) * scale;

    ctx.save();
    if (layer.shapeType === 'divider') {
      ctx.strokeStyle = layer.color || '#f5c97a';
      ctx.lineWidth = (layer.strokeWidth || 3) * scale;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();

      // Middle Diamond ornament
      ctx.fillStyle = layer.color || '#f5c97a';
      ctx.beginPath();
      ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (layer.shapeType === 'frame') {
      ctx.strokeStyle = layer.color || 'rgba(245, 201, 122, 0.5)';
      ctx.lineWidth = (layer.strokeWidth || 4) * scale;
      this.roundRect(ctx, -w / 2, -h / 2, w, h, radius);
      ctx.stroke();
    } else {
      ctx.fillStyle = layer.color || 'rgba(0, 0, 0, 0.5)';
      this.roundRect(ctx, -w / 2, -h / 2, w, h, radius);
      ctx.fill();
      if (layer.borderColor) {
        ctx.strokeStyle = layer.borderColor;
        ctx.lineWidth = (layer.borderWidth || 2) * scale;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  getLayerHandleMetrics(layer, scale = 1) {
    const bounds = this.getLayerLocalBounds(layer, scale);
    const pad = 12 * scale;
    const bx = bounds.x - pad;
    const by = bounds.y - pad;
    const bw = bounds.width + pad * 2;
    const bh = bounds.height + pad * 2;
    const rotDist = 28 * scale;

    return {
      bounds,
      pad,
      bx,
      by,
      bw,
      bh,
      corners: {
        tl: { x: bx, y: by },
        tr: { x: bx + bw, y: by },
        bl: { x: bx, y: by + bh },
        br: { x: bx + bw, y: by + bh }
      },
      edges: {
        tc: { x: bx + bw / 2, y: by },
        bc: { x: bx + bw / 2, y: by + bh },
        ml: { x: bx, y: by + bh / 2 },
        mr: { x: bx + bw, y: by + bh / 2 }
      },
      rot: { x: bx + bw / 2, y: by - rotDist }
    };
  }

  setInteractionState(state) {
    this.interactionState = state;
  }

  drawSelectionHandles(ctx, layer, scale) {
    ctx.save();
    const lx = layer.x * scale;
    const ly = layer.y * scale;
    ctx.translate(lx, ly);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);

    const metrics = this.getLayerHandleMetrics(layer, scale);
    const { bx, by, bw, bh, corners, edges, rot } = metrics;
    const interaction = this.interactionState || {};

    // 1. Selection border with soft glow
    ctx.shadowColor = 'rgba(14, 165, 233, 0.4)';
    ctx.shadowBlur = 6 * scale;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // 2. Rotation connector & handle at Top
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(bx + bw / 2, by);
    ctx.lineTo(rot.x, rot.y);
    ctx.stroke();

    const isRotHover = interaction.hoveredHandle === 'rot' || interaction.activeHandle === 'rot';
    const rotRadius = (isRotHover ? 8 : 6.5) * scale;
    ctx.fillStyle = isRotHover ? '#38bdf8' : '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(rot.x, rot.y, rotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Corner Handles (Primary proportional resizers)
    const baseHandleSize = 11 * scale;
    Object.entries(corners).forEach(([key, pt]) => {
      const isHover = interaction.hoveredHandle === key || interaction.activeHandle === key;
      const size = (isHover ? baseHandleSize + 3 * scale : baseHandleSize);
      ctx.fillStyle = isHover ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2 * scale;
      ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
      ctx.strokeRect(pt.x - size / 2, pt.y - size / 2, size, size);
    });

    // 4. Edge Midpoint Handles (Horizontal & Vertical pills)
    Object.entries(edges).forEach(([key, pt]) => {
      const isHover = interaction.hoveredHandle === key || interaction.activeHandle === key;
      ctx.fillStyle = isHover ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5 * scale;
      const isHoriz = (key === 'tc' || key === 'bc');
      const w = (isHoriz ? 14 : 7) * scale;
      const h = (isHoriz ? 7 : 14) * scale;
      ctx.beginPath();
      this.roundRect(ctx, pt.x - w / 2, pt.y - h / 2, w, h, 2 * scale);
      ctx.fill();
      ctx.stroke();
    });

    // 5. Live Dimension / Font Size Badge during drag
    if (interaction.isResizing || interaction.isRotating) {
      let badgeText = '';
      if (interaction.isRotating) {
        badgeText = `${Math.round(layer.rotation || 0)}°`;
      } else if (layer.type === 'text') {
        badgeText = `${Math.round(layer.fontSize || 54)}px`;
      } else {
        badgeText = `${Math.round(bw)} × ${Math.round(bh)}`;
      }

      ctx.save();
      ctx.font = `bold ${12 * scale}px system-ui, sans-serif`;
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = textWidth + 14 * scale;
      const badgeH = 22 * scale;
      const badgeX = -badgeW / 2;
      const badgeY = by - 36 * scale;

      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8 * scale;
      ctx.beginPath();
      this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6 * scale);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, badgeY + badgeH / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  getLayerLocalBounds(layer, scale = 1) {
    if (layer.type === 'text') {
      const fontSize = (layer.fontSize || 54) * scale;
      const fontFamily = layer.fontFamily || "'Noto Nastaliq Urdu', serif";
      const fontWeight = layer.fontWeight || 'bold';
      const lineHeight = (layer.lineHeight || 1.8) * fontSize;
      const lines = (layer.text || 'اردو').split('\n');

      this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      let maxWidth = 0;
      lines.forEach(l => {
        const w = this.ctx.measureText(l).width;
        if (w > maxWidth) maxWidth = w;
      });

      const totalH = lines.length * lineHeight;
      return {
        x: -maxWidth / 2,
        y: -totalH / 2,
        width: maxWidth || 100,
        height: totalH || 50
      };
    } else {
      const w = (layer.width || 200) * scale;
      const h = (layer.height || 100) * scale;
      return {
        x: -w / 2,
        y: -h / 2,
        width: w,
        height: h
      };
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
