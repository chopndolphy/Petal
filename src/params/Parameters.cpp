#include "Parameters.h"

Parameters::Parameters(PetalAudioProcessor& p) : audioProcessor(p),
apvts(audioProcessor, nullptr, "Parameters", createParameterLayout())
{
    shiftAmount = std::make_unique<ParameterInstance>(audioProcessor, *this, "shiftAmount");
    windowSize = std::make_unique<ParameterInstance>(audioProcessor, *this, "windowSize");
    freeTimeL = std::make_unique<ParameterInstance>(audioProcessor, *this, "freeTimeL");
    freeTimeR = std::make_unique<ParameterInstance>(audioProcessor, *this, "freeTimeR");
    syncTimeL = std::make_unique<ParameterInstance>(audioProcessor, *this, "syncTimeL");
    syncTimeR = std::make_unique<ParameterInstance>(audioProcessor, *this, "syncTimeR");
    reverbDecayTime = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbDecayTime");
    reverbLevel = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbLevel");
    pitchShiftWindowSize = std::make_unique<ParameterInstance>(audioProcessor, *this, "pitchShiftWindowSize");
    pitchShiftJitterAmount = std::make_unique<ParameterInstance>(audioProcessor, *this, "pitchShiftJitterAmount");
    filterCutoff = std::make_unique<ParameterInstance>(audioProcessor, *this, "filterCutoff");
    filterRes = std::make_unique<ParameterInstance>(audioProcessor, *this, "filterRes");
    filterType = std::make_unique<ParameterInstance>(audioProcessor, *this, "filterType");

    /*
    for (int i = 0; i < 8; i++)
    {
        tapState[i] = std::make_unique<ParameterInstance>(audioProcessor, *this, "tapState");
        tapReverbAmt[i] = std::make_unique<ParameterInstance>(audioProcessor, *this, "tapReverbAmt");

    }
    */
}

juce::AudioProcessorValueTreeState::ParameterLayout
Parameters::createParameterLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "shiftAmount", 1},
                                                           "Shift Amount",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "windowSize", 1},
                                                           "Window Size",
                                                           juce::NormalisableRange<float> { 0.25f, 100.0f, 0.1 }, 50.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "freeTimeL", 1},
                                                           "Free Time Left",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "freeTimeR", 1},
                                                           "Free Time Right",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "syncTimeL", 1},
                                                           "Sync Time Left",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "syncTimeR", 1},
                                                           "Sync Time Right",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "reverbDecayTime", 1},
                                                           "Reverb Decay Time",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "reverbLevel", 1},
                                                           "Reverb Level",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "pitchShiftWindowSize", 1},
                                                           "Pitch Shift Window Size",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "pitchShiftJitterAmount", 1},
                                                           "Pitch Shift Jitter Amount",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "filterCutoff", 1},
                                                           "Filter Cutoff",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "filterRes", 1},
                                                           "Filter Resonance",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "filterType", 1},
                                                           "Filter Type",
                                                           juce::NormalisableRange<float> { 0.0f, 2.0f, 0.01 }, 1.0f));
    return layout;
}

ParameterInstance::ParameterInstance(PetalAudioProcessor& p, Parameters& pm, juce::String paramID) : audioProcessor(p), param(pm)
{
    this->paramID = paramID;
    
    float initValue = param.apvts.getRawParameterValue(paramID)->load();
    value.store(initValue);
    valueSafe = initValue;
    cachedValue.store(initValue);

    if (auto* parameter = dynamic_cast<juce::AudioProcessorParameterWithID*>(param.apvts.getParameter(paramID)))
    {
        if (auto* ranged = dynamic_cast<juce::RangedAudioParameter*>(parameter))
        {
            rangedParam = ranged;
            rangedParam->addListener(this);
        }
    }
}

void ParameterInstance::parameterValueChanged (int /*maybe unused*/, float newValue)
{
    // load atomics for thread safe reading
    cachedValue.store(newValue);
    triggerUpdate();
    triggerAsyncUpdate();
}

void ParameterInstance::handleAsyncUpdate()
{
    if (rangedParam)
    {
        float newValue = cachedValue.load(std::memory_order_relaxed);
        
        if (auto* parameter = dynamic_cast<juce::AudioProcessorParameterWithID*>(param.apvts.getParameter(paramID)))
        {
            if (auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(parameter))
            {
                valueSafe = rangedParam->convertFrom0to1(newValue);
            }
        }
    }
}

void ParameterInstance::triggerUpdate()
{
    if (rangedParam)
    {
        float newValue = cachedValue.load(std::memory_order_relaxed);
        if (auto* parameter = dynamic_cast<juce::AudioProcessorParameterWithID*>(param.apvts.getParameter(paramID)))
        {
            if (auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(parameter))
            {
                value.store(rangedParam->convertFrom0to1(newValue));
            }
        }
    }
}

float ParameterInstance::get() const noexcept
{
    return value.load(std::memory_order_relaxed);
}

float ParameterInstance::getSafe() const noexcept
{
    return valueSafe;
}
