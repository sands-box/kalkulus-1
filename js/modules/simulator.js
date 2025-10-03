export const Simulator = {
    renderMath: null,

    init(config) {
        this.renderMath = config.renderMath;
        this.cacheDOM();
        this.bindEvents();
        this.initPlot();
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
        // PERBAIKAN: Tampilkan g(x) untuk grafik standar dan luas kurva
        this.gxControl.style.display = (type === 'grafik' || type === 'luas-kurva') ? 'flex' : 'none';
        this.fxyControl.style.display = is3D ? 'flex' : 'none';
        this.plotTarget.style.display = is3D ? 'none' : 'block';
        this.plotTarget3D.style.display = is3D ? 'block' : 'none';
        this.infoTarget.style.display = is3D ? 'none' : 'block';
        this.turunan3DTarget.style.display = is3D ? 'block' : 'none';

        if (is3D) {
            this.turunan3DTarget.innerText = '';
        }
    },

    initPlot() {
        this.infoTarget.innerHTML = "Masukkan fungsi dan klik 'Visualisasikan'.";
        this.turunan3DTarget.innerText = "";
        this.updateContextualInputs();
        this.run();
    },

    generateFunctionData(fnString, range = [-10, 10], step = 0.1) {
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
                case 'grafik': this.visualizeStandard(fnString, gnString); break;
                case 'kritis': this.visualizeCriticalPoints(fnString); break;
                case 'integral': this.visualizeIntegral(fnString); break;
                case 'luas-kurva': this.visualizeAreaBetweenCurves(fnString, gnString); break;
            }
            if (this.renderMath) this.renderMath();
        } catch (err) {
            this.infoTarget.innerHTML = `<span class="incorrect">Error: Fungsi atau parameter tidak valid. ${err.message}</span>`;
        }
    },

    visualizeStandard(fn, gn) {
        const data = [];
        const fData = this.generateFunctionData(fn);
        data.push({ ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} });

        // Hanya plot g(x) jika inputnya tidak kosong
        if (gn) {
            const gData = this.generateFunctionData(gn);
            data.push({ ...gData, type: 'scatter', mode: 'lines', name: `g(x)=${gn}`, line: {color: '#E04D5F'} });
        }
        
        const layout = {
            title: 'Grafik Fungsi', showlegend: true,
            xaxis: { range: [-10, 10], gridcolor: '#eee' },
            yaxis: { range: [-10, 10], gridcolor: '#eee' },
            plot_bgcolor: '#f9f9f9'
        };
        Plotly.newPlot(this.plotTarget, data, layout);
        this.infoTarget.innerHTML = 'Grafik standar untuk fungsi yang diberikan.';
    },

    visualize3DSurface() {
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
    },
    
    visualizeCriticalPoints(fn) {
        const data = [];
        const fData = this.generateFunctionData(fn);
        data.push({ ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} });
        
        const layout = { 
            title: 'Analisis Titik Kritis',
            xaxis: { range: [-10, 10] }, 
            yaxis: { range: [-10, 10] }  
        };
        
        try {
            const derivative = math.derivative(fn, 'x');
            const derivativeString = derivative.toString();
            this.infoTarget.innerHTML = `Mencari titik kritis untuk $f'(x) = ${derivativeString}$...`;

            const critX = [];
            for (let x = -10; x <= 10; x += 0.01) {
                if (Math.abs(derivative.evaluate({x})) < 0.01) {
                    if (critX.every(p => Math.abs(p - x) > 0.5)) {
                        critX.push(x);
                    }
                }
            }
            
            if (critX.length > 0) {
                const critY = critX.map(xVal => math.evaluate(fn, {x: xVal}));
                data.push({
                    x: critX, y: critY,
                    mode: 'markers', type: 'scatter', name: 'Titik Kritis',
                    marker: { color: '#E04D5F', size: 10 }
                });
                layout.annotations = critX.map((xVal, i) => ({
                    x: xVal, y: critY[i],
                    text: `Kritis di x≈${xVal.toFixed(2)}`,
                    ax: 0, ay: -30
                }));
                this.infoTarget.innerHTML = `Turunan $f'(x) = ${derivativeString}$. Ditemukan ${critX.length} kandidat titik kritis.`;
            } else {
                this.infoTarget.innerHTML = `Turunan $f'(x) = ${derivativeString}$. Tidak ada titik kritis yang ditemukan di rentang [-10, 10].`;
            }

        } catch (e) {
            this.infoTarget.innerHTML = `Tidak dapat menganalisis titik kritis untuk fungsi ini secara otomatis.`;
        }

        Plotly.newPlot(this.plotTarget, data, layout);
    },

    visualizeIntegral(fn) {
        const a = parseFloat(document.getElementById('integral-a').value);
        const b = parseFloat(document.getElementById('integral-b').value);
        if (isNaN(a) || isNaN(b)) {
            this.infoTarget.innerHTML = `<span class="incorrect">Error: Batas integral a dan b harus angka.</span>`;
            return;
        }
        
        const fData = this.generateFunctionData(fn);
        const integralRange = this.generateFunctionData(fn, [a,b], 0.05);
        
        const data = [
            { ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} },
            { ...integralRange, type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Area Integral', fillcolor: 'rgba(0,169,224,0.3)', line: {color: 'transparent'} }
        ];
        
        const layout = { 
            title: `Integral Tentu dari ${a} ke ${b}`,
            xaxis: { range: [-10, 10] }, 
            yaxis: { range: [-10, 10] } 
        };
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
        if (isNaN(a) || isNaN(b)) {
            this.infoTarget.innerHTML = `<span class="incorrect">Error: Batas integral a dan b harus angka.</span>`;
            return;
        }
        
        const data = [
            { ...this.generateFunctionData(fn), type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} },
            { ...this.generateFunctionData(gn), type: 'scatter', mode: 'lines', name: `g(x)=${gn}`, line: {color: '#E04D5F'} }
        ];
        
        const fillX = math.range(a, b, 0.05).toArray();
        const fillY_f = fillX.map(x => math.evaluate(fn, {x}));
        const fillY_g = fillX.map(x => math.evaluate(gn, {x}));
        
        data.push({
            x: [...fillX, ...fillX.slice().reverse()],
            y: [...fillY_f, ...fillY_g.slice().reverse()],
            fill: 'toself',
            fillcolor: 'rgba(128,128,128,0.3)',
            line: { color: 'transparent' },
            name: 'Area',
            showlegend: false
        });

        const layout = { 
            title: `Luas Antara f(x) dan g(x) dari ${a} ke ${b}`,
            xaxis: { range: [-10, 10] }, 
            yaxis: { range: [-10, 10] }  
        };
        Plotly.newPlot(this.plotTarget, data, layout);
        this.infoTarget.innerHTML = `Area diarsir adalah $\\int_{${a}}^{${b}} |${fn} - (${gn})| \\,dx$`;
    }
};