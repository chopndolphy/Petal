#include <JuceHeader.h>

class PitchShifter
{
public: 
    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {
        this->sampleRate = sampleRate;
    }

    void setAttributes(float shiftAmount, float grainSizeInMilliseconds, float jitterAmount) 
    {
        if (lastPhase > phase[0]){
            this->shiftAmount = shiftAmount;
            float grainSizeInHertz = grainSizeInMilliseconds/1000.0f;
            this->grainSizeInHertz = grainSizeInHertz;
            this->jitterAmount = jitterAmount * 0.25f;
        }
        lastPhase = phase[0];
    }
    
    void accumulate()
    {
        double phraseIncr = grainSizeInHertz/sampleRate;
        double offsetAmount = 0.25;

        for (int i = 0; i < 4; i++){
            phase[i] = phase[i] + phraseIncr + (offsetAmount * i);
            if (phase[i] >= 1.0) { phase[i] -= 1.0; }

        }
    }
    void processBlock(juce::AudioBuffer<float>& buffer)
    {
        for(int i = 0; i < buffer.getNumSamples(); i++)
        {
            

        }
    }

private: 
    double sampleRate;
    double lastPhase;
    std::array<double, 4> phase;
    std::array<juce::Random, 4> rd;

    float shiftAmount, grainSizeInHertz, jitterAmount;

};

