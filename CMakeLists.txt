cmake_minimum_required(VERSION 3.15)

project(Petal VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch JUCE from GitHub
include(FetchContent)
FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG 7.0.12
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(JUCE)

# Plugin configuration
juce_add_plugin(Petal
    COMPANY_NAME "Rainbow Circuit"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    PLUGIN_MANUFACTURER_CODE Ypco
    PLUGIN_CODE Petl
    FORMATS VST3 AU Standalone
    PRODUCT_NAME "Petal"
)

juce_generate_juce_header(Petal) 

# Source files
target_sources(Petal
    PRIVATE
        src/PluginProcessor.cpp
        src/PluginProcessor.h
        src/PluginEditor.cpp
        src/PluginEditor.h
)

# Preprocessor definitions
target_compile_definitions(Petal
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
)

# Link JUCE modules
target_link_libraries(Petal
    PRIVATE
        juce::juce_audio_utils
        juce::juce_dsp
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

juce_enable_copy_plugin_step(Petal)