
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
PetalAudioProcessorEditor::PetalAudioProcessorEditor (PetalAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p), 
    webview{juce::WebBrowserComponent::Options{}
    .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
    .withWinWebView2Options(juce::WebBrowserComponent::Options::WinWebView2{}
        .withUserDataFolder(juce::File::getSpecialLocation(juce::File::tempDirectory)))
        
    .withResourceProvider([this](const auto& url){
        return getResource(url);
    })}
{
    addAndMakeVisible(webview);

    webview.goToURL("file:///Users/tmatsui1/GitHub/Petal/resource/index.html");  
    setSize (700, 350);
    startTimerHz(30);


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

    
    juce::var amplitudesL{juce::Array<juce::var>()};
    juce::var amplitudesR{juce::Array<juce::var>()};

    for (int i = 0; i < 8; i++){
        int ampBoolL = audioProcessor.petal.amplitudesL[i].load() > 0 ? 20 : 0;
        amplitudesL.append(ampBoolL);
        amplitudesR.append(audioProcessor.petal.amplitudesR[i].load());

    }
    
    webview.emitEventIfBrowserIsVisible("amplitudesL", juce::JSON::toString(amplitudesL));
    webview.emitEventIfBrowserIsVisible("amplitudesR", juce::JSON::toString(amplitudesR));

    setValuesInWebview();



}