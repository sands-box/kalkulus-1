import { Navigation } from './modules/navigation.js';
import { Simulator } from './modules/simulator.js';
import { Calculator } from './modules/kalkulator.js';
import { Quiz } from './modules/quiz.js';

// Event listener ini akan berjalan setelah seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // Fungsi helper untuk merender formula matematika menggunakan MathJax
    const renderMath = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    };

    // Siapkan objek konfigurasi yang akan diberikan ke setiap modul.
    // Ini berisi dependensi yang dibutuhkan oleh modul-modul lain.
    const config = { 
        renderMath: renderMath 
    };

    // Inisialisasi setiap modul dengan memberikan konfigurasi yang diperlukan
    Simulator.init(config);
    Calculator.init(config);
    Quiz.init(config);

    // Inisialisasi Navigation terakhir, karena ia butuh referensi ke modul lain
    // untuk mengontrolnya saat halaman berganti.
    Navigation.init({
        renderMath: renderMath,
        Simulator: Simulator,
        Quiz: Quiz
    });
});