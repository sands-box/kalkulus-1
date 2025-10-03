export const Progress = {
    STORAGE_KEY: 'kalkulus1_progress',
    state: {
        xp: 0,
        level: 1,
    },
    config: {
        xpPerLevel: 100,
        xpForCorrectAnswer: 10
    },

    init() {
        this.load();
        this.updateUI();
    },

    load() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.state = JSON.parse(saved);
        }
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    },

    addXp(amount) {
        this.state.xp += amount;
        console.log(`Dapat ${amount} XP! Total XP: ${this.state.xp}`);
        while (this.state.xp >= this.config.xpPerLevel) {
            this.state.xp -= this.config.xpPerLevel;
            this.state.level++;
            console.log(`Selamat! Anda naik ke Level ${this.state.level}!`);
        }
        this.save();
        this.updateUI();
    },

    updateUI() {
        const levelDisplay = document.getElementById('user-level');
        const xpDisplay = document.getElementById('user-xp');
        if (levelDisplay) levelDisplay.innerText = this.state.level;
        if (xpDisplay) xpDisplay.innerText = this.state.xp;
    }
};