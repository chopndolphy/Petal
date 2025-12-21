

#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>
//==============================================================================
/**
*/
class PetalAudioProcessorEditor  : public juce::AudioProcessorEditor
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
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PetalAudioProcessorEditor)
};
