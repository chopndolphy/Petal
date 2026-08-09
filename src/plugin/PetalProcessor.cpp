#pragma once
#include "PetalProcessor.h"

void PetalProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    this->sampleRate = sampleRate;
    dlL.setMaximumDelayInSamples(sampleRate * 10);
    dlR.setMaximumDelayInSamples(sampleRate * 10);
    dlL.reset();
    dlR.reset();

    duckEnv.reset(sampleRate, 1.0);

    rvb.prepareToPlay(sampleRate, samplesPerBlock);
    rvbBuffer.setSize(2, samplesPerBlock, false, false, true);

    cr.prepare(sampleRate);
    cr.updateCorrelationSizes();

    for (auto &t : tp)
        for (int sub = 0; sub < numOverlaps; ++sub)
        {
            float p = (float)sub / (float)numOverlaps;
            t.phasePrevSub[sub] = p;
            t.simOffsetL[sub] = 0.0f;
            t.simOffsetR[sub] = 0.0f;
        }

    for (int tap = 0; tap < 8; tap++) // clean this up maybe
    {
        tp[tap].gain.reset(sampleRate, 0.01f);
        tp[tap].timeL.reset(sampleRate, 0.15f);
        tp[tap].timeR.reset(sampleRate, 0.15f);
    }
}

void PetalProcessor::processBlock(juce::AudioBuffer<float> &buffer) noexcept
{
    auto readDataL = buffer.getReadPointer(0);
    auto readDataR = buffer.getReadPointer(1);
    rvbBuffer.setSize(2, buffer.getNumSamples(), false, false, true);
    rvbBuffer.clear();

    const float gain = 2.0f / (float)numOverlaps;

    for (int sample = 0; sample < buffer.getNumSamples(); ++sample)
    {
        float inL = readDataL[sample] + feedbackL, inR = readDataR[sample] + feedbackR;
        dlL.writeSample(inL);
        dlR.writeSample(inR);
        duckEnv.setTargetValue((inL + inR)/2);
        float duck = 1.0f - (duckEnv.getNextValue() * duckAmt);

        for (int tap = 0; tap < 8; tap++)
        {
            advancePhase(tap);
            float pitchShiftedL = 0.0f, pitchShiftedR = 0.0f;

            // pull one interpolated value per sample, reused across both sub-iterations
            const float baseTimeL = tp[tap].timeL.getNextValue();
            const float baseTimeR = tp[tap].timeR.getNextValue();

            for (int sub = 0; sub < numOverlaps; sub++) // collapse this loop since theres only 2 overlaps
            {
                float phase = tp[tap].phase + (float)sub / (float)numOverlaps;
                if (phase >= 1.0f)
                    phase -= 1.0f;

                const float prevPhase = tp[tap].phasePrevSub[sub];
                if (std::abs(phase - prevPhase) > 0.5f)
                {
                    const float endPosL = baseTimeL + windowSizeInSamples * prevPhase + tp[tap].simOffsetL[sub];
                    const float endPosR = baseTimeR + windowSizeInSamples * prevPhase + tp[tap].simOffsetR[sub];

                    const float startL = baseTimeL + windowSizeInSamples * phase;
                    const float startR = baseTimeR + windowSizeInSamples * phase;

                    tp[tap].simOffsetL[sub] = cr.computeSimOffset(dlL, endPosL, startL);
                    tp[tap].simOffsetR[sub] = cr.computeSimOffset(dlR, endPosR, startR);
                }

                tp[tap].phasePrevSub[sub] = phase;
                // -----------------------------------------------------------
                float window = 0.5f * (1.0f - std::cos(2.0f * pi * phase));
                float windowPos = windowSizeInSamples * phase;
                float delayL = baseTimeL + windowPos + tp[tap].simOffsetL[sub];
                float delayR = baseTimeR + windowPos + tp[tap].simOffsetR[sub];

                pitchShiftedL += dlL.readSample(delayL) * window * tp[tap].gain.getNextValue();
                pitchShiftedR += dlR.readSample(delayR) * window * tp[tap].gain.getNextValue();
            }

        //   feedbackL = pitchShiftedL * feedbackAmt;
        //   feedbackR = pitchShiftedR * feedbackAmt;

            pitchShiftedL *= duck;
            pitchShiftedR *= duck;
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

void PetalProcessor::advancePhase(int tap) noexcept
{
    float rate = ((1.0f - tp[tap].shiftAmount) * 1000.0f) / windowSizeInMilliseconds;
    float phaseAngle = rate / sampleRate;

    tp[tap].phase += phaseAngle;
    if (tp[tap].phase >= 1.0f) { tp[tap].phase -= 1.0f; }
    if (tp[tap].phase <= 0.0f) { tp[tap].phase += 1.0f; }
}

void PetalProcessor::setDelayTapTimes(float freeTimeLInMs, float freeTimeRInMs, int syncIndexL, int syncIndexR,
                                      float positionL, float skewL, float positionR, float skewR, float round,
                                      bool isSyncL, bool isSyncR, bool stereoLock)
{
    const int lastIndex = (int)syncTimeOptions.size() - 1;
    float syncTimeLInMs = 1000.0f / ((bpm / 60.0f) * syncTimeOptions[(size_t) juce::jlimit(0, lastIndex, syncIndexL)]);
    float syncTimeRInMs = 1000.0f / ((bpm / 60.0f) * syncTimeOptions[(size_t) juce::jlimit(0, lastIndex, syncIndexR)]);

    float timeLInMs = isSyncL ? syncTimeLInMs : freeTimeLInMs;
    float timeRInMs = stereoLock ? timeLInMs : (isSyncR ? syncTimeRInMs : freeTimeRInMs);

    float timeLInSamples = (timeLInMs / 1000.0f) * sampleRate;
    float timeRInSamples = (timeRInMs / 1000.0f) * sampleRate;

    float positionRInUse = stereoLock ? positionL : positionR;
    float skewRInUse = stereoLock ? skewL : skewR;

    float exponentL = std::pow(2.0f, skewL * 5.0f);
    float exponentR = std::pow(2.0f, skewRInUse * 5.0f);

    // Leave headroom in the delay line for the window size and correlation
    // lookahead that processBlock adds on top of tp[tap].time{L,R}.
    const float maxTapTime = (float)dlL.getBufferLength() - (float)sampleRate * 0.5f;

    for (int tap = 0; tap < 8; tap++)
    {
        float basePos = (1.0f / 8.0f) * (tap + 1.0f);
        float warpedL = warpTapPosition(basePos, positionL, exponentL, round);
        float warpedR = warpTapPosition(basePos, positionRInUse, exponentR, round);
        delayTimesL[tap].store(warpedL);
        delayTimesR[tap].store(warpedR);

        tp[tap].timeL.setTargetValue(juce::jlimit(0.0f, maxTapTime, warpedL * timeLInSamples * 8.0f));
        tp[tap].timeR.setTargetValue(juce::jlimit(0.0f, maxTapTime, warpedR * timeRInSamples * 8.0f));
    }
}

void PetalProcessor::setBPM(juce::AudioPlayHead *playhead)
{
    if (playhead == nullptr) { return; }
    if (playhead->getPosition()->getBpm().hasValue())
    {
        this->bpm = *playhead->getPosition()->getBpm();
    }
}

void PetalProcessor::setDelayTapAttributes(int tap, bool state, int shiftAmountInSemitones, float reverbAmount)
{
    float shiftAmount = std::exp(0.057762265f * shiftAmountInSemitones);
    tp[tap].gain.setTargetValue(state);
    tapStates[tap].store(state);
    
    tp[tap].shiftAmount = shiftAmount;
    tp[tap].reverbAmount = reverbAmount;
}

void PetalProcessor::setDelayAndPitchAttributes(float feedbackAmt, int feedbackLen, int windowSizeInMilliseconds, 
    float setDuckingAmount, float duckTimeInMs)
{
    this->windowSizeInMilliseconds = windowSizeInMilliseconds;
    this->windowSizeInSamples = (sampleRate / 1000.0f) * windowSizeInMilliseconds;

    // ducking (setDuckingAmount, duckTimeInMs arrive as 0-100 and are normalized here)
    this->duckAmt = setDuckingAmount / 100.0f;
    this->duckLen = duckTimeInMs / 100.0f;
    duckEnv.reset(sampleRate, duckLen);
}