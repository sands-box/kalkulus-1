export const Calculator = {
    // Properti untuk menyimpan referensi ke fungsi renderMath
    renderMath: null,

    // Terima objek 'config' untuk dependensi
    init(config) {
        this.renderMath = config.renderMath; // Simpan referensi
        this.cacheDOM(); 
        this.bindEvents(); 
        this.updateInputs();
    },

    cacheDOM() {
        this.input = document.getElementById('calc-function-input');
        this.inputLabel = document.getElementById('calc-function-label');
        this.operation = document.getElementById('calc-operation');
        this.calcBtn = document.getElementById('calculate-button');
        this.output = document.getElementById('result-text');
        this.integralInputs = document.getElementById('calc-integral-inputs');
        this.limitInputs = document.getElementById('calc-limit-inputs');
        this.partialInputs = document.getElementById('calc-partial-inputs');
        this.partialOrderInput = document.getElementById('calc-partial-order');
    },

    bindEvents() {
        this.calcBtn.addEventListener('click', () => this.calculate());
        this.operation.addEventListener('change', () => this.updateInputs());
    },

    updateInputs() {
        const op = this.operation.value;
        
        this.integralInputs.style.display = 'none';
        this.limitInputs.style.display = 'none';
        this.partialInputs.style.display = 'none';

        this.inputLabel.innerHTML = 'Masukkan Fungsi $f(x)$:';
        
        if (op === 'integral') {
            this.integralInputs.style.display = 'flex';
        } else if (op === 'limit') {
            this.limitInputs.style.display = 'flex';
        } else if (op === 'turunan-parsial') {
            this.partialInputs.style.display = 'flex';
            this.inputLabel.innerHTML = 'Masukkan Fungsi $f(x, y)$:';
        }

        // Panggil renderMath menggunakan referensi yang disimpan
        if (this.renderMath) {
            this.renderMath();
        }
    },

    calculate() {
        const expr = this.input.value;
        if (!expr) { 
            this.output.textContent = 'Fungsi tidak boleh kosong.'; 
            return; 
        }
        try {
            let result = '';
            switch (this.operation.value) {
                case 'turunan':
                    const Derivative1 = math.derivative(expr, 'x');
                    const Derivative2 = math.derivative(Derivative1, 'x');
                    const Derivative3 = math.derivative(Derivative2, 'x');
                    const Derivative4 = math.derivative(Derivative3, 'x');
                    const Derivative5 = math.derivative(Derivative4, 'x');
                    const Derivative6 = math.derivative(Derivative5, 'x');
                    const Derivative7 = math.derivative(Derivative6, 'x');
                    const Derivative8 = math.derivative(Derivative7, 'x');
                    result = `Turunan dari $f(x)=${expr}$ adalah: $$f'(x) = ${Derivative1.toString()}$$
                    Turunan ketiga adalah: $$f''(x) = ${Derivative2.toString()}$$
                    Turunan keempat adalah: $$f'''(x) = ${Derivative3.toString()}$$
                    Turunan kelima adalah: $$f''''(x) = ${Derivative4.toString()}$$
                    Turunan keenam adalah: $$f'''''(x) = ${Derivative5.toString()}$$
                    Turunan ketujuh adalah: $$f''''''(x) = ${Derivative6.toString()}$$
                    Turunan kedelapan adalah: $$f'''''''(x) = ${Derivative7.toString()}$$`;
                    break;
                
                case 'turunan-parsial':
                    const orderStr = this.partialOrderInput.value.trim();
                    if (!orderStr) {
                        this.output.innerHTML = `<span class="incorrect">Urutan turunan tidak boleh kosong.</span>`;
                        return;
                    }
                    
                    let partialExpr = math.parse(expr);
                    for (const variable of orderStr) {
                        if (variable !== 'x' && variable !== 'y') {
                            throw new Error(`Variabel tidak valid '${variable}'. Gunakan 'x' atau 'y'.`);
                        }
                        partialExpr = math.derivative(partialExpr, variable);
                    }
                    result = `Turunan parsial dari $f(x, y)=${expr}$ dengan urutan '${orderStr}' adalah: $$${partialExpr.toString()}$$`;
                    break;

                case 'integral':
                    const a = document.getElementById('calc-integral-a').value;
                    const b = document.getElementById('calc-integral-b').value;
                    const integralValue = this.numericIntegration(expr, math.evaluate(a), math.evaluate(b));
                    result = `$\\int_{${a}}^{${b}} ${expr} \\,dx \\approx ${integralValue.toFixed(6)}$`;
                    break;

                case 'limit':
                    const c = document.getElementById('calc-limit-c').value;
                    // Evaluasi limit sederhana dengan substitusi
                    const limitValue = math.evaluate(expr, {x: math.evaluate(c)});
                    result = `$\\lim_{x \\to ${c}} ${expr} = ${limitValue}`;
                    break;
            }
            this.output.innerHTML = result;
            
            // Panggil renderMath menggunakan referensi yang disimpan
            if (this.renderMath) {
                this.renderMath();
            }
        } catch (err) { 
            this.output.innerHTML = `<span class="incorrect">Error: ${err.message}</span>`; 
        }
    },

    // Metode integrasi numerik (Aturan Simpson)
    numericIntegration(fn, a, b, n = 1000) {
        const h = (b - a) / n;
        const compiledFn = math.parse(fn).compile();
        let sum = compiledFn.evaluate({x: a}) + compiledFn.evaluate({x: b});

        for (let i = 1; i < n; i += 2) {
            sum += 4 * compiledFn.evaluate({x: a + i * h});
        }
        for (let i = 2; i < n - 1; i += 2) {
            sum += 2 * compiledFn.evaluate({x: a + i * h});
        }
        return sum * h / 3;
    }
};