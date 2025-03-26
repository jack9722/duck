class Duck {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 5;
        this.runSpeed = 10;
        this.turnSpeed = 2;
        this.isMoving = false;
        this.isRunning = false;
        this.isJumping = false;
        this.jumpHeight = 3;
        this.jumpSpeed = 8;
        this.gravity = 20;
        this.verticalVelocity = 0;
        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaRegenRate = 10; // Per second
        this.staminaRunCost = 15; // Per second
        this.playerName = 'Duck';
        this.duckColor = '#FFFF00'; // Default yellow
        this.nameLabel = null;
        this.isVisible = true;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
            jump: false,
            quack: false
        };
        
        // Create a simple duck model for now
        this.createSimpleDuck();
        
        // Add keyboard event listeners
        this.setupControls();
        
        // Create quack sound
        this.setupQuackSound();
        
        // Create UI elements for stamina
        this.createStaminaUI();
    }
    
    createSimpleDuck() {
        // Create a simple duck using primitive shapes
        const duckGroup = new THREE.Group();
        
        // Duck body (ellipsoid)
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 16);
        bodyGeometry.scale(1, 0.8, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.duckColor }); // Yellow
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        duckGroup.add(body);
        
        // Duck head
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.duckColor }); // Yellow
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.7, 1.2);
        head.castShadow = true;
        duckGroup.add(head);
        
        // Duck bill
        const billGeometry = new THREE.ConeGeometry(0.3, 0.7, 4);
        billGeometry.rotateX(Math.PI / 2);
        const billMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // Orange
        const bill = new THREE.Mesh(billGeometry, billMaterial);
        bill.position.set(0, 0.6, 1.8);
        bill.castShadow = true;
        duckGroup.add(bill);
        
        // Duck eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.2, 0.9, 1.4);
        duckGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-0.2, 0.9, 1.4);
        duckGroup.add(rightEye);
        
        // Duck feet
        const footGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // Orange
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(0.5, -0.7, 0);
        leftFoot.castShadow = true;
        duckGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.5, -0.7, 0);
        rightFoot.castShadow = true;
        duckGroup.add(rightFoot);
        
        // Position the duck above the ground
        duckGroup.position.set(0, 1, 0);
        
        this.mesh = duckGroup;
        this.scene.add(this.mesh);
        
        // Create player name label
        this.createNameLabel();
    }
    
    createNameLabel() {
        // Create canvas for the name texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw background with slight transparency
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = 'bold 32px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.playerName, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ map: texture });
        
        // Create sprite
        this.nameLabel = new THREE.Sprite(material);
        this.nameLabel.scale.set(2, 0.5, 1);
        this.nameLabel.position.set(0, 2.5, 0); // Position above duck
        
        // Add to duck mesh
        this.mesh.add(this.nameLabel);
    }
    
    updateNameLabel() {
        if (this.nameLabel) {
            // Get the canvas from the texture
            const canvas = this.nameLabel.material.map.image;
            const context = canvas.getContext('2d');
            
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background with slight transparency
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw text
            context.font = 'bold 32px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(this.playerName, canvas.width / 2, canvas.height / 2);
            
            // Update texture
            this.nameLabel.material.map.needsUpdate = true;
        }
    }
    
    setPlayerName(name) {
        this.playerName = name;
        this.updateNameLabel();
    }
    
    setDuckColor(color) {
        this.duckColor = color;
        
        // Update duck body and head color
        if (this.mesh) {
            // Body is the first child
            if (this.mesh.children[0] && this.mesh.children[0].material) {
                this.mesh.children[0].material.color.set(color);
            }
            
            // Head is the second child
            if (this.mesh.children[1] && this.mesh.children[1].material) {
                this.mesh.children[1].material.color.set(color);
            }
        }
    }
    
    setVisibility(visible) {
        this.isVisible = visible;
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
    }
    
    handleKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.run = true;
                break;
            case 'Space':
                this.keys.jump = true;
                if (!this.isJumping && this.mesh.position.y <= 1.1) {
                    this.jump();
                }
                break;
            case 'KeyQ':
                this.keys.quack = true;
                this.quack();
                break;
        }
    }
    
    handleKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.run = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'KeyQ':
                this.keys.quack = false;
                break;
        }
    }
    
    setupQuackSound() {
        // Create an audio listener and add it to the camera
        const listener = new THREE.AudioListener();
        this.scene.camera.add(listener);
        
        // Create a global audio source
        this.quackSound = new THREE.Audio(listener);
        
        // Load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('https://assets.codepen.io/21542/quack2.mp3', (buffer) => {
            this.quackSound.setBuffer(buffer);
            this.quackSound.setVolume(0.5);
        });
    }
    
    createStaminaUI() {
        // Create stamina bar container
        const staminaContainer = document.createElement('div');
        staminaContainer.id = 'stamina-container';
        staminaContainer.style.position = 'absolute';
        staminaContainer.style.bottom = '20px';
        staminaContainer.style.left = '20px';
        staminaContainer.style.width = '200px';
        staminaContainer.style.height = '20px';
        staminaContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        staminaContainer.style.borderRadius = '10px';
        staminaContainer.style.overflow = 'hidden';
        
        // Create stamina bar
        const staminaBar = document.createElement('div');
        staminaBar.id = 'stamina-bar';
        staminaBar.style.width = '100%';
        staminaBar.style.height = '100%';
        staminaBar.style.backgroundColor = '#4CAF50';
        staminaBar.style.transition = 'width 0.3s';
        
        staminaContainer.appendChild(staminaBar);
        document.getElementById('game-container').appendChild(staminaContainer);
    }
    
    updateStaminaUI() {
        const staminaBar = document.getElementById('stamina-bar');
        if (staminaBar) {
            staminaBar.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
            
            // Change color based on stamina level
            if (this.stamina < 30) {
                staminaBar.style.backgroundColor = '#F44336'; // Red when low
            } else if (this.stamina < 60) {
                staminaBar.style.backgroundColor = '#FFC107'; // Yellow when medium
            } else {
                staminaBar.style.backgroundColor = '#4CAF50'; // Green when high
            }
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.verticalVelocity = this.jumpSpeed;
            
            // Play jump sound
            if (this.quackSound && !this.quackSound.isPlaying) {
                // Play a higher pitched quack for jumping
                this.quackSound.setPlaybackRate(1.5);
                this.quackSound.play();
            }
        }
    }
    
    quack() {
        if (this.quackSound && !this.quackSound.isPlaying) {
            this.quackSound.setPlaybackRate(1.0);
            this.quackSound.play();
        }
    }
    
    update(delta) {
        // Handle movement
        let moveSpeed = this.speed;
        const turnSpeed = this.turnSpeed * delta;
        
        // Reset movement flag
        this.isMoving = false;
        this.isRunning = false;
        
        // Handle running (if has stamina)
        if (this.keys.run && this.stamina > 0) {
            moveSpeed = this.runSpeed;
            this.isRunning = true;
            this.stamina = Math.max(0, this.stamina - this.staminaRunCost * delta);
        } else {
            // Regenerate stamina when not running
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * delta);
        }
        
        // Update stamina UI
        this.updateStaminaUI();
        
        // Apply movement based on camera direction
        const actualMoveSpeed = moveSpeed * delta;
        
        if (this.keys.forward) {
            this.isMoving = true;
            this.mesh.position.x += Math.sin(this.mesh.rotation.y) * actualMoveSpeed;
            this.mesh.position.z += Math.cos(this.mesh.rotation.y) * actualMoveSpeed;
        }
        
        if (this.keys.backward) {
            this.isMoving = true;
            this.mesh.position.x -= Math.sin(this.mesh.rotation.y) * actualMoveSpeed * 0.5;
            this.mesh.position.z -= Math.cos(this.mesh.rotation.y) * actualMoveSpeed * 0.5;
        }        if (this.keys.left) {
            this.mesh.rotation.y += turnSpeed;
        }
        
        if (this.keys.right) {
            this.mesh.rotation.y -= turnSpeed;
        }
        
        // Apply gravity and handle jumping
        if (this.isJumping) {
            this.verticalVelocity -= this.gravity * delta;
            this.mesh.position.y += this.verticalVelocity * delta;
            
            // Check if landed
            if (this.mesh.position.y <= 1) {
                this.mesh.position.y = 1;
                this.isJumping = false;
                this.verticalVelocity = 0;
            }
        }
        
        // Update position for camera
        this.position.copy(this.mesh.position);
        this.rotation.copy(this.mesh.rotation);
        
        // Add bob effect when moving
        if (this.isMoving) {
            const bobFrequency = this.isRunning ? 12 : 8;
            const bobAmount = this.isRunning ? 0.1 : 0.05;
            this.mesh.position.y += Math.sin(Date.now() * 0.01 * bobFrequency) * bobAmount;
        }
    }
    
    setRotationFromCamera(yaw) {
        this.mesh.rotation.y = yaw;
    }
    
    getPosition() {
        return this.position;
    }
    
    getRotation() {
        return this.rotation;
    }
}