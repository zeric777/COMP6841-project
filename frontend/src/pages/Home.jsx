import { Link } from "react-router-dom";

const challenges = [
  {
    name: "SQL Injection",
    path: "/sqli",
    description: "A web security challenge placeholder for the SQL Injection category.",
  },
  {
    name: "XSS",
    path: "/xss",
    description: "A web security challenge placeholder for the Cross-Site Scripting category.",
  },
  {
    name: "Buffer Overflow",
    path: "/buffer",
    description: "A binary exploitation challenge placeholder for memory safety topics.",
  },
  {
    name: "Format String",
    path: "/format",
    description: "A binary exploitation challenge placeholder for formatted output topics.",
  },
  {
    name: "Reverse Engineering",
    path: "/reverse",
    description: "A reverse engineering challenge placeholder for program analysis topics.",
  },
];

function Home() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Home</h1>
        <p>Choose a CTF challenge!</p>
      </header>

      <main className="challenge-grid">
        {challenges.map((challenge) => (
          <section className="challenge-card" key={challenge.path}>
            <h2>{challenge.name}</h2>
            <p>{challenge.description}</p>
            <Link className="button" to={challenge.path}>
              Start Challenge
            </Link>
          </section>
        ))}
      </main>
    </div>
  );
}

export default Home;
