document.addEventListener('DOMContentLoaded', () => {
    const renderMath = () => window.MathJax?.typesetPromise();
    const Navigation = {
        init() {
            this.navLinks = document.querySelectorAll('.nav-link');
            this.pages = document.querySelectorAll('.page');
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavClick(e));
            });
            this.showPage('materi'); 
        },
        handleNavClick(event) {
            event.preventDefault();
            const pageId = event.target.getAttribute('href').substring(1);
            this.showPage(pageId);
        },
        showPage(pageId) {
            this.pages.forEach(p => p.classList.remove('active'));
            const activePage = document.getElementById(pageId);
            if (activePage) {
                activePage.classList.add('active');
            }

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${pageId}`) {
                    link.classList.add('active');
                }
            });
            
            if (pageId === 'simulasi') Simulator.initPlot();
            if (pageId === 'latihan') Quiz.render();

            renderMath();
        }
    };

    // --- MODUL SIMULATOR VISUAL---
    const Simulator = {
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.updateContextualInputs();
        },
        cacheDOM() {
            this.fInput = document.getElementById('sim-function-input');
            this.gInput = document.getElementById('sim-function-g-input');
            this.fxyInput = document.getElementById('sim-function-fxy-input');
            this.typeSelect = document.getElementById('visualization-type');
            this.integralInputs = document.getElementById('integral-inputs');
            this.visualizeBtn = document.getElementById('visualize-button');
            this.resetBtn = document.getElementById('reset-view-button');
            this.plotTarget = document.getElementById('plot-target');
            this.plotTarget3D = document.getElementById('plot-target-3d');
            this.infoTarget = document.getElementById('visualization-info');
            this.turunan3DTarget = document.getElementById('turunan-3d');
            this.fxControl = document.getElementById('fx-control');
            this.gxControl = document.getElementById('gx-control');
            this.fxyControl = document.getElementById('fxy-control');
        },
        bindEvents() {
            this.visualizeBtn.addEventListener('click', () => this.run());
            this.resetBtn.addEventListener('click', () => this.initPlot());
            this.typeSelect.addEventListener('change', () => this.updateContextualInputs());
        },
        updateContextualInputs() {
            const type = this.typeSelect.value;
            const is3D = type === 'grafik-3d';
            
            this.integralInputs.style.display = (type === 'integral' || type === 'luas-kurva') ? 'flex' : 'none';
            this.fxControl.style.display = is3D ? 'none' : 'flex';
            this.gxControl.style.display = is3D ? 'none' : 'flex';
            this.fxyControl.style.display = is3D ? 'flex' : 'none';
            this.plotTarget.style.display = is3D ? 'none' : 'block';
            this.plotTarget3D.style.display = is3D ? 'block' : 'none';
            this.infoTarget.style.display = is3D ? 'none' : 'block';
            this.turunan3DTarget.style.display = is3D ? 'block' : 'none';

            if (is3D) this.turunan3DTarget.innerText = '';
        },
        initPlot() {
            Plotly.purge(this.plotTarget);
            Plotly.purge(this.plotTarget3D);
            this.infoTarget.innerHTML = "Masukkan fungsi dan klik 'Visualisasikan'.";
            this.turunan3DTarget.innerText = "";
            this.updateContextualInputs();
        },
        generateFunctionData(fnString, range = [-5, 5], step = 0.1) {
            const expr = math.parse(fnString).compile();
            const x = math.range(range[0], range[1], step).toArray();
            const y = x.map(val => expr.evaluate({x: val}));
            return { x, y };
        },

        run() {
            const fnString = this.fInput.value;
            const gnString = this.gInput.value;
            const type = this.typeSelect.value;

            if (type === 'grafik-3d') {
                this.visualize3DSurface();
                return;
            }

            if (!fnString) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi f(x) tidak boleh kosong.</span>`;
                return;
            }

            try {
                switch (type) {
                    case 'grafik':
                        this.visualizeStandard(fnString, gnString);
                        break;
                    case 'kritis':
                        this.visualizeCriticalPoints(fnString);
                        break;
                    case 'integral':
                        this.visualizeIntegral(fnString);
                        break;
                    case 'luas-kurva':
                        this.visualizeAreaBetweenCurves(fnString, gnString);
                        break;
                }
                renderMath();
            } catch (err) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi atau parameter tidak valid. ${err.message}</span>`;
            }
        },

        visualizeStandard(fn, gn) {
            const data = [];
            const fData = this.generateFunctionData(fn);
            data.push({ ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} });

            if (gn) {
                const gData = this.generateFunctionData(gn);
                data.push({ ...gData, type: 'scatter', mode: 'lines', name: `g(x)=${gn}`, line: {color: '#E04D5F'} });
            }
            
            const layout = { title: 'Grafik Fungsi', showlegend: true };
            Plotly.newPlot(this.plotTarget, data, layout);
            this.infoTarget.innerHTML = 'Grafik standar untuk fungsi yang diberikan.';
        },

        visualizeCriticalPoints(fn) {
            const data = [];
            const fData = this.generateFunctionData(fn);
            data.push({ ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} });
            const critPoints = [{x: 1, type: 'Min'}, {x: -1, type: 'Max'}]; 
            const critX = critPoints.map(p => p.x);
            const critY = critX.map(x => math.evaluate(fn, {x}));
            
            data.push({
                x: critX, y: critY,
                mode: 'markers', type: 'scatter', name: 'Titik Kritis',
                marker: { color: '#E04D5F', size: 10 }
            });

            const layout = { 
                title: 'Analisis Titik Kritis',
                annotations: critPoints.map(p => ({
                    x: p.x, y: math.evaluate(fn, {x: p.x}),
                    text: `${p.type} di x=${p.x}`, ax: 0, ay: -30
                }))
            };
            Plotly.newPlot(this.plotTarget, data, layout);
            const derivative = math.derivative(fn, 'x').toString();
            this.infoTarget.innerHTML = `Turunan $f'(x) = ${derivative}$. Titik kritis ditemukan (contoh).`;
        },

        visualizeIntegral(fn) {
            const a = parseFloat(document.getElementById('integral-a').value);
            const b = parseFloat(document.getElementById('integral-b').value);
            const fData = this.generateFunctionData(fn);

            const integralRange = this.generateFunctionData(fn, [a,b], 0.05);
            
            const data = [
                { ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} },
                { ...integralRange, type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Area Integral', fillcolor: 'rgba(0,169,224,0.3)', line: {color: 'transparent'} }
            ];
            
            const layout = { title: `Integral Tentu dari ${a} ke ${b}` };
            Plotly.newPlot(this.plotTarget, data, layout);
            this.infoTarget.innerHTML = `Area diarsir merepresentasikan $\\int_{${a}}^{${b}} ${fn} \\,dx$`;
        },

        visualizeAreaBetweenCurves(fn, gn) {
            if (!gn) {
                this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi g(x) dibutuhkan.</span>`;
                return;
            }
            const a = parseFloat(document.getElementById('integral-a').value);
            const b = parseFloat(document.getElementById('integral-b').value);
            
            // Generate data pada interval integral untuk pengarsiran
            const fAreaData = this.generateFunctionData(fn, [a,b], 0.05);
            const gAreaData = this.generateFunctionData(gn, [a,b], 0.05);

            const data = [
                // Plot garis f(x) dan g(x) secara penuh
                { ...this.generateFunctionData(fn), type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} },
                { ...this.generateFunctionData(gn), type: 'scatter', mode: 'lines', name: `g(x)=${gn}`, line: {color: '#E04D5F'} },
                // Plot area di antara kurva
                { x: fAreaData.x, y: fAreaData.y, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(128,128,128,0.3)', line: {color: 'transparent'}, name: 'Area Antara Kurva', showlegend: false },
                { x: gAreaData.x, y: gAreaData.y, type: 'scatter', mode: 'lines', line: {color: 'transparent'}, showlegend: false }
            ];

            const layout = { title: `Luas Antara f(x) dan g(x) dari ${a} ke ${b}` };
            Plotly.newPlot(this.plotTarget, data, layout);
            this.infoTarget.innerHTML = `Area diarsir adalah $\\int_{${a}}^{${b}} |${fn} - (${gn})| \\,dx$`;
        },
        
        visualize3DSurface() {
            // Fungsi ini tetap sama seperti sebelumnya
            const inputFungsi = this.fxyInput.value;
            if (!inputFungsi) {
                 this.turunan3DTarget.innerText = "Error: Fungsi f(x,y) tidak boleh kosong.";
                 return;
            }
            try {
                const expr = math.parse(inputFungsi);
                const f = expr.compile();
                const dfdx = math.derivative(expr, "x");
                const dfdy = math.derivative(expr, "y");
                this.turunan3DTarget.innerText = `f(x,y) = ${expr.toString()}\n∂f/∂x = ${dfdx.toString()}\n∂f/∂y = ${dfdy.toString()}`;

                let xvals = math.range(-5, 5, 0.3).toArray();
                let yvals = math.range(-5, 5, 0.3).toArray();
                let zvals = yvals.map(y => xvals.map(x => f.evaluate({x, y})));
                let data = [{ x: xvals, y: yvals, z: zvals, type: "surface" }];
                let layout = {
                    title: `Grafik Permukaan f(x,y) = ${expr.toString()}`,
                    scene: { xaxis: {title: "x"}, yaxis: {title: "y"}, zaxis: {title: "f(x,y)"}},
                    margin: { l: 0, r: 0, b: 0, t: 40 }
                };
                Plotly.newPlot(this.plotTarget3D, data, layout);
            } catch (err) {
                this.turunan3DTarget.innerText = "Error: Fungsi tidak valid\n" + err;
            }
        }
    };

    // --- MODUL KALKULATOR (TIDAK ADA PERUBAHAN) ---
    const Calculator = {
        init() {
            this.cacheDOM(); this.bindEvents(); this.updateInputs();
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
            if (!expr) { this.output.textContent = 'Fungsi tidak boleh kosong.'; return; }
            try {
                let result = '';
                switch (this.operation.value) {
                    case 'turunan':
                        result = `Turunan dari $f(x)=${expr}$ adalah: $$f'(x) = ${math.derivative(expr, 'x').toString()}$$`;
                        break;
                    case 'integral':
                        const a = math.evaluate(document.getElementById('calc-integral-a').value);
                        const b = math.evaluate(document.getElementById('calc-integral-b').value);
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
            } catch (err) { this.output.innerHTML = `<span class="incorrect">Error: Ekspresi atau parameter tidak valid.</span>`; }
        },
        numericIntegration(fn, a, b, n = 1000) {
            const h = (b - a) / n;
            let sum = math.evaluate(fn, {x: a}) + math.evaluate(fn, {x: b});
            for (let i = 1; i < n; i += 2) sum += 4 * math.evaluate(fn, {x: a + i * h});
            for (let i = 2; i < n - 1; i += 2) sum += 2 * math.evaluate(fn, {x: a + i * h});
            return sum * h / 3;
        }
    };
    
    // --- MODUL KUIS (TIDAK ADA PERUBAHAN) ---
    const Quiz = {
        rendered: false,
        init() { this.cacheDOM(); this.bindEvents(); },
        cacheDOM() {
            this.container = document.getElementById('quiz-container');
            this.submitBtn = document.getElementById('submit-quiz-button');
            this.result = document.getElementById('quiz-result');
        },
        bindEvents() { this.submitBtn.addEventListener('click', () => this.checkAnswers()); },
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
                item.options.forEach(opt => { html += `<label><input type="radio" name="q${index}" value="${opt}"> ${opt}</label>`; });
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
                if (selected && selected.value === item.answer) score++;
            });
            this.result.innerHTML = `Skor Anda: <span class="${score === this.quizData.length ? 'correct' : 'incorrect'}">${score} dari ${this.quizData.length}</span>`;
        }
    };
    Navigation.init();
    Simulator.init();
    Calculator.init();
    Quiz.init();
});