/**
 * Background Image Uploader & Helper
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';

export function handleBackgroundImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('براہ کرم کوئی تصویر منتخب کریں۔');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      appState.background.type = 'image';
      appState.background.image = dataUrl;
      appState.background.imageElement = img;
      
      // Auto enable subtle overlay for contrast
      if (appState.background.overlayOpacity === 0) {
        appState.background.overlayOpacity = 0.4;
      }

      eventBus.emit('background:changed', appState.background);
      eventBus.emit('state:modified');
    };
  };
  reader.readAsDataURL(file);
}
