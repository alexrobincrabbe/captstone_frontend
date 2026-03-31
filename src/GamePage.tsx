import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ChatMessage, ChatTraceEvent, RoomState, ServerEvent } from "./types";
import {
  appendSessionTraceEvent,
  appendSessionTraceMessage,
  listSessionTraceEvents,
  resetSessionTraceMessages,
} from "./sessionTraceStore";

const API_WS_URL =
  import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:8000/ws";

const emptyState: RoomState = {
  players: [],
  scores: {},
  status: "waiting",
  roundEndTime: null,
};

export default function GamePage() {
  const [usernameInput, setUsernameInput] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [roomState, setRoomState] = useState<RoomState>(emptyState);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [traceEvents, setTraceEvents] = useState<ChatTraceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const socketRef = useRef<WebSocket | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  /** When true, the next socket `close` is expected (leave room / cleanup), not a server drop. */
  const intentionalDisconnectRef = useRef(false);

  const leaderboard = useMemo(() => {
    return [...Object.entries(roomState.scores)].sort((a, b) => b[1] - a[1]);
  }, [roomState.scores]);

  const botNames = useMemo(() => {
    return new Set(roomState.players.filter((p) => p.isBot).map((p) => p.name));
  }, [roomState.players]);

  useEffect(() => {
    setTraceEvents(listSessionTraceEvents());
  }, []);

  useEffect(() => {
    if (!username) return;

    intentionalDisconnectRef.current = false;
    const socket = new WebSocket(API_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", username }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerEvent;

      if (data.type === "error") {
        setError((data as { message?: string }).message ?? "Unknown error");
        return;
      }

      if (data.type === "chat_message" && data.message) {
        const sessionMessage = appendSessionTraceMessage(data.message);
        setChatMessages((prev) => [...prev, sessionMessage].slice(-200));
        return;
      }

      if (data.type === "chat_trace" && data.trace) {
        appendSessionTraceEvent(data.trace);
        setTraceEvents(listSessionTraceEvents());
        return;
      }

      if (data.type === "room_state" && data.state) {
        setRoomState(data.state);
      }
    };

    socket.onclose = () => {
      if (intentionalDisconnectRef.current) {
        intentionalDisconnectRef.current = false;
        return;
      }
      setError("Disconnected from server");
    };

    return () => {
      intentionalDisconnectRef.current = true;
      socket.close();
      socketRef.current = null;
    };
  }, [username]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!roomState.roundEndTime || roomState.status !== "active") {
        setCountdown(0);
        return;
      }
      const left = Math.max(
        0,
        Math.ceil(roomState.roundEndTime - Date.now() / 1000)
      );
      setCountdown(left);
    }, 250);

    return () => window.clearInterval(interval);
  }, [roomState.roundEndTime, roomState.status]);

  useLayoutEffect(() => {
    const el = chatLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  function send(type: string, payload: Record<string, unknown> = {}) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    socketRef.current.send(JSON.stringify({ type, ...payload }));
  }

  function onJoin(e: FormEvent) {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setError(null);
    setChatMessages([]);
    setTraceEvents([]);
    resetSessionTraceMessages();
    setUsername(trimmed);
  }

  function onSendChat(e: FormEvent) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    send("chat_message", { text: trimmed });
    setChatInput("");
  }

  function leaveRoom() {
    intentionalDisconnectRef.current = true;
    socketRef.current?.close();
    socketRef.current = null;
    setUsername(null);
    setRoomState(emptyState);
    setChatMessages([]);
    setTraceEvents([]);
    resetSessionTraceMessages();
    setError(null);
    setCountdown(0);
  }

  function getMessageTraceId(message: ChatMessage): string | null {
    let candidates = traceEvents.filter(() => false);

    if (!message.system && !message.isBot) {
      candidates = traceEvents.filter(
        (t) =>
          t.source.eventType === "chat" &&
          t.source.sender === message.sender &&
          t.source.text === message.text &&
          Math.abs(t.timestamp - message.timestamp) <= 120
      );
    } else if (message.system) {
      const joined = message.text.match(/^(.+)\s+joined the room$/i);
      if (joined) {
        const joinedUser = (joined[1] || "").trim();
        candidates = traceEvents.filter(
          (t) =>
            t.source.eventType === "player_joined" &&
            t.source.sender === joinedUser &&
            Math.abs(t.timestamp - message.timestamp) <= 10
        );
      } else if (message.text.trim().toLowerCase() === "round ended") {
        candidates = traceEvents.filter(
          (t) =>
            t.source.eventType === "round_ended" &&
            Math.abs(t.timestamp - message.timestamp) <= 10
        );
      }
    }

    if (candidates.length === 0) {
      return null;
    }
    const winner = candidates.sort(
      (a, b) =>
        Math.abs(a.timestamp - message.timestamp) -
        Math.abs(b.timestamp - message.timestamp)
    )[0];
    return winner?.traceId ?? null;
  }

  if (!username) {
    return (
      <main className="page page-play">
        <section className="card join-card">
          <h1 className="page-heading">Join the room</h1>
          <p className="muted join-hint">
            Pick a display name to connect to the tap game and chat.
          </p>
          <form onSubmit={onJoin} className="join-form">
            <input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
            <button type="submit" className="btn btn-primary">
              Join room
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="page page-play">
      <div className="play-toolbar">
        <div>
          <h1 className="page-heading">Tap game</h1>
          <p className="muted play-signed-in">
            Signed in as <strong>{username}</strong>
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={leaveRoom}>
          Leave room
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <section className="layout">
        <div className="card card-elevated">
          <h2>Game</h2>
          <p>
            Status: <strong className="status-pill">{roomState.status}</strong>
          </p>
          <p>
            Countdown: <strong>{countdown}s</strong>
          </p>
          <button
            className="tap-button"
            disabled={roomState.status !== "active"}
            onClick={() => send("tap")}
          >
            TAP
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => send("start_round")}
          >
            Start round
          </button>
        </div>

        <div className="card card-elevated">
          <h2>Players ({roomState.players.length})</h2>
          <ul className="player-list">
            {roomState.players.map((player) => (
              <li key={player.id}>
                {player.name}
                {player.isBot ? (
                  <span className="tag tag-bot">bot</span>
                ) : null}
              </li>
            ))}
          </ul>

          <h2>Leaderboard</h2>
          <ol className="leaderboard">
            {leaderboard.map(([player, score]) => (
              <li key={player}>
                <span className="lb-name">
                  {player}
                  {botNames.has(player) ? (
                    <span className="tag tag-bot">bot</span>
                  ) : null}
                </span>
                <span className="lb-score">{score}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card card-elevated chat-card">
          <h2>Chat</h2>
          <div className="chat-log" ref={chatLogRef}>
            {chatMessages.map((m, idx) => (
              (() => {
                const traceId = getMessageTraceId(m);
                return (
                  <p
                    key={`${m.timestamp}-${idx}`}
                    className={m.system ? "system" : m.isBot ? "bot-msg" : ""}
                  >
                    <strong>
                      {m.sender}
                      {m.isBot ? " (bot)" : ""}:
                    </strong>{" "}
                    {m.text}
                    {traceId ? (
                      <>
                        {" "}
                        <Link
                          className="trace-link"
                          to={`/trace?message=${encodeURIComponent(traceId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View trace
                        </Link>
                      </>
                    ) : null}
                  </p>
                );
              })()
            ))}
          </div>
          <form onSubmit={onSendChat} className="chat-form">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
