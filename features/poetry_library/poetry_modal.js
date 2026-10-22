/**
 * Urdu Poetry Library Modal Controller with i18n
 */
import { POETRY_CATEGORIES, POETRY_DATABASE } from './poetry_data.js';
import { createTextLayer } from '../text_editor/text_layer.js';
import { t, i18n } from '../../core/i18n.js';
import { eventBus } from '../../core/event_bus.js';

export class PoetryModal {
  constructor() {
    this.modalEl = null;
    this.activeCategory = 'all';
    this.searchQuery = '';
  }

  init() {
    this.createModalDOM();
    this.renderCards();
    this.bindEvents();

    eventBus.on('language:changed', () => {
      this.updateStaticLabels();
      this.renderCards();
    });
  }

  createModalDOM() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'poetryLibraryModal';

    backdrop.innerHTML = `
      <div class="modal-dialog poetry-dialog">
        <div class="modal-header">
          <div class="modal-title">
            <span id="poetryModalTitleLabel">${t('poetryModalTitle')}</span>
          </div>
          <button class="btn-icon" id="closePoetryModalBtn">&times;</button>
        </div>
        
        <div class="poetry-filter-bar">
          <div class="poetry-search-wrap">
            <input type="text" class="input-text" id="poetrySearchInput" placeholder="${t('poetrySearchPlaceholder')}">
          </div>
          <div class="poetry-categories" id="poetryCategoryTabs">
            ${POETRY_CATEGORIES.map(c => `
              <button class="cat-pill ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>
            `).join('')}
          </div>
        </div>

        <div class="modal-body poetry-cards-container" id="poetryCardsList">
          <!-- Cards rendered here -->
        </div>

        <div class="modal-footer">
          <span id="poetryFooterTipLabel" style="font-size:12px; color:var(--text-secondary); margin-inline-end:auto;">${t('poetryFooterTip')}</span>
          <button class="btn btn-secondary" id="closePoetryModalFooterBtn">${t('modalCloseBtn')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  updateStaticLabels() {
    if (!this.modalEl) return;
    const title = this.modalEl.querySelector('#poetryModalTitleLabel');
    const search = this.modalEl.querySelector('#poetrySearchInput');
    const footerTip = this.modalEl.querySelector('#poetryFooterTipLabel');
    const closeBtn = this.modalEl.querySelector('#closePoetryModalFooterBtn');

    if (title) title.textContent = t('poetryModalTitle');
    if (search) search.placeholder = t('poetrySearchPlaceholder');
    if (footerTip) footerTip.textContent = t('poetryFooterTip');
    if (closeBtn) closeBtn.textContent = t('modalCloseBtn');
  }

  renderCards() {
    const listEl = this.modalEl.querySelector('#poetryCardsList');
    if (!listEl) return;

    const filtered = POETRY_DATABASE.filter(item => {
      const matchCat = this.activeCategory === 'all' || item.category === this.activeCategory;
      const q = this.searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        item.text.toLowerCase().includes(q) || 
        item.poet.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="poetry-empty-state">
          <p>${t('poetryEmptyMsg')}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map((item, idx) => `
      <div class="poetry-card" data-index="${idx}">
        <div class="poetry-card-header">
          <span class="poet-badge">${item.poet}</span>
        </div>
        <div class="poetry-card-text">${item.text.replace(/\\n/g, '<br>')}</div>
        <div class="poetry-card-actions">
          <button class="btn btn-primary btn-sm insert-poetry-btn" data-text="${encodeURIComponent(item.text)}" data-poet="${encodeURIComponent(item.poet)}">
            ${t('poetryInsertBtn')}
          </button>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    const close1 = this.modalEl.querySelector('#closePoetryModalBtn');
    const close2 = this.modalEl.querySelector('#closePoetryModalFooterBtn');
    close1.addEventListener('click', () => this.close());
    close2.addEventListener('click', () => this.close());

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const tabs = this.modalEl.querySelector('#poetryCategoryTabs');
    tabs.addEventListener('click', (e) => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;
      tabs.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      this.activeCategory = pill.getAttribute('data-cat');
      this.renderCards();
    });

    const searchInput = this.modalEl.querySelector('#poetrySearchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderCards();
    });

    const listEl = this.modalEl.querySelector('#poetryCardsList');
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.insert-poetry-btn');
      if (!btn) return;
      
      const text = decodeURIComponent(btn.getAttribute('data-text'));
      const poet = decodeURIComponent(btn.getAttribute('data-poet'));

      createTextLayer(text, {
        fontSize: 52,
        name: poet || 'شعر',
        stroke: { enabled: true, color: '#000000', width: 5 },
        shadow: { enabled: true, color: 'rgba(0, 0, 0, 0.9)', blur: 18, x: 0, y: 6 },
        gradient: { enabled: true, start: '#f5c97a', end: '#ffffff' }
      });

      this.close();
    });
  }

  open() {
    this.updateStaticLabels();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
