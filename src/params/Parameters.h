#pragma once
#include <JuceHeader.h>
#include "../PluginProcessor.h"

class PetalAudioProcessor;
class ParameterInstance;
class Parameters
{
public:
    Parameters(PetalAudioProcessor& p);
    
    static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();
    
private:
    PetalAudioProcessor& audioProcessor;
    
public:
    juce::AudioProcessorValueTreeState apvts;

    std::unique_ptr<ParameterInstance>
        inputLevel,

        freeTimeL,
        freeTimeR,
        syncTimeL,
        syncTimeR,
        isSyncL,
        isSyncR,
        stereoLock,

        feedbackAmt,
        feedbackLen,

        delayLevel,

        positionL,
        skewL,
        positionR,
        skewR,
        round,

        windowSize,

        lfoRate,
        lfoAmount,

        filterCutoff,
        filterShape,

        reverbDecayTime,
        reverbSize,
        reverbLPF,
        reverbHPF,
        reverbLevel,

        dryLevel;

    std::array<std::unique_ptr<ParameterInstance>, 8> 
    tapState, tapShiftAmt, tapReverbAmt; 
    
};

class ParameterInstance : public juce::AudioProcessorParameter::Listener, juce::AsyncUpdater
{
public:
    ParameterInstance(PetalAudioProcessor& p, Parameters& pm, juce::String paramID);
    
    //==============================================================================
    void parameterValueChanged (int /*maybe unused*/, float newValue) override;
    void parameterGestureChanged (int parameterIndex, bool gestureIsStarting) override {}
    void handleAsyncUpdate() override;
    void triggerUpdate();
    
    //==============================================================================
    float get() const noexcept;
    float getSafe() const noexcept;
    float getSmooth() noexcept;

    juce::RangedAudioParameter *getRangedAudioParameter() const noexcept;

private:
    float valueSafe;
    std::atomic<float> value;
    std::atomic<float> cachedValue;
    juce::SmoothedValue<float> smoothed;

    juce::String paramID;
    juce::RangedAudioParameter* rangedParam = nullptr;
    
    PetalAudioProcessor& audioProcessor;
    Parameters& param;
};

