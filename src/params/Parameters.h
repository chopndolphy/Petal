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
    shiftAmount, windowSize;
    
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

