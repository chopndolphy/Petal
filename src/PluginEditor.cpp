
#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================

namespace {
std::vector<std::byte> streamToVector(juce::InputStream& stream) {
  using namespace juce;
  const auto sizeInBytes = static_cast<size_t>(stream.getTotalLength());
  std::vector<std::byte> result(sizeInBytes);
  stream.setPosition(0);
  [[maybe_unused]] const auto bytesRead =
      stream.read(result.data(), result.size());
  jassert(bytesRead == static_cast<ssize_t>(sizeInBytes));
  return result;
}

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
} // namespace


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

    webview.goToURL("http://localhost:4000");
    setSize(910, 460);
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
}

void PetalAudioProcessorEditor::resized()
{
    webview.setBounds(0, 0, getLocalBounds().getWidth(), getLocalBounds().getHeight());
}

auto PetalAudioProcessorEditor::getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>
{
    static const auto resourceRoot = juce::File("/Users/tmatsui1/GitHub/Petal/src/ui/public");
    const auto resourceToRetrieve = url == "/" ? "index.html" : url.fromFirstOccurrenceOf("/", false, false);

    const auto resource = resourceRoot.getChildFile(resourceToRetrieve).createInputStream();
    if (resource){
        const auto extension = resourceToRetrieve.fromLastOccurrenceOf(".", false, false);
        return juce::WebBrowserComponent::Resource{streamToVector(*resource), getMimeForExtension(extension)};
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