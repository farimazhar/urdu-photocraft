/**
 * Islamic & Urdu Calligraphy Stamps & Stickers
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';

export const CALLIGRAPHY_STAMPS = [
  {
    id: 'bismillah',
    title: 'بسم اللہ الرحمٰن الرحیم',
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    fontFamily: "'Amiri', serif",
    color: '#f5c97a',
    fontSize: 64,
  },
  {
    id: 'mashallah',
    title: 'ماشاء اللہ تبارک اللہ',
    text: 'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ',
    fontFamily: "'Amiri', serif",
    color: '#34d399',
    fontSize: 58,
  },
  {
    id: 'alhamdulillah',
    title: 'الحمد للہ رب العالمین',
    text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    fontFamily: "'Amiri', serif",
    color: '#ffffff',
    fontSize: 60,
  },
  {
    id: 'subhanallah',
    title: 'سبحان اللہ وبحمدہ',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    fontFamily: "'Amiri', serif",
    color: '#38bdf8',
    fontSize: 56,
  },
  {
    id: 'darood',
    title: 'درود شریف',
    text: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ',
    fontFamily: "'Amiri', serif",
    color: '#f5c97a',
    fontSize: 62,
  },
  {
    id: 'jummah',
    title: 'جمعہ مبارک',
    text: '✨ جُمُعَة مُبَارَك ✨',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    color: '#10b981',
    fontSize: 66,
  },
  {
    id: 'eid',
    title: 'عید مبارک',
    text: '🌙 عِیْدٌ مُبَارَک 🌙',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    color: '#f5c97a',
    fontSize: 70,
  }
];

export function addCalligraphyStamp(stamp) {
  const layer = {
    type: 'text',
    name: stamp.title || 'خطاطی',
    text: stamp.text,
    fontFamily: stamp.fontFamily || "'Amiri', serif",
    fontSize: stamp.fontSize || 60,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.8,
    color: stamp.color || '#f5c97a',
    stroke: {
      enabled: true,
      color: '#000000',
      width: 4,
    },
    shadow: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.85)',
      blur: 16,
      x: 0,
      y: 6,
    },
    gradient: {
      enabled: true,
      start: stamp.color || '#f5c97a',
      end: '#ffffff',
    },
    rotation: 0,
    opacity: 1,
  };

  return appState.addLayer(layer);
}
