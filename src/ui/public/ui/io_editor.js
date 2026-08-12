import { LitElement, html, css } from 'lit';
import "./ui/pictSlider.js"
import "./ui/button.js"
import "./ui/utility.js"
import './preset_editor.js'
import { color } from './drawings.js';

import { drawFeedback, drawDial } from './drawings.js';

export class IOEditor extends LitElement {
    static styles = css`
        *, *::before, *::after {
            box-sizing: border-box;
        }

        :host {
            --label-col: 1fr;
            --control-col: 64px;
            --row-gap: 6px;
            --group-gap: 10px;
        }

        .panel {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            padding: 20px;
            gap: 14px;
        }

        label {
            margin: 0;
            font-size: 14px;
            font-family: Verdana;
            color: #696969;
        }

        .section-label {
            color: white;
            display: block;
            margin-bottom: 4px;
        }

        .row {
            display: grid;
            grid-template-columns: var(--label-col) var(--control-col);
            align-items: center;
            column-gap: var(--row-gap);
        }

        .row label {
            color: white;
        }

        /* grouped row: N params side by side (Cutoff/Q/Shape, Amount/Release).
           Each pair sizes to its own content (not an equal fr share of the
           full row) and the whole cluster is right-aligned, so pairs sit
           close together and the last slider still lands on the same right
           edge as the single-param rows above/below it. */
        .group-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            column-gap: var(--group-gap);
        }

        .group-row .row {
            flex: 0 0 auto;
            grid-template-columns: auto var(--control-col);
        }

        /* modifier: left-justify the cluster instead of right-justifying it
           (used by Modulation / Ducking, not Input Filtering) */
        .group-row.align-left {
            justify-content: flex-start;
        }

        petal-num-slider {
            justify-self: end;
        }
    `

    constructor() {
        super();
    }

    render() {
        return html`
        <div class="panel">

            <!-- preset editors -->
            <preset-editor></preset-editor>

            <div class="row">
                <label>Input Level</label>
                <petal-num-slider juceID="inputLevel" suffix=" dB" style="--numbox-align: right"></petal-num-slider>
            </div>

            <div>
                <label class="section-label">Input Filtering</label>
                <div class="group-row">
                    <div class="row">
                        <label style="color: grey">Cutoff</label>
                        <petal-num-slider juceID="filterCutoff" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                    <div class="row">
                        <label style="color: grey">Q</label>
                        <petal-num-slider juceID="filterQ" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                    <div class="row">
                        <label style="color: grey">Shape</label>
                        <petal-num-slider juceID="filterShape" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                </div>
            </div>

            <div>
                <label class="section-label">Modulation</label>
                <div class="group-row align-left">
                    <div class="row">
                        <label style="color: grey">Rate</label>
                        <petal-num-slider juceID="lfoRate" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                    <div class="row">
                        <label style="color: grey">Amount</label>
                        <petal-num-slider juceID="lfoAmount" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                </div>
            </div>

            <div class="row">
                <label>Window Size</label>
                <petal-num-slider juceID="windowSize" suffix=" Hz" mode="rate" style="--numbox-align: right"></petal-num-slider>
            </div>

            <div>
                <label class="section-label">Ducking</label>
                <div class="group-row align-left">
                    <div class="row">
                        <label style="color: grey">Amount</label>
                        <petal-num-slider juceID="delayDuckAmt" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                    <div class="row">
                        <label style="color: grey">Release</label>
                        <petal-num-slider juceID="delayDuckLen" suffix=" %" style="--numbox-align: right"></petal-num-slider>
                    </div>
                </div>
            </div>

            <div class="row">
                <label>Delay Level</label>
                <petal-num-slider juceID="delayLevel" suffix=" dB" style="--numbox-align: right"></petal-num-slider>
            </div>

            <div class="row">
                <label>Reverb Level</label>
                <petal-num-slider juceID="reverbLevel" suffix=" dB" style="--numbox-align: right"></petal-num-slider>
            </div>

            <div class="row">
                <label>Dry Level</label>
                <petal-num-slider juceID="dryLevel" suffix=" dB" style="--numbox-align: right"></petal-num-slider>
            </div>
        </div>
        `
    }
};

customElements.define('io-editor', IOEditor);