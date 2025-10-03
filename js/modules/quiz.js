export const Quiz = {
    renderMath: null,
    progressModule: null,
    container: null,
    submitButton: null,
    resultContainer: null,
    currentQuestions: [],
    userAnswers: {},
    questionBank: [
        {
            question: "Tentukan turunan dari fungsi $f(x) = 3x^4 - 2x^2 + 5$.",
            options: [
                "$f'(x) = 12x^3 - 4x$",
                "$f'(x) = 12x^4 - 4x^2$",
                "$f'(x) = 3x^3 - 2x$",
                "$f'(x) = 4x^3 - 2x$"
            ],
            answer: 0
        },
        {
            question: "Hitunglah nilai limit berikut: $\\lim_{x \\to 2} (x^2 + 3x - 1)$.",
            options: [
                "8",
                "9",
                "10",
                "11"
            ],
            answer: 1 
        },
        {
            question: "Integral tentu dari $\\int_{0}^{1} 2x \\,dx$ adalah...",
            options: [
                "0",
                "1",
                "2",
                "1/2"
            ],
            answer: 1
        },
        {
            question: "Jika $f'(c) = 0$, maka $x=c$ adalah kandidat untuk...",
            options: [
                "Titik potong sumbu-y",
                "Asimtot tegak",
                "Titik belok",
                "Titik maksimum atau minimum lokal"
            ],
            answer: 3
        }
    ],

    init(config) {
        this.renderMath = config.renderMath;
        this.progressModule = config.progressModule;
        this.container = document.getElementById('quiz-container');
        this.submitButton = document.getElementById('submit-quiz-button');
        this.resultContainer = document.getElementById('quiz-result');

        if (!this.container || !this.submitButton || !this.resultContainer) {
            console.error("Elemen kuis tidak ditemukan di halaman!");
            return;
        }
        
        this.submitButton.addEventListener('click', () => this.checkAnswers());
        this.loadQuestions();
    },

    loadQuestions() {
        this.currentQuestions = this.questionBank;
        this.userAnswers = {};
        this.container.innerHTML = '';
        this.resultContainer.innerHTML = '';

        this.currentQuestions.forEach((q, index) => {
            const questionElement = document.createElement('article');
            questionElement.className = 'quiz-question';

            let optionsHTML = q.options.map((option, optionIndex) => `
                <label class="quiz-option">
                    <input type="radio" name="question-${index}" value="${optionIndex}">
                    <span>${option}</span>
                </label>
            `).join('');

            questionElement.innerHTML = `
                <h4>Soal ${index + 1}:</h4>
                <p>${q.question}</p>
                <div class="quiz-options">${optionsHTML}</div>
            `;
            this.container.appendChild(questionElement);
        });
        
        if (this.renderMath) {
            this.renderMath();
        }
    },

    checkAnswers() {
        let correctAnswers = 0;

        this.currentQuestions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption) {
                this.userAnswers[index] = parseInt(selectedOption.value);
            }
        });

        this.currentQuestions.forEach((q, index) => {
            if (this.userAnswers[index] === q.answer) {
                correctAnswers++;
                if (this.progressModule) {
                    this.progressModule.addXp(this.progressModule.config.xpForCorrectAnswer);
                }
            }
        });
        
        const score = (correctAnswers / this.currentQuestions.length) * 100;

        this.resultContainer.innerHTML = `
            <h3>Hasil Kuis</h3>
            <p>Anda menjawab benar <strong>${correctAnswers}</strong> dari <strong>${this.currentQuestions.length}</strong> soal.</p>
            <p>Skor Akhir: <strong>${score.toFixed(1)}%</strong></p>
            <button id="retry-quiz-button">Coba Lagi</button>
        `;

        document.getElementById('retry-quiz-button').addEventListener('click', () => this.loadQuestions());
    }
};