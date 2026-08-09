cmake_minimum_required(VERSION 3.22 FATAL_ERROR)

project(Petal VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch JUCE from GitHub
include(FetchContent)
FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG 8.0.12
    GIT_PROGRESS TRUE
)
FetchContent_MakeAvailable(JUCE)

# Plugin configuration
juce_add_plugin(Petal
    COMPANY_NAME "rainbowcircuit"
    PRODUCT_NAME "Petal"
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    PLUGIN_MANUFACTURER_CODE Ypco
    PLUGIN_CODE Petl
    FORMATS VST3 AU Standalone
    NEEDS_WEBVIEW2 TRUE
)

juce_generate_juce_header(Petal) 

# Source files
target_sources(Petal
    PRIVATE
        src/PluginProcessor.cpp
        src/PluginProcessor.h
        src/PluginEditor.cpp
        src/PluginEditor.h
        src/params/Parameters.cpp
        src/params/Parameters.h
        src/params/PresetLoader.cpp
        src/params/PresetLoader.h
        src/plugin/PetalProcessor.cpp
        src/plugin/PetalProcessor.h
        src/dsp/reverb/Reverb.cpp
        src/dsp/reverb/Reverb.h
        src/dsp/Utility.h

)

# Preprocessor definitions
target_compile_definitions(Petal
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1
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

