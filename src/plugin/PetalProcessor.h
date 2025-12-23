#include <JuceHeader.h>
#include "dsp/PitchShifter.h"

class PetalProcessor
{
public: 
    void prepareToPlay(double sampleRate, int maximumBlockSize) 
    {
        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.maximumBlockSize = maximumBlockSize;
        spec.numChannels = 2;

        dl.prepare(spec);
        dl.setMaximumDelayInSamples((int)(sampleRate * 10));
        dl.reset();
    }



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
        bool isLeft = true;
        bool isActive = true;
        int syncTime;
        float freeTime;
        float reverbAmt;
    };

    std::array<tapAttributes, 16> tp;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
    std::array<PitchShifter, 16> ps;

};