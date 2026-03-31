import { ChatMessage, ChatTraceEvent } from "./types";

const SESSION_TRACE_MESSAGES_KEY = "tapbot.sessionTrace.messages";
const SHARED_TRACE_MESSAGES_KEY = "tapbot.sharedTrace.messages";
const SESSION_TRACE_EVENTS_KEY = "tapbot.sessionTrace.events";
const SHARED_TRACE_EVENTS_KEY = "tapbot.sharedTrace.events";
const SESSION_TRACE_LIMIT = 300;

export interface SessionTraceMessage extends ChatMessage {
  traceId: string;
}

function readMessagesRaw(): SessionTraceMessage[] {
  try {
    const raw =
      window.localStorage.getItem(SHARED_TRACE_MESSAGES_KEY) ??
      window.sessionStorage.getItem(SESSION_TRACE_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionTraceMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMessagesRaw(messages: SessionTraceMessage[]) {
  window.localStorage.setItem(SHARED_TRACE_MESSAGES_KEY, JSON.stringify(messages));
  window.sessionStorage.setItem(SESSION_TRACE_MESSAGES_KEY, JSON.stringify(messages));
}

function readTraceEventsRaw(): ChatTraceEvent[] {
  try {
    const raw =
      window.localStorage.getItem(SHARED_TRACE_EVENTS_KEY) ??
      window.sessionStorage.getItem(SESSION_TRACE_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatTraceEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTraceEventsRaw(events: ChatTraceEvent[]) {
  window.localStorage.setItem(SHARED_TRACE_EVENTS_KEY, JSON.stringify(events));
  window.sessionStorage.setItem(SESSION_TRACE_EVENTS_KEY, JSON.stringify(events));
}

export function listSessionTraceMessages(): SessionTraceMessage[] {
  return readMessagesRaw();
}

export function listSessionTraceEvents(): ChatTraceEvent[] {
  return readTraceEventsRaw();
}

export function resetSessionTraceMessages() {
  window.localStorage.removeItem(SHARED_TRACE_MESSAGES_KEY);
  window.localStorage.removeItem(SHARED_TRACE_EVENTS_KEY);
  writeMessagesRaw([]);
  writeTraceEventsRaw([]);
}

export function appendSessionTraceMessage(message: ChatMessage): SessionTraceMessage {
  const traceId = `${message.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
  const next: SessionTraceMessage = { ...message, traceId };
  const prev = readMessagesRaw();
  const merged = [...prev, next].slice(-SESSION_TRACE_LIMIT);
  writeMessagesRaw(merged);
  return next;
}

export function appendSessionTraceEvent(event: ChatTraceEvent): ChatTraceEvent {
  const prev = readTraceEventsRaw();
  const merged = [...prev, event].slice(-SESSION_TRACE_LIMIT);
  writeTraceEventsRaw(merged);
  return event;
}
