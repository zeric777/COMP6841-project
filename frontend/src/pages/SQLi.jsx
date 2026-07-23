import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import SolutionGuide from "../components/SolutionGuide";
import { sqliSolutions } from "../data/challengeSolutions";

const API_BASE = "http://localhost:3000/api";

const challenges = [
  {
    id: 1,
    title: "Product Search",
    module: "Product Search",
    difficulty: 1,
    background:
      "A shopping website allows users to search products. The developer believes a simple search box is low risk.",
    goal: "Retrieve the hidden flag stored in the database.",
    learningObjective: "UNION SELECT, column count discovery, and database enumeration.",
    hints: [
      "The input is directly used in a SQL query.",
      "How many columns does the product query return?",
      "UNION can combine another result set with the product list.",
    ],
  },
  {
    id: 2,
    title: "Advanced Search",
    module: "Product Advanced Search",
    difficulty: 2,
    background:
      "The developer noticed suspicious search input and blocked spaces. The search feature is still backed by the same product database.",
    goal: "Bypass the filter and retrieve the hidden flag.",
    learningObjective: "WAF filter bypass, comments, newline separation, and token boundaries.",
    hints: [
      "The filter rejects spaces and tabs.",
      "Whitespace is not always a literal space.",
      "SQL comments can separate tokens.",
    ],
  },
  {
    id: 3,
    title: "User Directory",
    module: "User Lookup",
    difficulty: 3,
    background:
      "The company removed database output from the profile page. The page now only says whether a user exists.",
    goal: "Use true and false responses to infer the flag.",
    learningObjective: "Boolean blind SQL injection, length checks, substr(), and ASCII reasoning.",
    hints: [
      "Observe the response carefully.",
      "A condition that is true changes the message.",
      "Try checking one character or one length at a time.",
    ],
  },
  {
    id: 4,
    title: "Admin Portal",
    module: "Admin Login",
    difficulty: 4,
    background:
      "The admin login blocks UNION and SELECT. The authentication logic itself still trusts user input.",
    goal: "Access the administrator panel and retrieve the flag.",
    learningObjective: "Authentication bypass, login logic, and SQLite expression behavior.",
    hints: [
      "This challenge is not about returning extra rows with UNION.",
      "Think about how the WHERE clause decides whether a login is valid.",
      "A comment can change what part of a query is evaluated.",
    ],
  },
  {
    id: 5,
    title: "Employee Management",
    module: "Employee Bio Export",
    difficulty: 5,
    background:
      "Employees can register, log in, and edit their bio. The bio looks harmless when saved, but the export tool later reuses stored data.",
    goal: "Trigger the stored input during export and recover the flag.",
    learningObjective: "Second-order SQL injection, stored payloads, and data-flow analysis.",
    hints: [
      "The first request stores data but does not immediately show anything interesting.",
      "Look for a later feature that reuses your stored bio.",
      "The export step is where the stored input matters.",
    ],
  },
];

function getCompletedChallenges() {
  try {
    return JSON.parse(localStorage.getItem("sqli-progress") || "[]");
  } catch {
    return [];
  }
}

function saveCompletedChallenges(completed) {
  localStorage.setItem("sqli-progress", JSON.stringify(completed));
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
          onClick={() => setVisibleHints((current) => Math.min(current + 1, hints.length))}
          disabled={visibleHints === hints.length}
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

function ProductSearchLab({ challengeId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  const search = async (event) => {
    event.preventDefault();
    setMessage("Searching...");
    setResults([]);

    const response = await fetch(`${API_BASE}/sqli/${challengeId}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Search failed.");
      return;
    }

    setResults(data.results || []);
    setMessage(data.results?.length ? "Search complete." : "No products found.");
  };

  return (
    <div className="lab-panel">
      <h2>Product Search</h2>
      <form className="lab-form" onSubmit={search}>
        <label htmlFor={`search-${challengeId}`}>Search</label>
        <input
          id={`search-${challengeId}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Apple"
        />
        <button type="submit" className="button">Search</button>
      </form>
      {message && <p className="lab-message">{message}</p>}
      <div className="result-list">
        {results.map((result, index) => (
          <div className="result-row" key={`${result.id}-${result.name}-${index}`}>
            <span>{result.name}</span>
            <span>{result.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlindLookupLab() {
  const [id, setId] = useState("1");
  const [message, setMessage] = useState("");

  const lookup = async (event) => {
    event.preventDefault();
    setMessage("Looking up user...");

    const response = await fetch(`${API_BASE}/sqli/3/profile?id=${encodeURIComponent(id)}`);
    const data = await response.json();
    setMessage(data.message || "Lookup failed.");
  };

  return (
    <div className="lab-panel">
      <h2>User Lookup</h2>
      <form className="lab-form" onSubmit={lookup}>
        <label htmlFor="profile-id">User ID</label>
        <input id="profile-id" value={id} onChange={(event) => setId(event.target.value)} />
        <button type="submit" className="button">Lookup</button>
      </form>
      {message && <p className="lab-message">{message}</p>}
    </div>
  );
}

function AdminLoginLab() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [panel, setPanel] = useState(null);
  const [message, setMessage] = useState("");

  const login = async (event) => {
    event.preventDefault();
    setMessage("Checking credentials...");
    setPanel(null);

    const response = await fetch(`${API_BASE}/sqli/4/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }

    setMessage(data.message);
    setPanel(data);
  };

  return (
    <div className="lab-panel login-panel">
      <h2>Admin Portal</h2>
      <form className="lab-form" onSubmit={login}>
        <label htmlFor="admin-username">Username</label>
        <input id="admin-username" value={username} onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className="button">Login</button>
      </form>
      {message && <p className="lab-message">{message}</p>}
      {panel && (
        <div className="admin-panel">
          <h3>Admin Panel</h3>
          <ul>
            {panel.panel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <code>{panel.flag}</code>
        </div>
      )}
    </div>
  );
}

function EmployeeLab() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeUser, setActiveUser] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [exportRows, setExportRows] = useState([]);

  const register = async (event) => {
    event.preventDefault();
    setMessage("Registering...");
    const response = await fetch(`${API_BASE}/sqli/5/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setMessage(data.message || "Registration failed.");
  };

  const login = async () => {
    setMessage("Logging in...");
    const response = await fetch(`${API_BASE}/sqli/5/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }

    setActiveUser(data.username);
    setMessage(`Logged in as ${data.username}.`);
  };

  const saveBio = async () => {
    setMessage("Saving bio...");
    const response = await fetch(`${API_BASE}/sqli/5/bio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: activeUser, bio }),
    });
    const data = await response.json();
    setMessage(data.message || "Save failed.");
  };

  const exportUsers = async () => {
    setMessage("Exporting users...");
    setExportRows([]);
    const response = await fetch(`${API_BASE}/sqli/5/export?username=${encodeURIComponent(activeUser)}`);
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Export failed.");
      return;
    }

    setMessage("Export complete.");
    setExportRows(data.results || []);
  };

  return (
    <div className="lab-panel employee-panel">
      <h2>Employee Management</h2>
      <form className="lab-form" onSubmit={register}>
        <label htmlFor="employee-username">Username</label>
        <input id="employee-username" value={username} onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="employee-password">Password</label>
        <input
          id="employee-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="button-row">
          <button type="submit" className="button secondary">Register</button>
          <button type="button" className="button" onClick={login}>Login</button>
        </div>
      </form>

      {activeUser && (
        <div className="profile-editor">
          <h3>Profile</h3>
          <label htmlFor="employee-bio">Bio</label>
          <textarea id="employee-bio" value={bio} onChange={(event) => setBio(event.target.value)} />
          <div className="button-row">
            <button type="button" className="button secondary" onClick={saveBio}>Save Bio</button>
            <button type="button" className="button" onClick={exportUsers}>Export Users</button>
          </div>
        </div>
      )}

      {message && <p className="lab-message">{message}</p>}
      {exportRows.length > 0 && (
        <pre className="csv-output">
username,bio
{exportRows.map((row) => `${row.username},${row.bio}`).join("\n")}
        </pre>
      )}
    </div>
  );
}

function FlagSubmit({ challenge, isCompleted, onAccepted, solution }) {
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(isCompleted);

  const submitFlag = async (event) => {
    event.preventDefault();
    setMessage("Submitting flag...");

    const response = await fetch(`${API_BASE}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: challenge.id, flag }),
    });
    const data = await response.json();

    if (!response.ok) {
      setAccepted(isCompleted);
      setMessage(data.message || "Incorrect flag.");
      return;
    }

    setAccepted(true);
    setMessage("Congratulations! FLAG Accepted.");
    onAccepted(challenge.id);
  };

  return (
    <>
      <section className="sqli-section">
        <h2>Submit Flag</h2>
        <form className="lab-form flag-form" onSubmit={submitFlag}>
          <label htmlFor="flag-input">Flag</label>
          <input
            id="flag-input"
            value={flag}
            onChange={(event) => setFlag(event.target.value)}
            placeholder="COMP6841{...}"
          />
          <button type="submit" className="button">Submit</button>
        </form>
        {message && <p className={accepted ? "success-message" : "lab-message"}>{message}</p>}
      </section>
      {accepted && <SolutionGuide solution={solution} />}
      {accepted && challenge.id < challenges.length && (
        <div className="solution-actions">
          <Link className="button" to={`/sqli/${challenge.id + 1}`}>
            Unlock SQLi-{challenge.id + 1}
          </Link>
        </div>
      )}
    </>
  );
}

function ChallengeLab({ challengeId }) {
  if (challengeId === 1 || challengeId === 2) {
    return <ProductSearchLab challengeId={challengeId} />;
  }

  if (challengeId === 3) {
    return <BlindLookupLab />;
  }

  if (challengeId === 4) {
    return <AdminLoginLab />;
  }

  return <EmployeeLab />;
}

function SQLi() {
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
          <h1>SQL Injection Challenges</h1>
          <p>Learn SQL Injection through 5 progressive exercises inside one fictional company website.</p>
        </header>

        <section className="sqli-progress">
          <div>
            <strong>Progress</strong>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>

        <main className="sqli-list">
          {challenges.map((challenge) => {
            const isComplete = completed.includes(challenge.id);
            const isUnlocked = challenge.id === 1 || completed.includes(challenge.id - 1);

            return (
              <section className="sqli-list-item" key={challenge.id}>
                <div>
                  <p className="eyebrow">SQLi-{challenge.id}</p>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.learningObjective}</p>
                </div>
                <div className="challenge-status">
                  <span>{isComplete ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}</span>
                  {isUnlocked ? (
                    <Link className="button" to={`/sqli/${challenge.id}`}>
                      Start SQLi-{challenge.id}
                    </Link>
                  ) : (
                    <button type="button" className="button" disabled>
                      Complete SQLi-{challenge.id - 1}
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  if (!selectedChallenge) {
    return (
      <div className="page">
        <section className="challenge-detail">
          <h1>Challenge Not Found</h1>
          <Link className="button" to="/sqli">Back to SQL Injection</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page sqli-page">
      <header className="challenge-hero">
        <Link className="text-link" to="/sqli">SQL Injection</Link>
        <p className="eyebrow">Challenge {selectedChallenge.id}</p>
        <h1>{selectedChallenge.title}</h1>
        <div className="meta-row">
          <span>{selectedChallenge.module}</span>
          <span>Difficulty: <Difficulty level={selectedChallenge.difficulty} /></span>
        </div>
      </header>

      <section className="sqli-section">
        <h2>Background</h2>
        <p>{selectedChallenge.background}</p>
      </section>

      <section className="sqli-section">
        <h2>Goal</h2>
        <p>{selectedChallenge.goal}</p>
      </section>

      <HintPanel hints={selectedChallenge.hints} />

      <section className="sqli-section">
        <h2>Challenge</h2>
        <ChallengeLab challengeId={selectedChallenge.id} />
      </section>

      <FlagSubmit
        key={`sqli-flag-${selectedChallenge.id}`}
        challenge={selectedChallenge}
        isCompleted={completed.includes(selectedChallenge.id)}
        onAccepted={completeChallenge}
        solution={sqliSolutions[selectedChallenge.id]}
      />

      <section className="sqli-section">
        <h2>Learning Objective</h2>
        <p>{selectedChallenge.learningObjective}</p>
      </section>
    </div>
  );
}

export default SQLi;
