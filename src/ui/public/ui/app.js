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
            background-color: #222222;
            border-radius: 10px;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
        }

        #fx-stack {
            width: 450px;
            height: 450px;
        }
    `

    constructor(){
        super()
        this.isDisplayingDelay = false;
        this.isDisplayingIO = true;
        console.log("loaded")
    }

    render(){
        return html`
        <main id="divvy">
            <div style="display: flex; flex-direction: row; align-items: center; gap: 0px; margin: 0px">
                <div style="position: relative">
                    <reverb-editor id="reverb" style="display: ${this.isDisplayingDelay ? 'none' : 'block'}; height: 450px"></reverb-editor>
                    <delay-editor id="delay" style="display: ${this.isDisplayingDelay ? 'block' : 'none'}; height: 450px"></delay-editor>
                </div>
                <io-editor style="display: ${this.isDisplayingIO ? 'none' : 'block'}"></io-editor>
                <tap-editor id="tap" style="display: ${this.isDisplayingIO ? 'block' : 'none'}; height: 450px" .isPitch=${this.isDisplayingDelay} ></tap-editor>
                <selection-tab
                    .isDisplayingDelay=${this.isDisplayingDelay}
                    .isDisplayingIO=${this.isDisplayingIO}
                    @display-delay-change=${e => this.isDisplayingDelay = e.detail}
                    @display-io-change=${e => this.isDisplayingIO = e.detail}
                ></selection-tab>
            </div>
        </main>

        `
    }
}

customElements.define('main-app', App)