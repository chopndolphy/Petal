import { LitElement, html, css } from 'lit';
import './delay_editor.js'
import './reverb_editor.js'
import './tap_editor.js'
import './io_editor.js'
import './selection_tab.js'

class App extends LitElement {
    static properties = {
        isDisplayingDelay: { type: Boolean },
        isDisplayingIO: { type: Boolean },
        scale: { type: Number }
    }

    static styles = css`
        #wrapper {
            margin: 10px 0 0 10px; /* your fixed top-left margin, untouched by scale */
            width: fit-content;
            height: fit-content;
        }

        #divvy {
            width: 850px;
            height: 450px;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            transform-origin: top left;
            transform: scale(${ 0.875 }); 

            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10 and IE 11 */
            user-select: none; /* Standard syntax */

        }

        #effects {
            background-color: #222222;
            border-radius: 10px;
        }

        #controls {
            background-color: #222222;
            border-radius: 10px;
        }
    `
    constructor(){
        super()
        this.isDisplayingDelay = true;
        this.isDisplayingIO = true;
        this.scale = 0.875;
        console.log("loaded")
    }

    connectedCallback() {
        super.connectedCallback();
        if (window.__JUCE__) {
            window.__JUCE__.backend.addEventListener("windowWidth", (values) => {
                this.scale = JSON.parse(values) / 950;
            });
        }
    }

    render(){
        return html`
        <div id="wrapper">
        <main id="divvy" style="transform-origin: top left; transform: scale(${ this.scale })">
            <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; margin: 0px">
                <!-- delay and reverb -->
                <div id="effects" style="position: relative">
                    <reverb-editor id="reverb" 
                        style="display: ${this.isDisplayingDelay ? 'none' : 'block'}; width: 450px; height: 450px">
                    </reverb-editor>

                    <delay-editor id="delay" 
                        style="display: ${this.isDisplayingDelay ? 'block' : 'none'}; width: 450px; height: 450px">
                    </delay-editor>
                </div>
                
                <!-- controls -->
                <div id="controls" style="position: relative; display: flex; flex-direction: row; width: 450px; height: 450px">
                    <tap-editor id="tap" 
                        style="display: ${this.isDisplayingIO ? 'block' : 'none'}; width: 375px" 
                        .isPitch=${this.isDisplayingDelay} >
                    </tap-editor>

                    <io-editor style="display: ${this.isDisplayingIO ? 'none' : 'block'}; width: 375px"></io-editor>

                    <selection-tab
                        .isDisplayingDelay=${this.isDisplayingDelay}
                        .isDisplayingIO=${this.isDisplayingIO}
                        @display-delay-change=${e => this.isDisplayingDelay = e.detail}
                        @display-io-change=${e => this.isDisplayingIO = e.detail}
                        style="width: 75px; height: 450px">
                    </selection-tab>
                </div>
            </div>
        </main>
        </div>
        `
    }
}

customElements.define('main-app', App)