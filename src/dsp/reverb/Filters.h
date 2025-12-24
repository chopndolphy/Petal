#include <JuceHeader.h>

class APF
{
public:
    /*
        This class implements the difference equation: 
        y[n] = -g*x[n] + x[n-d] + g*y[n-d]
    */ 

    APF(float gain, int delayInSamples, bool isModulated)
    {
        this->gain = gain;
        this->delayInSamples = delayInSamples;
        this->isModulated = isModulated;
    }

    void prepareToPlay(double sampleRate, int maximumBlockSize)
    {
        this->sampleRate = sampleRate;

        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.maximumBlockSize = maximumBlockSize;
        spec.numChannels = 1;

        dl.prepare(spec);
        dl.setMaximumDelayInSamples(sampleRate);
        dl.reset();
    }

    void advancePhase()
    {
        double incr = rateInHz/sampleRate;
        phase += incr;
        if (phase >= 1.0) { phase -= 1.0; }
    }

    float processSample(float x)
    {
        float delayTime = phase * 16;
        float y = -gain * x + dl.popSample(0, delayTime);
        dl.pushSample(0, x + gain * y);  
        if (isModulated) { advancePhase(); }
        
        return y;
    }

private: 
    double sampleRate, phase;
    bool isModulated = false;
    int delayInSamples; 
    float rateInHz, gain;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
};


class LPF
{
public: 
    /*
        This class implements the difference equation: 
        y[n] = (1-g) * x[n] + g * y[n-1]
    */ 
   
    void setCutoffInHz(float cutoffInHz)
    {
        float omega = 2.0f * M_PI * cutoffInHz / sampleRate;
        this->gain = std::expf(-omega);
    }

    void prepareToPlay(double sampleRate)
    {
        this->sampleRate = sampleRate;
        
    }

    float processSample(float x)
    {
        float y = (1.0f - gain) * x + gain * lastY;
        lastY = y;

        return y;
    }

private: 
    double sampleRate, phase = 0.0;
    float gain = 0.5, lastY = 0.0f;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
};
