#include <JuceHeader.h>

class PitchShifter
{
public: 
    PitchShifter()
    {
        phase.fill(0.0);
        lastPhase.fill(0.0);
    }

    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {
        this->sampleRate = sampleRate;

        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.numChannels = 2;
        spec.maximumBlockSize = samplesPerBlock;

        dl.prepare(spec);
        dl.setMaximumDelayInSamples(static_cast<int>(sampleRate * 2));
        dl.reset();

        phase.fill(0.0);
        lastPhase.fill(0.0);
    }

    void setAttributes(float shiftAmount, float windowSizeInMilliseconds, float jitterAmount) 
    {
        for (int i = 0; i < 4; i++){
            if (lastPhase[i] > phase[i]){
                this->shiftAmount = shiftAmount;
                float windowSizeInHertz = windowSizeInMilliseconds/1000.0f;
                this->windowSizeInMilliseconds = windowSizeInMilliseconds;
                this->windowSizeInHertz = windowSizeInHertz;
                this->jitterAmount = jitterAmount * 0.25f;
            }
            lastPhase[i] = phase[i];
        }
    }
    
    void advancePhase()
    {
        double rate = (1.0 - shiftAmount) * 1000.0/windowSizeInMilliseconds;

        double phraseIncr = rate/sampleRate;

        for (int i = 0; i < 4; i++){
            phase[i] += phraseIncr;

            if (lastPhase[i] > phase[i])
            {
                float jitter = std::abs(rd[i].nextFloat()) * jitterAmount;
                phase[i] += jitter;
            }

            if (phase[i] >= 1.0) { phase[i] -= 1.0; }
            lastPhase[i] = phase[i];
        }
    }

    void processBlock(juce::AudioBuffer<float>& buffer)
    {
        for (int channel = 0; channel < buffer.getNumChannels(); ++channel){  

            auto readData = buffer.getReadPointer(channel);
            auto writeData = buffer.getWritePointer(channel);

            for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
            {
                float delaySumData = 0.0f;
                dl.pushSample(channel, readData[sample]);
                float data = dl.popSample(channel, sampleRate);

                writeData[sample] = (data + readData[sample]) * 0.5f;

            }
        }
    }

private: 
    double sampleRate;
    std::array<double, 4> phase;
    std::array<double, 4> lastPhase;

    std::array<juce::Random, 4> rd;
    juce::dsp::FastMathApproximations sin;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
    float shiftAmount = 2, windowSizeInHertz, windowSizeInMilliseconds, jitterAmount;

};

