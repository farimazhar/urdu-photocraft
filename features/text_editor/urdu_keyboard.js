/**
 * Virtual Urdu Phonetic Helper Keyboard
 * Facilitates quick Urdu typing without needing an Urdu keyboard layout installed
 */
export const URDU_KEYBOARD_LAYOUT = [
  ['آ', 'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ'],
  ['د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض'],
  ['ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن'],
  ['ں', 'و', 'ہ', 'ۂ', 'ھ', 'ء', 'ی', 'ے', 'ئ', 'ؤ'],
  ['،', '۔', '؟', '!', 'ﷺ', '﷽', 'علیہ السلام', 'رحمۃ اللہ']
];

export class UrduKeyboard {
  constructor(targetInputSelector) {
    this.targetSelector = targetInputSelector;
    this.isOpen = false;
  }

  render(containerEl) {
    let html = `
      <div class="urdu-virtual-keyboard" id="urduVirtualKeyboard" style="display:none;">
        <div class="kbd-header">
          <span>اردو فونیٹک کی بورڈ</span>
          <button class="btn-icon btn-sm" id="closeKbdBtn" title="بند کریں">&times;</button>
        </div>
        <div class="kbd-grid">
    `;

    URDU_KEYBOARD_LAYOUT.forEach(row => {
      html += `<div class="kbd-row">`;
      row.forEach(char => {
        html += `<button type="button" class="kbd-key" data-char="${char}">${char}</button>`;
      });
      html += `</div>`;
    });

    html += `
        <div class="kbd-row kbd-actions">
          <button type="button" class="kbd-key kbd-space" data-char=" ">فاصلہ (Space)</button>
          <button type="button" class="kbd-key kbd-backspace" id="kbdBackspace">⌫ مٹائیں</button>
        </div>
      </div>
    `;

    containerEl.innerHTML = html;
    this.bindEvents(containerEl);
  }

  bindEvents(containerEl) {
    const kbd = containerEl.querySelector('#urduVirtualKeyboard');
    
    containerEl.addEventListener('click', (e) => {
      const key = e.target.closest('.kbd-key');
      if (!key) return;

      const target = document.querySelector(this.targetSelector);
      if (!target) return;

      if (key.id === 'kbdBackspace') {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        if (start === end && start > 0) {
          target.value = target.value.slice(0, start - 1) + target.value.slice(start);
          target.setSelectionRange(start - 1, start - 1);
        } else {
          target.value = target.value.slice(0, start) + target.value.slice(end);
          target.setSelectionRange(start, start);
        }
      } else {
        const char = key.getAttribute('data-char');
        if (char !== null) {
          const start = target.selectionStart || target.value.length;
          target.value = target.value.slice(0, start) + char + target.value.slice(start);
          target.setSelectionRange(start + char.length, start + char.length);
        }
      }

      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.focus();
    });

    const closeBtn = containerEl.querySelector('#closeKbdBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle(false));
    }
  }

  toggle(forceState) {
    const kbd = document.getElementById('urduVirtualKeyboard');
    if (!kbd) return;
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    kbd.style.display = this.isOpen ? 'block' : 'none';
  }
}
