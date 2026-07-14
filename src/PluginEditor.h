

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

    juce::WebSliderRelay
        freeTimeLRelay { "freeTimeL" },
        freeTimeRRelay { "freeTimeR" },
        positionLRelay { "positionL" },
        skewLRelay { "skewL" },
        positionRRelay { "positionR" },
        skewRRelay { "skewR" };

    juce::WebBrowserComponent webview {
        juce::WebBrowserComponent::Options{}
            .withOptionsFrom (freeTimeLRelay)
            .withOptionsFrom (freeTimeRRelay)
            .withOptionsFrom (positionLRelay)
            .withOptionsFrom (skewLRelay)
            .withOptionsFrom (positionRRelay)
            .withOptionsFrom (skewRRelay)
            .withResourceProvider ([this] (const auto& url) { return getResource (url); })
    };

    WebSliderParameterAttachment freeTimeLAttachment { *audioProcessor.params->freeTimeL->getRangedAudioParameter(), freeTimeLRelay, nullptr };
    WebSliderParameterAttachment freeTimeRAttachment  { *audioProcessor.params->freeTimeR->getRangedAudioParameter(),  freeTimeRRelay,  nullptr };
    WebSliderParameterAttachment positionLAttachment { *audioProcessor.params->positionL->getRangedAudioParameter(), positionLRelay, nullptr };
    WebSliderParameterAttachment skewLAttachment { *audioProcessor.params->skewL->getRangedAudioParameter(), skewLRelay, nullptr };
    WebSliderParameterAttachment positionRAttachment { *audioProcessor.params->positionR->getRangedAudioParameter(), positionRRelay, nullptr };
    WebSliderParameterAttachment skewRAttachment { *audioProcessor.params->skewR->getRangedAudioParameter(), skewRRelay, nullptr };

    auto getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    void timerCallback() override;

    int testVal = 0;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PetalAudioProcessorEditor)
};
