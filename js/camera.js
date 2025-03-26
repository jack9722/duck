class FirstPersonCamera {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        this.offsetHeight = 1.2; // Height offset from duck's position (eye level)
        this.offsetForward = 0.8; // Forward offset to position camera at duck's "head"
        this.lookSensitivity = 0.002;
        this.pitchLimit = Math.PI / 3; // Limit vertical look angle
        this.pitch = 0;
        this.yaw = 0;
        
        // Mouse look variables
        this.isMouseLookEnabled = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        // Add property to track if we're in first person mode
        this.isFirstPerson = true;
        
        // Hide duck model in first person
        if (this.target && this.target.mesh) {
            this.target.setVisibility(false);
        }
        
        // Initialize camera position
        this.update();
        
        // Setup mouse controls
        this.setupMouseControls();
    }
    
    setupMouseControls() {
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isMouseLookEnabled = true;
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
                document.body.style.cursor = 'none'; // Hide cursor during look
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isMouseLookEnabled = false;
                document.body.style.cursor = 'auto'; // Show cursor again
            }
        });
        
        document.addEventListener('mousemove', (event) => {
            if (this.isMouseLookEnabled) {
                const deltaX = event.clientX - this.previousMousePosition.x;
                const deltaY = event.clientY - this.previousMousePosition.y;
                
                this.yaw -= deltaX * this.lookSensitivity;
                this.pitch -= deltaY * this.lookSensitivity;
                
                // Limit pitch to avoid flipping
                this.pitch = Math.max(-this.pitchLimit, Math.min(this.pitchLimit, this.pitch));
                
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });
        
        // Lock pointer for better FPS controls
        document.getElementById('game-canvas').addEventListener('click', () => {
            const canvas = document.getElementById('game-canvas');
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        });
        
        // Handle pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === document.getElementById('game-canvas')) {
                this.isMouseLookEnabled = true;
                document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            } else {
                this.isMouseLookEnabled = false;
                document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
            }
        });
    }
    
    onMouseMove(event) {
        if (this.isMouseLookEnabled) {
            this.yaw -= event.movementX * this.lookSensitivity;
            this.pitch -= event.movementY * this.lookSensitivity;
            
            // Limit pitch to avoid flipping
            this.pitch = Math.max(-this.pitchLimit, Math.min(this.pitchLimit, this.pitch));
        }
    }
    
    update() {
        if (!this.target) return;
        
        const targetPosition = this.target.getPosition();
        const targetRotation = this.target.getRotation();
        
        // Set duck's rotation based on camera yaw
        this.target.setRotationFromCamera(this.yaw);
        
        // Calculate camera position at duck's head
        const forward = new THREE.Vector3(
            Math.sin(this.yaw) * this.offsetForward,
            0,
            Math.cos(this.yaw) * this.offsetForward
        );
        
        // Position camera
        this.camera.position.x = targetPosition.x + forward.x;
        this.camera.position.y = targetPosition.y + this.offsetHeight;
        this.camera.position.z = targetPosition.z + forward.z;
        
        // Create look direction with pitch and yaw
        const lookDirection = new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        );
        
        // Set camera look target
        this.camera.lookAt(
            this.camera.position.x + lookDirection.x,
            this.camera.position.y + lookDirection.y,
            this.camera.position.z + lookDirection.z
        );
    }
}