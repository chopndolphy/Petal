#include <JuceHeader.h>
#include "dsp/PitchShifter.h"
#include "dsp/reverb/Reverb.h"

class PetalProcessor
{
public: 
    void prepareToPlay(double sampleRate, int maximumBlockSize) 
    {
        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.maximumBlockSize = maximumBlockSize;
        spec.numChannels = 2;

        dlL.prepare(spec);
        dlL.setMaximumDelayInSamples((int)(sampleRate * 10));
        dlL.reset();

        dlR.prepare(spec);
        dlR.setMaximumDelayInSamples((int)(sampleRate * 10));
        dlR.reset();
    }



    void setSaturatorValue(float inputGainInDecibels, bool saturatorActive)
    {

    }

    void setTapValue(int tapIndex, bool tapActive, int shiftAmountInSemitones)
    {

    }

    void setDelayValues(int channel, bool channelSynced, float delayTimeInMilliseconds, 
        int delayTimeInSubdiv, float shapingX, float shapingY, float quantizeTime)
    {
        
        for(int i = 0; i < 8; i++)
        {
            float linear;
            float sigmoid;



        }
    }

    void setBPM(juce::AudioPlayHead* playhead)
    {
        if (playhead == nullptr) { return; }
        if(playhead->getPosition()->getBpm().hasValue())
        {
            this->bpm = *playhead->getPosition()->getBpm();
        }
    }

    void setFeedback(float feedbackAmount)
    {
        
    }

    void processBlock(juce::AudioBuffer<float>& buffer) 
    {
        auto readData = buffer.getReadPointer(0);
        auto writeData = buffer.getWritePointer(0);

        float outData = 0;
        for (int sample = 0; sample < buffer.getNumSamples(); ++sample){

            for (int i = 0; i < 8; i++)
            {
                dlL.pushSample(0, readData[sample]);
                float delayedData = dlL.popSample(0, tp[i].freeTime, false);

                outData += delayedData;
            }
            writeData[sample] = outData;
        }

        
    }


private: 
    double bpm;
    struct tapAttributes 
    { 
        bool isLeft = true;
        bool isActive = true;
        int syncTime;
        float freeTime;
        float reverbAmt;
    };

    bool feedbackSuppression = false;
    std::array<tapAttributes, 16> tp;
    std::array<PitchShifter, 16> ps;
    Reverb rv;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dlL, dlR;

};