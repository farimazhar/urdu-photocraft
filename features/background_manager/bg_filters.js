/**
 * Background Filters & Effects Manager
 */
import { appState } from '../../core/state.js';
import { eventBus } from '../../core/event_bus.js';

export function updateBackgroundFilter(key, value) {
  if (appState.background[key] !== undefined) {
    appState.background[key] = value;
    eventBus.emit('background:changed', appState.background);
    eventBus.emit('state:modified');
  }
}
