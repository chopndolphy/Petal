#pragma once
#include <JuceHeader.h>
#include "Filters.h"

class MyVerb
{
public:
    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {

        lp1.prepareToPlay(sampleRate);
        lp2.prepareToPlay(sampleRate);
        lp3.prepareToPlay(sampleRate);
        lp4.prepareToPlay(sampleRate);

        ap1Mod.prepareToPlay(sampleRate, samplesPerBlock);
        ap2Mod.prepareToPlay(sampleRate, samplesPerBlock);
        ap1.prepareToPlay(sampleRate, samplesPerBlock);
        ap2.prepareToPlay(sampleRate, samplesPerBlock);
        ap3.prepareToPlay(sampleRate, samplesPerBlock);
        ap4.prepareToPlay(sampleRate, samplesPerBlock);
        ap5.prepareToPlay(sampleRate, samplesPerBlock);
        ap6.prepareToPlay(sampleRate, samplesPerBlock);

        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.numChannels = 2;
        spec.maximumBlockSize = samplesPerBlock;

        dl1.prepare(spec);
        dl1.setMaximumDelayInSamples(sampleRate);
        dl1.reset();

        dl2.prepare(spec);
        dl2.setMaximumDelayInSamples(sampleRate);
        dl2.reset();

        dl3.prepare(spec);
        dl3.setMaximumDelayInSamples(sampleRate);
        dl3.reset();

        dl4.prepare(spec);
        dl4.setMaximumDelayInSamples(sampleRate);
        dl4.reset();
    }
    
    void setDecayTime() {}

    void processSample(juce::AudioBuffer<float>& buffer)
    {

        for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
        {
            auto left = buffer.getReadPointer(0);
            auto right = buffer.getReadPointer(1);

            for (int sample = 0; sample < buffer.getNumSamples(); ++sample){

                float a = (left[sample] + right[sample]) * bandwidth;
                float b = lp1.processSample(a);
            
                float diffusion = ap4.processSample(ap3.processSample(ap2.processSample(ap1.processSample(b))));

                dl1.pushSample(0, (ap1Mod.processSample(diffusion))); 
                float tank1A = ap5.processSample(lp3.processSample(dl1.popSample(0, 500))); 
                dl2.pushSample(0, tank1A);
                float tank1B = dl2.popSample(0, 500) * 0.5f;

                dl3.pushSample(0, (ap2Mod.processSample(tank1B))); 
                float tank2A = ap6.processSample(lp4.processSample(dl3.popSample(0, 500))); 
                dl4.pushSample(0, tank1A);
                float tank2B = dl4.popSample(0, 500) * 0.5f;

                buffer.addSample(channel, sample, tank2B/2);
            }
        }
    }

private: 
    float bandwidth = 0.5f, damping = 0.5, decay = 0.9f;

    LPF lp1, lp2, lp3, lp4;

    APF 
    ap1Mod { 0.7f, 1343, true }, 
    ap2Mod { 0.7f, 995, true }, 
    ap1 { 0.75, 210, false },
    ap2 { 0.75, 158, false },
    ap3 { 0.625, 561, false },
    ap4 { 0.625, 410, false },
    ap5 { 0.5, 3931, false },
    ap6 { 0.5, 2664, false };

    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> 
    dl1, 
    dl2, 
    dl3, 
    dl4;

};