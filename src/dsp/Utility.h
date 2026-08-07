#pragma once
#include "Delayline.h"

class Correlation {
public: 
    void prepare(double sampleRate){
        this->sampleRate = sampleRate;
    }

    void updateCorrelationSizes()
    {
        maxLagSamples = (int)(8.0f * sampleRate / 1000.0f); // 8 is the correlation lag in ms
        int frameSamples = (int)(4.0 * sampleRate / 1000.0f); // 4 is the correlation frame
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

    double sampleRate = 48000.0;
    static constexpr int kMaxCorrTaps = 256;
    int corrStride = 2, maxLagSamples = 0, corrTaps = 0;
};