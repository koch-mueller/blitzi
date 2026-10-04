(() => {
  "use strict";

  const form = document.getElementById("assessment-form");
  const steps = [...document.querySelectorAll(".wizard-step")];
  const stepButtons = [...document.querySelectorAll(".step-dot")];
  const progressLabel = document.getElementById("progress-label");
  const reviewGrid = document.getElementById("review-grid");
  const model = window.BlitziModel;

  let currentStep = 0;
  let furthestStep = 0;

  function collectState() {
    const data = new FormData(form);
    return {
      activity: data.get("activity"),
      location: data.get("location"),
      area: data.get("area"),
      height: data.get("height"),
      material: data.get("material"),
      occupancy: data.get("occupancy"),
      equipment: Number(data.get("equipment")),
      surgeProtection: data.get("surgeProtection") === "on",
      valueBand: data.get("valueBand")
    };
  }

  function restoreStateFromHash() {
    try {
      if (!window.location.hash) return;
      const state = model.decodeState(window.location.hash.slice(1));

      Object.entries(state).forEach(([name, value]) => {
        if (typeof value === "boolean") {
          const checkbox = form.elements.namedItem(name);
          if (checkbox) checkbox.checked = value;
          return;
        }

        const field = form.querySelector(`[name="${name}"][value="${CSS.escape(String(value))}"]`)
          || form.elements.namedItem(name);
        if (!field) return;
        if (field instanceof RadioNodeList) {
          field.value = String(value);
        } else {
          field.value = String(value);
        }
      });

      furthestStep = steps.length - 1;
    } catch {
      // Ignore malformed or outdated fragments and start with an empty form.
    }
  }

  function validateStep(index, report = true) {
    const controls = [...steps[index].querySelectorAll("input, select")];
    const invalid = controls.find((control) => !control.checkValidity());
    if (!invalid) return true;
    if (report) invalid.reportValidity();
    return false;
  }

  function renderReview() {
    reviewGrid.replaceChildren();
    model.reviewItems(collectState()).forEach(([term, description]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "review-item";
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description;
      wrapper.append(dt, dd);
      reviewGrid.append(wrapper);
    });
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === currentStep));

    stepButtons.forEach((button, stepIndex) => {
      const active = stepIndex === currentStep;
      button.classList.toggle("active", active);
      button.classList.toggle("done", stepIndex < furthestStep || (furthestStep === steps.length - 1 && stepIndex < currentStep));
      button.setAttribute("aria-current", active ? "step" : "false");
      button.setAttribute("aria-disabled", stepIndex > furthestStep ? "true" : "false");
    });

    progressLabel.textContent = `Schritt ${currentStep + 1} von ${steps.length}`;
    if (currentStep === steps.length - 1) renderReview();
    document.querySelector("main").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      furthestStep = Math.max(furthestStep, currentStep + 1);
      showStep(currentStep + 1);
    });
  });

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => showStep(currentStep - 1));
  });

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.step);
      if (target <= furthestStep) showStep(target);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalidStep = steps.findIndex((_, index) => !validateStep(index, false));
    if (firstInvalidStep !== -1) {
      showStep(firstInvalidStep);
      validateStep(firstInvalidStep);
      return;
    }

    try {
      const state = collectState();
      model.buildAssessment(state);
      window.location.href = `ergebnis.html#${model.encodeState(state)}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Die Auswertung konnte nicht erstellt werden.");
    }
  });

  restoreStateFromHash();
  showStep(0);
})();
