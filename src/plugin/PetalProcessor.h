#include <JuceHeader.h>
#include "../dsp/PitchShifter.h"
// #include "dsp/reverb/Reverb.h"

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

        this->sampleRate = sampleRate;

        for(int i = 0; i < 8; i++)
        {
            tp[i].freeTime = 200.0;
            psL[i].prepareToPlay(sampleRate, maximumBlockSize);
            psR[i].prepareToPlay(sampleRate, maximumBlockSize);
        }

        // atomic
    //    amplitudesL.fill(0.0f);
     //   amplitudesR.fill(0.0f);

    }



    void setSaturatorValue(float inputGainInDecibels, bool saturatorActive)
    {

    }

    void setPitchShifter(int tapIndex, int shiftAmountInSemitones)
    {
        psL[tapIndex].setShiftAmount(shiftAmountInSemitones);
        psR[tapIndex].setShiftAmount(shiftAmountInSemitones);
     
        for(int i = 0; i < 8; i++)
        {
            psL[i].setAttributes(75, 0.0);
            psR[i].setAttributes(75, 0.0);
        }
    }

    void setDelayValues(int channel, bool channelSynced, float delayTimeInMilliseconds, 
        int delayTimeInSubdiv, float shapingX, float shapingY, float quantizeTime)
    {
    
            float linear;
            float sigmoid;
        


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
        // do this elsewhere

        auto readDataL = buffer.getReadPointer(0);
        auto writeDataL = buffer.getWritePointer(0);

        auto readDataR = buffer.getReadPointer(1);
        auto writeDataR = buffer.getWritePointer(1);


        for (int sample = 0; sample < buffer.getNumSamples(); ++sample){

            float outDataL = 0.0f;
            float outDataR = 0.0f;

            dlL.pushSample(0, readDataL[sample]);
            dlR.pushSample(0, readDataR[sample]);

            for (int i = 0; i < 8; i++)
            {
                
                float delayTimeInSamps = tp[i].freeTime * (sampleRate/1000.0f) * i; // * i for now

                float delayedDataL = dlL.popSample(0, delayTimeInSamps, i == 0);
                float delayedDataR = dlR.popSample(0, delayTimeInSamps, i == 0);

                float pitchShiftL = psL[i].processSample(delayedDataL);
                float pitchShiftR = psR[i].processSample(delayedDataR);

                outDataL += pitchShiftL;
                outDataR += pitchShiftR;

                amplitudesL[i].store(pitchShiftL);
                amplitudesR[i].store(pitchShiftR);
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


    double sampleRate;
    bool feedbackSuppression = false;
    std::array<tapAttributes, 16> tp;
    std::array<PitchShifter, 8> psL, psR;
 //   Reverb rv;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dlL, dlR;

};