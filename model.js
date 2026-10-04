(() => {
  "use strict";

  const optionSets = {
    activity: {
      low: { label: "Eher selten", points: 0 },
      medium: { label: "Durchschnittlich", points: 10 },
      high: { label: "Häufig", points: 20 }
    },
    location: {
      city: { label: "Dichte Stadtlage", points: 0 },
      suburb: { label: "Wohnsiedlung", points: 5 },
      open: { label: "Freistehend", points: 12 },
      elevated: { label: "Erhöhte Lage", points: 20 }
    },
    area: {
      small: { label: "Unter 100 m²", points: 0 },
      medium: { label: "100–200 m²", points: 4 },
      large: { label: "200–400 m²", points: 8 },
      "very-large": { label: "Über 400 m²", points: 12 }
    },
    height: {
      low: { label: "Unter 10 m", points: 0 },
      medium: { label: "10–20 m", points: 6 },
      high: { label: "Über 20 m", points: 12 }
    },
    material: {
      solid: { label: "Massivbau", points: 0 },
      wood: { label: "Holzbau", points: 8 },
      thatch: { label: "Weiche Bedachung", points: 15 }
    },
    occupancy: {
      occasional: { label: "Gelegentliche Nutzung", points: 0 },
      "one-two": { label: "1–2 Personen", points: 3 },
      "three-four": { label: "3–4 Personen", points: 6 },
      "five-plus": { label: "5 oder mehr Personen", points: 9 }
    },
    valueBand: {
      "under-200": { label: "Unter 200.000 €", points: 0 },
      "200-400": { label: "200.000–400.000 €", points: 4 },
      "400-800": { label: "400.000–800.000 €", points: 8 },
      "over-800": { label: "Über 800.000 €", points: 12 }
    }
  };

  const fixedFactors = [
    { key: "activity", label: "Regionale Aktivität", max: 20, group: "Exposition" },
    { key: "location", label: "Gebäudelage", max: 20, group: "Exposition" },
    { key: "area", label: "Grundfläche", max: 12, group: "Exposition" },
    { key: "height", label: "Gebäudehöhe", max: 12, group: "Exposition" },
    { key: "material", label: "Bauweise", max: 15, group: "Auswirkung" },
    { key: "occupancy", label: "Nutzung", max: 9, group: "Auswirkung" },
    { key: "valueBand", label: "Sachwert", max: 12, group: "Auswirkung" }
  ];

  function assertOption(field, value) {
    if (!optionSets[field] || !optionSets[field][value]) {
      throw new Error(`Ungültiger Wert für ${field}.`);
    }
    return optionSets[field][value];
  }

  function normalizeState(state) {
    const equipment = Number(state.equipment);
    if (!Number.isInteger(equipment) || equipment < 0 || equipment > 20) {
      throw new Error("Die Anzahl technischer Anlagen ist ungültig.");
    }

    const normalized = {
      activity: String(state.activity || ""),
      location: String(state.location || ""),
      area: String(state.area || ""),
      height: String(state.height || ""),
      material: String(state.material || ""),
      occupancy: String(state.occupancy || ""),
      equipment,
      surgeProtection: Boolean(state.surgeProtection),
      valueBand: String(state.valueBand || "")
    };

    Object.keys(optionSets).forEach((field) => assertOption(field, normalized[field]));
    return normalized;
  }

  function levelFor(score) {
    if (score >= 60) {
      return {
        key: "elevated",
        label: "Erhöhter Orientierungswert",
        summary: "Mehrere der ausgewählten Faktoren werden im Demonstrationsmodell stärker gewichtet. Eine individuelle Prüfung durch eine qualifizierte Fachperson ist besonders sinnvoll."
      };
    }
    if (score >= 30) {
      return {
        key: "medium",
        label: "Mittlerer Orientierungswert",
        summary: "Einige Faktoren erhöhen den Demonstrationswert. Schutzmaßnahmen sollten passend zum konkreten Gebäude fachlich geprüft werden."
      };
    }
    return {
      key: "low",
      label: "Niedriger Orientierungswert",
      summary: "Im vereinfachten Modell sind wenige stark gewichtete Faktoren vorhanden. Daraus folgt jedoch keine Aussage, dass Schutzmaßnahmen unnötig sind."
    };
  }

  function buildAssessment(input) {
    const state = normalizeState(input);
    const breakdown = fixedFactors.map((factor) => {
      const option = assertOption(factor.key, state[factor.key]);
      return { ...factor, valueLabel: option.label, points: option.points };
    });

    const equipmentPoints = Math.min(state.equipment, 3) * 3;
    breakdown.splice(6, 0, {
      key: "equipment",
      label: "Technische Anlagen",
      valueLabel: `${state.equipment} ${state.equipment === 1 ? "Anlage" : "Anlagen"}`,
      points: equipmentPoints,
      max: 9,
      group: "Auswirkung"
    });

    breakdown.push({
      key: "surgeProtection",
      label: "Überspannungsschutz",
      valueLabel: state.surgeProtection ? "Vorhanden" : "Nicht angegeben",
      points: state.surgeProtection ? -5 : 0,
      max: 5,
      group: "Minderung"
    });

    const maximum = 109;
    const rawScore = Math.max(0, breakdown.reduce((sum, factor) => sum + factor.points, 0));
    const score = Math.round((rawScore / maximum) * 100);

    return {
      schemaVersion: 2,
      createdAt: new Date().toISOString(),
      state,
      rawScore,
      maximum,
      score,
      level: levelFor(score),
      breakdown
    };
  }

  function labelFor(field, value) {
    return assertOption(field, value).label;
  }

  function reviewItems(input) {
    const state = normalizeState(input);
    return [
      ["Region", labelFor("activity", state.activity)],
      ["Lage", labelFor("location", state.location)],
      ["Grundfläche", labelFor("area", state.area)],
      ["Höhe", labelFor("height", state.height)],
      ["Bauweise", labelFor("material", state.material)],
      ["Nutzung", labelFor("occupancy", state.occupancy)],
      ["Technische Anlagen", String(state.equipment)],
      ["Überspannungsschutz", state.surgeProtection ? "Vorhanden" : "Nicht angegeben"],
      ["Sachwert", labelFor("valueBand", state.valueBand)]
    ];
  }

  function encodeState(input) {
    return encodeURIComponent(JSON.stringify(normalizeState(input)));
  }

  function decodeState(value) {
    if (!value) throw new Error("Keine Auswertungsdaten vorhanden.");
    return normalizeState(JSON.parse(decodeURIComponent(value)));
  }

  window.BlitziModel = {
    buildAssessment,
    decodeState,
    encodeState,
    normalizeState,
    reviewItems
  };
})();
