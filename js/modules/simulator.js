export const Simulator = {
    // Properti untuk menyimpan referensi ke fungsi renderMath
    renderMath: null,

    // Terima objek 'config' untuk dependensi
    init(config) {
        this.renderMath = config.renderMath; // Simpan referensi
        this.cacheDOM();
        this.bindEvents();
        this.updateContextualInputs();
        this.initPlot(); // Panggil initPlot saat pertama kali dimuat
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

    // Hanya ada SATU fungsi bindEvents sekarang
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
        this.gxControl.style.display = (type === 'luas-kurva') ? 'flex' : 'none'; // Hanya tampilkan g(x) saat dibutuhkan
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
            // Panggil renderMath setelah plot berhasil
            if (this.renderMath) {
                this.renderMath();
            }
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
        const layout = { 
            title: 'Grafik Fungsi', 
            showlegend: true,
            xaxis: { range: [-10, 10], gridcolor: '#eee' },
            yaxis: { range: [-10, 10], gridcolor: '#eee' },
            plot_bgcolor: '#f9f9f9'
        };
        Plotly.newPlot(this.plotTarget, data, layout);
        this.infoTarget.innerHTML = 'Grafik standar untuk fungsi yang diberikan.';
    },

    visualizeCriticalPoints(fn) {
        const data = [];
        const fData = this.generateFunctionData(fn);
        data.push({ ...fData, type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} });
        
        // Contoh titik kritis statis. Untuk implementasi nyata, dibutuhkan metode numerik.
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
            })),
            xaxis: { range: [-10, 10] }, 
            yaxis: { range: [-10, 10] }  
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
        
        const fAreaData = this.generateFunctionData(fn, [a,b], 0.05);
        const gAreaData = this.generateFunctionData(gn, [a,b], 0.05);

        const data = [
            { ...this.generateFunctionData(fn), type: 'scatter', mode: 'lines', name: `f(x)=${fn}`, line: {color: '#005A9C'} },
            { ...this.generateFunctionData(gn), type: 'scatter', mode: 'lines', name: `g(x)=${gn}`, line: {color: '#E04D5F'} },
            { 
                x: fAreaData.x, 
                y: fAreaData.y, 
                type: 'scatter', 
                mode: 'lines', 
                fill: 'tonexty', // Mengisi area ke plot berikutnya (g(x))
                fillcolor: 'rgba(128,128,128,0.3)', 
                line: {color: 'transparent'}, 
                name: 'Area Antara Kurva', 
                showlegend: false 
            },
            { 
                x: gAreaData.x, 
                y: gAreaData.y, 
                type: 'scatter', 
                mode: 'lines', 
                line: {color: 'transparent'}, 
                showlegend: false 
            }
        ];

        const layout = { 
            title: `Luas Antara f(x) dan g(x) dari ${a} ke ${b}`,
            xaxis: { range: [-10, 10] }, 
            yaxis: { range: [-10, 10] }  
        };
        Plotly.newPlot(this.plotTarget, data, layout);
        this.infoTarget.innerHTML = `Area diarsir adalah $\\int_{${a}}^{${b}} |${fn} - (${gn})| \\,dx$`;
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
    }
};