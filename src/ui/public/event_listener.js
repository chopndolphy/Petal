export let delayTimesL = [0, 1, 2, 3, 4, 5, 6, 7, 8]
export let delayTimesR = [0, 1, 2, 3, 4, 5, 6, 7, 8]
export let reverbLevelMsr = 0.0;

if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener("delayTimesL", (values) => {
        delayTimesL = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("delayTimesR", (values) => {
        delayTimesR = JSON.parse(values);
    });

    window.__JUCE__.backend.addEventListener("reverbLevelMsr", (values) => {
        reverbLevelMsr = JSON.parse(values);
    });
} else {
    console.warn("JUCE backend not found — using placeholder delay times");
}

