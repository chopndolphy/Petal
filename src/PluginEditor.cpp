
#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "PluginEditor.h"
#include "BinaryData.h"

//==============================================================================

namespace {
    static const char* getMimeForExtension(const juce::String& extension) {
        static const std::unordered_map<juce::String, const char*> mimeMap = {
            {{"htm"}, "text/html"},
            {{"html"}, "text/html"},
            {{"txt"}, "text/plain"},
            {{"jpg"}, "image/jpeg"},
            {{"jpeg"}, "image/jpeg"},
            {{"svg"}, "image/svg+xml"},
            {{"ico"}, "image/vnd.microsoft.icon"},
            {{"json"}, "application/json"},
            {{"png"}, "image/png"},
            {{"css"}, "text/css"},
            {{"map"}, "application/json"},
            {{"js"}, "text/javascript"},
            {{"woff2"}, "font/woff2"}};

        if (const auto it = mimeMap.find(extension.toLowerCase());
            it != mimeMap.end())
            return it->second;

        jassertfalse;
        return "";
        }
} 


//==============================================================================
std::array<std::unique_ptr<juce::WebSliderRelay>, 8> PetalAudioProcessorEditor::makeTapRelays (const juce::String& idPrefix)
{
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> relays;

    for (int tap = 0; tap < 8; ++tap)
        relays[tap] = std::make_unique<juce::WebSliderRelay>(idPrefix + juce::String(tap));

    return relays;
}

PetalAudioProcessorEditor::PetalAudioProcessorEditor(PetalAudioProcessor &p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    addAndMakeVisible(webview);

#if JUCE_DEBUG
    webview.goToURL("http://localhost:4000");
#else
    webview.goToURL(juce::WebBrowserComponent::getResourceProviderRoot());
#endif
    const int width = 950;
    setResizable(true, false);
    setResizeLimits((int)width * 0.75f, (int)width * 0.75f / 2, (int)width, (int)width / 2);
    getConstrainer()->setFixedAspectRatio(2); // <-- likely triggers a bounds check/resize here

    resizer = std::make_unique<juce::ResizableBorderComponent>(this, getConstrainer()); // resizer created AFTER
    addAndMakeVisible(resizer.get());

    setSize(width, width / 2); 
    startTimerHz(30);

    inputLevelAttachment.sendInitialUpdate();

    freeTimeLAttachment.sendInitialUpdate();
    freeTimeRAttachment.sendInitialUpdate();
    syncTimeLAttachment.sendInitialUpdate();
    syncTimeRAttachment.sendInitialUpdate();
    isSyncLAttachment.sendInitialUpdate();
    isSyncRAttachment.sendInitialUpdate();
    stereoLockAttachment.sendInitialUpdate();
    positionLAttachment.sendInitialUpdate();
    skewLAttachment.sendInitialUpdate();
    positionRAttachment.sendInitialUpdate();
    skewRAttachment.sendInitialUpdate();
    roundAttachment.sendInitialUpdate();

    windowSizeAttachment.sendInitialUpdate();
    delayLevelAttachment.sendInitialUpdate();

    reverbSizeAttachment.sendInitialUpdate();
    reverbDecayTimeAttachment.sendInitialUpdate();
    reverbLPFAttachment.sendInitialUpdate();
    reverbHPFAttachment.sendInitialUpdate();
    reverbLevelAttachment.sendInitialUpdate();

    dryLevelAttachment.sendInitialUpdate();

    for (int tap = 0; tap < 8; ++tap)
    {
        tapStateAttachments[tap] = std::make_unique<WebSliderParameterAttachment>(
            *audioProcessor.params->tapState[tap]->getRangedAudioParameter(),
            *tapStateRelays[tap], nullptr);
        tapStateAttachments[tap]->sendInitialUpdate();

        tapShiftAmtAttachments[tap] = std::make_unique<WebSliderParameterAttachment>(
            *audioProcessor.params->tapShiftAmt[tap]->getRangedAudioParameter(),
            *tapShiftAmtRelays[tap], nullptr);
        tapShiftAmtAttachments[tap]->sendInitialUpdate();

        tapReverbAmtAttachments[tap] = std::make_unique<WebSliderParameterAttachment>(
            *audioProcessor.params->tapReverbAmt[tap]->getRangedAudioParameter(),
            *tapReverbAmtRelays[tap], nullptr);
        tapReverbAmtAttachments[tap]->sendInitialUpdate();
    }

}

PetalAudioProcessorEditor::~PetalAudioProcessorEditor()
{

}

//==============================================================================
void PetalAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll(juce::Colour(0x1d1d1d));
}

void PetalAudioProcessorEditor::resized()
{
    webview.setBounds(0, 0, 
        getLocalBounds().getWidth() - 5, 
        getLocalBounds().getHeight() - 5);

    juce::var windowWidth;
    windowWidth = getLocalBounds().getWidth();
    webview.emitEventIfBrowserIsVisible("windowWidth", juce::JSON::toString(windowWidth));

    if (resizer != nullptr)
        resizer->setBounds(getLocalBounds());
}

auto PetalAudioProcessorEditor::getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>
{
    const auto resourceToRetrieve = url == "/" ? juce::String("index.html") : url.fromFirstOccurrenceOf("/", false, false);

    for (int i = 0; i < PetalUIData::namedResourceListSize; ++i)
    {
        const auto* symbolName = PetalUIData::namedResourceList[i];
        const auto* originalFilename = PetalUIData::getNamedResourceOriginalFilename(symbolName);

        if (originalFilename == nullptr || resourceToRetrieve != originalFilename)
            continue;

        int dataSizeInBytes = 0;
        const auto* data = PetalUIData::getNamedResource(symbolName, dataSizeInBytes);

        if (data == nullptr)
            return std::nullopt;

        const auto* bytes = reinterpret_cast<const std::byte*>(data);
        const auto extension = resourceToRetrieve.fromLastOccurrenceOf(".", false, false);
        return juce::WebBrowserComponent::Resource{
            std::vector<std::byte>(bytes, bytes + dataSizeInBytes),
            getMimeForExtension(extension)};
    }

    return std::nullopt;
}

void PetalAudioProcessorEditor::timerCallback()
{
    juce::var delayTimesL{juce::Array<juce::var>()};
    juce::var delayTimesR{juce::Array<juce::var>()};
    juce::var amplitudesL{juce::Array<juce::var>()};
    juce::var amplitudesR{juce::Array<juce::var>()};
    juce::var tapStates{juce::Array<juce::var>()};
    juce::var reverbLevelMsr;

    for (int tap = 0; tap < 8; tap++){
        delayTimesL.append(audioProcessor.petal.delayTimesL[tap].load());
        delayTimesR.append(audioProcessor.petal.delayTimesR[tap].load());
        amplitudesL.append(audioProcessor.petal.amplitudesL[tap].load());
        amplitudesR.append(audioProcessor.petal.amplitudesR[tap].load());
        tapStates.append(audioProcessor.petal.tapStates[tap].load());
    }
    reverbLevelMsr = audioProcessor.petal.rvb.reverbLevelMsr.load();

    webview.emitEventIfBrowserIsVisible("delayTimesL", juce::JSON::toString(delayTimesL));
    webview.emitEventIfBrowserIsVisible("delayTimesR", juce::JSON::toString(delayTimesR));
    webview.emitEventIfBrowserIsVisible("amplitudesL", juce::JSON::toString(amplitudesL));
    webview.emitEventIfBrowserIsVisible("amplitudesR", juce::JSON::toString(amplitudesR));
    webview.emitEventIfBrowserIsVisible("reverbLevelMsr", juce::JSON::toString(reverbLevelMsr));
    webview.emitEventIfBrowserIsVisible("tapStates", juce::JSON::toString(tapStates));
}