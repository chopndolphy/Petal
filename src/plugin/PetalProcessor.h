#include <JuceHeader.h>
#include "dsp/PitchShifter.h"

class PetalProcessor
{
public: 
    void setSampleRate(double sampleRate) {}



    void setSaturatorValue(float inputGainInDecibels, bool saturatorActive)
    {

    }

    void setTapValue(int tapIndex, bool tapActive, int shiftAmountInSemitones)
    {

    }

    void setDelayValues(int channel, bool channelSynced, float delayTimeInMilliseconds, int delayTimeInSubdiv, float lerpAmount, float sigmoidAmount)
    {

    }

    void setFeedback(float feedbackAmount)
    {

    }

    void processBlock(juce::AudioBuffer<float>& buffer) 
    {
        

    }


private: 
    struct tapAttributes 
    { 
        bool isActive = true;
        int syncTime;
        float freeTime;
        float reverbAmt;
    };

    std::array<tapAttributes, 16> tp;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
    std::array<PitchShifter, 16> ps;

};