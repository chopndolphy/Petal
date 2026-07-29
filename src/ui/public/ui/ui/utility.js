export class Smoothening {
    #previous = 0;
    constructor(factor, initial = 0) {
        this.factor = factor;
        this.#previous = initial;
        this.target = initial;
    }

    set(value) { this.target = value; }

    get() {
        this.#previous += (this.target - this.#previous) * this.factor;
        return this.#previous;
    }
}
