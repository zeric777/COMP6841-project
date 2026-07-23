import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import SolutionGuide from "../components/SolutionGuide";
import { bofSolutions } from "../data/challengeSolutions";

const API_BASE = "http://localhost:3000/api";

const challenges = [
  {
    id: 1,
    title: "Employee Verification",
    module: "Change a Variable",
    difficulty: 1,
    background:
      "An employee verification utility accepts an employee name. Only records assigned to team B can print the verification flag.",
    goal: "Overflow the name field and change the adjacent team value from A to B.",
    learningObjective: "Buffer overflows, stack layout, gets(), and local variable overwrites.",
    hints: [
      "The name field has a fixed length, but the input function has no length limit.",
      "Inspect the local record layout in a debugger or read the optional source.",
      "The team byte is directly after the 32-byte name field.",
    ],
    commands: "file bof1\n./bof1\ngdb ./bof1",
  },
  {
    id: 2,
    title: "Binary Login",
    module: "Return Address",
    difficulty: 2,
    background:
      "A login utility contains a win function that normal program flow never calls. The password input is handled by a vulnerable function.",
    goal: "Find win() and redirect the vulnerable function's return address to it.",
    learningObjective: "Saved frame pointers, return addresses, offsets, and control-flow hijacking.",
    hints: [
      "There is a function that nobody calls.",
      "Use nm, objdump, or disassemble in gdb to find its address.",
      "A cyclic pattern can help identify the exact return-address offset.",
    ],
    commands: "checksec --file=bof2\nnm -n bof2\ngdb ./bof2",
  },
  {
    id: 3,
    title: "Backup Server",
    module: "Hidden Admin Shell",
    difficulty: 3,
    background:
      "A backup server offers login, backup, and exit options. A leftover debugging function is still included in the binary but never appears in the menu.",
    goal: "Analyse the program, locate the hidden function, and redirect login() to it.",
    learningObjective: "Binary analysis, hidden functions, symbol tables, objdump, strings, and gdb.",
    hints: [
      "Developers sometimes forget to remove debug functions.",
      "The menu is not the full list of functions in the binary.",
      "Inspect symbols and then determine the login() return-address offset.",
    ],
    commands: "strings bof3\nnm -n bof3\nobjdump -d bof3 | less",
  },
];

function getCompletedChallenges() {
  try {
    return JSON.parse(localStorage.getItem("bof-progress") || "[]");
  } catch {
    return [];
  }
}

function saveCompletedChallenges(completed) {
  localStorage.setItem("bof-progress", JSON.stringify(completed));
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
      <p>Analyse the local Linux binary in an isolated environment.</p>
      <div className="download-row">
        <a className="button" href={`${API_BASE}/bof/${challenge.id}/download`}>Download Challenge</a>
        <a className="button secondary" href={`${API_BASE}/bof/${challenge.id}/source`}>Download Source (Optional)</a>
      </div>
      <p className="download-note">The binary is compiled without PIE and stack canaries for this educational exercise.</p>
      <pre className="source-preview">{challenge.commands}</pre>
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
      body: JSON.stringify({ challenge: `bof-${challenge.id}`, flag }),
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
          <label htmlFor="bof-flag-input">Flag</label>
          <input id="bof-flag-input" value={flag} onChange={(event) => setFlag(event.target.value)} placeholder="COMP6841{...}" />
          <button type="submit" className="button">Submit</button>
        </form>
        {message && <p className={accepted ? "success-message" : "lab-message"}>{message}</p>}
      </section>
      {accepted && <SolutionGuide solution={solution} />}
      {accepted && challenge.id < challenges.length && (
        <div className="solution-actions">
          <Link className="button" to={`/buffer/${challenge.id + 1}`}>Unlock BOF-{challenge.id + 1}</Link>
        </div>
      )}
    </>
  );
}

function BufferOverflow() {
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
          <h1>Buffer Overflow Challenges</h1>
          <p>Learn stack-based binary exploitation through 3 progressive Linux exercises.</p>
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
                <div><p className="eyebrow">BOF-{challenge.id}</p><h2>{challenge.title}</h2><p>{challenge.learningObjective}</p></div>
                <div className="challenge-status">
                  <span>{isComplete ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}</span>
                  {isUnlocked ? <Link className="button" to={`/buffer/${challenge.id}`}>Start BOF-{challenge.id}</Link> : <button type="button" className="button" disabled>Complete BOF-{challenge.id - 1}</button>}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  if (!selectedChallenge) {
    return <div className="page"><section className="challenge-detail"><h1>Challenge Not Found</h1><Link className="button" to="/buffer">Back to Buffer Overflow</Link></section></div>;
  }

  return (
    <div className="page sqli-page">
      <header className="challenge-hero">
        <Link className="text-link" to="/buffer">Buffer Overflow</Link>
        <p className="eyebrow">Challenge {selectedChallenge.id}</p>
        <h1>{selectedChallenge.title}</h1>
        <div className="meta-row"><span>{selectedChallenge.module}</span><span>Difficulty: <Difficulty level={selectedChallenge.difficulty} /></span></div>
      </header>
      <section className="sqli-section"><h2>Background</h2><p>{selectedChallenge.background}</p></section>
      <section className="sqli-section"><h2>Goal</h2><p>{selectedChallenge.goal}</p></section>
      <HintPanel hints={selectedChallenge.hints} />
      <section className="sqli-section"><h2>Challenge</h2><BinaryLab challenge={selectedChallenge} /></section>
      <FlagSubmit
        key={`bof-flag-${selectedChallenge.id}`}
        challenge={selectedChallenge}
        isCompleted={completed.includes(selectedChallenge.id)}
        onAccepted={completeChallenge}
        solution={bofSolutions[selectedChallenge.id]}
      />
      <section className="sqli-section"><h2>Learning Objective</h2><p>{selectedChallenge.learningObjective}</p></section>
    </div>
  );
}

export default BufferOverflow;
