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
    return 1;   // NB: some hosts don't cope very well if you tell them there are 0 programs,
                // so this should be at least 1, even if you're not really implementing programs.
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
    ps.prepareToPlay(sampleRate, samplesPerBlock);
    rv.prepareToPlay(sampleRate, samplesPerBlock);
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
    
    ps.setAttributes(params->shiftAmount->get(),
                     params->windowSize->get(),
                     0.0f);


    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());

    //    ps.setAttributes(2.0, 5.0f, 0.0f);
        ps.processBlock(buffer);
    //    rv.processSample(buffer);  
    
    
}

//==============================================================================
bool PetalAudioProcessor::hasEditor() const
{
    return true; // (change this to false if you choose to not supply an editor)
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
// This creates new instances of the plugin..
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new PetalAudioProcessor();
}
