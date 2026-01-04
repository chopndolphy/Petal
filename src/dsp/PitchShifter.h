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
        dl.setMaximumDelayInSamples((int)(sampleRate * 2));
        dl.reset();

        for (int i = 0; i < 4; i++)
        {
            phase[i] = i * 0.25;
            lastPhase[i] = i * 0.25;
        }
        delayTimeInSamples.fill(0.0);
        
    }

    void setAttributes(float shiftAmount, float windowSizeInMilliseconds, float jitterAmount) 
    {
        this->shiftAmount = shiftAmount;
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        float windowSizeInHertz = 1000.0f/windowSizeInMilliseconds;
        this->windowSizeInHertz = windowSizeInHertz;
        this->jitterAmount = jitterAmount * 0.25f;
    }
    
    void advancePhase()
    {
        double rate = ((1.0 - shiftAmount) * 1000.0)/windowSizeInMilliseconds;
        double phraseIncr = rate/sampleRate;

        for (int i = 0; i < 4; i++){
            phase[i] += phraseIncr;
            if (phase[i] >= 1.0) { phase[i] -= 1.0; }
            if (phase[i] < 0.0) { phase[i] += 1.0; }
        }
    }

void processBlock(juce::AudioBuffer<float>& buffer)
{
    float windowSizeInSamples = (sampleRate / 1000.0) * windowSizeInMilliseconds;
    
    for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
    {  
        auto readData = buffer.getReadPointer(channel);
        auto writeData = buffer.getWritePointer(channel);
        
        for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
        {
            if (channel == 0)
            {
                for (int i = 0; i < 4; i++)
                {
                    double normDelayTime = phase[i];
                    
                    if (lastPhase[i] > phase[i])
                    {
                        float jitter = std::abs(rd[i].nextFloat()) * jitterAmount + 1.0f;
                        normDelayTime += jitter;
                    }
                    
                    delayTimeInSamples[i] = windowSizeInSamples * normDelayTime;
                    lastPhase[i] = phase[i];
                }
                advancePhase();
            }
            
            float delaySumData = 0.0f;
            dl.pushSample(channel, readData[sample]);
            
            for (int i = 0; i < 4; i++)
            {
                bool advance = (i == 0);
                float window = (cos.cos((phase[i] - 0.5) * pi) * 0.5 + 0.5);
                delaySumData += dl.popSample(channel, delayTimeInSamples[i], advance) * window;
            }
            writeData[sample] = delaySumData;
        }
    }
}
private: 
    double sampleRate;
    std::array<double, 4> phase;
    std::array<double, 4> lastPhase;
    std::array<double, 4> delayTimeInSamples;

    std::array<juce::Random, 4> rd;
    juce::dsp::FastMathApproximations cos;
    double pi = juce::MathConstants<double>::pi;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
    float shiftAmount = 2.0f, windowSizeInHertz = 4.0f, windowSizeInMilliseconds, jitterAmount = 0.0f;
};

