document.addEventListener('DOMContentLoaded', () => {

    // --- NAVIGATION LOGIC ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Trigger function for specific pages
        if (pageId === 'simulasi') {
            plotGraph();
        } else if (pageId === 'latihan') {
            renderQuiz();
        }
        
        // Re-render MathJax for the new page
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });

    // --- SIMULASI GRAFIK LOGIC ---
    const functionInput = document.getElementById('function-input');
    const plotButton = document.getElementById('plot-button');

    function plotGraph() {
        const functionString = functionInput.value || "x";
        try {
            functionPlot({
                target: '#plot-target',
                width: document.getElementById('plot-target').clientWidth,
                height: 400,
                yAxis: { domain: [-10, 10] },
                xAxis: { domain: [-10, 10] },
                grid: true,
                data: [{
                    fn: functionString,
                    sampler: 'builtIn',
                    graphType: 'polyline'
                }]
            });
        } catch (err) {
            document.getElementById('plot-target').innerHTML = `<p style="color: red;">Error: Fungsi tidak valid. ${err.message}</p>`;
        }
    }

    plotButton.addEventListener('click', plotGraph);


    // --- KALKULATOR LOGIC ---
    const calcInput = document.getElementById('calc-function-input');
    const calcButton = document.getElementById('calculate-derivative-button');
    const resultText = document.getElementById('result-text');

    calcButton.addEventListener('click', () => {
        const expression = calcInput.value;
        if (!expression) {
            resultText.innerHTML = "Harap masukkan sebuah fungsi.";
            return;
        }

        try {
            const derivative = math.derivative(expression, 'x');
            // Tampilkan hasil dalam format LaTeX yang indah
            resultText.innerHTML = `Turunan dari $f(x) = ${expression}$ adalah: <br><br> $$ f'(x) = ${derivative.toString()} $$`;
            MathJax.typesetPromise(); // Render ulang MathJax untuk hasil
        } catch (err) {
            resultText.textContent = `Error: Ekspresi matematika tidak valid. ${err.message}`;
        }
    });

    // --- LATIHAN SOAL (QUIZ) LOGIC ---
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizButton = document.getElementById('submit-quiz-button');
    const quizResult = document.getElementById('quiz-result');

    const quizData = [
        {
            question: "1. Turunan dari $f(x) = x^3 + 5x$ adalah...",
            options: ["$3x^2 + 5$", "$3x^2$", "$x^2 + 5$", "$3x + 5$"],
            answer: "$3x^2 + 5$"
        },
        {
            question: "2. Nilai dari $\\lim_{x \\to 2} (x^2 + 3x - 1)$ adalah...",
            options: ["8", "9", "10", "11"],
            answer: "9"
        },
        {
            question: "3. Integral tak tentu dari $\\int 2x \\,dx$ adalah...",
            options: ["$2x^2 + C$", "$x^2 + C$", "$x + C$", "$2 + C$"],
            answer: "$x^2 + C$"
        }
    ];
    
    let rendered = false;
    function renderQuiz() {
        if(rendered) return; // Hanya render sekali
        quizContainer.innerHTML = '';
        quizData.forEach((item, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            
            const questionText = document.createElement('p');
            questionText.innerHTML = item.question;
            questionDiv.appendChild(questionText);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';
            item.options.forEach(option => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question${index}`;
                radio.value = option;
                label.appendChild(radio);
                label.append(` ${option}`);
                optionsDiv.appendChild(label);
            });
            questionDiv.appendChild(optionsDiv);
            quizContainer.appendChild(questionDiv);
        });
        rendered = true;
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }
    
    submitQuizButton.addEventListener('click', () => {
        let score = 0;
        quizData.forEach((item, index) => {
            const selected = document.querySelector(`input[name="question${index}"]:checked`);
            if (selected && selected.value === item.answer) {
                score++;
            }
        });
        quizResult.innerHTML = `Skor Anda: <span class="${score === quizData.length ? 'correct' : 'incorrect'}">${score} dari ${quizData.length}</span>`;
    });


    // --- INITIAL PAGE LOAD ---
    showPage('home'); // Tampilkan halaman beranda saat pertama kali dimuat

});

// --- SIMULASI KALKULUS INTERAKTIF (VERSI BARU) ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (kode navigasi dan lainnya tetap sama)

    const simFunctionInput = document.getElementById('sim-function-input');
    const visualizationType = document.getElementById('visualization-type');
    const visualizeButton = document.getElementById('visualize-button');
    const plotTarget = document.getElementById('plot-target');
    const vizInfo = document.getElementById('visualization-info');
    
    const turunanInputs = document.getElementById('turunan-inputs');
    const integralInputs = document.getElementById('integral-inputs');
    const limitInputs = document.getElementById('limit-inputs');

    const turunanPoint = document.getElementById('turunan-point');
    const turunanSlider = document.getElementById('turunan-slider');

    // Fungsi untuk menampilkan/menyembunyikan input sesuai pilihan
    function updateContextualInputs() {
        turunanInputs.style.display = 'none';
        integralInputs.style.display = 'none';
        limitInputs.style.display = 'none';

        const selectedType = visualizationType.value;
        if (selectedType === 'turunan') {
            turunanInputs.style.display = 'flex';
        } else if (selectedType === 'integral') {
            integralInputs.style.display = 'flex';
        } else if (selectedType === 'limit') {
            limitInputs.style.display = 'flex';
        }
    }

    // Sinkronisasi antara input angka dan slider untuk turunan
    turunanPoint.addEventListener('input', () => turunanSlider.value = turunanPoint.value);
    turunanSlider.addEventListener('input', () => turunanPoint.value = turunanSlider.value);

    // Event listener untuk pilihan visualisasi dan tombol utama
    visualizationType.addEventListener('change', updateContextualInputs);
    visualizeButton.addEventListener('click', runVisualization);
    
    // Panggil fungsi sekali di awal untuk setup
    updateContextualInputs();

    // Fungsi utama yang menjalankan semua visualisasi
    function runVisualization() {
        const fnString = simFunctionInput.value;
        if (!fnString) {
            vizInfo.innerHTML = "Error: Harap masukkan sebuah fungsi.";
            return;
        }

        const type = visualizationType.value;
        vizInfo.innerHTML = ''; // Kosongkan info sebelumnya

        try {
            const plotOptions = {
                target: '#plot-target',
                width: plotTarget.clientWidth,
                height: 400,
                grid: true,
                data: [{ fn: fnString }]
            };

            switch (type) {
                case 'grafik':
                    functionPlot(plotOptions);
                    break;
                case 'turunan':
                    visualizeDerivative(fnString, plotOptions);
                    break;
                case 'integral':
                    visualizeIntegral(fnString, plotOptions);
                    break;
                case 'limit':
                    visualizeLimit(fnString, plotOptions);
                    break;
            }
        } catch (err) {
            plotTarget.innerHTML = "";
            vizInfo.innerHTML = `<span class="incorrect">Error: Fungsi atau parameter tidak valid. ${err.message}</span>`;
        }
    }

    // --- FUNGSI SPESIFIK UNTUK TIAP VISUALISASI ---

    function visualizeDerivative(fnString, plotOptions) {
        const a = parseFloat(turunanPoint.value);
        
        // Hitung turunan dan nilai-nilainya menggunakan math.js
        const derivative = math.derivative(fnString, 'x');
        const scope = { x: a };
        const f_a = math.parse(fnString).evaluate(scope);
        const f_prime_a = derivative.evaluate(scope); // Gradien/kemiringan

        // Persamaan garis singgung: y - f(a) = f'(a) * (x - a)  =>  y = f'(a)*(x-a) + f(a)
        const tangentFn = `${f_prime_a} * (x - ${a}) + ${f_a}`;
        
        // Tambahkan data garis singgung dan titik ke plot
        plotOptions.data.push({
            fn: tangentFn,
            graphType: 'polyline',
            color: '#E04D5F' // Merah
        }, {
            points: [[a, f_a]],
            fnType: 'points',
            graphType: 'scatter',
            color: '#E04D5F',
            attr: { r: 5 } // Ukuran titik
        });

        functionPlot(plotOptions);
        vizInfo.innerHTML = `Kemiringan (turunan) di $x = ${a}$ adalah $f'(${a}) \\approx ${f_prime_a.toFixed(4)}$`;
        MathJax.typesetPromise();
    }

    function visualizeIntegral(fnString, plotOptions) {
        const a = parseFloat(document.getElementById('integral-a').value);
        const b = parseFloat(document.getElementById('integral-b').value);
        
        // Gunakan fitur built-in function-plot untuk mengarsir area integral
        plotOptions.data[0].range = [a, b];
        plotOptions.data[0].closed = true; // Untuk mengarsir

        functionPlot(plotOptions);

        // Hitung nilai integral (membutuhkan library tambahan atau metode numerik)
        // Untuk kesederhanaan, kita hanya tampilkan notasinya
        vizInfo.innerHTML = `Area yang diarsir merepresentasikan nilai integral $\\int_{${a}}^{${b}} ${fnString} \\,dx$`;
        MathJax.typesetPromise();
    }

    function visualizeLimit(fnString, plotOptions) {
        const c = parseFloat(document.getElementById('limit-c').value);
        const scope = { x: c };
        const L = math.parse(fnString).evaluate(scope);

        // Tambahkan titik target limit ke plot
        plotOptions.data.push({
            points: [[c, L]],
            fnType: 'points',
            graphType: 'scatter',
            color: 'blue',
            attr: { r: 6 }
        });
        
        functionPlot(plotOptions);
        
        // Animasi titik mendekati limit
        let delta = 1;
        const animationInterval = setInterval(() => {
            const pointsToShow = [
                [c - delta, math.parse(fnString).evaluate({x: c - delta})],
                [c + delta, math.parse(fnString).evaluate({x: c + delta})]
            ];
            
            functionPlot.globals.instance.draw(); // Hapus titik animasi sebelumnya
            functionPlot.globals.instance.addLink({
                 points: pointsToShow,
                 fnType: 'points',
                 graphType: 'scatter',
                 color: 'green'
            });

            delta /= 1.5;
            if (delta < 0.001) clearInterval(animationInterval);
        }, 300);

        vizInfo.innerHTML = `Visualisasi $\\lim_{x \\to ${c}} ${fnString} = ${L.toFixed(4)}$`;
        MathJax.typesetPromise();
    }
});