/**
 * Professional High-Resolution Export Modal with i18n
 */
import { appState } from '../../core/state.js';
import { CanvasRenderer } from '../canvas/canvas_renderer.js';
import { copyCanvasToClipboard } from './clipboard_helper.js';
import { t } from '../../core/i18n.js';
import { eventBus } from '../../core/event_bus.js';

export class ExportModal {
  constructor() {
    this.modalEl = null;
    this.exportScale = 1;
    this.exportFormat = 'image/png';
    this.exportQuality = 0.95;
  }

  init() {
    this.createModalDOM();
    this.bindEvents();

    eventBus.on('language:changed', () => {
      this.updateStaticLabels();
    });
  }

  createModalDOM() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'exportModal';

    backdrop.innerHTML = `
      <div class="modal-dialog export-dialog">
        <div class="modal-header">
          <div class="modal-title">
            <span id="expModalTitleLabel">${t('exportModalTitle')}</span>
          </div>
          <button class="btn-icon" id="closeExportModalBtn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" id="expFmtLabel">${t('exportFormatLabel')}</label>
            <div class="segmented-control" id="exportFormatControl">
              <button class="segmented-btn active" data-fmt="image/png" id="expPngBtn">${t('exportFormatPng')}</button>
              <button class="segmented-btn" data-fmt="image/jpeg" id="expJpgBtn">${t('exportFormatJpg')}</button>
              <button class="segmented-btn" data-fmt="image/webp" id="expWebpBtn">${t('exportFormatWebp')}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span id="expResLabel">${t('exportResolutionLabel')}</span>
              <span class="val-tag" id="exportResolutionLabel">1080 x 1080 px</span>
            </label>
            <div class="segmented-control" id="exportScaleControl">
              <button class="segmented-btn active" data-scale="1" id="expScale1Btn">${t('exportScale1x')}</button>
              <button class="segmented-btn" data-scale="2" id="expScale2Btn">${t('exportScale2x')}</button>
              <button class="segmented-btn" data-scale="3" id="expScale3Btn">${t('exportScale3x')}</button>
            </div>
          </div>

          <div class="export-preview-box">
            <div class="export-stat-item">
              <span class="stat-lbl" id="expCurSizeLabel">${t('exportCanvasSize')}</span>
              <span class="stat-val" id="expCurrentSize">1080 x 1080</span>
            </div>
            <div class="export-stat-item">
              <span class="stat-lbl" id="expFinSizeLabel">${t('exportFinalSize')}</span>
              <span class="stat-val" id="expFinalSize">1080 x 1080 px (1x)</span>
            </div>
          </div>

          <div id="exportStatusMsg" class="export-status-banner" style="display:none;"></div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="copyClipboardBtn">${t('exportClipboardBtn')}</button>
          <button class="btn btn-primary" id="downloadImageBtn">${t('exportDownloadBtn')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  updateStaticLabels() {
    if (!this.modalEl) return;
    const title = this.modalEl.querySelector('#expModalTitleLabel');
    const fmt = this.modalEl.querySelector('#expFmtLabel');
    const png = this.modalEl.querySelector('#expPngBtn');
    const jpg = this.modalEl.querySelector('#expJpgBtn');
    const webp = this.modalEl.querySelector('#expWebpBtn');
    const res = this.modalEl.querySelector('#expResLabel');
    const s1 = this.modalEl.querySelector('#expScale1Btn');
    const s2 = this.modalEl.querySelector('#expScale2Btn');
    const s3 = this.modalEl.querySelector('#expScale3Btn');
    const cSize = this.modalEl.querySelector('#expCurSizeLabel');
    const fSize = this.modalEl.querySelector('#expFinSizeLabel');
    const copy = this.modalEl.querySelector('#copyClipboardBtn');
    const dl = this.modalEl.querySelector('#downloadImageBtn');

    if (title) title.textContent = t('exportModalTitle');
    if (fmt) fmt.textContent = t('exportFormatLabel');
    if (png) png.textContent = t('exportFormatPng');
    if (jpg) jpg.textContent = t('exportFormatJpg');
    if (webp) webp.textContent = t('exportFormatWebp');
    if (res) res.textContent = t('exportResolutionLabel');
    if (s1) s1.textContent = t('exportScale1x');
    if (s2) s2.textContent = t('exportScale2x');
    if (s3) s3.textContent = t('exportScale3x');
    if (cSize) cSize.textContent = t('exportCanvasSize');
    if (fSize) fSize.textContent = t('exportFinalSize');
    if (copy) copy.textContent = t('exportClipboardBtn');
    if (dl) dl.textContent = t('exportDownloadBtn');
    this.updateMetrics();
  }

  updateMetrics() {
    const { width, height } = appState.canvas;
    const finalW = width * this.exportScale;
    const finalH = height * this.exportScale;

    const label = this.modalEl.querySelector('#exportResolutionLabel');
    const curSize = this.modalEl.querySelector('#expCurrentSize');
    const finSize = this.modalEl.querySelector('#expFinalSize');

    if (label) label.textContent = `${finalW} x ${finalH} px`;
    if (curSize) curSize.textContent = `${width} x ${height} px`;
    if (finSize) finSize.textContent = `${finalW} x ${finalH} px (${this.exportScale}x)`;
  }

  renderOffscreenCanvas() {
    const { width, height } = appState.canvas;
    const offscreen = document.createElement('canvas');
    offscreen.width = width * this.exportScale;
    offscreen.height = height * this.exportScale;

    const renderer = new CanvasRenderer(offscreen);
    renderer.render(appState, {
      showSelection: false,
      exportScale: this.exportScale
    });

    return offscreen;
  }

  bindEvents() {
    this.modalEl.querySelector('#closeExportModalBtn').addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const fmtCtrl = this.modalEl.querySelector('#exportFormatControl');
    fmtCtrl.addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-btn');
      if (!btn) return;
      fmtCtrl.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.exportFormat = btn.getAttribute('data-fmt');
    });

    const scaleCtrl = this.modalEl.querySelector('#exportScaleControl');
    scaleCtrl.addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-btn');
      if (!btn) return;
      scaleCtrl.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.exportScale = parseFloat(btn.getAttribute('data-scale')) || 1;
      this.updateMetrics();
    });

    const downloadBtn = this.modalEl.querySelector('#downloadImageBtn');
    downloadBtn.addEventListener('click', () => {
      this.download();
    });

    const copyBtn = this.modalEl.querySelector('#copyClipboardBtn');
    copyBtn.addEventListener('click', async () => {
      const status = this.modalEl.querySelector('#exportStatusMsg');
      try {
        const offscreen = this.renderOffscreenCanvas();
        await copyCanvasToClipboard(offscreen);
        status.style.display = 'block';
        status.className = 'export-status-banner success';
        status.textContent = t('clipboardSuccess');
        setTimeout(() => { status.style.display = 'none'; }, 4000);
      } catch (err) {
        status.style.display = 'block';
        status.className = 'export-status-banner error';
        status.textContent = t('clipboardError') + err.message;
      }
    });
  }

  download() {
    const offscreen = this.renderOffscreenCanvas();
    const ext = this.exportFormat === 'image/jpeg' ? 'jpg' : (this.exportFormat === 'image/webp' ? 'webp' : 'png');
    const filename = `urdu-photocraft-${Date.now()}.${ext}`;

    const dataUrl = offscreen.toDataURL(this.exportFormat, this.exportQuality);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    const status = this.modalEl.querySelector('#exportStatusMsg');
    status.style.display = 'block';
    status.className = 'export-status-banner success';
    status.textContent = t('downloadSuccess') + ' (' + filename + ')';
    setTimeout(() => { 
      status.style.display = 'none';
      this.close();
    }, 2000);
  }

  open() {
    this.updateStaticLabels();
    this.updateMetrics();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
