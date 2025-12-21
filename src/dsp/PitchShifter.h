#include <JuceHeader.h>

class PitchShifter
{
public: 
    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {
        this->sampleRate = sampleRate;
        dl.setMaximumDelayInSamples(sampleRate * 2);
        
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
        double offsetAmount = 0.25;

        for (int i = 0; i < 4; i++){
            phase[i] = phase[i] + phraseIncr + (offsetAmount * i);
            if (phase[i] >= 1.0) { phase[i] -= 1.0; }
        }
    }

    void processBlock(juce::AudioBuffer<float>& buffer)
    {
        float windowSizeInSamples = sampleRate / windowSizeInHertz;
        
        for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
        {
            auto bufferData = buffer.getReadPointer(channel);
            auto data = buffer.getWritePointer(channel);
            
            for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
            {
                advancePhase();
                float out = 0.0f; 
                
                for (int i = 0; i < 4; i++)
                {                    
                    float delayTime = phase[i];
                    if (lastPhase[i] > phase[i]) 
                    {
                        float random = std::abs(rd[i].nextFloat()) * jitterAmount;
                        delayTime += random * windowSizeInSamples;
                    }
                    
                    dl.pushSample(0, bufferData[sample]);
                    out += dl.popSample(0, delayTime);
                    
                    lastPhase[i] = phase[i];    
                }
                
                data[sample] = out * 0.25f;
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

