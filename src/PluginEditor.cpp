
#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
PetalAudioProcessorEditor::PetalAudioProcessorEditor (PetalAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p), webview{juce::WebBrowserComponent::Options{}}
{
    addAndMakeVisible(webview);

   // juce::URL url (juce::File::getSpecialLocation(juce::File::userDesktopDirectory).getChildFile ("foo.bar"));
    webview.goToURL("file:///Users/tmatsui1/GitHub/Petal/resource/index.html");  
    setSize (700, 350);
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
    webview.setBounds(getLocalBounds());
}
