#include <JuceHeader.h>
#include <cmath>
#include <limits>
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

        updateCorrelationSizes();

        for (auto &t : tp)
            for (int sub = 0; sub < numOverlaps; ++sub)
            {
                float p = (float)sub / (float)numOverlaps;
                t.phasePrevSub[sub] = p;
                t.simOffsetL[sub] = 0.0f;
                t.simOffsetR[sub] = 0.0f;
            }
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
            delayTimesL[tap].store(warpedL);
            delayTimesR[tap].store(warpedR);

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

    void setFeedback(float feedbackAmt)
    {
        this->feedbackAmt = feedbackAmt / 110;
    }

    void setCorrelate(bool enabled) { correlateEnabled = enabled; }

    void setCorrelationParams(float maxLagMs, float frameMs, int stride)
    {
        corrMaxLagMs = maxLagMs;
        corrFrameMs = frameMs;
        corrStride = juce::jmax(1, stride);
        updateCorrelationSizes();
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
            dlL.writeSample(readDataL[sample] + feedbackL);
            dlR.writeSample(readDataR[sample] + feedbackR);

            for (int tap = 0; tap < 8; tap++)
            {
                advancePhase(tap);
                float pitchShiftedL = 0.0f;
                float pitchShiftedR = 0.0f;

                for (int sub = 0; sub < numOverlaps; sub++)
                {
                    float phase = tp[tap].phase + (float)sub / (float)numOverlaps;
                    if (phase >= 1.0f)
                        phase -= 1.0f;

                    if (correlateEnabled)
                    {
                        const float prevPhase = tp[tap].phasePrevSub[sub];
                        if (std::abs(phase - prevPhase) > 0.5f) // wrapped this sample
                        {
                            // Outgoing edge uses the OLD offset (what it actually read).
                            const float endPosL = tp[tap].freeTimeL + windowSizeInSamples * prevPhase + tp[tap].simOffsetL[sub];
                            const float endPosR = tp[tap].freeTimeR + windowSizeInSamples * prevPhase + tp[tap].simOffsetR[sub];

                            // Incoming nominal start (offset chosen by the search).
                            const float startL = tp[tap].freeTimeL + windowSizeInSamples * phase;
                            const float startR = tp[tap].freeTimeR + windowSizeInSamples * phase;

                            tp[tap].simOffsetL[sub] = computeSimOffset(dlL, endPosL, startL);
                            tp[tap].simOffsetR[sub] = computeSimOffset(dlR, endPosR, startR);
                        }
                    }
                    else
                    {
                        tp[tap].simOffsetL[sub] = 0.0f;
                        tp[tap].simOffsetR[sub] = 0.0f;
                    }
                    tp[tap].phasePrevSub[sub] = phase;
                    // -----------------------------------------------------------

                    float window = 0.5f * (1.0f - std::cos(2.0f * pi * phase));
                    float windowPos = windowSizeInSamples * phase;
                    float delayL = tp[tap].freeTimeL + windowPos + tp[tap].simOffsetL[sub];
                    float delayR = tp[tap].freeTimeR + windowPos + tp[tap].simOffsetR[sub];

                    pitchShiftedL += dlL.readSample(delayL) * window;
                    pitchShiftedR += dlR.readSample(delayR) * window;
                }

                feedbackL = pitchShiftedL * feedbackAmt;
                feedbackR = pitchShiftedR * feedbackAmt;

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
        if (tp[tap].phase >= 1.0f)
        {
            tp[tap].phase -= 1.0f;
        }
        if (tp[tap].phase <= 0.0f)
        {
            tp[tap].phase += 1.0f;
        }
    }

    void setValues(int tap, int shiftAmountInSemitones, float reverbAmount)
    {
        float shiftAmount = std::exp(0.057762265f * shiftAmountInSemitones);
        tp[tap].shiftAmount = shiftAmount;
        tp[tap].reverbAmount = reverbAmount;
    }

    void setWindowSize(int windowSizeInMilliseconds, float windowJitterAmt)
    {
        this->windowSizeInMilliseconds = windowSizeInMilliseconds;
        this->windowSizeInSamples = (sampleRate / 1000.0f) * windowSizeInMilliseconds;
        this->windowJitterAmt = windowJitterAmt / 500.0f;
    }

    std::array<std::atomic<float>, 8> amplitudesL, amplitudesR;
    std::array<std::atomic<float>, 8> delayTimesL, delayTimesR;

    MyVerb rvb; // its public
    juce::AudioBuffer<float> rvbBuffer;

private:
    static constexpr int numOverlaps = 2;
    static constexpr int kMaxCorrTaps = 256;
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

        // Per-slot WSOLA state.
        std::array<float, numOverlaps> phasePrevSub{{}};
        std::array<float, numOverlaps> simOffsetL{{}};
        std::array<float, numOverlaps> simOffsetR{{}};
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
    float windowSizeInSamples = (float)(sampleRate / 2), windowSizeInMilliseconds = 200.0, windowJitterAmt = 0.0f;

    juce::Random rd;
    bool feedbackSuppression = false;
    float feedbackAmt = 0.0f, feedbackL = 0.0f, feedbackR = 0.0f;
    Delayline dlL, dlR;

    bool correlateEnabled = true;
    float corrMaxLagMs = 8.0f; 
    float corrFrameMs = 4.0f;  
    int corrStride = 2;        
    int maxLagSamples = 0;     
    int corrTaps = 0;          

    void updateCorrelationSizes()
    {
        maxLagSamples = (int)(corrMaxLagMs * sampleRate / 1000.0f);
        int frameSamples = (int)(corrFrameMs * sampleRate / 1000.0f);
        corrTaps = juce::jlimit(4, kMaxCorrTaps, frameSamples / juce::jmax(1, corrStride));
    }

    float computeSimOffset(Delayline &dl, float endPos, float startNominal)
    {
        const float maxRead = (float)(sampleRate * 10.0 - 2.0);
        auto clampDelay = [maxRead](float d)
        { return juce::jlimit(1.0f, maxRead, d); };

        float refBuf[kMaxCorrTaps];
        for (int i = 0; i < corrTaps; ++i)
            refBuf[i] = dl.readSample(clampDelay(endPos + (float)(i * corrStride)));

        float bestScore = -std::numeric_limits<float>::max();
        float bestLag = 0.0f; 

        for (int lag = -maxLagSamples; lag <= maxLagSamples; ++lag)
        {
            float dot = 0.0f, energy = 0.0f;
            for (int i = 0; i < corrTaps; ++i)
            {
                float c = dl.readSample(clampDelay(startNominal + (float)(lag + i * corrStride)));
                dot += refBuf[i] * c;
                energy += c * c;
            }

            if (energy < 1.0e-6f)
                continue; 

            float score = dot / std::sqrt(energy + 1.0e-9f) - 1.0e-4f * (float)std::abs(lag);
            if (score > bestScore)
            {
                bestScore = score;
                bestLag = (float)lag;
            }
        }
        return bestLag;
    }
};
