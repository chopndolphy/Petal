import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './delay_editor.js'
import './reverb_editor.js'
import './tap_editor.js'
import './io_editor.js'
import './selection_tab.js'

class App extends LitElement {
    static properties = {
        isDisplayingDelay: { type: Boolean },
        isDisplayingIO: { type: Boolean }
    }

    static styles = css`


        #divvy {
            width: 850px;
            height: 450px;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            transform: scale(0.8)
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
        console.log("loaded")
    }

    render(){
        return html`
        <main id="divvy">
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

        `
    }
}

customElements.define('main-app', App)