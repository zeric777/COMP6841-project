import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000/api";

const challenges = [
  {
    id: 1,
    title: "Forum Search",
    module: "Reflected XSS",
    difficulty: 1,
    background:
      "A forum reflects search terms back into the page to make search results easier to understand. The developer tried to block script tags.",
    goal: "Execute JavaScript in the reflected search result and retrieve the flag from the browser cookie.",
    learningObjective: "Reflected XSS, HTML injection, event handlers, and document.cookie.",
    hints: [
      "Your search term is inserted into the response as HTML.",
      "The filter removes script tags, but it does not understand every HTML execution context.",
      "An image error handler can execute JavaScript without a script tag.",
    ],
  },
  {
    id: 2,
    title: "Post Comments",
    module: "Stored XSS",
    difficulty: 3,
    background:
      "The same forum stores comments and renders them for every visitor. New comments are reviewed by an administrator simulation.",
    goal: "Publish a persistent payload that automatically sends a report when the comment is rendered.",
    learningObjective: "Stored XSS, persistent payloads, automatic execution, and victim simulation.",
    hints: [
      "Your comment remains after the page reloads.",
      "The administrator reviews newly published comments.",
      "A short payload can make a same-origin request to /api/xss/2/report.",
    ],
  },
  {
    id: 3,
    title: "Live Profile",
    module: "DOM XSS",
    difficulty: 4,
    background:
      "A profile page uses the URL fragment to show a live display name. The server never receives the fragment.",
    goal: "Use the URL fragment to execute JavaScript and recover the page secret.",
    learningObjective: "DOM XSS, location.hash, decodeURIComponent(), and innerHTML.",
    hints: [
      "Everything happens in the browser after the page loads.",
      "The fragment begins after the # character and is decoded before being rendered.",
      "Inspect the client-side source and follow the value from location.hash to its DOM sink.",
    ],
  },
];

function getCompletedChallenges() {
  try {
    return JSON.parse(localStorage.getItem("xss-progress") || "[]");
  } catch {
    return [];
  }
}

function saveCompletedChallenges(completed) {
  localStorage.setItem("xss-progress", JSON.stringify(completed));
}

function Difficulty({ level }) {
  return <span aria-label={`${level} star difficulty`}>{"★".repeat(level)}</span>;
}

function HintPanel({ hints }) {
  const [visibleHints, setVisibleHints] = useState(0);

  return (
    <section className="sqli-section">
      <div className="section-title-row">
        <h2>Hints</h2>
        <button
          type="button"
          className="button secondary"
          disabled={visibleHints === hints.length}
          onClick={() => setVisibleHints((current) => Math.min(current + 1, hints.length))}
        >
          Show Hint
        </button>
      </div>
      {visibleHints === 0 ? (
        <p>No hints revealed.</p>
      ) : (
        <ol className="hint-list">
          {hints.slice(0, visibleHints).map((hint, index) => (
            <li key={hint}>Hint {index + 1}: {hint}</li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ReflectedSearchLab() {
  const [query, setQuery] = useState("");
  const [reflection, setReflection] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.cookie = "forum_flag=COMP6841{T4kR9wD2}; path=/; SameSite=Lax";
  }, []);

  const search = async (event) => {
    event.preventDefault();
    setMessage("Searching posts...");
    const response = await fetch(`${API_BASE}/xss/1/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setReflection(data.reflection || "");
    setMessage(response.ok ? "Search complete." : data.message || "Search failed.");
  };

  return (
    <div className="lab-panel">
      <h2>Forum Search</h2>
      <form className="lab-form" onSubmit={search}>
        <label htmlFor="forum-query">Search Posts</label>
        <input id="forum-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="apple" />
        <button type="submit" className="button">Search</button>
      </form>
      {message && <p className="lab-message">{message}</p>}
      <div className="xss-rendered-output">
        <strong>You searched for:</strong>
        <div dangerouslySetInnerHTML={{ __html: reflection }} />
      </div>
    </div>
  );
}

function StoredCommentsLab() {
  const [username, setUsername] = useState("Guest");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");

  const loadComments = async () => {
    const response = await fetch(`${API_BASE}/xss/2/comments`);
    const data = await response.json();
    if (response.ok) {
      setComments(data.comments || []);
    } else {
      setMessage(data.message || "Could not load comments.");
    }
  };

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/xss/2/comments`)
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!active) return;
        if (response.ok) {
          setComments(data.comments || []);
        } else {
          setMessage(data.message || "Could not load comments.");
        }
      })
      .catch(() => {
        if (active) setMessage("Could not load comments.");
      });

    return () => {
      active = false;
    };
  }, []);

  const submitComment = async (event) => {
    event.preventDefault();
    setMessage("Publishing comment...");
    const response = await fetch(`${API_BASE}/xss/2/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, content }),
    });
    const data = await response.json();
    setMessage(data.message || "Comment could not be published.");

    if (response.ok) {
      setContent("");
      loadComments();
    }
  };

  return (
    <div className="lab-panel">
      <h2>How to Learn SQL?</h2>
      <p>A short discussion about learning application security.</p>
      <div className="result-list" aria-live="polite">
        {comments.map((comment) => (
          <article className="forum-post" key={comment.id}>
            <strong>{comment.username}</strong>
            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
          </article>
        ))}
      </div>
      <form className="lab-form" onSubmit={submitComment}>
        <label htmlFor="comment-username">Name</label>
        <input id="comment-username" value={username} onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="comment-content">Write Comment</label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength="280"
        />
        <button type="submit" className="button">Publish Comment</button>
      </form>
      {message && <p className="lab-message">{message}</p>}
    </div>
  );
}

function DomProfileLab() {
  const [name, setName] = useState("Eric");

  useEffect(() => {
    window.xssDomSecret = "COMP6841{V3hN6sQ4}";

    const updateName = () => {
      const rawName = window.location.hash.slice(1) || "Eric";
      try {
        setName(decodeURIComponent(rawName));
      } catch {
        setName(rawName);
      }
    };

    updateName();
    window.addEventListener("hashchange", updateName);
    return () => window.removeEventListener("hashchange", updateName);
  }, []);

  return (
    <div className="lab-panel">
      <h2>Profile</h2>
      <p className="lab-message">Profile URL: /xss/3#name</p>
      <div className="xss-rendered-output">
        <strong>Welcome,</strong>
        <div id="profile-name" dangerouslySetInnerHTML={{ __html: name }} />
      </div>
      <pre className="source-preview">{`const name = decodeURIComponent(location.hash.substring(1));\ndocument.getElementById("profile-name").innerHTML = name;`}</pre>
    </div>
  );
}

function FlagSubmit({ challenge, onAccepted }) {
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);

  const submitFlag = async (event) => {
    event.preventDefault();
    setMessage("Submitting flag...");
    const response = await fetch(`${API_BASE}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: `xss-${challenge.id}`, flag }),
    });
    const data = await response.json();

    if (!response.ok) {
      setAccepted(false);
      setMessage(data.message || "Incorrect flag.");
      return;
    }

    setAccepted(true);
    setMessage("Congratulations! FLAG Accepted.");
    onAccepted(challenge.id);
  };

  return (
    <section className="sqli-section">
      <h2>Submit Flag</h2>
      <form className="lab-form flag-form" onSubmit={submitFlag}>
        <label htmlFor="xss-flag-input">Flag</label>
        <input id="xss-flag-input" value={flag} onChange={(event) => setFlag(event.target.value)} placeholder="COMP6841{...}" />
        <button type="submit" className="button">Submit</button>
      </form>
      {message && <p className={accepted ? "success-message" : "lab-message"}>{message}</p>}
      {accepted && challenge.id < challenges.length && (
        <Link className="button" to={`/xss/${challenge.id + 1}`}>Unlock XSS-{challenge.id + 1}</Link>
      )}
    </section>
  );
}

function ChallengeLab({ challengeId }) {
  if (challengeId === 1) return <ReflectedSearchLab />;
  if (challengeId === 2) return <StoredCommentsLab />;
  return <DomProfileLab />;
}

function XSS() {
  const { challengeId } = useParams();
  const [completed, setCompleted] = useState(getCompletedChallenges);
  const selectedChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === Number(challengeId)),
    [challengeId]
  );

  const completeChallenge = (id) => {
    setCompleted((current) => {
      const next = Array.from(new Set([...current, id])).sort((a, b) => a - b);
      saveCompletedChallenges(next);
      return next;
    });
  };

  if (!challengeId) {
    const progress = Math.round((completed.length / challenges.length) * 100);
    return (
      <div className="page sqli-page">
        <header className="page-header">
          <Link className="text-link" to="/">Home</Link>
          <h1>Cross-Site Scripting Challenges</h1>
          <p>Learn XSS through 3 progressive exercises in one fictional forum platform.</p>
        </header>
        <section className="sqli-progress">
          <div><strong>Progress</strong><span>{progress}%</span></div>
          <div className="progress-bar" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
        </section>
        <main className="sqli-list">
          {challenges.map((challenge) => {
            const isComplete = completed.includes(challenge.id);
            const isUnlocked = challenge.id === 1 || completed.includes(challenge.id - 1);
            return (
              <section className="sqli-list-item" key={challenge.id}>
                <div><p className="eyebrow">XSS-{challenge.id}</p><h2>{challenge.title}</h2><p>{challenge.learningObjective}</p></div>
                <div className="challenge-status">
                  <span>{isComplete ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}</span>
                  {isUnlocked ? <Link className="button" to={`/xss/${challenge.id}`}>Start XSS-{challenge.id}</Link> : <button type="button" className="button" disabled>Complete XSS-{challenge.id - 1}</button>}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  if (!selectedChallenge) {
    return <div className="page"><section className="challenge-detail"><h1>Challenge Not Found</h1><Link className="button" to="/xss">Back to XSS</Link></section></div>;
  }

  return (
    <div className="page sqli-page">
      <header className="challenge-hero">
        <Link className="text-link" to="/xss">Cross-Site Scripting</Link>
        <p className="eyebrow">Challenge {selectedChallenge.id}</p>
        <h1>{selectedChallenge.title}</h1>
        <div className="meta-row"><span>{selectedChallenge.module}</span><span>Difficulty: <Difficulty level={selectedChallenge.difficulty} /></span></div>
      </header>
      <section className="sqli-section"><h2>Background</h2><p>{selectedChallenge.background}</p></section>
      <section className="sqli-section"><h2>Goal</h2><p>{selectedChallenge.goal}</p></section>
      <HintPanel hints={selectedChallenge.hints} />
      <section className="sqli-section"><h2>Challenge</h2><ChallengeLab challengeId={selectedChallenge.id} /></section>
      <FlagSubmit challenge={selectedChallenge} onAccepted={completeChallenge} />
      <section className="sqli-section"><h2>Learning Objective</h2><p>{selectedChallenge.learningObjective}</p></section>
    </div>
  );
}

export default XSS;
