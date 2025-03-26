class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.players = {}; // Other players
        this.connected = false;
        this.updateInterval = null;
        this.lastUpdateTime = 0;
        this.updateRate = 100; // ms between updates
        
        // Chat elements
        this.chatContainer = null;
        this.chatMessages = null;
        this.chatInput = null;
        
        this.setupChatUI();
    }
    
    connect() {
        // Connect to the server
        this.socket = io();
        
        // Setup socket event handlers
        this.setupSocketHandlers();
        
        // Set connected flag
        this.connected = true;
        
        // Start sending position updates
        this.startUpdates();
    }
    
    setupSocketHandlers() {
        // Handle connection
        this.socket.on('connect', () => {
            console.log('Connected to server');
            
            // Send player data to server
            this.socket.emit('playerJoin', {
                name: this.game.duck.playerName,
                color: this.game.duck.duckColor,
                position: this.game.duck.getPosition(),
                rotation: { y: this.game.duck.getRotation().y }
            });
        });
        
        // Handle existing players
        this.socket.on('existingPlayers', (players) => {
            console.log('Received existing players:', players);
            
            // Add each existing player
            Object.keys(players).forEach(id => {
                if (id !== this.socket.id) {
                    this.addPlayer(players[id]);
                }
            });
        });
        
        // Handle new player joined
        this.socket.on('playerJoined', (playerData) => {
            console.log('Player joined:', playerData);
            this.addPlayer(playerData);
            
            // Add system message
            this.addChatMessage({
                system: true,
                message: `${playerData.name} joined the game`
            });
        });
        
        // Handle player movement
        this.socket.on('playerMoved', (playerData) => {
            this.updatePlayerPosition(playerData);
        });
        
        // Handle player left
        this.socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            
            if (this.players[playerId]) {
                // Add system message
                this.addChatMessage({
                    system: true,
                    message: `${this.players[playerId].name} left the game`
                });
                
                // Remove player mesh from scene
                this.game.scene.remove(this.players[playerId].mesh);
                
                // Remove player from players object
                delete this.players[playerId];
            }
        });
        
        // Handle chat messages
        this.socket.on('chatMessage', (messageData) => {
            this.addChatMessage(messageData);
        });
        
        // Handle disconnection
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.stopUpdates();
            
            // Remove all other players
            Object.keys(this.players).forEach(id => {
                this.game.scene.remove(this.players[id].mesh);
            });
            this.players = {};
        });
    }
    
    addPlayer(playerData) {
        // Create a new duck for the player
        const duckMesh = this.createRemoteDuck(playerData.color);
        
        // Position the duck
        duckMesh.position.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );
        
        // Set rotation
        duckMesh.rotation.y = playerData.rotation.y;
        
        // Add to scene
        this.game.scene.add(duckMesh);
        
        // Create name label
        const nameLabel = this.createNameLabel(playerData.name, duckMesh);
        
        // Store player data
        this.players[playerData.id] = {
            id: playerData.id,
            name: playerData.name,
            color: playerData.color,
            mesh: duckMesh,
            nameLabel: nameLabel,
            isMoving: playerData.isMoving || false,
            isJumping: playerData.isJumping || false,
            lastPosition: new THREE.Vector3(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            ),
            targetPosition: new THREE.Vector3(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            ),
            lastRotation: playerData.rotation.y,
            targetRotation: playerData.rotation.y
        };
    }
    
    createRemoteDuck(color) {
        // Create a duck group
        const duckGroup = new THREE.Group();
        
        // Duck body (ellipsoid)
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 16);
        bodyGeometry.scale(1, 0.8, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        duckGroup.add(body);
        
        // Duck head
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.7, 1.2);
        head.castShadow = true;
        duckGroup.add(head);
        
        // Duck bill
        const billGeometry = new THREE.ConeGeometry(0.3, 0.7, 4);
        billGeometry.rotateX(Math.PI / 2);
        const billMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
        const bill = new THREE.Mesh(billGeometry, billMaterial);
        bill.position.set(0, 0.6, 1.8);
        bill.castShadow = true;
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
        leftFoot.castShadow = true;
        duckGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.5, -0.7, 0);
        rightFoot.castShadow = true;
        duckGroup.add(rightFoot);
        
        return duckGroup;
    }
    
    createNameLabel(name, parentMesh) {
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
        context.fillText(name, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ map: texture });
        
        // Create sprite
        const nameLabel = new THREE.Sprite(material);
        nameLabel.scale.set(2, 0.5, 1);
        nameLabel.position.set(0, 2.5, 0); // Position above duck
        
        // Add to parent mesh
        parentMesh.add(nameLabel);
        
        return nameLabel;
    }
    
    updatePlayerPosition(playerData) {
        const player = this.players[playerData.id];
        
        if (player) {
            // Update target position and rotation for smooth interpolation
            player.targetPosition.set(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            );
            player.targetRotation = playerData.rotation.y;
            player.isMoving = playerData.isMoving;
            player.isJumping = playerData.isJumping;
        }
    }
    
    startUpdates() {
        // Send position updates to server at regular intervals
        this.updateInterval = setInterval(() => {
            if (this.connected && this.game.duck) {
                const now = Date.now();
                
                // Only send updates if enough time has passed or if significant movement
                if (now - this.lastUpdateTime > this.updateRate) {
                    this.socket.emit('playerUpdate', {
                        position: this.game.duck.getPosition(),
                        rotation: { y: this.game.duck.getRotation().y },
                        isMoving: this.game.duck.isMoving,
                        isJumping: this.game.duck.isJumping
                    });
                    
                    this.lastUpdateTime = now;
                }
            }
        }, this.updateRate);
    }
    
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    update(delta) {
        // Interpolate other players' positions and rotations
        Object.values(this.players).forEach(player => {
            // Smoothly interpolate position
            player.mesh.position.lerp(player.targetPosition, 0.2);
            
            // Smoothly interpolate rotation
            const rotationDiff = player.targetRotation - player.mesh.rotation.y;
            player.mesh.rotation.y += rotationDiff * 0.2;
            
            // Add bob effect when moving
            if (player.isMoving) {
                const bobFrequency = 8;
                const bobAmount = 0.05;
                player.mesh.position.y += Math.sin(Date.now() * 0.01 * bobFrequency) * bobAmount;
            }
        });
    }
    
    setupChatUI() {
        // Create chat container
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'chat-container';
        this.chatContainer.style.position = 'absolute';
        this.chatContainer.style.bottom = '20px';
        this.chatContainer.style.left = '20px';
        this.chatContainer.style.width = '300px';
        this.chatContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.chatContainer.style.borderRadius = '5px';
        this.chatContainer.style.padding = '10px';
        this.chatContainer.style.zIndex = '100';
        this.chatContainer.style.display = 'flex';
        this.chatContainer.style.flexDirection = 'column';
        
        // Create chat messages area
        this.chatMessages = document.createElement('div');
        this.chatMessages.id = 'chat-messages';
        this.chatMessages.style.height = '150px';
        this.chatMessages.style.overflowY = 'auto';
        this.chatMessages.style.marginBottom = '10px';
        this.chatMessages.style.color = 'white';
        this.chatMessages.style.fontFamily = 'Arial, sans-serif';
        this.chatMessages.style.fontSize = '14px';
        
        // Create chat input
        this.chatInput = document.createElement('input');
        this.chatInput.id = 'chat-input';
        this.chatInput.type = 'text';
        this.chatInput.placeholder = 'Press T to chat...';
        this.chatInput.style.width = '100%';
        this.chatInput.style.padding = '5px';
        this.chatInput.style.borderRadius = '3px';
        this.chatInput.style.border = 'none';
        this.chatInput.style.display = 'none';
        
        // Add elements to container
        this.chatContainer.appendChild(this.chatMessages);
        this.chatContainer.appendChild(this.chatInput);
        
        // Add container to game
        document.getElementById('game-container').appendChild(this.chatContainer);
        
        // Add event listeners for chat
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyT' && !this.chatInput.style.display === 'block') {
                // Show chat input
                this.chatInput.style.display = 'block';
                this.chatInput.focus();
                event.preventDefault();
            } else if (event.code === 'Escape' && this.chatInput.style.display === 'block') {
                // Hide chat input
                this.chatInput.style.display = 'none';
                this.chatInput.value = '';
                event.preventDefault();
            }
        });
        
        this.chatInput.addEventListener('keydown', (event) => {
            if (event.code === 'Enter') {
                const message = this.chatInput.value.trim();
                
                if (message && this.connected) {
                    // Send message to server
                    this.socket.emit('chatMessage', message);
                    
                    // Clear input
                    this.chatInput.value = '';
                }
                
                // Hide chat input
                this.chatInput.style.display = 'none';
                
                event.preventDefault();
            }
        });
    }
    
    addChatMessage(messageData) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '5px';
        messageElement.style.wordBreak = 'break-word';
        
        if (messageData.system) {
            // System message
            messageElement.style.color = '#FFA500';
            messageElement.textContent = messageData.message;
        } else {
            // Player message
            const playerName = messageData.name;
            const message = messageData.message;
            
            messageElement.innerHTML = `<span style="color: #4CAF50;">${playerName}:</span> ${message}`;
        }
        
        // Add message to chat
        this.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}