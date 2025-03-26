class PlayerCustomization {
    constructor(game) {
        this.game = game;
        this.playerName = '';
        this.duckColor = '#FFFF00'; // Default yellow
        this.colorOptions = [
            { name: 'Yellow', value: '#FFFF00' },
            { name: 'White', value: '#FFFFFF' },
            { name: 'Brown', value: '#8B4513' },
            { name: 'Black', value: '#333333' },
            { name: 'Blue', value: '#1E90FF' },
            { name: 'Green', value: '#32CD32' },
            { name: 'Red', value: '#FF6347' },
            { name: 'Purple', value: '#9370DB' }
        ];
        
        this.createCustomizationUI();
    }
    
    createCustomizationUI() {
        // Create customization container
        const customContainer = document.createElement('div');
        customContainer.id = 'customization-container';
        customContainer.className = 'game-ui hidden';
        customContainer.style.position = 'absolute';
        customContainer.style.top = '50%';
        customContainer.style.left = '50%';
        customContainer.style.transform = 'translate(-50%, -50%)';
        customContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        customContainer.style.padding = '30px';
        customContainer.style.borderRadius = '10px';
        customContainer.style.color = 'white';
        customContainer.style.textAlign = 'center';
        customContainer.style.width = '400px';
        customContainer.style.zIndex = '10';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Customize Your Duck';
        title.style.marginBottom = '20px';
        customContainer.appendChild(title);
        
        // Create name input
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Your Duck Name:';
        nameLabel.style.display = 'block';
        nameLabel.style.marginBottom = '5px';
        nameLabel.style.textAlign = 'left';
        customContainer.appendChild(nameLabel);
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'player-name-input';
        nameInput.placeholder = 'Enter your duck name';
        nameInput.maxLength = 15;
        nameInput.style.width = '100%';
        nameInput.style.padding = '8px';
        nameInput.style.marginBottom = '20px';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = 'none';
        customContainer.appendChild(nameInput);
        
        // Create color selection
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Duck Color:';
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '10px';
        colorLabel.style.textAlign = 'left';
        customContainer.appendChild(colorLabel);
        
        const colorGrid = document.createElement('div');
        colorGrid.style.display = 'grid';
        colorGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        colorGrid.style.gap = '10px';
        colorGrid.style.marginBottom = '20px';
        
        this.colorOptions.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color.value;
            colorOption.style.width = '50px';
            colorOption.style.height = '50px';
            colorOption.style.borderRadius = '50%';
            colorOption.style.margin = '0 auto';
            colorOption.style.cursor = 'pointer';
            colorOption.style.border = '3px solid transparent';
            colorOption.title = color.name;
            
            // Mark default color as selected
            if (index === 0) {
                colorOption.style.border = '3px solid white';
                this.selectedColorElement = colorOption;
            }
            
            colorOption.addEventListener('click', () => {
                // Update selected color
                this.duckColor = color.value;
                
                // Update visual selection
                if (this.selectedColorElement) {
                    this.selectedColorElement.style.border = '3px solid transparent';
                }
                colorOption.style.border = '3px solid white';
                this.selectedColorElement = colorOption;
                
                // Update duck preview
                this.updateDuckPreview();
            });
            
            colorGrid.appendChild(colorOption);
        });
        
        customContainer.appendChild(colorGrid);
        
        // Create duck preview
        const previewContainer = document.createElement('div');
        previewContainer.id = 'duck-preview-container';
        previewContainer.style.width = '150px';
        previewContainer.style.height = '150px';
        previewContainer.style.margin = '0 auto 20px auto';
        previewContainer.style.position = 'relative';
        
        const previewCanvas = document.createElement('canvas');
        previewCanvas.id = 'duck-preview-canvas';
        previewCanvas.width = 150;
        previewCanvas.height = 150;
        previewContainer.appendChild(previewCanvas);
        
        const previewName = document.createElement('div');
        previewName.id = 'preview-name';
        previewName.style.position = 'absolute';
        previewName.style.top = '-25px';
        previewName.style.left = '0';
        previewName.style.width = '100%';
        previewName.style.textAlign = 'center';
        previewName.style.color = 'white';
        previewName.style.fontWeight = 'bold';
        previewName.textContent = 'Duck';
        previewContainer.appendChild(previewName);
        
        customContainer.appendChild(previewContainer);
        
        // Create confirm button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Start Game';
        confirmButton.style.backgroundColor = '#4CAF50';
        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.padding = '10px 20px';
        confirmButton.style.borderRadius = '5px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.fontSize = '16px';
        confirmButton.style.width = '100%';
        
        confirmButton.addEventListener('click', () => {
            // Get player name (use default if empty)
            this.playerName = nameInput.value.trim() || 'Duck';
            
            // Hide customization screen
            customContainer.classList.add('hidden');
            
            // Apply customizations and start game
            this.applyCustomizations();
            this.game.startGame();
        });
        
        customContainer.appendChild(confirmButton);
        
        // Add to game container
        document.getElementById('game-container').appendChild(customContainer);
        
        // Setup preview renderer
        this.setupPreviewRenderer();
        
        // Update name preview when typing
        nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim() || 'Duck';
            document.getElementById('preview-name').textContent = name;
        });
    }
    
    setupPreviewRenderer() {
        // Create a small Three.js scene for the duck preview
        const canvas = document.getElementById('duck-preview-canvas');
        
        this.previewScene = new THREE.Scene();
        this.previewScene.background = new THREE.Color(0x87CEEB);
        
        this.previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.previewCamera.position.set(0, 2, 5);
        this.previewCamera.lookAt(0, 1, 0);
        
        this.previewRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        
        // Add light to preview scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.previewScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.previewScene.add(directionalLight);
        
        // Create preview duck
        this.createPreviewDuck();
        
        // Start preview animation
        this.animatePreview();
    }
    
    createPreviewDuck() {
        // Create a simple duck for preview
        const duckGroup = new THREE.Group();
        
        // Duck body
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 16);
        bodyGeometry.scale(1, 0.8, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.duckColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        duckGroup.add(body);
        
        // Duck head
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.duckColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.7, 1.2);
        duckGroup.add(head);
        
        // Duck bill
        const billGeometry = new THREE.ConeGeometry(0.3, 0.7, 4);
        billGeometry.rotateX(Math.PI / 2);
        const billMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
        const bill = new THREE.Mesh(billGeometry, billMaterial);
        bill.position.set(0, 0.6, 1.8);
        duckGroup.add(bill);
        
        // Duck eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.2, 0.9, 1.4);
        duckGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-0.2, 0.9, 1.4);
        duckGroup.add(rightEye);
        
        // Duck feet
        const footGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(0.5, -0.7, 0);
        duckGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.5, -0.7, 0);
        duckGroup.add(rightFoot);
        
        this.previewDuck = duckGroup;
        this.previewScene.add(duckGroup);
    }
    
    updateDuckPreview() {
        // Update duck color in preview
        if (this.previewDuck) {
            // Update body and head color
            this.previewDuck.children[0].material.color.set(this.duckColor);
            this.previewDuck.children[1].material.color.set(this.duckColor);
        }
    }
    
    animatePreview() {
        requestAnimationFrame(() => this.animatePreview());
        
        if (this.previewDuck) {
            // Rotate duck slowly
            this.previewDuck.rotation.y += 0.01;
        }
        
        this.previewRenderer.render(this.previewScene, this.previewCamera);
    }
    
    applyCustomizations() {
        // Apply name and color to the game duck
        if (this.game.duck) {
            this.game.duck.setPlayerName(this.playerName);
            this.game.duck.setDuckColor(this.duckColor);
        }
    }
    
    show() {
        document.getElementById('customization-container').classList.remove('hidden');
    }
    
    hide() {
        document.getElementById('customization-container').classList.add('hidden');
    }
}