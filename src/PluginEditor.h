

#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>
#include <array>
//==============================================================================

class PetalAudioProcessorEditor  : public juce::AudioProcessorEditor, public juce::Timer
{
public:
    PetalAudioProcessorEditor (PetalAudioProcessor&);
    ~PetalAudioProcessorEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;
    
private:
    PetalAudioProcessor& audioProcessor;

    juce::WebSliderRelay
        inputLevelRelay{"inputLevel"},

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
        roundRelay{"round"},

        delayLevelRelay{"delayLevel"},
        windowSizeRelay{"windowSize"},

        reverbSizeRelay{"reverbSize"},
        reverbDecayTimeRelay{"reverbDecayTime"},
        reverbLPFRelay{"reverbLPF"},
        reverbHPFRelay{"reverbHPF"},
        reverbLevelRelay{"reverbLevel"},

        dryLevelRelay{"dryLevel"};

    static std::array<std::unique_ptr<juce::WebSliderRelay>, 8> makeTapRelays (const juce::String& idPrefix);
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapStateRelays = makeTapRelays("tapState");
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapShiftAmtRelays  = makeTapRelays ("tapShiftAmt");
    std::array<std::unique_ptr<juce::WebSliderRelay>, 8> tapReverbAmtRelays = makeTapRelays ("tapReverbAmt");

    juce::WebBrowserComponent webview {
        [this]
        {
            auto options = juce::WebBrowserComponent::Options{}
                               .withOptionsFrom(inputLevelRelay)
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
                               .withOptionsFrom(roundRelay)
                               .withOptionsFrom(delayLevelRelay)
                               .withOptionsFrom(windowSizeRelay)
                               .withOptionsFrom(reverbSizeRelay)
                               .withOptionsFrom(reverbDecayTimeRelay)
                               .withOptionsFrom(reverbLPFRelay)
                               .withOptionsFrom(reverbHPFRelay)
                               .withOptionsFrom(reverbLevelRelay)
                               .withOptionsFrom(dryLevelRelay);

            for (auto &relay : tapStateRelays)
                options = options.withOptionsFrom(*relay);
            for (auto& relay : tapShiftAmtRelays)
                options = options.withOptionsFrom(*relay);
            for (auto& relay : tapReverbAmtRelays)
                options = options.withOptionsFrom(*relay);

            options = options.withNativeFunction("attemptSave", [this](auto &var, auto completion)
            {
                juce::MessageManager::callAsync([this] { audioProcessor.presets->attemptSave(); });
                completion(juce::var()); 
            });

            options = options.withNativeFunction("getAllPreset", [this](auto &var, auto completion)
            {
                completion(audioProcessor.presets->getAllPresetAsVar()); 
            });

            options = options.withNativeFunction("loadPreset", [this](auto &var, auto completion)
            {
                audioProcessor.presets->loadPreset(var[0].toString());
                completion(juce::var());
            });

            return options.withResourceProvider([this](const auto &url)
                                                { return getResource(url); });
        }()};

    WebSliderParameterAttachment inputLevelAttachment { *audioProcessor.params->inputLevel->getRangedAudioParameter(), inputLevelRelay, nullptr };
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
    WebSliderParameterAttachment roundAttachment { *audioProcessor.params->round->getRangedAudioParameter(), roundRelay, nullptr };
    WebSliderParameterAttachment windowSizeAttachment { *audioProcessor.params->windowSize->getRangedAudioParameter(), windowSizeRelay, nullptr };
    WebSliderParameterAttachment delayLevelAttachment{*audioProcessor.params->delayLevel->getRangedAudioParameter(), delayLevelRelay, nullptr};

    WebSliderParameterAttachment reverbSizeAttachment { *audioProcessor.params->reverbSize->getRangedAudioParameter(), reverbSizeRelay, nullptr };
    WebSliderParameterAttachment reverbDecayTimeAttachment { *audioProcessor.params->reverbDecayTime->getRangedAudioParameter(), reverbDecayTimeRelay, nullptr };
    WebSliderParameterAttachment reverbLPFAttachment{*audioProcessor.params->reverbLPF->getRangedAudioParameter(), reverbLPFRelay, nullptr};
    WebSliderParameterAttachment reverbHPFAttachment{*audioProcessor.params->reverbHPF->getRangedAudioParameter(), reverbHPFRelay, nullptr};
    WebSliderParameterAttachment reverbLevelAttachment{*audioProcessor.params->reverbLevel->getRangedAudioParameter(), reverbLevelRelay, nullptr};
    WebSliderParameterAttachment dryLevelAttachment{*audioProcessor.params->dryLevel->getRangedAudioParameter(), dryLevelRelay, nullptr};

    std::array<std::unique_ptr<WebSliderParameterAttachment>, 8> tapStateAttachments, tapShiftAmtAttachments, tapReverbAmtAttachments;

    auto getResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    void timerCallback() override;
    std::unique_ptr<juce::ResizableBorderComponent> resizer;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PetalAudioProcessorEditor)
};
