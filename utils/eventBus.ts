export const EventTypes = {
  WORKOUTS_UPDATED: 'NEW_WORKOUT_LOGGED'
} as const;

type EventType = typeof EventTypes[keyof typeof EventTypes] | string;
type EventCallback = (data?: any) => void;

class EventBus {
  listeners: Record<string, EventCallback[]> = {};

  subscribe(event: EventType, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event: EventType, callback: EventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  publish(event: EventType, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default new EventBus();
