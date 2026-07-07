#include "Parameters.h"

Parameters::Parameters(PetalAudioProcessor& p) : audioProcessor(p),
apvts(audioProcessor, nullptr, "Parameters", createParameterLayout())
{

    for (int tap = 0; tap < 8; tap++)
    {
        auto tapShiftAmtID = "tapShiftAmt" + juce::String(tap);
        tapShiftAmt[tap] = std::make_unique<ParameterInstance>(audioProcessor, *this, tapShiftAmtID);
    }

    // time
    freeTimeL = std::make_unique<ParameterInstance>(audioProcessor, *this, "freeTimeL");
    freeTimeR = std::make_unique<ParameterInstance>(audioProcessor, *this, "freeTimeR");

    // shaping
    positionL = std::make_unique<ParameterInstance>(audioProcessor, *this, "positionL");
    skewL = std::make_unique<ParameterInstance>(audioProcessor, *this, "skewL");
    positionR = std::make_unique<ParameterInstance>(audioProcessor, *this, "positionR");
    skewR = std::make_unique<ParameterInstance>(audioProcessor, *this, "skewR");

    // window
    windowSize = std::make_unique<ParameterInstance>(audioProcessor, *this, "windowSize");

    // reverb
    reverbDecayTime = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbDecayTime");
    reverbSize = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbSize");
    reverbDampening = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbDampening");
    reverbLevel = std::make_unique<ParameterInstance>(audioProcessor, *this, "reverbLevel");

}

juce::AudioProcessorValueTreeState::ParameterLayout
Parameters::createParameterLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;

    for(int tap = 0; tap < 8; tap++)
    {
        auto tapShiftAmtID = "tapShiftAmt" + juce::String(tap);
        auto tapShiftAmtName = "Tap " + juce::String(tap) + " Shift Amount";
        layout.add(std::make_unique<juce::AudioParameterInt>(juce::ParameterID {tapShiftAmtID, 1},
                                                            tapShiftAmtName,
                                                             -12, 12, 0));
    }

    // time                 
    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "freeTimeL", 1},
                                                           "Free Time L",
                                                           juce::NormalisableRange<float> { 5.0f, 20000.0f, 0.01 }, 100.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "freeTimeR", 1},
                                                           "Free Time R",
                                                           juce::NormalisableRange<float> { 5.0f, 20000.0f, 0.01 }, 100.0f));




    // shaping
    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "positionL", 1},
                                                           "Position L",
                                                           juce::NormalisableRange<float> { 0.0f, 1.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"skewL", 1},
                                                           "Skew L",
                                                           juce::NormalisableRange<float>{ -1.0f, 1.0f, 0.01}, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"positionR", 1},
                                                           "Position R",
                                                           juce::NormalisableRange<float>{ 0.0f, 1.0f, 0.01}, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"skewR", 1},
                                                           "Skew R",
                                                           juce::NormalisableRange<float>{ -1.0f, 1.0f, 0.01}, 1.0f));


    // window size
    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"windowSize", 1},
                                                           "Window Size",
                                                           juce::NormalisableRange<float>{10.0f, 200.0f, 0.1}, 50.0f));


    // reverb 
    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "reverbDecayTime", 1},
                                                           "Reverb Decay Time",
                                                           juce::NormalisableRange<float> { 0.0f, 1.0f, 0.01 }, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"reverbSize", 1},
                                                           "Reverb Size",
                                                           juce::NormalisableRange<float>{0.0f, 1.0f, 0.01}, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID{"reverbDampening", 1},
                                                           "Reverb Dampening",
                                                           juce::NormalisableRange<float>{0.0f, 1.0f, 0.01}, 1.0f));

    layout.add(std::make_unique<juce::AudioParameterFloat>(juce::ParameterID { "reverbLevel", 1},
                                                           "Reverb Level",
                                                           juce::NormalisableRange<float> { 0.0f, 1.0f, 0.01 }, 1.0f));


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
