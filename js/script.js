import { Navigation } from './modules/navigation.js';
import { Simulator } from './modules/simulator.js';
import { Calculator } from './modules/kalkulator.js';
import { Quiz } from './modules/quiz.js';
import { Progress } from './modules/progress.js';

document.addEventListener('DOMContentLoaded', () => {
    const renderMath = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    };
    Progress.init();
    Simulator.init({ renderMath: renderMath });
    Calculator.init({ renderMath: renderMath });
    Quiz.init({ 
        renderMath: renderMath, 
        progressModule: Progress 
    });
    Navigation.init({
        renderMath: renderMath,
        Simulator: Simulator,
        Quiz: Quiz
    });
});