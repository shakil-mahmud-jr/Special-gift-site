/* ----------------------------------------------------
   3D Animated Birthday Celebration Engine
---------------------------------------------------- */

// Main Three.js Scene State
let mainScene, mainCamera, mainRenderer;
let balloons = [];
let rosePetals = [];
let champagneBubbles = [];
let constellationStars;
let giftBoxGroup, giftLidMesh;
let raycaster, mouse;
let currentTargetSlot = 1;
let isUnboxed = false;

// Smooth Mouse Parallax LERP State
let targetMouseX = 0, targetMouseY = 0;
let currentRotX = 0, currentRotY = 0;

// 3D Cake State
let cakeScene, cakeCamera, cakeRenderer;
let candleFlames = [];
let candleLights = [];
let candlesLit = true;

// 3D Photo Cube State
let cubeScene, cubeCamera, cubeRenderer, photoCubeMesh;
let isDraggingCube = false;
let previousMousePosition = { x: 0, y: 0 };
let cubeMaterials = [];

// Ticker State
let tickerIntervalId = null;

// Heartfelt Reasons Array
const loveReasons = [
  "Your radiant smile brightens up even my darkest days. ✨",
  "The way you care for everyone around you with so much warmth.",
  "Your beautiful laugh is my absolute favorite sound in the world. 💖",
  "How you make our house feel like a cozy, loving home.",
  "Your incredible intelligence, grace, and inner strength.",
  "The way your eyes crinkle when you laugh really hard.",
  "How you always know how to comfort me when I am stressed.",
  "Our cozy weekend mornings drinking coffee together. ☕",
  "Your endless patience, kindness, and understanding.",
  "How passionate you are about the things you love.",
  "Your gentle touch and how safe I feel in your arms.",
  "The unforgettable adventures and trips we have shared together. 🌅",
  "How you always believe in me even when I doubt myself.",
  "Your cute little habits and unique sense of humor. 😄",
  "The way you hold my hand when we walk together.",
  "Because you are my best friend, my soulmate, and my whole world. 👑"
];

// Spotlight Romantic Captions
const spotlightCaptions = {
  1: '"Forehead Kiss & Forever Love" 💋',
  2: '"Traditional Grace & Elegance" 👑',
  3: '"Side by Side Always & Forever" 💜',
  4: '"In your arms, I have found my home." ❤️',
  5: '"Walking Into Forever Together" 🌅',
  6: '"Our Endless Happiness & Joy" 💞'
};

// Expose functions globally
window.unboxSurprise = unboxSurprise;
window.updateAnniversaryDate = updateAnniversaryDate;
window.redeemCoupon = redeemCoupon;
window.scrollToSection = scrollToSection;
window.triggerPhotoUpload = triggerPhotoUpload;
window.closePhotoModal = closePhotoModal;
window.handleFileSelected = handleFileSelected;
window.switchSpotlightPhoto = switchSpotlightPhoto;
window.nextSpotlightPhoto = nextSpotlightPhoto;
window.togglePlayMusic = togglePlayMusic;
window.playBackgroundMusic = playBackgroundMusic;
window.switchParticleAtmosphere = switchParticleAtmosphere;
window.openTimeCapsule = openTimeCapsule;
window.closeTimeCapsule = closeTimeCapsule;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

// Initialize on DOM Ready with Try-Catch Isolation
document.addEventListener('DOMContentLoaded', () => {
  try { initMainThreeScene(); } catch (e) { console.error("Main scene error", e); }
  try { initCakeThreeScene(); } catch (e) { console.error("Cake scene error", e); }
  try { setupEventListeners(); } catch (e) { console.error("Events error", e); }
  try { loadSavedPhotos(); } catch (e) { console.error("Saved photos error", e); }
  try { initPhotoCubeScene(); } catch (e) { console.error("Photo cube error", e); }
  try { initLoveTicker(); } catch (e) { console.error("Love ticker error", e); }
  try { initPolaroidCorkboardWall(); } catch (e) { console.error("Corkboard wall error", e); }
});

/* Helper Function: Smooth Scroll to Any Section */
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ----------------------------------------------------
   1. MAIN CINEMATIC OPENING 3D SCENE (AURORA MAGENTA LIGHTING)
---------------------------------------------------- */
function initMainThreeScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  mainScene = new THREE.Scene();
  mainScene.fog = new THREE.FogExp2(0x1D0A24, 0.012);

  mainCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  mainCamera.position.set(0, 0, 15);

  try {
    mainRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    console.warn("WebGL Context Creation Failed", e);
    return;
  }

  mainRenderer.setSize(window.innerWidth, window.innerHeight);
  mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);

  const ambientLight = new THREE.AmbientLight(0x320F3B, 2.2);
  mainScene.add(ambientLight);

  const magentaSun = new THREE.DirectionalLight(0xFF2A85, 2.5);
  magentaSun.position.set(10, 25, 15);
  mainScene.add(magentaSun);

  const neonPinkGlow = new THREE.PointLight(0xEC4899, 3.2, 45);
  neonPinkGlow.position.set(-12, -8, 10);
  mainScene.add(neonPinkGlow);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  createRealistic3DBalloons();
  create3DRosePetals();
  create3DChampagneBubbles();
  createConstellationStars();
  create3DGiftBox();

  // Click Raycaster on 3D gift box
  canvas.addEventListener('click', (e) => {
    if (isUnboxed) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, mainCamera);
    const intersects = raycaster.intersectObjects(giftBoxGroup.children, true);
    if (intersects.length > 0) {
      unboxSurprise();
    }
  });

  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Floating 3D Balloons Physics (Rising Upward)
    balloons.forEach((b, i) => {
      b.position.y += b.userData.speed;
      b.position.x = b.userData.originalX + Math.sin(elapsedTime * 1.2 + b.userData.phase) * 0.4;
      b.rotation.y += 0.005;

      if (b.position.y > 22) {
        b.position.y = -18;
        b.position.x = (Math.random() - 0.5) * 32;
      }
    });

    // Floating 3D Rose Petals Physics (Drifting Downward)
    rosePetals.forEach((p, i) => {
      p.position.y -= p.userData.fallSpeed;
      p.position.x = p.userData.originalX + Math.sin(elapsedTime * 1.4 + p.userData.phase) * 0.5;

      if (p.position.y < -18) {
        p.position.y = 18;
        p.position.x = (Math.random() - 0.5) * 34;
      }
    });

    // 3D Champagne Bubbles Physics (Rising Upward)
    champagneBubbles.forEach((b, i) => {
      b.position.y += b.userData.riseSpeed;
      b.position.x = b.userData.originalX + Math.sin(elapsedTime * 1.8 + b.userData.phase) * 0.3;

      if (b.position.y > 20) {
        b.position.y = -18;
        b.position.x = (Math.random() - 0.5) * 32;
      }
    });

    if (constellationStars) {
      constellationStars.rotation.y = elapsedTime * 0.012;
    }

    if (giftBoxGroup && !isUnboxed) {
      giftBoxGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2;
      giftBoxGroup.position.y = -0.5 + Math.sin(elapsedTime * 2) * 0.2;
    }

    // Buttery Smooth Mouse Parallax LERP Interpolation
    if (!isUnboxed) {
      currentRotX += (targetMouseY * 8 - currentRotX) * 0.08;
      currentRotY += (targetMouseX * 8 - currentRotY) * 0.08;
      const cardWrapper = document.querySelector('.unboxing-card-wrapper');
      if (cardWrapper) {
        cardWrapper.style.transform = `rotateY(${currentRotY}deg) rotateX(${-currentRotX}deg)`;
      }
    }

    mainRenderer.render(mainScene, mainCamera);
  }
  animate();

  window.addEventListener('resize', onWindowResize);
}

/* Photorealistic 3D Metallic Balloons */
function createRealistic3DBalloons() {
  const balloonColors = [0xFF758C, 0xFFD700, 0xEC4899, 0xFF4D6D, 0xC084FC];
  const balloonGeo = new THREE.SphereGeometry(0.8, 32, 32);
  balloonGeo.scale(1, 1.25, 1);

  const knotGeo = new THREE.CylinderGeometry(0.12, 0.04, 0.2, 16);
  const stringMat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.6 });

  for (let i = 0; i < 18; i++) {
    const balloonGroup = new THREE.Group();
    const color = balloonColors[i % balloonColors.length];

    const balloonMat = new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95
    });

    const balloonMesh = new THREE.Mesh(balloonGeo, balloonMat);
    balloonGroup.add(balloonMesh);

    const knotMesh = new THREE.Mesh(knotGeo, balloonMat);
    knotMesh.position.y = -1.0;
    balloonGroup.add(knotMesh);

    const points = [new THREE.Vector3(0, -1.1, 0), new THREE.Vector3(0, -3.2, 0)];
    const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
    const stringLine = new THREE.Line(stringGeo, stringMat);
    balloonGroup.add(stringLine);

    const x = (Math.random() - 0.5) * 32;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 20 - 4;
    balloonGroup.position.set(x, y, z);

    const scale = 0.8 + Math.random() * 0.5;
    balloonGroup.scale.set(scale, scale, scale);

    balloonGroup.userData = {
      phase: Math.random() * Math.PI * 2,
      originalX: x,
      speed: 0.012 + Math.random() * 0.01
    };

    mainScene.add(balloonGroup);
    balloons.push(balloonGroup);
  }
}

function create3DRosePetals() {
  const petalCount = 28;
  const petalGeo = new THREE.PlaneGeometry(0.7, 0.9, 6, 6);
  const pos = petalGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3();
    v.fromBufferAttribute(pos, i);
    const dist = Math.sqrt(v.x * v.x + v.y * v.y);
    v.z = Math.sin(dist * 2.2) * 0.22;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  petalGeo.computeVertexNormals();

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xFF4D6D,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });

  for (let i = 0; i < petalCount; i++) {
    const petalMesh = new THREE.Mesh(petalGeo, petalMat);
    const x = (Math.random() - 0.5) * 34;
    const y = (Math.random() - 0.5) * 34;
    const z = (Math.random() - 0.5) * 20 - 2;
    petalMesh.position.set(x, y, z);

    const scale = 0.7 + Math.random() * 0.5;
    petalMesh.scale.set(scale, scale, scale);
    petalMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    petalMesh.userData = {
      phase: Math.random() * Math.PI * 2,
      originalX: x,
      fallSpeed: 0.012 + Math.random() * 0.01
    };

    mainScene.add(petalMesh);
    rosePetals.push(petalMesh);
  }
}

function create3DChampagneBubbles() {
  const bubbleCount = 20;
  const bubbleGeo = new THREE.SphereGeometry(0.28, 12, 12);
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8,
    clearcoat: 1.0
  });

  for (let i = 0; i < bubbleCount; i++) {
    const bubbleMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
    const x = (Math.random() - 0.5) * 32;
    const y = (Math.random() - 0.5) * 34;
    const z = (Math.random() - 0.5) * 18 - 3;
    bubbleMesh.position.set(x, y, z);

    const scale = 0.5 + Math.random() * 0.6;
    bubbleMesh.scale.set(scale, scale, scale);

    bubbleMesh.userData = {
      phase: Math.random() * Math.PI * 2,
      originalX: x,
      riseSpeed: 0.016 + Math.random() * 0.012
    };

    mainScene.add(bubbleMesh);
    champagneBubbles.push(bubbleMesh);
  }
}

function createConstellationStars() {
  const starCount = 280;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 40;
    positions[i + 1] = (Math.random() - 0.5) * 40;
    positions[i + 2] = (Math.random() - 0.5) * 28;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const radGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  radGrad.addColorStop(0, 'rgba(255, 215, 0, 1)');
  radGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.7)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.PointsMaterial({
    size: 0.65,
    map: texture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  constellationStars = new THREE.Points(geometry, material);
  mainScene.add(constellationStars);
}

function create3DGiftBox() {
  giftBoxGroup = new THREE.Group();
  const boxMat = new THREE.MeshPhysicalMaterial({ color: 0xFF4D6D, roughness: 0.25, metalness: 0.35, clearcoat: 1.0 });
  const boxBase = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), boxMat);
  boxBase.position.y = -1;
  giftBoxGroup.add(boxBase);

  const ribbonMat = new THREE.MeshPhysicalMaterial({ color: 0xFFD700, metalness: 0.95, roughness: 0.08 });
  const strap1 = new THREE.Mesh(new THREE.BoxGeometry(3.06, 2.26, 0.45), ribbonMat); strap1.position.y = -1;
  const strap2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.26, 3.06), ribbonMat); strap2.position.y = -1;
  giftBoxGroup.add(strap1); giftBoxGroup.add(strap2);

  giftLidMesh = new THREE.Group();
  const lidBase = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.5, 3.25), boxMat);
  giftLidMesh.add(lidBase);

  const bowKnot = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 16, 32), ribbonMat);
  bowKnot.rotation.x = Math.PI / 2; bowKnot.position.y = 0.42;
  giftLidMesh.add(bowKnot);

  giftLidMesh.position.y = 0.35;
  giftBoxGroup.add(giftLidMesh);
  giftBoxGroup.position.set(0, -0.5, 5);
  mainScene.add(giftBoxGroup);
}

/* ----------------------------------------------------
   2. ULTRA-PHOTOREALISTIC 3D LUXURY BIRTHDAY CAKE WITH WRITTEN PLAQUE
---------------------------------------------------- */
function initCakeThreeScene() {
  const container = document.getElementById('cake-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  cakeScene = new THREE.Scene();
  cakeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  cakeCamera.position.set(0, 3.2, 7.2);
  cakeCamera.lookAt(0, 1.1, 0);

  cakeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  cakeRenderer.setSize(container.clientWidth, container.clientHeight);
  cakeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(cakeRenderer.domElement);

  const ambient = new THREE.AmbientLight(0xFFF0F5, 1.8);
  cakeScene.add(ambient);

  const cakeSun = new THREE.DirectionalLight(0xFFD700, 2.2);
  cakeSun.position.set(6, 12, 6);
  cakeScene.add(cakeSun);

  const rimLight = new THREE.PointLight(0xFF4D6D, 2.0, 15);
  rimLight.position.set(-6, 4, -4);
  cakeScene.add(rimLight);

  const cakeGroup = new THREE.Group();

  // 1. Polished Gold Platter Base
  const platterMat = new THREE.MeshPhysicalMaterial({ color: 0xFFD700, metalness: 0.95, roughness: 0.08, clearcoat: 1.0 });
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.2, 0.15, 64), platterMat);
  platter.position.y = 0.07;
  cakeGroup.add(platter);

  // 2. Base Tier (Velvet Rose Pink Frosting)
  const tier1Mat = new THREE.MeshPhysicalMaterial({ color: 0xFF4D6D, roughness: 0.22, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.1 });
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.0, 64), tier1Mat);
  tier1.position.y = 0.65;
  cakeGroup.add(tier1);

  // 3. Top Tier (Vanilla Cream Frosting)
  const tier2Mat = new THREE.MeshPhysicalMaterial({ color: 0xFFF5E1, roughness: 0.18, metalness: 0.05, clearcoat: 0.95 });
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.85, 64), tier2Mat);
  tier2.position.y = 1.58;
  cakeGroup.add(tier2);

  // 3.5 CURVED PLAQUE BANNER WITH WRITTEN TEXT: "Happy Birthday To My Love, To My Princess 👑"
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 1024;
  plaqueCanvas.height = 256;
  const pCtx = plaqueCanvas.getContext('2d');

  // Deep rich magenta-gold gradient background for plaque
  const pGrad = pCtx.createLinearGradient(0, 0, 1024, 256);
  pGrad.addColorStop(0, '#2D0B38');
  pGrad.addColorStop(0.5, '#4A1157');
  pGrad.addColorStop(1, '#2D0B38');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 1024, 256);

  // Metallic Gold & Pink Border Frame
  pCtx.strokeStyle = '#FFD700';
  pCtx.lineWidth = 12;
  pCtx.strokeRect(10, 10, 1004, 236);

  pCtx.strokeStyle = '#FF69B4';
  pCtx.lineWidth = 4;
  pCtx.strokeRect(20, 20, 984, 216);

  // Handwritten Romantic Script Text
  pCtx.fillStyle = '#FFD700';
  pCtx.font = '700 52px "Great Vibes", cursive, sans-serif';
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  pCtx.fillText('Happy Birthday To My Love', 512, 85);

  pCtx.fillStyle = '#FFFFFF';
  pCtx.font = '700 46px "Great Vibes", cursive, sans-serif';
  pCtx.fillText('✨ To My Princess 👑 ✨', 512, 170);

  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTex.needsUpdate = true;

  // Curved Plaque Mesh positioned cleanly on front of base tier
  const plaqueGeo = new THREE.CylinderGeometry(2.02, 2.02, 0.55, 32, 1, true, -Math.PI / 3, (Math.PI / 3) * 2);
  const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, side: THREE.DoubleSide, transparent: true });
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.65;
  cakeGroup.add(plaqueMesh);

  // 4. White Cream Swirls Around Rim
  const creamSwirlMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.15, clearcoat: 1.0 });
  const swirlRing = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.07, 16, 64), creamSwirlMat);
  swirlRing.rotation.x = Math.PI / 2;
  swirlRing.position.y = 2.01;
  cakeGroup.add(swirlRing);

  // 5. Gold Leaf Pearls Decorating Both Tiers
  const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xFFD700, metalness: 0.95, roughness: 0.05 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const pearl1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), pearlMat);
    pearl1.position.set(Math.cos(a) * 1.36, 1.15, Math.sin(a) * 1.36);
    cakeGroup.add(pearl1);

    const pearl2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), pearlMat);
    pearl2.position.set(Math.cos(a) * 2.01, 0.16, Math.sin(a) * 2.01);
    cakeGroup.add(pearl2);
  }

  // 6. 5 Elegant White & Pink Spiral Candles
  const candlePositions = [
    { x: -0.55, z: 0 }, { x: 0.55, z: 0 },
    { x: 0, z: 0.55 }, { x: 0, z: -0.55 },
    { x: 0, z: 0 }
  ];

  const candleWaxMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
  const outerFlameMat = new THREE.MeshBasicMaterial({ color: 0xFF3300, transparent: true, opacity: 0.75 });

  candlePositions.forEach((pos) => {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16), candleWaxMat);
    candle.position.set(pos.x, 2.35, pos.z);
    cakeGroup.add(candle);

    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), wickMat);
    wick.position.set(pos.x, 2.75, pos.z);
    cakeGroup.add(wick);

    const flameGroup = new THREE.Group();
    const innerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 16), innerFlameMat);
    innerFlame.position.y = 0.13;
    flameGroup.add(innerFlame);

    const outerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 16), outerFlameMat);
    outerFlame.position.y = 0.15;
    flameGroup.add(outerFlame);

    flameGroup.position.set(pos.x, 2.8, pos.z);
    cakeGroup.add(flameGroup);
    candleFlames.push(flameGroup);

    const flameLight = new THREE.PointLight(0xFF8C00, 2.5, 3.5);
    flameLight.position.set(pos.x, 2.9, pos.z);
    cakeGroup.add(flameLight); 
    candleLights.push(flameLight);
  });

  cakeScene.add(cakeGroup);

  let cakeClock = new THREE.Clock();
  function animateCake() {
    requestAnimationFrame(animateCake);
    const t = cakeClock.getElapsedTime();
    cakeGroup.rotation.y = t * 0.25;

    if (candlesLit) {
      candleFlames.forEach((flame, idx) => {
        flame.scale.y = 1 + Math.sin(t * 12 + idx) * 0.18;
        flame.scale.x = 1 + Math.cos(t * 10 + idx) * 0.12;
        if (candleLights[idx]) {
          candleLights[idx].intensity = 2.0 + Math.sin(t * 15 + idx) * 0.5;
        }
      });
    }

    cakeRenderer.render(cakeScene, cakeCamera);
  }
  animateCake();
}

/* ----------------------------------------------------
   3. FEATURE: SPOTLIGHT PHOTO SWITCHER HELPER (SUPPORTS ALL 6 PHOTOS)
---------------------------------------------------- */
let currentSpotlightIdx = 1;

function switchSpotlightPhoto(photoIdx) {
  if (photoIdx < 1) photoIdx = 6;
  if (photoIdx > 6) photoIdx = 1;
  currentSpotlightIdx = photoIdx;

  const heroImg = document.getElementById('spotlight-hero-img');
  const captionEl = document.getElementById('spotlight-caption-text');
  const counterEl = document.getElementById('spotlight-counter-badge');
  const galleryImg = document.getElementById(`gallery-photo-${photoIdx}`);

  if (heroImg && galleryImg) {
    if (typeof gsap !== 'undefined') {
      gsap.to(heroImg, {
        opacity: 0.3, scale: 0.95, duration: 0.2,
        onComplete: () => {
          heroImg.src = galleryImg.src;
          if (captionEl && spotlightCaptions[photoIdx]) {
            captionEl.innerText = spotlightCaptions[photoIdx];
          }
          if (counterEl) counterEl.innerText = `${photoIdx} / 6`;
          gsap.to(heroImg, { opacity: 1, scale: 1, duration: 0.3 });
        }
      });
    } else {
      heroImg.src = galleryImg.src;
      if (captionEl && spotlightCaptions[photoIdx]) {
        captionEl.innerText = spotlightCaptions[photoIdx];
      }
      if (counterEl) counterEl.innerText = `${photoIdx} / 6`;
    }
  }

  // Highlight active pill button (1 to 6)
  for (let i = 1; i <= 6; i++) {
    const btn = document.getElementById(`spotlight-btn-${i}`);
    if (btn) {
      if (i === photoIdx) {
        btn.className = 'spotlight-pill-btn px-2.5 py-1 bg-pink-500 text-white rounded-full text-xs font-bold hover:bg-pink-600 transition-colors shadow-sm ring-2 ring-pink-400';
      } else {
        btn.className = 'spotlight-pill-btn px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold hover:bg-pink-500 hover:text-white transition-colors shadow-sm';
      }
    }
  }
}

function nextSpotlightPhoto(step) {
  switchSpotlightPhoto(currentSpotlightIdx + step);
}

/* ----------------------------------------------------
   4. FEATURE: 3D ROTATING PHOTO CUBE (DYNAMIC CANVAS PIXEL RENDERER)
---------------------------------------------------- */
function getCanvasTextureFromGalleryImg(slotIndex) {
  const canvas = document.createElement('canvas');
  const size = 1024; // 1024x1024 HD Texture Resolution
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fill dark background
  ctx.fillStyle = '#1D0A24';
  ctx.fillRect(0, 0, size, size);

  const imgEl = document.getElementById(`gallery-photo-${slotIndex}`);

  if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
    const nw = imgEl.naturalWidth;
    const nh = imgEl.naturalHeight;
    const aspect = nw / nh;

    let sx, sy, sWidth, sHeight;
    if (aspect > 1) {
      // Landscape: crop sides to keep center 1:1 square
      sHeight = nh;
      sWidth = nh;
      sx = (nw - sWidth) / 2;
      sy = 0;
    } else {
      // Portrait: crop top/bottom to keep center 1:1 square
      sWidth = nw;
      sHeight = nw;
      sx = 0;
      sy = (nh - sHeight) / 2;
    }

    // Enable high quality bicubic smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgEl, sx, sy, sWidth, sHeight, 0, 0, size, size);
  } else if (imgEl) {
    imgEl.addEventListener('load', () => {
      updateCubeTexturesFromGallery();
    }, { once: true });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  if (typeof cubeRenderer !== 'undefined' && cubeRenderer && cubeRenderer.capabilities) {
    tex.anisotropy = cubeRenderer.capabilities.getMaxAnisotropy();
  }
  tex.needsUpdate = true;
  return tex;
}

function updateCubeTexturesFromGallery() {
  if (!photoCubeMesh || !cubeMaterials.length) return;
  for (let i = 1; i <= 6; i++) {
    const newTex = getCanvasTextureFromGalleryImg(i);
    cubeMaterials[i - 1].map = newTex;
    cubeMaterials[i - 1].needsUpdate = true;
  }
}

function initPhotoCubeScene() {
  const canvas = document.getElementById('photo-cube-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const wrapper = canvas.parentElement;
  const w = wrapper ? wrapper.clientWidth : canvas.clientWidth;
  const h = wrapper ? wrapper.clientHeight : canvas.clientHeight;

  cubeScene = new THREE.Scene();
  cubeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  const initialCamZ = window.innerWidth < 640 ? 4.6 : 4.2;
  cubeCamera.position.set(0, 0, initialCamZ);
  cubeCamera.lookAt(0, 0, 0);

  cubeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  cubeRenderer.setSize(w, h);
  cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // True-color natural lighting (1.0 intensity, zero color distortion)
  const ambient = new THREE.AmbientLight(0xFFFFFF, 1.0);
  cubeScene.add(ambient);

  cubeMaterials = [];
  for (let i = 1; i <= 6; i++) {
    const tex = getCanvasTextureFromGalleryImg(i);
    // MeshBasicMaterial preserves 100% exact original photo colors without harsh specular lighting washed-out effects!
    cubeMaterials.push(new THREE.MeshBasicMaterial({ map: tex }));
  }

  const geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  photoCubeMesh = new THREE.Mesh(geometry, cubeMaterials);
  photoCubeMesh.position.set(0, 0, 0);
  cubeScene.add(photoCubeMesh);

  canvas.addEventListener('mousedown', (e) => { isDraggingCube = true; previousMousePosition = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDraggingCube || !photoCubeMesh) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    photoCubeMesh.rotation.y += deltaX * 0.008;
    photoCubeMesh.rotation.x += deltaY * 0.008;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => { isDraggingCube = false; });

  canvas.addEventListener('touchstart', (e) => { 
    isDraggingCube = true; 
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }; 
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDraggingCube || !photoCubeMesh) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    photoCubeMesh.rotation.y += deltaX * 0.008;
    photoCubeMesh.rotation.x += deltaY * 0.008;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  
  window.addEventListener('touchend', () => { isDraggingCube = false; });

  function animateCube() {
    requestAnimationFrame(animateCube);
    if (!isDraggingCube && photoCubeMesh) {
      photoCubeMesh.rotation.y += 0.004;
      photoCubeMesh.rotation.x += 0.002;
    }
    cubeRenderer.render(cubeScene, cubeCamera);
  }
  animateCube();

  setTimeout(updateCubeTexturesFromGallery, 600);
}

/* ----------------------------------------------------
   5. FEATURE: LOVE TICKER ("COUNTING EVERY SECOND SINCE MARCH 23, 2020")
---------------------------------------------------- */
function initLoveTicker() {
  const defaultDate = '2020-03-23';
  const savedDate = localStorage.getItem('wife_bday_anniversary_date') || defaultDate;
  const dateInput = document.getElementById('anniversary-date-input');
  if (dateInput) dateInput.value = savedDate;

  startLoveTicker(savedDate);
}

function updateAnniversaryDate(newDate) {
  if (!newDate) return;
  try { localStorage.setItem('wife_bday_anniversary_date', newDate); } catch (e) {}
  startLoveTicker(newDate);
}

function startLoveTicker(startDateStr) {
  if (tickerIntervalId) clearInterval(tickerIntervalId);

  let startDate;
  if (typeof startDateStr === 'string' && startDateStr.includes('-')) {
    const parts = startDateStr.split('-');
    if (parts.length === 3) {
      startDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      startDate = new Date(startDateStr);
    }
  } else {
    startDate = new Date(startDateStr);
  }

  if (isNaN(startDate.getTime())) return;

  function updateTicker() {
    const now = new Date();
    const diffMs = now - startDate;

    if (diffMs < 0) return;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    const secs = Math.floor((diffMs / 1000) % 60);

    const dEl = document.getElementById('ticker-days');
    const hEl = document.getElementById('ticker-hours');
    const mEl = document.getElementById('ticker-mins');
    const sEl = document.getElementById('ticker-secs');

    if (dEl) dEl.innerText = String(days).padStart(2, '0');
    if (hEl) hEl.innerText = String(hours).padStart(2, '0');
    if (mEl) mEl.innerText = String(mins).padStart(2, '0');
    if (sEl) sEl.innerText = String(secs).padStart(2, '0');
  }

  updateTicker();
  tickerIntervalId = setInterval(updateTicker, 1000);
}



/* ----------------------------------------------------
   7. FEATURE: REDEEMABLE LOVE COUPONS (ALWAYS RESTART UNCLAIMED ON LOAD)
---------------------------------------------------- */
function redeemCoupon(couponId) {
  const couponCard = document.getElementById(`coupon-${couponId}`);
  if (couponCard) {
    couponCard.classList.add('redeemed');
    const btn = couponCard.querySelector('.redeem-btn');
    if (btn) btn.innerText = "Claimed / Redeemed! ✨";
    
    triggerConfettiFireworks();
  }
}

function loadSavedCoupons() {
  for (let i = 1; i <= 6; i++) {
    try { localStorage.removeItem(`wife_bday_coupon_${i}`); } catch (e) {}
    const couponCard = document.getElementById(`coupon-${i}`);
    if (couponCard) {
      couponCard.classList.remove('redeemed');
      const btn = couponCard.querySelector('.redeem-btn');
      if (btn) btn.innerText = "Redeem Coupon ✨";
    }
  }
}

/* ----------------------------------------------------
   8. FEATURE: 100 REASONS WHY I LOVE YOU (JAR)
---------------------------------------------------- */
function setupJarOfReasons() {
  const drawBtn = document.getElementById('draw-reason-btn');
  const display = document.getElementById('reason-display');

  if (drawBtn && display) {
    drawBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const randomReason = loveReasons[Math.floor(Math.random() * loveReasons.length)];
      
      if (typeof gsap !== 'undefined') {
        gsap.to(display, {
          opacity: 0, scale: 0.9, duration: 0.2,
          onComplete: () => {
            display.innerText = `"${randomReason}"`;
            gsap.to(display, { opacity: 1, scale: 1, duration: 0.3 });
          }
        });
      } else {
        display.innerText = `"${randomReason}"`;
      }

      if (typeof confetti === 'function') {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      }
    });
  }
}

/* ----------------------------------------------------
   9. BULLETPROOF ASYNC IMAGE LOADER HELPER
---------------------------------------------------- */
function loadCanvasImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ----------------------------------------------------
   10. GRAND RECTANGULAR & SQUARE LUXURY 3-PHOTO WALLPAPER ENGINE (ZERO CLIPPING / ZERO CROPPING)
---------------------------------------------------- */
function setupWallpaperGenerator() {
  const btn = document.getElementById('download-wallpaper-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.innerText = "⏳ Generating Masterpiece Wallpaper...";
    btn.style.opacity = '0.7';

    // Fetch real couple photo sources natively from images/ directory or DOM
    const src1 = document.getElementById('gallery-photo-1')?.src || 'images/photo1.jpg'; // Forehead Kiss
    const src2 = document.getElementById('gallery-photo-4')?.src || 'images/photo4.jpg'; // Rooftop lift hug hero
    const src3 = document.getElementById('gallery-photo-3')?.src || 'images/photo3.jpg'; // Navy suit & purple veil

    // Await Promise Load of All 3 Images (Guarantees zero missing photos!)
    const [img1, img2, img3] = await Promise.all([
      loadCanvasImage(src1),
      loadCanvasImage(src2),
      loadCanvasImage(src3)
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // 1. Deep Aurora Magenta Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#1D0A24');
    grad.addColorStop(0.35, '#3B1046');
    grad.addColorStop(0.75, '#1E0727');
    grad.addColorStop(1, '#0C0312');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Golden Bokeh Spheres & Ambient Dust Particles
    for (let i = 0; i < 50; i++) {
      const bx = Math.random() * 1080;
      const by = Math.random() * 1920;
      const br = 15 + Math.random() * 70;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bGrad.addColorStop(0, 'rgba(255, 215, 0, 0.28)');
      bGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.15)');
      bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }

    // 3. Double Metallic Gold & Rose Foil Outer Border Frame
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 14;
    ctx.strokeRect(50, 50, 980, 1820);

    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 70, 940, 1780);

    // 4. Header Calligraphy & Crown Badge
    ctx.fillStyle = '#EC4899';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑 AUGUST 27TH • HAPPY BIRTHDAY MY PRINCESS 👑', 540, 140);

    const name = localStorage.getItem('wife_bday_name') || 'My Princess';
    ctx.fillStyle = '#FFD700';
    ctx.font = '800 88px "Playfair Display", serif';
    ctx.fillText(name + ' ✨', 540, 240);

    ctx.fillStyle = '#F7E7CE';
    ctx.font = 'italic 52px "Great Vibes", cursive';
    ctx.fillText('For My Dearest Wife...', 540, 315);

    // 5. TOP SIDE-BY-SIDE TILTED SQUARE POLAROID CARDS (Y: 380–760)
    // Left Square Polaroid Frame (`photo1.jpg` - Forehead Kiss)
    ctx.save();
    ctx.translate(290, 560);
    ctx.rotate(-0.12);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 25;

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-195, -175, 390, 350);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-185, -165, 370, 330);

    ctx.save();
    ctx.beginPath(); ctx.rect(-175, -155, 350, 260); ctx.clip();
    if (img1) {
      ctx.drawImage(img1, -175, -155, 350, 260);
    } else {
      ctx.fillStyle = '#1D0A24'; ctx.fillRect(-175, -155, 350, 260);
    }
    ctx.restore();

    ctx.fillStyle = '#EC4899';
    ctx.font = '700 24px "Great Vibes", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Forehead Kiss 💋', 0, 142);
    ctx.restore();

    // Right Square Polaroid Frame (`photo3.jpg` - Navy Suit & Purple Veil)
    ctx.save();
    ctx.translate(790, 560);
    ctx.rotate(0.12);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 25;

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-195, -175, 390, 350);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-185, -165, 370, 330);

    ctx.save();
    ctx.beginPath(); ctx.rect(-175, -155, 350, 260); ctx.clip();
    if (img3) {
      ctx.drawImage(img3, -175, -155, 350, 260);
    } else {
      ctx.fillStyle = '#1D0A24'; ctx.fillRect(-175, -155, 350, 260);
    }
    ctx.restore();

    ctx.fillStyle = '#EC4899';
    ctx.font = '700 24px "Great Vibes", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Side By Side Always 💜', 0, 142);
    ctx.restore();

    // 6. GRAND CENTER RECTANGULAR POLAROID HERO CARD (Y: 770–1370)
    ctx.save();
    ctx.translate(540, 1070);
    ctx.shadowColor = 'rgba(236, 72, 153, 0.9)';
    ctx.shadowBlur = 45;

    // Gold Outer Foil Border
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.roundRect(-370, -290, 740, 580, 28);
    ctx.fill();

    // Neon Pink Foil Border
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.roundRect(-362, -282, 724, 564, 24);
    ctx.fill();

    // White Crisp Polaroid Inner Box
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-354, -274, 708, 548, 20);
    ctx.fill();

    // Hero Rectangular Photo Window (`photo4.jpg` - Rooftop Lift Hug)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-340, -260, 680, 460, 16);
    ctx.clip();

    if (img2) {
      // Cover fit calculation
      const aspect = img2.width / img2.height;
      let dw = 680, dh = 460, dx = -340, dy = -230;
      if (aspect > (680 / 460)) {
        dw = 460 * aspect;
        dx = -dw / 2;
      } else {
        dh = 680 / aspect;
        dy = -dh / 2;
      }
      ctx.drawImage(img2, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#240D2E'; ctx.fillRect(-340, -260, 680, 460);
    }
    ctx.restore();

    // Bottom Romantic Script Badge
    ctx.fillStyle = '#EC4899';
    ctx.font = '700 40px "Great Vibes", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('"In Your Arms, I Have Found My Home" ❤️', 0, 245);
    ctx.restore();

    // 7. Sentimental Love Ticker Stats Banner (Y: 1400–1590)
    ctx.fillStyle = 'rgba(36, 13, 46, 0.95)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(140, 1400, 800, 185, 30);
    ctx.fill();
    ctx.stroke();

    const daysText = document.getElementById('ticker-days')?.innerText || '2347';
    ctx.fillStyle = '#FFD700';
    ctx.font = '800 64px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💖 ${daysText} Days Of Pure Love 💖`, 540, 1475);

    ctx.fillStyle = '#F7E7CE';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Counting Every Second Since March 23, 2020 ⏳', 540, 1535);

    // 8. Romantic Quote & Signature (Y: 1640–1760)
    ctx.fillStyle = '#F7E7CE';
    ctx.font = 'italic 36px "Playfair Display", serif';
    ctx.fillText('"In all the world, there is no heart for me like yours."', 540, 1650);

    ctx.fillStyle = '#EC4899';
    ctx.font = '700 66px "Great Vibes", cursive';
    ctx.fillText('Forever & Always Yours ❤️', 540, 1740);

    // Download Masterpiece PNG
    const link = document.createElement('a');
    link.download = `Grand_Masterpiece_Wallpaper_${name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    btn.innerText = "📸 Download Grand Mobile Wallpaper Card";
    btn.style.opacity = '1.0';
  });
}

/* ----------------------------------------------------
   11. UNBOXING SURPRISE ANIMATION TRIGGER (BULLETPROOF)
---------------------------------------------------- */
/* ----------------------------------------------------
   AUDIO CONTROL ENGINE
---------------------------------------------------- */
let isMusicPlaying = false;

function playBackgroundMusic() {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;
  audio.volume = 0.6;
  audio.play().then(() => {
    isMusicPlaying = true;
    updateMusicUI();
  }).catch((err) => {
    console.log("Audio play postponed until user click:", err);
  });
}

function pauseBackgroundMusic() {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;
  audio.pause();
  isMusicPlaying = false;
  updateMusicUI();
}

function togglePlayMusic() {
  if (isMusicPlaying) {
    pauseBackgroundMusic();
  } else {
    playBackgroundMusic();
  }
}

function updateMusicUI() {
  const vinylDisc = document.getElementById('vinylDisc');
  const playIcon = document.getElementById('playIcon');
  const musicStatusText = document.getElementById('musicStatusText');

  if (vinylDisc) vinylDisc.classList.toggle('paused', !isMusicPlaying);
  if (playIcon) playIcon.innerText = isMusicPlaying ? '⏸️' : '▶️';
  if (musicStatusText) {
    musicStatusText.innerText = isMusicPlaying ? 'Now Playing 💕' : 'Click to Play Music';
    musicStatusText.classList.toggle('text-pink-300', isMusicPlaying);
  }
}

function unboxSurprise() {
  if (isUnboxed) return;
  isUnboxed = true;

  playBackgroundMusic();

  if (typeof gsap !== 'undefined' && giftLidMesh && giftBoxGroup) {
    gsap.timeline()
      .to(giftLidMesh.position, { y: 3.5, duration: 0.8, ease: "power2.out" })
      .to(giftLidMesh.rotation, { x: -Math.PI / 3, z: Math.PI / 4, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .to(giftBoxGroup.position, { y: -10, opacity: 0, duration: 1, ease: "power2.in" }, "+=0.2");
  }

  const overlay = document.getElementById('unboxing-overlay');
  const mainHub = document.getElementById('main-hub');
  const navbar = document.querySelector('.navbar');

  if (overlay) {
    overlay.classList.add('hidden');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400);
  }
  if (mainHub) mainHub.classList.add('visible');
  if (navbar) navbar.classList.add('visible');

  triggerConfettiFireworks();
}

function blowOutCandles() {
  if (!candlesLit) return;
  candlesLit = false;

  if (typeof gsap !== 'undefined') {
    candleFlames.forEach(flame => gsap.to(flame.scale, { x: 0, y: 0, z: 0, duration: 0.5 }));
    candleLights.forEach(light => gsap.to(light, { intensity: 0, duration: 0.5 }));
  }

  const wishStatus = document.getElementById('wish-status-text');
  const btn = document.getElementById('blow-candles-btn');
  
  if (btn) {
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
    const textSpan = btn.querySelector('.btn-text');
    if (textSpan) textSpan.innerText = '✨ Candles Blown! Wish Granted! ✨';
  }

  if (wishStatus) wishStatus.classList.add('visible');
  triggerConfettiFireworks();
}

function triggerConfettiFireworks() {
  if (typeof confetti !== 'function') return;

  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    
    confetti({ particleCount: Math.floor(particleCount), spread: 80, origin: { x: 0.1, y: 0.6 }, colors: ['#FF758C', '#FF4D6D', '#EC4899', '#FFD700'] });
    confetti({ particleCount: Math.floor(particleCount), spread: 80, origin: { x: 0.9, y: 0.6 }, colors: ['#FF758C', '#FF4D6D', '#EC4899', '#FFD700'] });
  }, 250);
}

function triggerPhotoUpload(slotIndex) {
  currentTargetSlot = slotIndex;
  const modal = document.getElementById('photo-upload-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}

function closePhotoModal() {
  const modal = document.getElementById('photo-upload-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const imgEl = document.getElementById(`gallery-photo-${currentTargetSlot}`);
    if (imgEl) {
      imgEl.src = dataUrl;
      try { localStorage.setItem(`wife_bday_photo_${currentTargetSlot}`, dataUrl); } catch (err) {}
    }
    updateCubeTexturesFromGallery();
    closePhotoModal();
  };
  reader.readAsDataURL(file);
}

function loadSavedPhotos() {
  for (let i = 1; i <= 6; i++) {
    const saved = localStorage.getItem(`wife_bday_photo_${i}`);
    if (saved) {
      const imgEl = document.getElementById(`gallery-photo-${i}`);
      if (imgEl) imgEl.src = saved;
    }
  }

  const savedName = localStorage.getItem('wife_bday_name');
  if (savedName) {
    const nameEl = document.getElementById('display-wife-name');
    if (nameEl) nameEl.innerText = savedName;
  }

  loadSavedCoupons();
  updateCubeTexturesFromGallery();
}

function setupEventListeners() {
  const openBoxBtn = document.getElementById('open-box-btn');
  if (openBoxBtn) openBoxBtn.addEventListener('click', unboxSurprise);

  const blowBtn = document.getElementById('blow-candles-btn');
  if (blowBtn) blowBtn.addEventListener('click', blowOutCandles);

  const uploadBtn = document.getElementById('upload-modal-btn');
  if (uploadBtn) uploadBtn.addEventListener('click', () => triggerPhotoUpload(1));

  setupJarOfReasons();
  setupWallpaperGenerator();

  const nameEl = document.getElementById('display-wife-name');
  if (nameEl) {
    nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nameEl.blur();
      }
    });
    nameEl.addEventListener('blur', () => {
      const cleanName = nameEl.innerText.trim().slice(0, 30);
      nameEl.innerText = cleanName || 'My Princess';
      localStorage.setItem('wife_bday_name', nameEl.innerText);
    });
  }

  // Smooth LERP Target Mouse Trackers
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      targetMouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (touch.clientY / window.innerHeight) * 2 - 1;
    }
  }, { passive: true });
}

function onWindowResize() {
  if (mainCamera && mainRenderer) {
    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  const container = document.getElementById('cake-canvas-container');
  if (container && cakeCamera && cakeRenderer) {
    cakeCamera.aspect = container.clientWidth / container.clientHeight;
    cakeCamera.updateProjectionMatrix();
    cakeRenderer.setSize(container.clientWidth, container.clientHeight);
  }

  const cubeCanvas = document.getElementById('photo-cube-canvas');
  if (cubeCanvas && cubeCamera && cubeRenderer) {
    const wrapper = cubeCanvas.parentElement;
    if (wrapper) {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      cubeCamera.aspect = w / h;
      cubeCamera.position.z = window.innerWidth < 640 ? 4.6 : 4.2;
      cubeCamera.updateProjectionMatrix();
      cubeRenderer.setSize(w, h);
    }
  }
}

/* ----------------------------------------------------
   ATMOSPHERIC PARTICLE SYSTEM SWITCHER (HEARTS, ROSES, SAKURA, GOLD)
---------------------------------------------------- */
function switchParticleAtmosphere(mode) {
  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach((btn) => {
    btn.classList.remove('bg-pink-500/20', 'ring-2', 'ring-pink-400');
    if (btn.dataset.mode === mode) {
      btn.classList.add('bg-pink-500/20', 'ring-2', 'ring-pink-400');
    }
  });

  if (rosePetals && rosePetals.length) {
    rosePetals.forEach(p => p.visible = (mode === 'rose' || mode === 'hearts'));
  }
  if (champagneBubbles && champagneBubbles.length) {
    champagneBubbles.forEach(b => b.visible = (mode === 'gold' || mode === 'sakura'));
  }

  triggerConfettiFireworks();
}

/* ----------------------------------------------------
   POLAROID CORKBOARD DRAG MECHANICS
---------------------------------------------------- */
function initPolaroidCorkboardWall() {
  const wall = document.getElementById('corkboard-wall');
  if (!wall) return;

  const cards = wall.querySelectorAll('.polaroid-drag-card');
  cards.forEach((card) => {
    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    const onPointerDown = (e) => {
      isDragging = false;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      startX = clientX;
      startY = clientY;
      initialLeft = card.offsetLeft;
      initialTop = card.offsetTop;

      const onPointerMove = (moveEvt) => {
        const moveX = moveEvt.clientX || (moveEvt.touches && moveEvt.touches[0].clientX);
        const moveY = moveEvt.clientY || (moveEvt.touches && moveEvt.touches[0].clientY);
        const dx = moveX - startX;
        const dy = moveY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isDragging = true;
          const wallWidth = wall.clientWidth;
          const wallHeight = wall.clientHeight;
          const cardWidth = card.offsetWidth;
          const cardHeight = card.offsetHeight;

          let newLeft = Math.max(0, Math.min(initialLeft + dx, wallWidth - cardWidth));
          let newTop = Math.max(0, Math.min(initialTop + dy, wallHeight - cardHeight));

          card.style.left = `${newLeft}px`;
          card.style.top = `${newTop}px`;
        }
      };

      const onPointerUp = () => {
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
      };

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove);
      document.addEventListener('touchend', onPointerUp);
    };

    card.addEventListener('mousedown', onPointerDown);
    card.addEventListener('touchstart', onPointerDown, { passive: true });
  });
}

/* ----------------------------------------------------
   TIME CAPSULE LETTERS MODAL ENGINE
---------------------------------------------------- */
const capsuleLettersData = {
  miss: {
    title: 'Open When You Miss Me ❤️',
    body: 'Remember that distance is just a temporary space between two hearts that belong together.\n\nClose your eyes, take a deep breath, and feel how deeply you are loved. I am thinking of you right now and can’t wait to hold you in my arms!'
  },
  hug: {
    title: 'Open When You Need A Warm Hug 🤗',
    body: 'Sending you the warmest, tightest, sweetest virtual hug right now!\n\nYou are safe, deeply appreciated, and so incredibly special. Take a pause, smile, and wrap yourself in this giant hug from me.'
  },
  birthday: {
    title: 'Open On Your Birthday 🎉',
    body: 'Happy Birthday to my absolute favorite person in the entire universe!\n\nToday is all about celebrating you, your beautiful soul, your radiant smile, and all the endless joy you bring into my world. May this new year of your life be filled with love, laughter, success, and magical moments together!'
  },
  anniversary: {
    title: 'Open On Our Anniversary 🥂',
    body: 'Happy Anniversary, my love!\n\nEvery single year with you feels like a priceless gift. Thank you for being my lover, my best friend, and my favorite part of every day. Here’s to forever together!'
  },
  tough: {
    title: 'Open On A Tough Day 🌸',
    body: 'You are so strong, resilient, and amazingly capable.\n\nWhatever challenge today brings, remember that this too shall pass. I believe in you with all my heart, and I am right here by your side always.'
  }
};

function openTimeCapsule(type) {
  const modal = document.getElementById('timecapsule-modal');
  const titleEl = document.getElementById('capsule-modal-title');
  const bodyEl = document.getElementById('capsule-modal-body');
  const data = capsuleLettersData[type];

  if (modal && data) {
    if (titleEl) titleEl.innerText = data.title;
    if (bodyEl) bodyEl.innerText = data.body;
    modal.style.display = 'flex';
    modal.classList.add('active');
    triggerConfettiFireworks();
  }
}

function closeTimeCapsule() {
  const modal = document.getElementById('timecapsule-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

/* ----------------------------------------------------
   FULLSCREEN PHOTO LIGHTBOX ENGINE
---------------------------------------------------- */
const galleryCaptions = {
  1: 'Forehead Kiss & Forever Love 💋',
  2: 'Traditional Grace & Elegance 👑',
  3: 'Side by Side Always & Forever 💜',
  4: 'Swept Off Your Feet & Deeply Loved ✨',
  5: 'Walking Into Forever Together 🌅',
  6: 'Our Endless Happiness & Joy 💞'
};

function openLightbox(slotIndex) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const galleryImg = document.getElementById(`gallery-photo-${slotIndex}`);

  if (modal && img && galleryImg) {
    img.src = galleryImg.src;
    if (caption) caption.innerText = galleryCaptions[slotIndex] || 'Our Sweet Memory ❤️';
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}
