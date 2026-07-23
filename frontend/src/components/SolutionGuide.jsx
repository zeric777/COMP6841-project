function SolutionGuide({ solution }) {
  return (
    <section className="sqli-section solution-guide" aria-labelledby="solution-guide-title">
      <div className="solution-heading">
        <p className="eyebrow">Post-Solve Write-up</p>
        <h2 id="solution-guide-title">How the Challenge Works</h2>
      </div>

      <div className="solution-layout">
        <div>
          <h3>Vulnerability Principle</h3>
          <p>{solution.principle}</p>
        </div>
        <div>
          <h3>Solution Path</h3>
          <ol className="solution-steps">
            {solution.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Defensive Takeaway</h3>
          <p>{solution.defense}</p>
        </div>
      </div>

      {solution.example && (
        <div className="solution-example">
          <h3>{solution.exampleLabel || "Key Observation"}</h3>
          <pre className="source-preview">{solution.example}</pre>
        </div>
      )}
    </section>
  );
}

export default SolutionGuide;
