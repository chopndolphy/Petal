



let eventCount = 0;

    document.addEventListener("click", () => {
        eventCount++
        document.querySelector("h2").innerText = eventCount;
    })

    window.__JUCE__.backend.addEventListener("amplitudesL", (testVal) => {
        const jsTestVal = JSON.parse(testVal);
        document.querySelector("#ampL").innerText = jsTestVal;
    });

    window.__JUCE__.backend.addEventListener("amplitudesR", (testVal) => {
        const jsTestVal = JSON.parse(testVal);

        document.querySelector("#ampR").innerText = jsTestVal;
    });

