// Main game class
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.duck = null;
        this.terrain = null;
        this.firstPersonCamera = null;
        this.clock = new THREE.Clock();
        this.isGameRunning = false;
        this.collectibles = [];
        this.score = 0;
        this.multiplayer = null;
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.01); // Add fog for atmosphere
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        // Make camera accessible to other components
        this.scene.camera = this.camera;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        this.addLights();
        
        // Create terrain
        this.terrain = new Terrain(this.scene);
        
        // Create duck
        this.duck = new Duck(this.scene);
        
        // Create first-person camera
        this.firstPersonCamera = new FirstPersonCamera(this.camera, this.duck);
        
        // Add collectibles
        this.addCollectibles();
        
        // Create score display
        this.createScoreDisplay();
        
        // Initialize multiplayer
        this.multiplayer = new MultiplayerManager(this);
        
        // Initialize menu
        this.menu = new Menu(this);
        
        // Add event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
        
        // Hide loading screen after everything is loaded
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('menu').classList.remove('hidden');
        }, 2000);
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    addCollectibles() {
        // Add bread crumbs as collectibles
        const breadGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const breadMaterial = new THREE.MeshStandardMaterial({ color: 0xD2691E }); // Brown bread color
        
        for (let i = 0; i < 20; i++) {
            const bread = new THREE.Mesh(breadGeometry, breadMaterial);
            
            // Random position
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            bread.position.set(x, 1.5, z);
            
            // Add rotation animation
            bread.userData = {
                rotationSpeed: 0.01 + Math.random() * 0.02,
                floatSpeed: 0.5 + Math.random() * 0.5,
                floatHeight: 0.2 + Math.random() * 0.3,
                initialY: 1.5
            };
            
            bread.castShadow = true;
            this.scene.add(bread);
            this.collectibles.push(bread);
        }
    }
    
    createScoreDisplay() {
        // Create score container
        const scoreContainer = document.createElement('div');
        scoreContainer.id = 'score-container';
        scoreContainer.style.position = 'absolute';
        scoreContainer.style.top = '20px';
        scoreContainer.style.right = '20px';
        scoreContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        scoreContainer.style.color = 'white';
        scoreContainer.style.padding = '10px';
        scoreContainer.style.borderRadius = '5px';
        scoreContainer.style.fontFamily = 'Arial, sans-serif';
        scoreContainer.style.fontSize = '18px';
        
        // Create score text
        const scoreText = document.createElement('div');
        scoreText.id = 'score-text';
        scoreText.textContent = 'Bread: 0 / 20';
        
        scoreContainer.appendChild(scoreText);
        document.getElementById('game-container').appendChild(scoreContainer);
    }
    
    updateScoreDisplay() {
        const scoreText = document.getElementById('score-text');
        if (scoreText) {
            scoreText.textContent = `Bread: ${this.score} / 20`;
        }
    }
    
    checkCollectibleCollisions() {
        if (!this.duck) return;
        
        const duckPosition = this.duck.getPosition();
        const collectDistance = 2; // Distance to collect bread
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            const distance = collectible.position.distanceTo(duckPosition);
            
            if (distance < collectDistance) {
                // Collect the bread
                this.scene.remove(collectible);
                this.collectibles.splice(i, 1);
                this.score++;
                this.updateScoreDisplay();
                
                // Play collection sound
                if (this.duck.quackSound && !this.duck.quackSound.isPlaying) {
                    this.duck.quackSound.setPlaybackRate(1.2);
                    this.duck.quackSound.play();
                }
                
                // Check if all bread collected
                if (this.score >= 20) {
                    this.showVictoryMessage();
                }
            }
        }
    }
    
    showVictoryMessage() {
        // Create victory message
        const victoryContainer = document.createElement('div');
        victoryContainer.id = 'victory-container';
        victoryContainer.style.position = 'absolute';
        victoryContainer.style.top = '50%';
        victoryContainer.style.left = '50%';
        victoryContainer.style.transform = 'translate(-50%, -50%)';
        victoryContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        victoryContainer.style.color = 'white';
        victoryContainer.style.padding = '20px';
        victoryContainer.style.borderRadius = '10px';
        victoryContainer.style.textAlign = 'center';
        victoryContainer.style.zIndex = '100';
        
        const victoryTitle = document.createElement('h2');
        victoryTitle.textContent = 'Victory!';
        victoryTitle.style.fontSize = '32px';
        victoryTitle.style.marginBottom = '10px';
        
        const victoryText = document.createElement('p');
        victoryText.textContent = 'You collected all the bread! You are the best duck!';
        victoryText.style.fontSize = '18px';
        victoryText.style.marginBottom = '20px';
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Play Again';
        restartButton.style.backgroundColor = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.padding = '10px 20px';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.onclick = () => {
            location.reload();
        };
        
        victoryContainer.appendChild(victoryTitle);
        victoryContainer.appendChild(victoryText);
        victoryContainer.appendChild(restartButton);
        
        document.getElementById('game-container').appendChild(victoryContainer);
        
        // Pause the game
        this.pauseGame();
    }
    
    startGame() {
        this.isGameRunning = true;
        document.getElementById('menu').classList.add('hidden');
        
        // Connect to multiplayer server when game starts
        if (this.multiplayer) {
            this.multiplayer.connect();
        }
    }
    
    pauseGame() {
        this.isGameRunning = false;
        document.getElementById('menu').classList.remove('hidden');
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.isGameRunning) {
            // Update duck
            if (this.duck) {
                this.duck.update(delta);
            }
            
            // Update camera
            if (this.firstPersonCamera) {
                this.firstPersonCamera.update();
            }
            
            // Check for collectible collisions
            this.checkCollectibleCollisions();
            
            // Animate collectibles
            this.collectibles.forEach(collectible => {
                collectible.rotation.y += collectible.userData.rotationSpeed;
                collectible.position.y = collectible.userData.initialY + 
                    Math.sin(Date.now() * 0.001 * collectible.userData.floatSpeed) * 
                    collectible.userData.floatHeight;
            });
            
            // Update multiplayer
            if (this.multiplayer) {
                this.multiplayer.update(delta);
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
});