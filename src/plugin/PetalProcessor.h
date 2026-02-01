#include <JuceHeader.h>
#include "../dsp/Delayline.h"

class PetalProcessor 
{
public: 
    PetalProcessor()
    {

    }

    void prepareToPlay(double sampleRate, int maximumBlockSize) 
    {
        dlL.setMaximumDelayInSamples(sampleRate * 10);
        dlR.setMaximumDelayInSamples(sampleRate * 10);
        dlL.reset();
        dlR.reset();

        this->sampleRate = sampleRate;
    }

    void setSaturatorValue(float inputGainInDecibels, bool saturatorActive)
    {

    }

    void setTime(float freeTimeL, float freeTimeR, int syncTimeL, int syncTimeR, 
        float shapingXL, float shapingYL, float shapingXR, float shapingYR, bool stereoLock)
    {
        float freeTimeLInMilliseconds = freeTimeL;
        float freeTimeRInMilliseconds = freeTimeR;
        float syncTimeLInMilliseconds = 1000.0f / ((bpm/60.0f) * syncTimeOptions[syncTimeL]);
        float syncTimeRInMilliseconds = 1000.0f / ((bpm/60.0f) * syncTimeOptions[syncTimeR]);

        for (int tap = 1; tap < 8; tap++){

            float sigmoidScaleL = tap - shapingYL * 7;
            float sigmoidScaleR = tap - shapingYR * 7;

            float linearL = (1.0f/8.0f) * tap;
            float linearR = (1.0f/8.0f) * tap;

            float sigmoidL = 1.0f/(1.0f + std::exp(-sigmoidScaleL));
            float sigmoidR = 1.0f/(1.0f + std::exp(-sigmoidScaleR));

            float lerpL = linearL + (sigmoidL - linearL) * shapingXL;
            float lerpR = linearR + (sigmoidR - linearR) * shapingXR;

            tp[tap].freeTimeL = lerpL * freeTimeLInMilliseconds;
            tp[tap].freeTimeR = lerpR * freeTimeRInMilliseconds;

            tp[tap].syncTimeL = lerpR * syncTimeLInMilliseconds;
            tp[tap].syncTimeR = lerpR * syncTimeRInMilliseconds;
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
            dlL.writeSample(readDataL[sample]);
            dlR.writeSample(readDataR[sample]);

            for (int tap = 0; tap < 8; tap++){
                advancePhase(tap);

                float pitchShiftedL = dlL.readSample(getDelayTimeInSamples(tap, false)) * getWindow(tap, false);
                pitchShiftedL += dlL.readSample(getDelayTimeInSamples(tap, true)) * getWindow(tap, true);

                float pitchShiftedR = dlR.readSample(getDelayTimeInSamples(tap, false)) * getWindow(tap, false);
                pitchShiftedR += dlR.readSample(getDelayTimeInSamples(tap, true)) * getWindow(tap, true);

                buffer.addSample(0, sample, pitchShiftedL); 
                buffer.addSample(1, sample, pitchShiftedR);
            }
        }
    }

    void advancePhase(int tap)
    {
        float rate = ((1.0 - tp[tap].shiftAmount) * 1000.0) / windowSizeInMilliseconds;
        float phaseAngle = rate / sampleRate;

        tp[tap].phase += phaseAngle;
        if (tp[tap].phase >= 1.0f) tp[tap].phase -= 1.0f;
        if (tp[tap].phase <= 0.0f) tp[tap].phase += 1.0f;

        tp[tap].phaseInv = tp[tap].phase + 0.5;
        if (tp[tap].phaseInv >= 1.0f) tp[tap].phaseInv -= 1.0f;
        if (tp[tap].phaseInv <= 0.0f) tp[tap].phaseInv += 1.0f;

    }

    void setPitchShifter(int tap, int shiftAmountInSemitones)
    {
        float shiftAmount = std::exp(0.057762265f * shiftAmountInSemitones);
        tp[tap].shiftAmount = shiftAmount;
    }

    void setWindowSize(int windowSizeInMilliseconds)
    {
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        this->windowSizeInSamples = (sampleRate / 1000.0f) * windowSizeInMilliseconds;
    }

    float getDelayTimeInSamples(int tap, bool isInverted)
    {
        float phase = !isInverted ? tp[tap].phase : tp[tap].phaseInv;
        float delayTime = tp[tap].freeTimeL + (windowSizeInSamples * phase);
        return delayTime;
    }

    float getWindow(int tap, bool isInverted)
    {
        float phase = !isInverted ? tp[tap].phase : tp[tap].phaseInv;
        phase -= 0.5f;
        phase *= phase;
        return 1.0f - 4.0f * phase;
    }

    std::array<std::atomic<float>, 8> amplitudesL, amplitudesR; 
private: 

    double bpm;
    struct tapAttributes 
    { 
        float phase = 0.0;
        float phaseInv = 0.0;
        bool isActive = true;
        int syncTimeL = 1;
        int syncTimeR = 1;
        float freeTimeL = 1.0f;
        float freeTimeR = 1.0f;
        float shiftAmount = 1.0f;
        float reverbAmt = 0.0f;
    };

    std::array<tapAttributes, 8> tp;

    static constexpr std::array<double, 19> syncTimeOptions = {
         0.03125,   0.04167,   0.0625,   0.0833,
         0.125,     0.25,      0.333,    0.5,
         0.666,     0.75,      0.8,      1.0,
         1.333,     1.5,       2.0,      3.0,
         4.0,       6.0,       8.0
    };

    double sampleRate;
    float windowSizeInSamples = sampleRate/2, windowSizeInMilliseconds = 200;
    bool feedbackSuppression = false;
    Delayline dlL, dlR;


};

