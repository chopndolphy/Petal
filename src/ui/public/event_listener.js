export let delayTimesL = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
export let delayTimesR = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

export let amplitudesL = [0, 0, 0, 0, 0, 0, 0, 0];
export let amplitudesR = [0, 0, 0, 0, 0, 0, 0, 0];
export let tapStates = [1, 1, 1, 1, 1, 1, 1, 1];

export let reverbLevelMsr = 0.0;

if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener("delayTimesL", (values) => {
        delayTimesL = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("delayTimesR", (values) => {
        delayTimesR = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("amplitudesL", (values) => {
        amplitudesL = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("amplitudesR", (values) => {
        amplitudesR = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("tapStates", (values) => {
        tapStates = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("reverbLevelMsr", (values) => {
        reverbLevelMsr = JSON.parse(values);
    });

} else {
    console.warn("JUCE backend not found — using placeholder delay times");
}