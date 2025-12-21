

#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
PetalAudioProcessorEditor::PetalAudioProcessorEditor (PetalAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p), webview{juce::WebBrowserComponent::Options{}}
{
    addAndMakeVisible(webview);
    webview.goToURL("https://rainbowcircuit.co");
    setSize (700, 700);
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
