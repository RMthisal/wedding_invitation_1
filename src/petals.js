import * as THREE from 'three';

export function initPetals(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const scene = new THREE.Scene();
  
  // Fog for depth blur effect
  scene.fog = new THREE.FogExp2(0xFFFDF8, 0.03); // Ivory white fog

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Petal Geometry (Curved plane to look like a petal)
  const petalGeometry = new THREE.PlaneGeometry(0.3, 0.5, 4, 4);
  const position = petalGeometry.attributes.position;
  // Curl the petal
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    // basic curvature
    const z = Math.sin(x * Math.PI) * 0.1 + Math.cos(y * Math.PI) * 0.1;
    position.setZ(i, z);
  }
  petalGeometry.computeVertexNormals();

  // Materials for variation
  const materials = [
    new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), // White
    new THREE.MeshLambertMaterial({ color: 0xF8E1E7, side: THREE.DoubleSide }), // Blush
    new THREE.MeshLambertMaterial({ color: 0xDDE8D5, side: THREE.DoubleSide }), // Sage Leaf
    new THREE.MeshLambertMaterial({ color: 0xD8C3A5, side: THREE.DoubleSide })  // Gold Dust
  ];

  const particlesCount = 200;
  const particles = [];

  for (let i = 0; i < particlesCount; i++) {
    const materialIndex = i % materials.length;
    let mesh;
    
    // Make gold dust much smaller
    if (materialIndex === 3) {
      const dustGeo = new THREE.CircleGeometry(0.05, 8);
      mesh = new THREE.Mesh(dustGeo, materials[materialIndex]);
    } else {
      mesh = new THREE.Mesh(petalGeometry, materials[materialIndex]);
    }

    // Randomize initial positions
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 20;

    // Randomize initial rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;

    // Randomize scale slightly
    const scale = Math.random() * 0.5 + 0.5;
    mesh.scale.set(scale, scale, scale);

    // Custom properties for animation
    mesh.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        -Math.random() * 0.02 - 0.01, // falling down
        (Math.random() - 0.5) * 0.01
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      timeOffset: Math.random() * Math.PI * 2
    };

    scene.add(mesh);
    particles.push(mesh);
  }

  // Animation Loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    particles.forEach(p => {
      // Move position
      p.position.add(p.userData.velocity);

      // Add sine wave wind wobble to x and z
      p.position.x += Math.sin(time * p.userData.wobbleSpeed + p.userData.timeOffset) * 0.01;
      p.position.z += Math.cos(time * p.userData.wobbleSpeed * 0.5 + p.userData.timeOffset) * 0.01;

      // Rotate
      p.rotation.x += p.userData.rotationSpeed.x;
      p.rotation.y += p.userData.rotationSpeed.y;
      p.rotation.z += p.userData.rotationSpeed.z;

      // Wrap around bounds
      if (p.position.y < -15) p.position.y = 15;
      if (p.position.y > 15) p.position.y = -15;
      if (p.position.x < -20) p.position.x = 20;
      if (p.position.x > 20) p.position.x = -20;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
