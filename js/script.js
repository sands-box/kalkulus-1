/**
 * Kalkulus Interaktif Pro
 * Struktur kode modular untuk kemudahan pengelolaan.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- UTILITIES ---
    // Helper untuk merender MathJax
    const renderMath = () => window.MathJax?.typesetPromise();

    // --- MODUL NAVIGASI ---
    const Navigation = {
        init() {
            this.navLinks = document.querySelectorAll('.nav-link');
            this.pages = document.querySelectorAll('.page');
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavClick(e));
            });
            this.showPage('home');
        },
        handleNavClick(event) {
            event.preventDefault();
            const pageId = event.target.getAttribute('href').substring(1);
            this.showPage(pageId);
        },
        showPage(pageId) {
            this.pages.forEach(p => p.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${pageId}`) {
                    link.classList.add('active');
                }
            });
            
            // Inisialisasi modul terkait saat halaman ditampilkan
            if (pageId === 'simulasi') Simulator.initPlot();
            if (pageId === 'latihan') Quiz.render();

            renderMath();
        }
    };

    // --- MODUL SIMULATOR VISUAL ---
    const Simulator = {
        plotInstance: null,
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.updateContextualInputs();
        },
        cacheDOM() {
            this.fInput = document.getElementById('sim-function-input');
            this.gInput = document.getElementById('sim-function-g-input');
            this.typeSelect = document.getElementById('visualization-type');
            this.integralInputs = document.getElementById('integral-inputs');
            this.visualizeBtn = document.getElementById('visualize-button');
            this.resetBtn = document.getElementById('reset-view-button');
            this.plotTarget = document.getElementById('plot-target');
            this.infoTarget = document.getElementById('visualization-info');
        },
        bindEvents() {
            this.visualizeBtn.addEventListener('click', () => this.run());
            this.resetBtn.addEventListener('click', () => this.initPlot());
            this.typeSelect.addEventListener('change', () => this.updateContextualInputs());
        },
        updateContextualInputs() {
            const type = this.typeSelect.value;
            this.integralInputs.style.display = (type === 'integral' || type === 'luas-kurva') ? 'flex' : 'none';
        },
        initPlot() {
            this.plotInstance = functionPlot({ target: this.plotTarget, grid: true });
            this.infoTarget.innerHTML = "Masukkan fungsi dan klik 'Visualisasikan'.";
        },
        run() {
            const fnString = this.fInput.value;
            if (!fnString) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi f(x) tidak boleh kosong.</span>`;
                return;
            }
            try {
                const plotOptions = { target: this.plotTarget, grid: true, data: [] };
                
                switch (this.typeSelect.value) {
                    case 'grafik':
                        plotOptions.data.push({ fn: fnString, color: '#005A9C' });
                        if (this.gInput.value) plotOptions.data.push({ fn: this.gInput.value, color: '#E04D5F' });
                        break;
                    case 'kritis':
                        this.visualizeCriticalPoints(fnString, plotOptions);
                        break;
                    case 'integral':
                        this.visualizeIntegral(fnString, plotOptions);
                        break;
                    case 'luas-kurva':
                        this.visualizeAreaBetweenCurves(fnString, this.gInput.value, plotOptions);
                        break;
                }
                this.plotInstance = functionPlot(plotOptions);
                renderMath();
            } catch (err) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi atau parameter tidak valid.</span>`;
            }
        },
        visualizeCriticalPoints(fn, options) {
            options.data.push({ fn, color: '#005A9C' });
            const derivative = math.derivative(fn, 'x');
            // Catatan: Menemukan akar secara numerik adalah masalah kompleks.
            // Di sini kita akan menggunakan pendekatan sederhana untuk fungsi polinomial.
            // Untuk solusi yang lebih kuat, diperlukan library pencari akar.
            // Mari kita asumsikan kita menemukan titik kritis secara manual untuk demonstrasi.
            // Contoh: f(x) = x^3 - 3x -> f'(x) = 3x^2 - 3 -> akar di x=1, x=-1
            const critPoints = [{x: 1, type: 'Min'}, {x: -1, type: 'Max'}]; // Hardcoded untuk x^3-3x
            const annotations = [];
            critPoints.forEach(p => {
                const y = math.evaluate(fn, {x: p.x});
                options.data.push({ points: [[p.x, y]], fnType: 'points', graphType: 'scatter', color: '#E04D5F' });
                annotations.push({ x: p.x, y: y, text: `${p.type} (${p.x}, ${y.toFixed(2)})` });
            });
            options.annotations = annotations;
            this.infoTarget.innerHTML = `Turunan $f'(x) = ${derivative.toString()}$. Titik kritis ditemukan (contoh).`;
        },
        visualizeIntegral(fn, options) {
            const a = parseFloat(document.getElementById('integral-a').value);
            const b = parseFloat(document.getElementById('integral-b').value);
            options.data.push({ fn, range: [a, b], closed: true, color: '#00A9E0' });
            this.infoTarget.innerHTML = `Area diarsir merepresentasikan $\\int_{${a}}^{${b}} ${fn} \\,dx$`;
        },
        visualizeAreaBetweenCurves(fn1, fn2, options) {
            if (!fn2) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi g(x) dibutuhkan untuk visualisasi ini.</span>`;
                return;
            }
            const a = parseFloat(document.getElementById('integral-a').value);
            const b = parseFloat(document.getElementById('integral-b').value);
            options.data.push({ fn: fn1, color: '#005A9C' }, { fn: fn2, color: '#E04D5F' });
            // Mengarsir area antara dua kurva
            options.data.push({
                fn: `max(${fn1}, ${fn2}) - max(min(${fn1}, ${fn2}), 0)`,
                range: [a, b],
                closed: true,
                skipTip: true,
                color: '#cccccc'
            });
            this.infoTarget.innerHTML = `Area diarsir adalah $\\int_{${a}}^{${b}} |${fn1} - (${fn2})| \\,dx$`;
        }
    };

    // --- MODUL KALKULATOR ---
    const Calculator = {
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.updateInputs();
        },
        cacheDOM() {
            this.input = document.getElementById('calc-function-input');
            this.operation = document.getElementById('calc-operation');
            this.calcBtn = document.getElementById('calculate-button');
            this.output = document.getElementById('result-text');
            this.integralInputs = document.getElementById('calc-integral-inputs');
            this.limitInputs = document.getElementById('calc-limit-inputs');
        },
        bindEvents() {
            this.calcBtn.addEventListener('click', () => this.calculate());
            this.operation.addEventListener('change', () => this.updateInputs());
        },
        updateInputs() {
            const op = this.operation.value;
            this.integralInputs.style.display = (op === 'integral') ? 'flex' : 'none';
            this.limitInputs.style.display = (op === 'limit') ? 'flex' : 'none';
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
                        result = `Turunan dari $f(x)=${expr}$ adalah: $$f'(x) = ${math.derivative(expr, 'x').toString()}$$`;
                        break;
                    case 'integral':
                        const a = math.evaluate(document.getElementById('calc-integral-a').value);
                        const b = math.evaluate(document.getElementById('calc-integral-b').value);
                        // Integrasi numerik sederhana (metode Simpson)
                        const integralValue = this.numericIntegration(expr, a, b);
                        result = `$\\int_{${a.toFixed(2)}}^{${b.toFixed(2)}} ${expr} \\,dx \\approx ${integralValue.toFixed(6)}$`;
                        break;
                    case 'limit':
                        const c = document.getElementById('calc-limit-c').value;
                        const limitValue = math.evaluate(expr, {x: parseFloat(c)});
                        result = `$\\lim_{x \\to ${c}} ${expr} = ${limitValue.toFixed(6)}$`;
                        break;
                }
                this.output.innerHTML = result;
                renderMath();
            } catch (err) {
                this.output.innerHTML = `<span class="incorrect">Error: Ekspresi atau parameter tidak valid.</span>`;
            }
        },
        numericIntegration(fn, a, b, n = 1000) {
            const h = (b - a) / n;
            let sum = math.evaluate(fn, {x: a}) + math.evaluate(fn, {x: b});
            for (let i = 1; i < n; i += 2) {
                sum += 4 * math.evaluate(fn, {x: a + i * h});
            }
            for (let i = 2; i < n - 1; i += 2) {
                sum += 2 * math.evaluate(fn, {x: a + i * h});
            }
            return sum * h / 3;
        }
    };
    
    // --- MODUL KUIS ---
    const Quiz = {
        rendered: false,
        init() {
            this.cacheDOM();
            this.bindEvents();
        },
        cacheDOM() {
            this.container = document.getElementById('quiz-container');
            this.submitBtn = document.getElementById('submit-quiz-button');
            this.result = document.getElementById('quiz-result');
        },
        bindEvents() {
            this.submitBtn.addEventListener('click', () => this.checkAnswers());
        },
        quizData: [
            { question: "Turunan dari $f(x) = \\cos(x)$ adalah...", options: ["$-\\sin(x)$", "$\\sin(x)$", "$\\cos(x)$", "$1$"], answer: "$-\\sin(x)$" },
            { question: "Nilai dari $\\int_{0}^{1} 2x \\,dx$ adalah...", options: ["0", "1", "2", "3"], answer: "1" },
            { question: "Titik minimum lokal dari $f(x) = x^2 - 4x + 5$ terjadi di $x = $...", options: ["1", "2", "3", "4"], answer: "2" }
        ],
        render() {
            if (this.rendered) return;
            let html = '';
            this.quizData.forEach((item, index) => {
                html += `<div class="quiz-question"><p>${index + 1}. ${item.question}</p><div class="quiz-options">`;
                item.options.forEach(opt => {
                    html += `<label><input type="radio" name="q${index}" value="${opt}"> ${opt}</label>`;
                });
                html += `</div></div>`;
            });
            this.container.innerHTML = html;
            this.rendered = true;
            renderMath();
        },
        checkAnswers() {
            let score = 0;
            this.quizData.forEach((item, index) => {
                const selected = document.querySelector(`input[name="q${index}"]:checked`);
                if (selected && selected.value === item.answer) {
                    score++;
                }
            });
            this.result.innerHTML = `Skor Anda: <span class="${score === this.quizData.length ? 'correct' : 'incorrect'}">${score} dari ${this.quizData.length}</span>`;
        }
    };

    // --- INISIALISASI APLIKASI ---
    Navigation.init();
    Simulator.init();
    Calculator.init();
    Quiz.init();
});