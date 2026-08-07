#include <JuceHeader.h>
#include <cmath>
#include <limits>
#include "../dsp/Utility.h"
#include "../dsp/Delayline.h"
#include "../dsp/reverb/Reverb.h"

class PetalProcessor
{
public:
    PetalProcessor() {}

    void prepareToPlay(double sampleRate, int samplesPerBlock);
    void processBlock(juce::AudioBuffer<float> &buffer) noexcept;

    void setDelayTapAttributes(int tap, bool state, int shiftAmountInSemitones, float reverbAmount);
    void setDelayTapTimes(float freeTimeLInMs, float freeTimeRInMs, int syncIndexL, int syncIndexR,
                 float positionL, float skewL, float positionR, float skewR, float round,
                 bool isSyncL, bool isSyncR, bool stereoLock);

    void setBPM(juce::AudioPlayHead *playhead);
    void setDelayAndPitchAttributes(float feedbackAmt, int feedbackLen, int windowSizeInMilliseconds,
                                                    float setDuckingAmount, float setDuckingTime);

    std::array<std::atomic<float>, 8> amplitudesL, amplitudesR, delayTimesL, delayTimesR, tapStates;
    PetalReverb rvb;
    juce::AudioBuffer<float> rvbBuffer;

private:
    void advancePhase(int tap) noexcept;
    static float warpTapPosition(float basePos, float pos, float exponent, float round) // round should be a factor
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

    static constexpr std::array<double, 11> syncTimeOptions = {
        0.03125, 0.04167, 0.0625, 0.0833,
        0.125, 0.25, 0.333, 0.5,
        0.666, 0.75, 1.0 };

    double sampleRate = 48000, bpm = 120.0;
    float pi = juce::MathConstants<float>::pi;
    float windowSizeInSamples = (float)(sampleRate / 2), windowSizeInMilliseconds = 200.0;
    static constexpr int numOverlaps = 2;

    bool feedbackSuppression = false;
    float feedbackAmt = 0.0f, feedbackL = 0.0f, feedbackR = 0.0f;
    Delayline dlL, dlR;
    Correlation cr;
    juce::SmoothedValue<float> duckEnv;
    float duckAmt = 0.0f, duckLen = 0.0f;

    struct tapAttributes
    {
        float phase = 0.0f;
        float phaseInv = 0.0f;
        juce::SmoothedValue<float> gain;
        float timeL = 1.0f;
        float timeR = 1.0f;
        float shiftAmount = 1.0f;
        float reverbAmount = 0.0f;

        std::array<float, numOverlaps> phasePrevSub{{}};
        std::array<float, numOverlaps> simOffsetL{{}};
        std::array<float, numOverlaps> simOffsetR{{}};
    };

    std::array<tapAttributes, 8> tp;
};
