export type GameStatus = "waiting" | "active" | "finished";

export interface BotTraceEntry {
  kind: "node" | "edge";
  node?: string;
  context?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  from?: string;
  to?: string;
  reason?: string;
}

export interface BotTraceSource {
  sender: string;
  text: string;
  eventType: string;
  isRoundActive: boolean;
}

export interface ChatTraceEvent {
  traceId: string;
  source: BotTraceSource;
  trace: BotTraceEntry[];
  generatedReply: string;
  timestamp: number;
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
  system: boolean;
  isBot: boolean;
  trace?: BotTraceEntry[] | null;
  traceSource?: BotTraceSource | null;
}

export interface RoomPlayer {
  id: string;
  name: string;
  isBot: boolean;
}

export interface RoomState {
  players: RoomPlayer[];
  scores: Record<string, number>;
  status: GameStatus;
  roundEndTime: number | null;
}

export interface ServerEvent {
  type: string;
  state?: RoomState;
  message?: ChatMessage;
  trace?: ChatTraceEvent;
  username?: string;
  messageText?: string;
}

export interface MemoryRecord {
  id: number;
  memoryText: string;
  metadata: Record<string, string>;
}
