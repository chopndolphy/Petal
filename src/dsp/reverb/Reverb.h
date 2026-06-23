#pragma once
#include <JuceHeader.h>
#include "Filters.h"

class MyVerb
{
public:

    MyVerb(){}

    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {
        this->sampleRate = sampleRate;
        lpL.prepareToPlay(sampleRate);
        lpR.prepareToPlay(sampleRate);
        hpL.prepareToPlay(sampleRate);
        hpR.prepareToPlay(sampleRate);
        hpL.setCoefficients(550, 0.707);
        hpR.setCoefficients(550, 0.707);

        difAp1.prepareToPlay(sampleRate, samplesPerBlock);
        difAp2.prepareToPlay(sampleRate, samplesPerBlock);
        difAp3.prepareToPlay(sampleRate, samplesPerBlock);
        difAp4.prepareToPlay(sampleRate, samplesPerBlock);
        difAp1.setValues(0.75, 5);
        difAp2.setValues(0.75, 11);
        difAp3.setValues(0.625, 17);
        difAp4.setValues(0.625, 23);

        modAp1.prepareToPlay(sampleRate, samplesPerBlock);
        modAp2.prepareToPlay(sampleRate, samplesPerBlock);
        modAp3.prepareToPlay(sampleRate, samplesPerBlock);
        modAp4.prepareToPlay(sampleRate, samplesPerBlock);

        // delay line specs:

        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.numChannels = 1;
        spec.maximumBlockSize = samplesPerBlock;
        dlL.prepare(spec);
        dlR.prepare(spec);

        // calculate angles
        modAngle1 = 0.15 / sampleRate;
        modAngle2 = 0.1 / sampleRate;
    }
    
    void setDecayTime(float decayTimeInMs, float dampFreqInHz) { // placeholder
        lpL.setCoefficients(dampFreqInHz, 0.707);
        lpR.setCoefficients(dampFreqInHz, 0.707);
        float decayInSamples = (decayTimeInMs / 1000.0f) * sampleRate;

        // full loop length = delay line + allpass center delays
        float loopLengthL = 3000.0f + 7.0f + 11.0f;  // dlL + modAp1 + modAp2
        float loopLengthR = 5000.0f + 13.0f + 19.0f; // dlR + modAp3 + modAp4
        float avgLoopLength = (loopLengthL + loopLengthR) * 0.5f;

        float loopIterations = decayInSamples / avgLoopLength;
        feedBackAmount = std::exp(-6.9077552789821f / loopIterations);
    }

    static constexpr float epsilon = 1e-6f; // safety for dividing by 0

    void processBlock(juce::AudioBuffer<float>& buffer)
    {
        auto left = buffer.getReadPointer(0);
        auto right = buffer.getReadPointer(1);

        for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
        {
            float x = (left[sample] + right[sample]) * 0.5f;
            float diffusion = difAp4.processSample(difAp3.processSample(difAp2.processSample(difAp1.processSample(x))));

            // calculate modulation
            float lfo1 = std::abs(modPhase1 - 0.5f) * 4.0 - 1; // polarity
            float lfo2 = std::abs(modPhase2 - 0.5f) * 4.0 - 1; 

            modAp1.setValues(0.5, 7 + lfo1 * 5);
            modAp2.setValues(0.5, 11 + lfo2 * 6);
            modAp3.setValues(0.5, 13 + lfo1 * 5);
            modAp4.setValues(0.5, 19 + lfo2 * 9);

            // left
            float apL1 = modAp1.processSample(diffusion + feedbackR);
            float apL2 = modAp2.processSample(apL1);
            float _lpL = lpL.processSample(apL2, 0);
            float _hpL = hpL.processSample(_lpL, 2);
            dlL.pushSample(0, _lpL * feedBackAmount);
            feedbackL = dlL.popSample(0, 3000); 

            // right
            float apR1 = modAp3.processSample(diffusion + feedbackL);
            float apR2 = modAp4.processSample(apR1);
            float _lpR = lpR.processSample(apR2, 0);
            float _hpR = hpR.processSample(_lpR, 2);
            dlR.pushSample(0, _lpR * feedBackAmount);
            feedbackR = dlR.popSample(0, 5000);


            // increment lfo
            modPhase1 += modAngle1; if (modPhase1 >= 1.0) modPhase1 -= 1.0; 
            modPhase2 += modAngle2; if (modPhase2 >= 1.0) modPhase2 -= 1.0;

            buffer.addSample(0, sample, _hpL);
            buffer.addSample(1, sample, _hpR);
        }
    }

private: 
    double sampleRate;
    float bandwidth = 0.5f, damping = 0.5, decay = 0.9f, feedBackAmount = 0.92f;
    float feedbackL = 0.0f, feedbackR = 0.0f;

    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dlL, dlR;
    SVF lpL, lpR, hpL, hpR;
    APF difAp1, difAp2, difAp3, difAp4,
    modAp1, modAp2, modAp3, modAp4;

    double modPhase1 = 0.0, 
    modAngle1 = 0.0, 
    modPhase2 = 0.0, 
    modAngle2; 

};