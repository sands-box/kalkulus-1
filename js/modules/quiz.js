export const Quiz = {
    rendered: false,
    // Properti untuk menyimpan referensi ke fungsi renderMath
    renderMath: null,

    // Terima objek 'config' untuk dependensi
    init(config) {
        this.renderMath = config.renderMath; // Simpan referensi
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
        // Hanya render soal jika belum pernah di-render, untuk mencegah duplikasi
        if (this.rendered) return;

        let html = '';
        this.quizData.forEach((item, index) => {
            // Perbaikan kecil: class="quiz-question" bukan class.quiz-question
            html += `<div class="quiz-question"><p>${index + 1}. ${item.question}</p><div class="quiz-options">`;
            item.options.forEach(opt => { 
                html += `<label><input type="radio" name="q${index}" value="${opt}"> ${opt}</label>`; 
            });
            html += `</div></div>`;
        });
        this.container.innerHTML = html;
        this.rendered = true; // Tandai bahwa kuis sudah di-render

        // Panggil renderMath menggunakan referensi yang disimpan
        if (this.renderMath) {
            this.renderMath();
        }
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