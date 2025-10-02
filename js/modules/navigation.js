export const Navigation = {
    // Tambahkan properti untuk menyimpan referensi
    pages: null,
    navLinks: null,
    renderMath: null,
    simulatorModule: null,
    quizModule: null,

    // Terima semua yang dibutuhkan saat init
    init(config) {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');

        // Simpan referensi dari objek config
        this.renderMath = config.renderMath;
        this.simulatorModule = config.Simulator;
        this.quizModule = config.Quiz;

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Tampilkan halaman default
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
        
        // Panggil modul yang relevan menggunakan referensi yang sudah disimpan
        if (pageId === 'simulasi' && this.simulatorModule) {
            this.simulatorModule.initPlot();
        }
        if (pageId === 'latihan' && this.quizModule) {
            this.quizModule.render();
        }

        // Panggil fungsi renderMath yang sudah disimpan
        if (this.renderMath) {
            this.renderMath();
        }
    }
};