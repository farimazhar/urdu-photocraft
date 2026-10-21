/**
 * Urdu PhotoCraft - Bilingual Localization Engine (English & Urdu)
 */
import { eventBus } from './event_bus.js';

export const LANGUAGES = {
  EN: 'en',
  UR: 'ur'
};

const STORAGE_KEY = 'urdu_photocraft_lang_v1';

export const TRANSLATIONS = {
  en: {
    // Brand & Topbar
    appTitle: 'Urdu PhotoCraft',
    appSubtitle: 'Professional Urdu Studio',
    brandBadge: 'Urdu PhotoCraft',
    undoTooltip: 'Undo (Ctrl+Z)',
    redoTooltip: 'Redo (Ctrl+Y)',
    poetryLibBtn: '📜 Poetry Library',
    addTextBtn: '✍️ Add Text',
    exportBtn: '💾 Export Image',
    themeStudio: 'Dark Studio',
    themeGold: 'Royal Gold',
    themeEmerald: 'Midnight Emerald',
    langToggleBtn: '🌐 اردو',
    langToggleTitle: 'Switch to Urdu (اردو)',

    // Presets
    presetSquare: 'Instagram Post (1:1)',
    presetStory: 'Story / Reel (9:16)',
    presetThumbnail: 'YouTube Thumbnail (16:9)',
    presetPoetryCard: 'Poetry Card (4:3)',
    presetPortrait: 'Portrait Card (3:4)',
    presetCustom: 'Custom Size',

    // Left Toolbar
    toolText: 'Text',
    toolPoetry: 'Poetry',
    toolCalligraphy: 'Stamps',
    toolShapes: 'Shapes',
    toolBackground: 'Backdrop',
    toolKeyboard: 'Keyboard',

    // Inspector Tabs
    tabProperties: '⚙️ Properties',
    tabLayers: '📑 Layers',

    // Text Inspector
    propUrduTextLabel: 'Text Content',
    propFontLabel: 'Typography & Font',
    propFontSizeLabel: 'Font Size',
    propAlignmentLabel: 'Alignment',
    propAlignRight: 'Right',
    propAlignCenter: 'Center',
    propAlignLeft: 'Left',
    propColorLabel: 'Color',
    propPresetsLabel: 'Quick Styles',
    propStrokeSection: 'Stroke / Outline',
    propStrokeWidthLabel: 'Stroke Width',
    propShadowSection: 'Drop Shadow & Glow',
    propShadowBlurLabel: 'Shadow Blur',
    propGradientSection: 'Gradient Fill',
    propGradStart: 'Start Color',
    propGradEnd: 'End Color',
    propDuplicateBtn: '❐ Duplicate',
    propDeleteBtn: '🗑️ Delete',
    noLayerSelected: 'Click any text or element on the canvas to inspect properties.',
    addTextPrompt: '+ Add New Text Layer',

    // Background Inspector
    bgSettingsTitle: '🖼️ Background Settings',
    bgTypeLabel: 'Background Type',
    bgTypeGradient: 'Gradient',
    bgTypeSolid: 'Solid Color',
    bgTypeImage: 'Image Photo',
    bgCuratedGrads: 'Curated Gradients',
    bgSolidPalette: 'Color Palette',
    bgCustomColor: 'Custom Color',
    bgUploadLabel: 'Upload Photo from Computer',
    bgAdjustmentsTitle: 'Overlay & Effects',
    bgOverlayLabel: 'Darkness Overlay',
    bgOverlayNote: 'Dark overlay ensures high contrast and legibility for text.',
    bgBlurLabel: 'Background Blur',
    bgVignetteLabel: 'Vignette Shadow',

    // Calligraphy & Stamps
    calligraphyTitle: '✨ Islamic Calligraphy Stamps',
    calligraphyDesc: 'Insert sacred phrases and calligraphy onto the canvas with 1-click:',

    // Shapes & Borders
    shapesTitle: '🔷 Decorative Shapes & Borders',
    addDividerBtn: '⚜️ Decorative Divider',
    addFrameBtn: '🖼️ Border Frame',
    addRibbonBtn: '🏷️ Text Highlight Ribbon',

    // Layers Inspector
    emptyLayersMsg: 'No elements on canvas yet. Add new text or calligraphy.',
    layerVisToggle: 'Toggle Visibility',
    layerLockToggle: 'Lock / Unlock',
    layerMoveUp: 'Move Up',
    layerMoveDown: 'Move Down',
    layerDuplicate: 'Duplicate',
    layerDelete: 'Delete',

    // Floating Zoom Bar
    zoomFitBtn: 'Fit Screen',
    zoomInBtn: 'Zoom In',
    zoomOutBtn: 'Zoom Out',

    // Poetry Modal
    poetryModalTitle: '📜 Urdu Poetry & Literary Quotes Library',
    poetrySearchPlaceholder: 'Search poet, verses, or keywords...',
    poetryAllCategory: 'All Verses',
    poetryInsertBtn: '✨ Insert to Canvas',
    poetryEmptyMsg: 'No verses found matching your query.',
    poetryFooterTip: 'Select any verse to insert onto the canvas with Nastaliq typography',
    modalCloseBtn: 'Close',

    // Export Modal
    exportModalTitle: '💾 Export & Download Image',
    exportFormatLabel: 'Format',
    exportFormatPng: 'PNG (High Quality)',
    exportFormatJpg: 'JPEG (Compact)',
    exportFormatWebp: 'WebP (Modern)',
    exportResolutionLabel: 'Resolution & Scale',
    exportScale1x: '1x Standard',
    exportScale2x: '2x Ultra HD (4K)',
    exportScale3x: '3x Print Ready',
    exportCanvasSize: 'Canvas Size:',
    exportFinalSize: 'Exported Dimensions:',
    exportClipboardBtn: '📋 Copy to Clipboard',
    exportDownloadBtn: '⬇️ Download Image',
    clipboardSuccess: '✅ Image copied to clipboard! You can paste it into WhatsApp, Twitter, or docs.',
    clipboardError: '❌ Failed to copy to clipboard: ',
    downloadSuccess: '✅ Image downloaded successfully!'
  },

  ur: {
    // Brand & Topbar
    appTitle: 'اردو فوٹو کرافٹ',
    appSubtitle: 'پیشہ ورانہ اردو ڈیزائن اسٹوڈیو',
    brandBadge: 'اردو فوٹو کرافٹ',
    undoTooltip: 'واپس کریں (Ctrl+Z)',
    redoTooltip: 'دوبارہ کریں (Ctrl+Y)',
    poetryLibBtn: '📜 اشعار لائبریری',
    addTextBtn: '✍️ نیا متن',
    exportBtn: '💾 محفوظ کریں',
    themeStudio: 'ڈارک اسٹوڈیو',
    themeGold: 'شاہی گولڈ',
    themeEmerald: 'زمرد قرآنی',
    langToggleBtn: '🌐 English',
    langToggleTitle: 'انگریزی میں تبدیل کریں (Switch to English)',

    // Presets
    presetSquare: 'Instagram پوسٹ (1:1)',
    presetStory: 'Story / Reel (9:16)',
    presetThumbnail: 'YouTube تھمب نیل (16:9)',
    presetPoetryCard: 'اردو شاعری کارڈ (4:3)',
    presetPortrait: 'پورٹریٹ کارڈ (3:4)',
    presetCustom: 'اپنی مرضی (Custom)',

    // Left Toolbar
    toolText: 'متن',
    toolPoetry: 'شاعری',
    toolCalligraphy: 'خطاطی',
    toolShapes: 'اشکال',
    toolBackground: 'پس منظر',
    toolKeyboard: 'کی بورڈ',

    // Inspector Tabs
    tabProperties: '⚙️ ترتیبات (Properties)',
    tabLayers: '📑 تہیں (Layers)',

    // Text Inspector
    propUrduTextLabel: 'اردو متن (Text Content)',
    propFontLabel: 'رسم الخط (Urdu Font)',
    propFontSizeLabel: 'سائز (Font Size)',
    propAlignmentLabel: 'سیدھ (Alignment)',
    propAlignRight: 'دائیں',
    propAlignCenter: 'درمیان',
    propAlignLeft: 'بائیں',
    propColorLabel: 'رنگ (Color)',
    propPresetsLabel: 'تیار اسٹائلز (Presets)',
    propStrokeSection: 'متن کا حاشیہ (Stroke / Outline)',
    propStrokeWidthLabel: 'موٹائی (Stroke Width)',
    propShadowSection: 'سایہ و روشنی (Drop Shadow)',
    propShadowBlurLabel: 'دھندلا پن (Blur)',
    propGradientSection: 'سنہری شیڈنگ (Gradient Fill)',
    propGradStart: 'آغاز رنگ',
    propGradEnd: 'اختتام رنگ',
    propDuplicateBtn: '❐ نقل بنائیں',
    propDeleteBtn: '🗑️ مٹائیں',
    noLayerSelected: 'ترتیبات دیکھنے کے لیے کینوس پر کسی متن یا عنصر پر کلک کریں۔',
    addTextPrompt: '+ نیا اردو متن شامل کریں',

    // Background Inspector
    bgSettingsTitle: '🖼️ پس منظر ترتیبات (Background Settings)',
    bgTypeLabel: 'نوعیت پس منظر (Type)',
    bgTypeGradient: 'شیڈز (Gradient)',
    bgTypeSolid: 'سادہ رنگ (Solid)',
    bgTypeImage: 'تصویر (Image)',
    bgCuratedGrads: 'تیار گریڈینٹس (Curated Gradients)',
    bgSolidPalette: 'مخصوص رنگ پیلیٹ',
    bgCustomColor: 'مرضی کا رنگ:',
    bgUploadLabel: 'کمپیوٹر سے تصویر منتخب کریں',
    bgAdjustmentsTitle: 'تاریکی و وضوح (Overlay & Contrast)',
    bgOverlayLabel: 'تاریک پردہ (Darkness Overlay)',
    bgOverlayNote: 'متن کو نمایاں اور واضح پڑھنے کے لیے تاریک پردہ بہت ضروری ہے۔',
    bgBlurLabel: 'دھندلا پن (Background Blur)',
    bgVignetteLabel: 'ویگنیٹ (Vignette Shadow)',

    // Calligraphy & Stamps
    calligraphyTitle: '✨ اسلامی خطاطی و اسٹیکرز (Calligraphy)',
    calligraphyDesc: 'مبارک کلمات اور خطاطی کینوس پر ایک کلک سے شامل کریں:',

    // Shapes & Borders
    shapesTitle: '🔷 آرائشی اشکال و حاشیہ (Borders & Shapes)',
    addDividerBtn: '⚜️ آرائشی لکیر (Decorative Divider)',
    addFrameBtn: '🖼️ مکمل کینوس حاشیہ (Border Frame)',
    addRibbonBtn: '🏷️ متن کی پٹی (Highlight Ribbon)',

    // Layers Inspector
    emptyLayersMsg: 'کینوس پر ابھی کوئی تہہ (Layer) موجود نہیں ہے۔ نیا متن یا خطاطی شامل کریں۔',
    layerVisToggle: 'چھپائیں یا دکھائیں',
    layerLockToggle: 'کھولیں یا بند کریں',
    layerMoveUp: 'اوپر کریں',
    layerMoveDown: 'نیچے کریں',
    layerDuplicate: 'نقل بنائیں',
    layerDelete: 'حذف کریں',

    // Floating Zoom Bar
    zoomFitBtn: 'Fit',
    zoomInBtn: 'بڑا کریں',
    zoomOutBtn: 'چھوٹا کریں',

    // Poetry Modal
    poetryModalTitle: '📜 اردو شاعری و اقتباسات لائبریری',
    poetrySearchPlaceholder: 'شاعر کا نام، شعر، یا الفاظ تلاش کریں...',
    poetryAllCategory: 'تمام اشعار',
    poetryInsertBtn: '✨ کینوس پر شامل کریں',
    poetryEmptyMsg: 'کوئی شعر یا اقتباس نہیں ملا۔ براہ کرم کچھ اور تلاش کریں۔',
    poetryFooterTip: 'شعر منتخب کریں اور کینوس میں شامل کریں',
    modalCloseBtn: 'بند کریں',

    // Export Modal
    exportModalTitle: '💾 تصویر برآمد و محفوظ کریں (Export & Download)',
    exportFormatLabel: 'فارمیٹ (Format)',
    exportFormatPng: 'PNG (اعلیٰ کوالٹی)',
    exportFormatJpg: 'JPEG (کم سائز)',
    exportFormatWebp: 'WebP (جدید)',
    exportResolutionLabel: 'ریزولوشن اور اسکیل (Resolution & Scale)',
    exportScale1x: '1x Standard',
    exportScale2x: '2x Ultra HD (2K/4K)',
    exportScale3x: '3x Print Ready',
    exportCanvasSize: 'کینوس سائز:',
    exportFinalSize: 'حتمی فائل سائز:',
    exportClipboardBtn: '📋 کلپ بورڈ پر کاپی کریں',
    exportDownloadBtn: '⬇️ ڈاؤنلوڈ کریں',
    clipboardSuccess: '✅ تصویر کلپ بورڈ پر کامیابی سے کاپی ہو گئی! آپ اسے کہیں بھی Paste کر سکتے ہیں۔',
    clipboardError: '❌ کاپی کرنے میں مسئلہ پیش آیا: ',
    downloadSuccess: '✅ تصویر کامیابی کے ساتھ ڈاؤنلوڈ ہو گئی!'
  }
};

export class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem(STORAGE_KEY) || LANGUAGES.UR;
    this.applyLanguage(this.currentLang, false);
  }

  t(key) {
    const langDict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.ur;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  }

  getLanguage() {
    return this.currentLang;
  }

  applyLanguage(lang, emit = true) {
    if (!TRANSLATIONS[lang]) lang = LANGUAGES.UR;
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update document properties
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === LANGUAGES.UR) ? 'rtl' : 'ltr';

    if (emit) {
      eventBus.emit('language:changed', { lang });
    }
  }

  toggleLanguage() {
    const nextLang = (this.currentLang === LANGUAGES.UR) ? LANGUAGES.EN : LANGUAGES.UR;
    this.applyLanguage(nextLang, true);
    return nextLang;
  }
}

export const i18n = new I18nManager();
export const t = (key) => i18n.t(key);
