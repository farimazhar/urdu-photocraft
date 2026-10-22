/**
 * Urdu Text Layer Model and Factory
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';

export function createTextLayer(initialText = 'اردو فوٹو کرافٹ', customProps = {}) {
  const defaultTextLayer = {
    type: 'text',
    name: initialText.slice(0, 16) || 'اردو متن',
    text: initialText,
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontSize: 58,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.9,
    color: '#ffffff',
    
    // Stroke outline
    stroke: {
      enabled: true,
      color: '#000000',
      width: 4,
    },
    
    // Drop shadow
    shadow: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.85)',
      blur: 14,
      x: 0,
      y: 6,
    },
    
    // Gradient fill
    gradient: {
      enabled: false,
      start: '#f5c97a',
      end: '#ffffff',
    },
    
    // Highlight Ribbon Box
    bgBox: {
      enabled: false,
      color: 'rgba(0, 0, 0, 0.65)',
      padding: 16,
      radius: 12,
    },
    
    rotation: 0,
    opacity: 1,
    ...customProps,
  };

  return appState.addLayer(defaultTextLayer);
}
