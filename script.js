const buttons = document.querySelectorAll(".persona-button");
const personaMapAssets = document.querySelectorAll(".persona-map-asset");
const mapButtons = document.querySelectorAll(".map-circle-overlay");
const colorMapOverlay = document.querySelector(".color-map-overlay");

let state = {
  selectedPersonas: [],
  topPersona: null,
  animatingPersonas: [],
  colorMapShown: false,
  completedAnimations: [],
};

const allPersonas = ['lucia', 'sergio', 'carina', 'marta'];

function areAllPersonasSelected() {
  return allPersonas.every(persona => state.selectedPersonas.includes(persona));
}

function areAllAnimationsCompleted() {
  return allPersonas.every(persona =>
    state.selectedPersonas.includes(persona) &&
    state.completedAnimations.includes(persona)
  );
}

function showColorMapOverlay() {
  console.log('showColorMapOverlay called');
  if (!state.colorMapShown && colorMapOverlay && areAllPersonasSelected() && areAllAnimationsCompleted()) {
    state.colorMapShown = true;
    colorMapOverlay.style.display = "block";

    setTimeout(() => {
      colorMapOverlay.classList.add("visible");
    }, 50);
  }
}

function hideColorMapOverlay() {
  console.log('hideColorMapOverlay called');
  if (state.colorMapShown && colorMapOverlay) {
    state.colorMapShown = false;
    colorMapOverlay.classList.remove("visible");
    colorMapOverlay.style.display = "none";
  }
}

function updatePersonaAssetsVisibility(selectedPersonas, topPersona) {
  console.log('updatePersonaAssetsVisibility', selectedPersonas, topPersona);
  const activePersonas = new Set(selectedPersonas);

  personaMapAssets.forEach((asset) => {
    const persona = asset.dataset.persona;
    const wasActive = asset.style.display === "block";
    const isActive = activePersonas.has(persona);
    const isTopPersona = persona === topPersona;

    if (isActive && !wasActive) {

      asset.style.display = "block";

      if (!state.animatingPersonas.includes(persona)) {
        state.animatingPersonas.push(persona);
      }

      if (asset.classList.contains("map-circle-overlay")) {
        const currentTopPersona = state.topPersona && state.topPersona !== persona ? state.topPersona : persona;
        asset.style.zIndex = persona === currentTopPersona ? 100 : 50;
      }

      setTimeout(() => {
        if (asset.classList.contains("map-color-overlay") && !asset.classList.contains("color-map-overlay")) {
          asset.classList.add("visible");
        }
        if (
          asset.classList.contains("lucia-line") ||
          asset.classList.contains("sergio-line") ||
          asset.classList.contains("carina-line") ||
          asset.classList.contains("marta-line")
        ) {
          asset.classList.add("animate");
        }
        if (asset.classList.contains("map-circle-overlay")) {
          asset.classList.add("visible");
        }
      }, 50);


      // TODO Adjust the face color time to appear
      setTimeout(() => {
        if (state.animatingPersonas.includes(persona)) {
          state.animatingPersonas = state.animatingPersonas.filter(p => p !== persona);

          if (!state.completedAnimations.includes(persona)) {
            state.completedAnimations.push(persona);
          }

          updatePlayButtonZIndexes(selectedPersonas, persona);

          if (areAllPersonasSelected() && areAllAnimationsCompleted()) {
            console.log("All personas selected and all animations completed!");
            showColorMapOverlay();
          }
        }
      }, 1500);

    } else if (!isActive && wasActive) {

      asset.classList.remove("visible", "animate");
      asset.style.display = "none";
      asset.style.zIndex = "";

      state.completedAnimations = state.completedAnimations.filter(p => p !== persona);
      state.animatingPersonas = state.animatingPersonas.filter(p => p !== persona);
    } else if (isActive && wasActive && !state.animatingPersonas.includes(persona)) {
      if (asset.classList.contains("map-circle-overlay")) {
        asset.style.zIndex = isTopPersona ? 100 : 50;
      }
    }
  });

  if (!areAllPersonasSelected() || !areAllAnimationsCompleted()) {
    hideColorMapOverlay();
  }
}

function updatePlayButtonZIndexes(selectedPersonas, topPersona) {
  console.log('updatePlayButtonZIndexes', selectedPersonas, topPersona);
  const activePersonas = new Set(selectedPersonas);

  personaMapAssets.forEach((asset) => {
    if (asset.classList.contains("map-circle-overlay")) {
      const persona = asset.dataset.persona;
      if (activePersonas.has(persona)) {
        asset.style.zIndex = persona === topPersona ? 100 : 50;
      }
    }
  });
}

function updateSelectedButton(personaToSelect) {
  console.log('updateSelectedButton', personaToSelect);
  const targetButton = document.querySelector(
    `.persona-button[data-persona="${personaToSelect}"]`
  );
  const isCurrentlySelected =
    targetButton && targetButton.classList.contains("selected");

  if (!isCurrentlySelected) {
    targetButton.classList.add("selected");
    state.selectedPersonas.push(personaToSelect);
    state.topPersona = personaToSelect;
  } else {
    if (!state.animatingPersonas.includes(personaToSelect)) {
      state.topPersona = personaToSelect;
    }
  }

    console.log('State after selection', state.selectedPersonas, state.topPersona);
    updatePersonaAssetsVisibility(state.selectedPersonas, state.topPersona);
}


// TODO Adjust this function for the video ID

mapButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const persona = btn.dataset.persona;
    const videoId = `VIDEO_${persona.toUpperCase()}`;
    console.log(videoId);

    const event = new CustomEvent("play-persona-video", {
      detail: { id: videoId },
    });
    window.dispatchEvent(event);
  });
});

buttons.forEach((btn) => {
  btn.addEventListener("mousedown", () => {
    if (!btn.classList.contains("disabled")) {
      btn.classList.add("pressed");
    }
  });
  btn.addEventListener("mouseup", () => {
    btn.classList.remove("pressed");
  });
  btn.addEventListener("mouseleave", () => {
    btn.classList.remove("pressed");
  });
  btn.addEventListener("click", () => {
    if (!btn.classList.contains("disabled")) {
      updateSelectedButton(btn.dataset.persona);
    }
  });
});

function checkButtonAvailability() {
  console.log('checkButtonAvailability called');
  const now = new Date();

  buttons.forEach((btn) => {
    const enableDateStr = btn.dataset.enableAfter;
    if (enableDateStr) {
      const enableDate = new Date(enableDateStr);
      const isEnabled = now >= enableDate;

      if (isEnabled) {
        btn.classList.remove("disabled");
        btn.removeAttribute("disabled");
        btn.removeAttribute("aria-disabled");
      } else {
        btn.classList.add("disabled");
        btn.setAttribute("disabled", "true");
        btn.setAttribute("aria-disabled", "true");

        const persona = btn.dataset.persona;
        if (state.selectedPersonas.includes(persona)) {
          state.selectedPersonas = state.selectedPersonas.filter(
            (p) => p !== persona
          );
          btn.classList.remove("selected");

          if (state.topPersona === persona) {
            state.topPersona =
              state.selectedPersonas.length > 0
                ? state.selectedPersonas[state.selectedPersonas.length - 1]
                : null;
          }
        }
      }
    }
  });

  updatePersonaAssetsVisibility(state.selectedPersonas, state.topPersona);
}

checkButtonAvailability();
setInterval(checkButtonAvailability, 60000);
updatePersonaAssetsVisibility(state.selectedPersonas, state.topPersona);
