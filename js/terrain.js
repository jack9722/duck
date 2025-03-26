class Terrain {
    constructor(scene) {
        this.scene = scene;
        
        // Create ground
        this.createGround();
        
        // Add water
        this.createWater();
        
        // Add trees and rocks
        this.addEnvironmentObjects();
    }
    
    createGround() {
        // Create ground geometry
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        groundGeometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
        
        // Create ground material
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7CFC00, // Grass green
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create ground mesh
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.receiveShadow = true;
        
        this.scene.add(ground);
    }
    
    createWater() {
        // Create water geometry
        const waterGeometry = new THREE.PlaneGeometry(50, 50);
        waterGeometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
        
        // Create water material
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4682B4, // Steel blue
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.3
        });
        
        // Create water mesh
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(50, 0.2, 50); // Position water at one corner
        water.receiveShadow = true;
        
        this.scene.add(water);
    }
    
    addEnvironmentObjects() {
        // Add trees
        this.addTrees();
        
        // Add rocks
        this.addRocks();
    }
    
    addTrees() {
        // Create tree trunk geometry
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
        
        // Create tree top geometry
        const topGeometry = new THREE.ConeGeometry(2, 4, 8);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green
        
        // Add multiple trees
        for (let i = 0; i < 20; i++) {
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            const top = new THREE.Mesh(topGeometry, topMaterial);
            
            // Position trunk
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            trunk.position.set(x, 1.5, z);
            
            // Position top above trunk
            top.position.set(x, 5, z);
            
            // Add shadows
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            top.castShadow = true;
            top.receiveShadow = true;
            
            this.scene.add(trunk);
            this.scene.add(top);
        }
    }
    
    addRocks() {
        // Create rock geometry
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080, // Gray
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Add multiple rocks
        for (let i = 0; i < 30; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Random position
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            
            // Random scale
            const scale = 0.5 + Math.random() * 1.5;
            rock.scale.set(scale, scale * 0.7, scale);
            
            // Random rotation
            rock.rotation.y = Math.random() * Math.PI * 2;
            rock.rotation.z = Math.random() * 0.2;
            
            // Position
            rock.position.set(x, scale * 0.3, z);
            
            // Add shadows
            rock.castShadow = true;
            rock.receiveShadow = true;
            
            this.scene.add(rock);
        }
    }
}