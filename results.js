(() => {
  "use strict";

  const model = window.BlitziModel;
  const resultContent = document.getElementById("result-content");
  const emptyState = document.getElementById("empty-state");

  function recommendationsFor(assessment) {
    const { state, score } = assessment;
    const recommendations = [
      "Lass die konkrete Situation bei einer geplanten Schutzmaßnahme von einer qualifizierten Blitzschutz- oder Elektrofachkraft bewerten."
    ];

    if (!state.surgeProtection) {
      recommendations.push("Lass prüfen, ob ein fachgerecht abgestimmter Überspannungsschutz für Gebäude und Technik sinnvoll ist.");
    }
    if (state.location === "open" || state.location === "elevated" || state.height === "high") {
      recommendations.push("Sprich die exponierte Lage beziehungsweise Gebäudehöhe bei einer fachlichen Bewertung ausdrücklich an.");
    }
    if (state.material !== "solid") {
      recommendations.push("Die Bauweise sollte bei der Planung möglicher äußerer Schutzmaßnahmen besonders berücksichtigt werden.");
    }
    if (state.equipment > 0) {
      recommendations.push("Dokumentiere empfindliche Gebäudetechnik und berücksichtige sie in einem abgestimmten Schutzkonzept.");
    }
    if (score < 30) {
      recommendations.push("Auch ein niedriger Demonstrationswert schließt einen Schaden oder verbindliche Anforderungen nicht aus.");
    }

    return recommendations;
  }

  function render(assessment) {
    document.getElementById("score-value").textContent = String(assessment.score);
    document.getElementById("result-level").textContent = assessment.level.label;
    document.getElementById("result-summary").textContent = assessment.level.summary;

    const scoreRing = document.getElementById("score-ring");
    const color = assessment.level.key === "elevated"
      ? "var(--red)"
      : assessment.level.key === "medium"
        ? "var(--orange)"
        : "var(--green)";
    scoreRing.style.setProperty("--score", String(assessment.score));
    scoreRing.style.setProperty("--score-color", color);

    const breakdown = document.getElementById("breakdown");
    breakdown.replaceChildren();
    assessment.breakdown.forEach((factor) => {
      const row = document.createElement("div");
      row.className = "breakdown-row";

      const label = document.createElement("div");
      label.className = "breakdown-label";
      const strong = document.createElement("strong");
      const detail = document.createElement("span");
      strong.textContent = factor.label;
      detail.textContent = factor.valueLabel;
      label.append(strong, detail);

      const bar = document.createElement("div");
      bar.className = "bar";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${Math.min(100, Math.abs(factor.points) / factor.max * 100)}%`;
      if (factor.points < 0) fill.style.background = "var(--green)";
      bar.append(fill);

      const points = document.createElement("div");
      points.className = "points";
      points.textContent = factor.points > 0 ? `+${factor.points}` : String(factor.points);

      row.append(label, bar, points);
      breakdown.append(row);
    });

    const recommendationList = document.getElementById("recommendations");
    recommendationList.replaceChildren();
    recommendationsFor(assessment).forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      recommendationList.append(item);
    });

    resultContent.hidden = false;
    emptyState.hidden = true;

    const editLink = document.getElementById("edit-link");
    editLink.href = `stepwizard.html#${model.encodeState(assessment.state)}`;
  }

  try {
    const state = model.decodeState(window.location.hash.slice(1));
    const assessment = model.buildAssessment(state);
    render(assessment);
  } catch {
    resultContent.hidden = true;
    emptyState.hidden = false;
  }

  document.getElementById("restart-button").addEventListener("click", () => {
    window.location.href = "stepwizard.html";
  });
})();
