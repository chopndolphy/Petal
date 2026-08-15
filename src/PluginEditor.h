

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

        feedbackAmtRelay{"feedbackAmt"},
        feedbackLenRelay{"feedbackLen"},

        delayLevelRelay{"delayLevel"},
        windowSizeRelay{"windowSize"},

        filterCutoffRelay{"filterCutoff"},
        filterShapeRelay{"filterShape"},

        lfoRateRelay{"lfoRate"},
        lfoAmountRelay{"lfoAmount"},

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

    // On Windows, WebBrowserComponent requires the WebView2 Runtime to be installed on the
    // target machine; JUCE has no built-in way to bundle it. Users here just copy the .vst3
    // in (no installer step to hook a WebView2 bootstrapper into), so rather than crash when
    // the runtime is missing, we detect its absence up front and fall back to a plain message.
    static bool isWebView2RuntimeAvailable();
    juce::WebBrowserComponent::Options buildWebviewOptions();

    std::unique_ptr<juce::WebBrowserComponent> webview;
    juce::Label webViewUnavailableLabel;
    juce::HyperlinkButton webViewDownloadLink{
        "Download WebView2 Runtime",
        juce::URL("https://go.microsoft.com/fwlink/p/?LinkId=2124703")};

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

    WebSliderParameterAttachment feedbackAmtAttachment{*audioProcessor.params->feedbackAmt->getRangedAudioParameter(), feedbackAmtRelay, nullptr};
    WebSliderParameterAttachment feedbackLenAttachment{*audioProcessor.params->feedbackLen->getRangedAudioParameter(), feedbackLenRelay, nullptr};

    WebSliderParameterAttachment filterCutoffAttachment{*audioProcessor.params->filterCutoff->getRangedAudioParameter(), filterCutoffRelay, nullptr};
    WebSliderParameterAttachment filterShapeAttachment{*audioProcessor.params->filterShape->getRangedAudioParameter(), filterShapeRelay, nullptr};

    WebSliderParameterAttachment lfoRateAttachment{*audioProcessor.params->lfoRate->getRangedAudioParameter(), lfoRateRelay, nullptr};
    WebSliderParameterAttachment lfoAmountAttachment{*audioProcessor.params->lfoAmount->getRangedAudioParameter(), lfoAmountRelay, nullptr};

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
