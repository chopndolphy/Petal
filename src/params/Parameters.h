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
        freeTimeL,
        freeTimeR,
        
        positionL, 
        skewL,
        positionR,
        skewR,
        
        windowSize,

        reverbDecayTime,
        reverbSize,
        reverbDampening,
        reverbLevel;

    std::array<std::unique_ptr<ParameterInstance>, 8> 
    tapShiftAmt; // tapReverbAmt;
    
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

private:
    float valueSafe;
    std::atomic<float> value;
    std::atomic<float> cachedValue;

    juce::String paramID;
    juce::RangedAudioParameter* rangedParam = nullptr;

    PetalAudioProcessor& audioProcessor;
    Parameters& param;
};

