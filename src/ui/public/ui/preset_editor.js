import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import "./ui/button.js"


export class PresetEditor extends LitElement {
    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }

        label {
            margin: 0;
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
        }
        `

    constructor(){
        super();
    }

    firstUpdated() {
        this.menu = this.renderRoot.querySelector('select')
        if (this.menu) {
            this.menu.addEventListener("change", (e) => this.onSelection(e))

            const populateMenu = () => { };

        }


    }

    onSelection(e) {
        console.log("weeeee", e.target.value)
    }



    render()
    {
        return html`
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: left; padding: 0px">
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: left">
                <label>Input</label>
                <select name="pets" id="menu-container">
                    <option value="">--Please choose an option--</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="parrot">Parrot</option>
                    <option value="spider">Spider</option>
                    <option value="goldfish">Goldfish</option>
                </select>
            </div>
        </div>
        `
    }
};

customElements.define('preset-editor', PresetEditor);

