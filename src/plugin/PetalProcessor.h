#include <JuceHeader.h>
#include "../dsp/Delayline.h"
#include "../dsp/reverb/Reverb.h"

class PetalProcessor
{
public:
    PetalProcessor() {}

    void prepareToPlay(double sampleRate, int samplesPerBlock)
    {
        this->sampleRate = sampleRate;
        dlL.setMaximumDelayInSamples(sampleRate * 10);
        dlR.setMaximumDelayInSamples(sampleRate * 10);
        dlL.reset();
        dlR.reset();

        rvb.prepareToPlay(sampleRate, samplesPerBlock);
        rvbBuffer.setSize(2, samplesPerBlock, false, false, true); 
    }

    static float warpTapPosition(float basePos, float pos, float exponent)
    {
        if (basePos <= pos)
        {
            float span = pos;
            float distFrac = span <= 0.0001f ? 0.0f : (pos - basePos) / span;
            return pos - std::pow(distFrac, exponent) * span;
        }
        else
        {
            float span = 1.0f - pos;
            float distFrac = span <= 0.0001f ? 0.0f : (basePos - pos) / span;
            return pos + std::pow(distFrac, exponent) * span;
        }
    }

    void setTime(float freeTimeLInMs, float freeTimeRInMs, int syncTimeL, int syncTimeR,
                 float positionL, float skewL, float positionR, float skewR, bool stereoLock)
    {
        float freeTimeLInSamples = (freeTimeLInMs / 1000.0f) * sampleRate;
        float freeTimeRInSamples = (freeTimeRInMs / 1000.0f) * sampleRate;
        float syncTimeLInMilliseconds = 1000.0f / ((bpm / 60.0f) * syncTimeOptions[syncTimeL]);
        float syncTimeRInMilliseconds = 1000.0f / ((bpm / 60.0f) * syncTimeOptions[syncTimeR]);

        float exponentL = std::pow(2.0f, skewL * 4.5f);
        float exponentR = std::pow(2.0f, skewR * 4.5f);

        for (int tap = 1; tap < 8; tap++)
        {
            float basePos = (1.0f / 8.0f) * tap;
            float warpedL = warpTapPosition(basePos, positionL, exponentL);
            float warpedR = warpTapPosition(basePos, positionR, exponentR);

            tp[tap].freeTimeL = warpedL * freeTimeLInSamples;
            tp[tap].freeTimeR = warpedR * freeTimeRInSamples;
            tp[tap].syncTimeL = warpedL * syncTimeLInMilliseconds;
            tp[tap].syncTimeR = warpedR * syncTimeRInMilliseconds;
        }
    }

    void setBPM(juce::AudioPlayHead *playhead)
    {
        if (playhead == nullptr)
        {
            return;
        }
        if (playhead->getPosition()->getBpm().hasValue())
        {
            this->bpm = *playhead->getPosition()->getBpm();
        }
    }

    void setFeedback(float feedbackAmount)
    {
    }

    void processBlock(juce::AudioBuffer<float> &buffer)
    {
        auto readDataL = buffer.getReadPointer(0);
        auto readDataR = buffer.getReadPointer(1);
        rvbBuffer.setSize(2, buffer.getNumSamples(), false, false, true); 
        rvbBuffer.clear();

        const float gain = 2.0f / (float)numOverlaps;

        for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
        {
            dlL.writeSample(readDataL[sample]);
            dlR.writeSample(readDataR[sample]);

            for (int tap = 0; tap < 8; tap++)
            {
                advancePhase(tap);
                float pitchShiftedL = 0.0f;
                float pitchShiftedR = 0.0f;
                float reverbTapL = 0.0f;
                float reverbTapR = 0.0f;

                for (int sub = 0; sub < numOverlaps; sub++)
                {
                    float phase = tp[tap].phase + (float)sub / (float)numOverlaps;
                    if (phase >= 1.0f)
                        phase -= 1.0f;

                    float window = 0.5f * (1.0f - std::cos(2.0f * pi * phase));
                    float windowPos = windowSizeInSamples * phase;
                    float delayL = tp[tap].freeTimeL + windowPos;
                    float delayR = tp[tap].freeTimeR + windowPos;

                    pitchShiftedL += dlL.readSample(delayL) * window;
                    pitchShiftedR += dlR.readSample(delayR) * window;
                }

                buffer.addSample(0, sample, pitchShiftedL * gain);
                buffer.addSample(1, sample, pitchShiftedR * gain);
                rvbBuffer.addSample(0, sample, pitchShiftedL * gain * tp[tap].reverbAmount);
                rvbBuffer.addSample(1, sample, pitchShiftedR * gain * tp[tap].reverbAmount);
            }
        }

        rvb.processBlock(rvbBuffer);
        buffer.addFrom(0, 0, rvbBuffer, 0, 0, buffer.getNumSamples());
        buffer.addFrom(1, 0, rvbBuffer, 1, 0, buffer.getNumSamples());
    }

    void advancePhase(int tap)
    {
        float rate = ((1.0f - tp[tap].shiftAmount) * 1000.0f) / windowSizeInMilliseconds;
        float phaseAngle = rate / sampleRate;

        tp[tap].phase += phaseAngle;
        if (tp[tap].phase >= 1.0f) tp[tap].phase -= 1.0f;
        if (tp[tap].phase <= 0.0f) tp[tap].phase += 1.0f;
    }

    void setValues(int tap, int shiftAmountInSemitones, float reverbAmount)
    {
        float shiftAmount = std::exp(0.057762265f * shiftAmountInSemitones);
        tp[tap].shiftAmount = shiftAmount;
        tp[tap].reverbAmount = reverbAmount;
    }

    void setWindowSize(int windowSizeInMilliseconds)
    {
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        this->windowSizeInSamples = (sampleRate / 1000.0f) * windowSizeInMilliseconds;
    }

    std::array<std::atomic<float>, 8> amplitudesL, amplitudesR;
    MyVerb rvb; // its public
    juce::AudioBuffer<float> rvbBuffer;
private:
    static constexpr int numOverlaps = 4;

    double bpm = 120.0;
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
        float reverbAmount = 0.0f;
    };

    std::array<tapAttributes, 8> tp;

    static constexpr std::array<double, 19> syncTimeOptions = {
        0.03125, 0.04167, 0.0625, 0.0833,
        0.125, 0.25, 0.333, 0.5,
        0.666, 0.75, 0.8, 1.0,
        1.333, 1.5, 2.0, 3.0,
        4.0, 6.0, 8.0};

    double sampleRate = 48000;
    float pi = juce::MathConstants<float>::pi;
    float windowSizeInSamples = (float)(sampleRate / 2), windowSizeInMilliseconds = 200.0;
    bool feedbackSuppression = false;
    Delayline dlL, dlR;

};