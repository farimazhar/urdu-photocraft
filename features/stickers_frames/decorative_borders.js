/**
 * Decorative Borders, Dividers & Shapes
 */
import { appState } from '../../core/state.js';

export function addDecorativeDivider() {
  const layer = {
    type: 'shape',
    shapeType: 'divider',
    name: 'آرائشی لکیر (Divider)',
    width: 450,
    height: 40,
    color: '#f5c97a',
    strokeWidth: 3,
    opacity: 0.9,
  };
  return appState.addLayer(layer);
}

export function addDecorativeFrame() {
  const { width, height } = appState.canvas;
  const layer = {
    type: 'shape',
    shapeType: 'frame',
    name: 'خوبصورت حاشیہ (Frame)',
    width: width - 80,
    height: height - 80,
    color: 'rgba(245, 201, 122, 0.6)',
    strokeWidth: 4,
    radius: 16,
    opacity: 0.85,
  };
  return appState.addLayer(layer);
}

export function addBackdropRibbon() {
  const layer = {
    type: 'shape',
    shapeType: 'box',
    name: 'متن کی پٹی (Ribbon)',
    width: 500,
    height: 120,
    color: 'rgba(0, 0, 0, 0.65)',
    radius: 16,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    opacity: 0.9,
  };
  return appState.addLayer(layer);
}
