#include <JuceHeader.h>
//==============================================================================
/*
#include <JuceHeader.h>

class PitchShifter
{
public: 
    PitchShifter()
    {
        phase.fill(0.0);
        lastPhase.fill(0.0);

        this->pi = juce::MathConstants<double>::pi;
    }

    void prepareToPlay(double sampleRate, int samplesPerBlock) 
    {
        this->sampleRate = sampleRate;

        juce::dsp::ProcessSpec spec;
        spec.sampleRate = sampleRate;
        spec.numChannels = 1;
        spec.maximumBlockSize = samplesPerBlock;

        dl.prepare(spec);
        dl.setMaximumDelayInSamples((int)(sampleRate * 2));
        dl.reset();

        for (int i = 0; i < 4; i++)
        {
            phase[i] = i * 0.5;
            lastPhase[i] = i * 0.5;
        }
        delayTimeInSamples.fill(0.0);
        
    }

    void setAttributes(float windowSizeInMilliseconds, float jitterAmount) 
    {
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        float windowSizeInHertz = 1000.0f/windowSizeInMilliseconds;
        this->windowSizeInHertz = windowSizeInHertz;
        this->jitterAmount = jitterAmount * 0.25f;
    }

    void setShiftAmount(float intervalInSemitones)
    {
        float shiftAmount = std::exp(0.057762265f * intervalInSemitones);
        this->shiftAmount = shiftAmount;
    }
    

float processSample(float sample)
{
    float windowSizeInSamples = (sampleRate / 1000.0) * windowSizeInMilliseconds;
    float pitchShifted = 0.0f;
    dl.pushSample(0, sample);

    for (int i = 0; i < 2; i++)
    {
        double normPhase = phase[i];
        
        if (lastPhase[i] < phase[i])
        {
            float jitter = std::abs(rd[i].nextFloat()) * jitterAmount + 1.0f;
            normPhase += jitter;
        }
        
        delayTimeInSamples[i] = windowSizeInSamples * normPhase;
        lastPhase[i] = phase[i];

        float window = cos.cos((normPhase - 0.5) * pi);
        window *= window;
        pitchShifted += (dl.popSample(0, delayTimeInSamples[i], i == 0) * window);

    }

        double rate = ((1.0 - shiftAmount) * 1000.0)/windowSizeInMilliseconds;
        double phraseIncr = rate/sampleRate;

        for (int i = 0; i < 4; i++){
            phase[i] += phraseIncr;
            if (phase[i] >= 1.0) { phase[i] -= 1.0; }
            if (phase[i] < 0.0) { phase[i] += 1.0; }
        }

    return pitchShifted;
}

private: 
    double sampleRate;
    std::array<double, 4> phase;
    std::array<double, 4> lastPhase;
    std::array<double, 4> delayTimeInSamples;

    std::array<juce::Random, 4> rd;
    juce::dsp::FastMathApproximations cos;
    double pi;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> dl;
    float shiftAmount = 2.0f, windowSizeInHertz = 4.0f, windowSizeInMilliseconds, jitterAmount = 0.0f;
};

*/



#include <JuceHeader.h>

class PitchShifter
{
public: 
    PitchShifter(juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear>& dl) : delayline(dl)
    {

    }
    
    void prepareToPlay(int channel, double sampleRate) 
    {
        this->sampleRate = sampleRate;
    //    this->channel = channel;
        
        phase = 0.0;
        lastPhase = 0.0;
        delayTime1 = 0.0;
        delayTime2 = 0.0;

        this->pi = juce::MathConstants<double>::pi;
    }
    
    void setAttributes(float windowSizeInMilliseconds, float jitterAmount) 
    {
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        float windowSizeInHertz = 1000.0f / windowSizeInMilliseconds;
        this->windowSizeInHertz = windowSizeInHertz;
        this->jitterAmount = jitterAmount * 0.25f;
    }
    
    void setShiftAmount(float intervalInSemitones)
    {
        float shiftAmount = std::exp(0.057762265f * intervalInSemitones);
        this->shiftAmount = shiftAmount;
    }
    
    float processSample(int channel, int tapInstance, float tapDelayOffsetInSamples)    
    {
        float phases[2] = {phase, phase + 0.5f}; 
        phases[1] -= std::floor(phases[1]); 

        float lastPhases[2] = {lastPhase, lastPhase + 0.5f};
        float delayTimes[2] = {delayTime1, delayTime2};
        
        float windowSizeInSamples = (sampleRate / 1000.0) * windowSizeInMilliseconds;
        float pitchShifted = 0.0f;

        for (int i = 0; i < 2; i++)
        {
            float normPhase = phases[i];
            if (lastPhases[i] < phases[i])
            {
                float jitter = rd.nextFloat() * jitterAmount + 1.0f;
                normPhase += jitter;
            }
            delayTimes[i] = tapDelayOffsetInSamples + windowSizeInSamples * normPhase;
            lastPhases[i] = phases[i];
            float window = cos.cos((normPhase - 0.5) * pi);
            window *= window;

            bool advanceReadPointer = (tapInstance == 0) && (channel == 0);
            pitchShifted += (delayline.popSample(channel, delayTimes[i], advanceReadPointer) * window);
        }
        
        float rate = ((1.0 - shiftAmount) * 1000.0) / windowSizeInMilliseconds;
        float phaseIncr = rate / sampleRate;
        
        phase += phaseIncr;
        phase -= std::floor(phase);
        
        return pitchShifted;
    }
    
private: 
  //  int channel;
    float sampleRate;
    float phase;
    float lastPhase;
    float delayTime1, delayTime2;
    juce::Random rd;
    juce::dsp::FastMathApproximations cos;
    float pi;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear>& delayline;
    float shiftAmount = 2.0f, windowSizeInHertz = 4.0f, windowSizeInMilliseconds, jitterAmount = 0.0f;
};
