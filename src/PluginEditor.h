

#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>
//==============================================================================
/**
*/
class PetalAudioProcessorEditor  : public juce::AudioProcessorEditor, public juce::Timer
{
public:
    PetalAudioProcessorEditor (PetalAudioProcessor&);
    ~PetalAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

private:
    PetalAudioProcessor& audioProcessor;
    juce::WebBrowserComponent webview;

    auto getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    void timerCallback() override;

    int testVal = 0;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PetalAudioProcessorEditor)
};
