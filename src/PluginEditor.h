

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
        freeTimeLRelay{"freeTimeL"},
        freeTimeRRelay{"freeTimeR"},
        syncTimeLRelay{"syncTimeL"},
        syncTimeRRelay{"syncTimeR"},
        isSyncLRelay{"isSyncL"},
        isSyncRRelay{"isSyncR"},
        stereoLockRelay{"stereoLock"},
        positionLRelay{"positionL"},
        skewLRelay{"skewL"},
        positionRRelay{"positionR"},
        skewRRelay{"skewR"},
        reverbSizeRelay{"reverbSize"},
        reverbDecayTimeRelay{"reverbDecayTime"},
        reverbLPFRelay{"reverbLPF"},
        reverbHPFRelay{"reverbHPF"};
    ;

    static std::array<std::unique_ptr<juce::WebSliderRelay>, 8> makeTapRelays (const juce::String& idPrefix);
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapStateRelays = makeTapRelays("tapState");
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapShiftAmtRelays  = makeTapRelays ("tapShiftAmt");
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapReverbAmtRelays = makeTapRelays ("tapReverbAmt");

    juce::WebBrowserComponent webview {
        [this]
        {
            auto options = juce::WebBrowserComponent::Options{}
                               .withOptionsFrom(freeTimeLRelay)
                               .withOptionsFrom(freeTimeRRelay)
                               .withOptionsFrom(syncTimeLRelay)
                               .withOptionsFrom(syncTimeRRelay)
                               .withOptionsFrom(isSyncLRelay)
                               .withOptionsFrom(isSyncRRelay)
                               .withOptionsFrom(stereoLockRelay)
                               .withOptionsFrom(positionLRelay)
                               .withOptionsFrom(skewLRelay)
                               .withOptionsFrom(positionRRelay)
                               .withOptionsFrom(skewRRelay)
                               .withOptionsFrom(reverbSizeRelay)
                               .withOptionsFrom(reverbDecayTimeRelay)
                               .withOptionsFrom(reverbLPFRelay)
                               .withOptionsFrom(reverbHPFRelay);

            for (auto &relay : tapStateRelays)
                options = options.withOptionsFrom(*relay);
            for (auto& relay : tapShiftAmtRelays)
                options = options.withOptionsFrom(*relay);
            for (auto& relay : tapReverbAmtRelays)
                options = options.withOptionsFrom(*relay);

            return options.withResourceProvider ([this] (const auto& url) { return getResource (url); });
        }()};

    WebSliderParameterAttachment freeTimeLAttachment { *audioProcessor.params->freeTimeL->getRangedAudioParameter(), freeTimeLRelay, nullptr };
    WebSliderParameterAttachment freeTimeRAttachment  { *audioProcessor.params->freeTimeR->getRangedAudioParameter(),  freeTimeRRelay,  nullptr };
    WebSliderParameterAttachment syncTimeLAttachment { *audioProcessor.params->syncTimeL->getRangedAudioParameter(), syncTimeLRelay, nullptr };
    WebSliderParameterAttachment syncTimeRAttachment { *audioProcessor.params->syncTimeR->getRangedAudioParameter(), syncTimeRRelay, nullptr };
    WebSliderParameterAttachment isSyncLAttachment { *audioProcessor.params->isSyncL->getRangedAudioParameter(), isSyncLRelay, nullptr };
    WebSliderParameterAttachment isSyncRAttachment { *audioProcessor.params->isSyncR->getRangedAudioParameter(), isSyncRRelay, nullptr };
    WebSliderParameterAttachment stereoLockAttachment { *audioProcessor.params->stereoLock->getRangedAudioParameter(), stereoLockRelay, nullptr };
    WebSliderParameterAttachment positionLAttachment { *audioProcessor.params->positionL->getRangedAudioParameter(), positionLRelay, nullptr };
    WebSliderParameterAttachment skewLAttachment { *audioProcessor.params->skewL->getRangedAudioParameter(), skewLRelay, nullptr };
    WebSliderParameterAttachment positionRAttachment { *audioProcessor.params->positionR->getRangedAudioParameter(), positionRRelay, nullptr };
    WebSliderParameterAttachment skewRAttachment { *audioProcessor.params->skewR->getRangedAudioParameter(), skewRRelay, nullptr };
    WebSliderParameterAttachment reverbSizeAttachment { *audioProcessor.params->reverbSize->getRangedAudioParameter(), reverbSizeRelay, nullptr };
    WebSliderParameterAttachment reverbDecayTimeAttachment { *audioProcessor.params->reverbDecayTime->getRangedAudioParameter(), reverbDecayTimeRelay, nullptr };
    WebSliderParameterAttachment reverbLPFAttachment{*audioProcessor.params->reverbLPF->getRangedAudioParameter(), reverbLPFRelay, nullptr};
    WebSliderParameterAttachment reverbHPFAttachment{*audioProcessor.params->reverbHPF->getRangedAudioParameter(), reverbLPFRelay, nullptr};

    std::array<std::unique_ptr<WebSliderParameterAttachment>, 8> tapStateAttachments, tapShiftAmtAttachments, tapReverbAmtAttachments;

    auto getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    void timerCallback() override;

    int testVal = 0;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PetalAudioProcessorEditor)
};
