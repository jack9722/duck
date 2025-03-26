class Menu {
    constructor(game) {
        this.game = game;
        this.startButton = document.getElementById('start-button');
        this.optionsButton = document.getElementById('options-button');
        this.backButton = document.getElementById('back-button');
        this.optionsPanel = document.getElementById('options-panel');
        
        // Create player customization
        this.playerCustomization = new PlayerCustomization(game);
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Start button - now opens customization instead of starting game directly
        this.startButton.addEventListener('click', () => {
            document.getElementById('menu').classList.add('hidden');
            this.playerCustomization.show();
        });
        
        // Options button
        this.optionsButton.addEventListener('click', () => {
            this.optionsPanel.classList.remove('hidden');
            this.startButton.classList.add('hidden');
            this.optionsButton.classList.add('hidden');
        });
        
        // Back button
        this.backButton.addEventListener('click', () => {
            this.optionsPanel.classList.add('hidden');
            this.startButton.classList.remove('hidden');
            this.optionsButton.classList.remove('hidden');
        });
        
        // Volume slider
        const volumeSlider = document.getElementById('sound-volume');
        volumeSlider.addEventListener('input', (event) => {
            const volume = event.target.value / 100;
            // Set volume for all audio elements
            if (this.game.duck && this.game.duck.quackSound) {
                this.game.duck.quackSound.setVolume(volume);
            }
        });
        
        // Escape key to pause game
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.game.isGameRunning) {
                this.game.pauseGame();
            }
        });
    }
}