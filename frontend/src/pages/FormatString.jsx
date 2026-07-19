import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

const API_BASE = "http://localhost:3000/api";

const challenges = [
  {
    id: 1,
    title: "Echo Service",
    module: "Format String Introduction",
    difficulty: 1,
    background:
      "An echo service prints everything a client submits. The developer passes the input directly to printf instead of treating it as a string value.",
    goal: "Use format specifiers to leak the flag that is stored on the stack.",
    learningObjective: "printf(user_input), %x, stack leaks, and format string fundamentals.",
    hints: [
      "The program calls printf(input), not printf(\"%s\", input).",
      "Try printing several stack values with %x.",
      "The flag is stored in a local stack variable. Watch for hexadecimal values that decode to ASCII.",
    ],
    commands: "file fs1\n./fs1\ngdb ./fs1",
  },
  {
    id: 2,
    title: "Authentication Server",
    module: "Hidden Password",
    difficulty: 2,
    background:
      "An authentication service stores a password but never displays it. A pointer to the secret remains in the vulnerable function's stack frame.",
    goal: "Find the stack value that points to the password and dereference it with a string format specifier.",
    learningObjective: "%s, arbitrary address reads, dereferencing pointers, and stack inspection.",
    hints: [
      "Strings live somewhere in memory. Can you print them?",
      "Use %x to identify values that look like addresses.",
      "A positional format specifier can select a specific stack argument before using %s.",
    ],
    commands: "./fs2\ngdb ./fs2\nx/32wx $esp",
  },
  {
    id: 3,
    title: "Admin Login",
    module: "Secret Counter",
    difficulty: 3,
    background:
      "An admin counter starts at zero. The program grants access only after the counter reaches 1337, but the echo field has a format string write primitive.",
    goal: "Use %n to write 1337 to the admin variable and trigger the flag.",
    learningObjective: "%n, memory writes, output-length control, and write primitives.",
    hints: [
      "Sometimes printing changes memory.",
      "Find the address of admin with nm, objdump, or a debugger.",
      "%n writes the number of characters printed so far to an address taken from the stack.",
    ],
    commands: "nm -n fs3\nobjdump -t fs3 | grep admin\ngdb ./fs3",
  },
  {
    id: 4,
    title: "System Utility",
    module: "Control Flow Hijack",
    difficulty: 4,
    background:
      "A system utility prints a goodbye message after echoing user input. A hidden win function remains in the binary, and the writable puts GOT entry is used after the format string call.",
    goal: "Overwrite puts@GOT with win() using format string writes, then let the next puts call execute win().",
    learningObjective: "GOT and PLT, %n, %hn, partial writes, and control-flow hijacking.",
    hints: [
      "Not every pointer is on the stack.",
      "Use readelf or objdump to locate puts@GOT, then find win() in the symbol table.",
      "Writing a full address at once is inconvenient. Partial writes with %hn are often more practical.",
    ],
    commands: "readelf -r fs4\nnm -n fs4\nobjdump -d fs4 | less",
  },
];

function getCompletedChallenges() {
  try {
    return JSON.parse(localStorage.getItem("format-progress") || "[]");
  } catch {
    return [];
  }
}

function saveCompletedChallenges(completed) {
  localStorage.setItem("format-progress", JSON.stringify(completed));
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
        <button type="button" className="button secondary" disabled={visibleHints === hints.length} onClick={() => setVisibleHints((current) => Math.min(current + 1, hints.length))}>
          Show Hint
        </button>
      </div>
      {visibleHints === 0 ? <p>No hints revealed.</p> : (
        <ol className="hint-list">
          {hints.slice(0, visibleHints).map((hint, index) => <li key={hint}>Hint {index + 1}: {hint}</li>)}
        </ol>
      )}
    </section>
  );
}

function BinaryLab({ challenge }) {
  return (
    <div className="lab-panel">
      <h2>{challenge.title}</h2>
      <p>Analyse the local 32-bit Linux binary in an isolated environment.</p>
      <div className="download-row">
        <a className="button" href={`${API_BASE}/format/${challenge.id}/download`}>Download Challenge</a>
        <a className="button secondary" href={`${API_BASE}/format/${challenge.id}/source`}>Download Source (Optional)</a>
      </div>
      <p className="download-note">The binaries are non-PIE and use writable GOT entries for this educational exercise.</p>
      <pre className="source-preview">{challenge.commands}</pre>
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
      body: JSON.stringify({ challenge: `fs-${challenge.id}`, flag }),
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
        <label htmlFor="format-flag-input">Flag</label>
        <input id="format-flag-input" value={flag} onChange={(event) => setFlag(event.target.value)} placeholder="COMP6841{...}" />
        <button type="submit" className="button">Submit</button>
      </form>
      {message && <p className={accepted ? "success-message" : "lab-message"}>{message}</p>}
      {accepted && challenge.id < challenges.length && <Link className="button" to={`/format/${challenge.id + 1}`}>Unlock FS-{challenge.id + 1}</Link>}
    </section>
  );
}

function FormatString() {
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
          <h1>Format String Challenges</h1>
          <p>Learn format string exploitation through 4 progressive 32-bit Linux exercises.</p>
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
                <div><p className="eyebrow">FS-{challenge.id}</p><h2>{challenge.title}</h2><p>{challenge.learningObjective}</p></div>
                <div className="challenge-status">
                  <span>{isComplete ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}</span>
                  {isUnlocked ? <Link className="button" to={`/format/${challenge.id}`}>Start FS-{challenge.id}</Link> : <button type="button" className="button" disabled>Complete FS-{challenge.id - 1}</button>}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  if (!selectedChallenge) {
    return <div className="page"><section className="challenge-detail"><h1>Challenge Not Found</h1><Link className="button" to="/format">Back to Format String</Link></section></div>;
  }

  return (
    <div className="page sqli-page">
      <header className="challenge-hero">
        <Link className="text-link" to="/format">Format String</Link>
        <p className="eyebrow">Challenge {selectedChallenge.id}</p>
        <h1>{selectedChallenge.title}</h1>
        <div className="meta-row"><span>{selectedChallenge.module}</span><span>Difficulty: <Difficulty level={selectedChallenge.difficulty} /></span></div>
      </header>
      <section className="sqli-section"><h2>Background</h2><p>{selectedChallenge.background}</p></section>
      <section className="sqli-section"><h2>Goal</h2><p>{selectedChallenge.goal}</p></section>
      <HintPanel hints={selectedChallenge.hints} />
      <section className="sqli-section"><h2>Challenge</h2><BinaryLab challenge={selectedChallenge} /></section>
      <FlagSubmit challenge={selectedChallenge} onAccepted={completeChallenge} />
      <section className="sqli-section"><h2>Learning Objective</h2><p>{selectedChallenge.learningObjective}</p></section>
    </div>
  );
}

export default FormatString;
