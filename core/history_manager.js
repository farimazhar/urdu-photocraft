/**
 * Undo / Redo History Manager
 */
import { appState } from './state.js';
import { eventBus } from './event_bus.js';

export class HistoryManager {
  constructor(maxSteps = 30) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSteps = maxSteps;
    this.isApplying = false;

    // Listen to state modifications
    eventBus.on('state:modified', () => {
      if (this.isApplying) return;
      this.saveSnapshot();
    });
  }

  saveSnapshot() {
    const snapshot = JSON.stringify(appState.serialize());
    
    // Don't save duplicate consecutive states
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snapshot) {
      return;
    }

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxSteps) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notifyStatus();
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    this.isApplying = true;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    
    const previous = this.undoStack[this.undoStack.length - 1];
    appState.restore(JSON.parse(previous));
    this.isApplying = false;
    this.notifyStatus();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.isApplying = true;
    const next = this.redoStack.pop();
    this.undoStack.push(next);
    
    appState.restore(JSON.parse(next));
    this.isApplying = false;
    this.notifyStatus();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  notifyStatus() {
    eventBus.emit('history:status', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }
}

export const historyManager = new HistoryManager();
