#include <JuceHeader.h>
#include "../dsp/PitchShifter.h"
// #include "dsp/reverb/Reverb.h"
//==============================================================================

class PetalProcessor
{
public: 
    PetalProcessor()
    {
        for(int i = 0; i < 8; i++)
        {
            ps[i] = std::make_unique<PitchShifter>(dl);
        //    psR[i] = std::make_unique<PitchShifter>(dl);
        }
    }

    void prepareToPlay(double sampleRate, int maximumBlockSize) 
    {
        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.maximumBlockSize = maximumBlockSize;
        spec.numChannels = 2;

        dl.prepare(spec);
        dl.setMaximumDelayInSamples((int)(sampleRate * 10));
        dl.reset();

        this->sampleRate = sampleRate;

        for(int i = 0; i < 8; i++)
        {
            tpL[i].freeTime = 200.0;
            ps[i]->prepareToPlay(0, sampleRate);
           // psR[i]->prepareToPlay(1, sampleRate);
        }
    }



    void setSaturatorValue(float inputGainInDecibels, bool saturatorActive)
    {

    }

    void setPitchShifter(int tapIndex, int shiftAmountInSemitones)
    {
        ps[tapIndex]->setShiftAmount(shiftAmountInSemitones);
     //   psR[tapIndex]->setShiftAmount(shiftAmountInSemitones);
     
        for(int i = 0; i < 8; i++)
        {
            ps[i]->setAttributes(75, 0.0);
         //   psR[i]->setAttributes(75, 0.0);
        }
    }

    void setTime(float freeTimeL, float freeTimeR, int syncTimeL, int syncTimeR, 
        float shapingXL, float shapingYL, float shapingXR, float shapingYR, bool stereoLock)
    {
        float freeTimeLInMilliseconds = freeTimeL;
        float freeTimeRInMilliseconds = freeTimeR;
        float syncTimeLInMilliseconds = 1000.0f / ((bpm/60.0f) * syncTimeOptions[syncTimeL]);
        float syncTimeRInMilliseconds = 1000.0f / ((bpm/60.0f) * syncTimeOptions[syncTimeR]);

        for (int i = 1; i <= 7; i++){
            float sigmoidScaleL = i - shapingYL * 7;
            float sigmoidScaleR = i - shapingYL * 7;

            float linearL = (1.0f/8.0f) * i;
            float linearR = (1.0f/8.0f) * i;

            float sigmoidL = 1.0f/(1.0f + std::exp(-sigmoidScaleL));
            float sigmoidR = 1.0f/(1.0f + std::exp(-sigmoidScaleR));

            float lerpL = linearL + (sigmoidL - linearL) * shapingXL;
            float lerpR = linearR + (sigmoidR - linearR) * shapingXR;

            tpL[i].freeTime = lerpL * freeTimeLInMilliseconds;
            tpR[i].freeTime = lerpR * freeTimeRInMilliseconds;

            tpL[i].syncTime = lerpR * syncTimeLInMilliseconds;
            tpR[i].syncTime = lerpR * syncTimeRInMilliseconds;
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
        auto readDataL = buffer.getReadPointer(0);
        auto writeDataL = buffer.getWritePointer(0);

        auto readDataR = buffer.getReadPointer(1);
        auto writeDataR = buffer.getWritePointer(1);

        for (int sample = 0; sample < buffer.getNumSamples(); ++sample){

            float outDataL = 0.0f;
            float outDataR = 0.0f;

            dl.pushSample(0, readDataL[sample]);
            dl.pushSample(1, readDataR[sample]);

            for (int tap = 0; tap < 8; tap++)
            {
                float delayTimeInSampsL = tpL[tap].freeTime * (sampleRate/1000.0f) * tap;
                float delayTimeInSampsR = tpR[tap].freeTime * (sampleRate/1000.0f) * tap;

                float pitchShiftL = ps[tap]->processSample(0, tap, delayTimeInSampsL);
                float pitchShiftR = ps[tap]->processSample(1, tap, delayTimeInSampsL);

                outDataL += pitchShiftL;
                outDataR += pitchShiftR;

                amplitudesL[tap].store(pitchShiftL);
                amplitudesR[tap].store(pitchShiftR);
            }

            writeDataL[sample] = readDataL[sample] + outDataL;
            writeDataR[sample] = readDataR[sample] + outDataR;
        }
    }  

    std::array<std::atomic<float>, 8> amplitudesL, amplitudesR; 

private: 
    double bpm;
    struct tapAttributes 
    { 
        bool isLeft = true;
        bool isActive = true;
        int syncTime = 1;
        float freeTime = 1.0f;
        float reverbAmt;
    };

    std::array<tapAttributes, 8> tpL, tpR;

    static constexpr std::array<double, 19> syncTimeOptions = {
         0.03125,   0.04167,   0.0625,   0.0833,
         0.125,     0.25,      0.333,    0.5,
         0.666,     0.75,      0.8,      1.0,
         1.333,     1.5,       2.0,      3.0,
         4.0,       6.0,       8.0
    };

    double sampleRate;

    bool feedbackSuppression = false;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;

    std::array<std::unique_ptr<PitchShifter>, 8> ps;

};
