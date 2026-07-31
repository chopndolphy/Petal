

#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>
#include <array>
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
        skewRRelay { "skewR" },
        reverbSizeRelay { "reverbSize" },
        reverbDecayTimeRelay { "reverbDecayTime" },
        reverbDampeningRelay { "reverbDampening" };

    static std::array<std::unique_ptr<juce::WebSliderRelay>, 8> makeTapRelays (const juce::String& idPrefix);

    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapShiftAmtRelays  = makeTapRelays ("tapShiftAmt");
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapReverbAmtRelays = makeTapRelays ("tapReverbAmt");

    juce::WebBrowserComponent webview {
        [this]
        {
            auto options = juce::WebBrowserComponent::Options{}
                .withOptionsFrom (freeTimeLRelay)
                .withOptionsFrom (freeTimeRRelay)
                .withOptionsFrom (positionLRelay)
                .withOptionsFrom (skewLRelay)
                .withOptionsFrom (positionRRelay)
                .withOptionsFrom (skewRRelay)
                .withOptionsFrom (reverbSizeRelay)
                .withOptionsFrom (reverbDecayTimeRelay)
                .withOptionsFrom (reverbDampeningRelay);

            for (auto& relay : tapShiftAmtRelays)  options = options.withOptionsFrom (*relay);
            for (auto& relay : tapReverbAmtRelays) options = options.withOptionsFrom (*relay);

            return options.withResourceProvider ([this] (const auto& url) { return getResource (url); });
        }()
    };

    WebSliderParameterAttachment freeTimeLAttachment { *audioProcessor.params->freeTimeL->getRangedAudioParameter(), freeTimeLRelay, nullptr };
    WebSliderParameterAttachment freeTimeRAttachment  { *audioProcessor.params->freeTimeR->getRangedAudioParameter(),  freeTimeRRelay,  nullptr };
    WebSliderParameterAttachment positionLAttachment { *audioProcessor.params->positionL->getRangedAudioParameter(), positionLRelay, nullptr };
    WebSliderParameterAttachment skewLAttachment { *audioProcessor.params->skewL->getRangedAudioParameter(), skewLRelay, nullptr };
    WebSliderParameterAttachment positionRAttachment { *audioProcessor.params->positionR->getRangedAudioParameter(), positionRRelay, nullptr };
    WebSliderParameterAttachment skewRAttachment { *audioProcessor.params->skewR->getRangedAudioParameter(), skewRRelay, nullptr };
    WebSliderParameterAttachment reverbSizeAttachment { *audioProcessor.params->reverbSize->getRangedAudioParameter(), reverbSizeRelay, nullptr };
    WebSliderParameterAttachment reverbDecayTimeAttachment { *audioProcessor.params->reverbDecayTime->getRangedAudioParameter(), reverbDecayTimeRelay, nullptr };
    WebSliderParameterAttachment reverbDampeningAttachment { *audioProcessor.params->reverbDampening->getRangedAudioParameter(), reverbDampeningRelay, nullptr };

    std::array<std::unique_ptr<WebSliderParameterAttachment>, 8> tapShiftAmtAttachments, tapReverbAmtAttachments;

    auto getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    void timerCallback() override;

    int testVal = 0;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PetalAudioProcessorEditor)
};
