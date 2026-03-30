import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="page page-home">
      <section className="hero">
        <p className="hero-eyebrow">Proof of concept</p>
        <h1 className="hero-title">A tiny game, a social bot</h1>
        <section className="hero-body" aria-label="Project overview">
          <p>
            This project is a proof of concept for adding intelligent bot
            players to live, browser-based games like those on{" "}
            <a
              className="inline-link"
              href="https://www.boojumgames.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Boojum Games
            </a>
            .
          </p>

          <p>
            On platforms such as{" "}
            <a
              className="inline-link"
              href="https://www.boojumgames.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Boojum Games
            </a>
            , players can join shared game rooms to compete and chat in real
            time. However, live multiplayer games rely on having enough active
            users. When a player joins an empty or nearly empty room, the
            experience can feel slow, awkward, or unengaging. This creates a
            common “cold start” problem: without players, new players don’t
            stay—and without new players, the rooms never fill.
          </p>

          <p>
            This project explores a solution:{" "}
            <strong>social bot players</strong>.
          </p>

          <p>
            These bots don’t just simulate gameplay—they participate as full
            members of the room. They:
          </p>

          <ul className="hero-bullet-list">
            <li>play alongside human players</li>
            <li>send chat messages and react to events</li>
            <li>adapt their behavior to the game state</li>
            <li>remember players for future interactions</li>
          </ul>

          <p>
            By introducing bots into low-traffic rooms, the experience feels
            more active and welcoming. Players have someone to compete against
            immediately, reducing hesitation and making the game more engaging
            from the moment they join.
          </p>

          <p>
            Bots also help balance gameplay. Instead of facing opponents who are
            far stronger or weaker, players can compete against bots of
            different skill levels, providing a more satisfying and accessible
            challenge.
          </p>

          <p>
            This demo uses a simple tap-based game to showcase the concept, but
            the idea is designed for richer multiplayer environments like:
          </p>

          <p className="hero-callout">
            <span className="hero-callout-icon" aria-hidden>
              →
            </span>
            <a
              className="inline-link inline-link-cta"
              href="https://www.boojumgames.com/rooms/guest/boojum/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View an example game room
            </a>
          </p>

          <p>
            Ultimately, the goal is to{" "}
            <strong>
              bridge the gap between empty rooms and active communities
            </strong>
            , helping multiplayer games feel alive even before they reach
            critical mass.
          </p>
        </section>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/play">
            Join the room
          </Link>
          <Link className="btn btn-ghost" to="/memories">
            Browse bot memories
          </Link>
        </div>
      </section>

      <section className="card card-feature">
        <h2>What you&apos;re looking at</h2>
        <p>
          The frontend is a lightweight demo room: leaderboard, taps, and live
          chat. The bot participates as a player and as a conversational
          companion, storing memories about users you can inspect on the
          memories page.
        </p>
      </section>
    </main>
  );
}
