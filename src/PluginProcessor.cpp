#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
PetalAudioProcessor::PetalAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     #if ! JucePlugin_IsMidiEffect
                      #if ! JucePlugin_IsSynth
                       .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                      #endif
                       .withOutput ("Output", juce::AudioChannelSet::stereo(), true)
                     #endif
                       )
#endif
{
    params = std::make_unique<Parameters>(*this);
}


PetalAudioProcessor::~PetalAudioProcessor()
{
}

//==============================================================================
const juce::String PetalAudioProcessor::getName() const
{
    return JucePlugin_Name;
}

bool PetalAudioProcessor::acceptsMidi() const
{
   #if JucePlugin_WantsMidiInput
    return true;
   #else
    return false;
   #endif
}

bool PetalAudioProcessor::producesMidi() const
{
   #if JucePlugin_ProducesMidiOutput
    return true;
   #else
    return false;
   #endif
}

bool PetalAudioProcessor::isMidiEffect() const
{
   #if JucePlugin_IsMidiEffect
    return true;
   #else
    return false;
   #endif
}

double PetalAudioProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int PetalAudioProcessor::getNumPrograms()
{
    return 1;   
}

int PetalAudioProcessor::getCurrentProgram()
{
    return 0;
}

void PetalAudioProcessor::setCurrentProgram (int index)
{
}

const juce::String PetalAudioProcessor::getProgramName (int index)
{
    return {};
}

void PetalAudioProcessor::changeProgramName (int index, const juce::String& newName)
{
}

//==============================================================================
void PetalAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    petal.prepareToPlay(sampleRate, samplesPerBlock);
}

void PetalAudioProcessor::releaseResources()
{
}

#ifndef JucePlugin_PreferredChannelConfigurations
bool PetalAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
  #if JucePlugin_IsMidiEffect
    juce::ignoreUnused (layouts);
    return true;
  #else
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

   #if ! JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
   #endif

    return true;
  #endif
}
#endif

void PetalAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i){
        buffer.clear(i, 0, buffer.getNumSamples());
    }

    petal.setDelayTapTimes(params->freeTimeL->get(),
                           params->freeTimeR->get(),
                           params->syncTimeL->get(),
                           params->syncTimeR->get(),
                           // delay time modification
                           params->positionL->get(),
                           params->skewL->get(),
                           params->positionR->get(),
                           params->skewR->get(),
                           params->round->get(),
                           // sync
                           params->isSyncL->get(),
                           params->isSyncR->get(),
                           params->stereoLock->get());

    petal.setDelayAndPitchAttributes(0, 0, params->windowSize->get(),
                                params->delayDuckAmt->get(),
                                params->delayDuckLen->get());

    petal.rvb.setReverbAttributes(params->reverbLevel->get(),
                                params->reverbDecayTime->get(),
                                params->reverbLPF->get(),
                                params->reverbHPF->get(),
                                params->reverbSize->get(),
                                params->reverbDuckAmt->get(),
                                params->reverbDuckLen->get());

    for(int tap = 0; tap < 8; tap++){
        petal.setDelayTapAttributes(tap,
                                    params->tapState[tap]->get(),
                                    params->tapShiftAmt[tap]->get(),
                                    params->tapReverbAmt[tap]->get());
    }
    petal.processBlock(buffer);
}

//==============================================================================
bool PetalAudioProcessor::hasEditor() const
{
    return true; 
}

juce::AudioProcessorEditor* PetalAudioProcessor::createEditor()
{
    return new PetalAudioProcessorEditor (*this);
}

//==============================================================================
void PetalAudioProcessor::getStateInformation (juce::MemoryBlock& destData)
{
}

void PetalAudioProcessor::setStateInformation (const void* data, int sizeInBytes)
{

}

//==============================================================================
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new PetalAudioProcessor();
}
