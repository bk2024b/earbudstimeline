'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function getBrandIdentity(journey) {
  const key = `${journey.id || ''} ${journey.name || ''}`.toLowerCase();
  const identities = [
    { match: ['apple'], bg: '#F4F4F2', panel: '#E8E8E5', text: '#111111', muted: '#686865', accent: '#111111' },
    { match: ['sony'], bg: '#10151D', panel: '#18212D', text: '#F5F7FA', muted: '#8D99A8', accent: '#6EA8FF' },
    { match: ['samsung'], bg: '#0D1B33', panel: '#132B50', text: '#F4F8FF', muted: '#91A6C5', accent: '#6EA8FF' },
    { match: ['jbl'], bg: '#19130E', panel: '#2A1C12', text: '#FFF8EF', muted: '#BCA58E', accent: '#FF8A2A' },
    { match: ['bose'], bg: '#E9E6DF', panel: '#DCD8D0', text: '#161616', muted: '#706D67', accent: '#111111' },
    { match: ['google'], bg: '#F2F3F5', panel: '#E4E7EB', text: '#202124', muted: '#70757A', accent: '#4285F4' },
    { match: ['nothing'], bg: '#ECECEA', panel: '#DCDCD8', text: '#111111', muted: '#6B6B67', accent: '#E53935' },
    { match: ['beats'], bg: '#171113', panel: '#27191E', text: '#FFF5F6', muted: '#B49CA2', accent: '#FF365F' },
    { match: ['oneplus'], bg: '#1B1110', panel: '#2A1715', text: '#FFF5F2', muted: '#B99A92', accent: '#F04438' },
    { match: ['xiaomi'], bg: '#19120D', panel: '#2A1B12', text: '#FFF7F0', muted: '#B79E8C', accent: '#FF6900' },
  ];

  return identities.find((identity) => identity.match.some((term) => key.includes(term))) || {
    bg: '#151619',
    panel: '#202125',
    text: '#F5F5F5',
    muted: '#96989E',
    accent: journey.color || '#AAB0B8',
  };
}

function createCardTexture(journey, isFr) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 820;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const identity = getBrandIdentity(journey);
  const grad = ctx.createLinearGradient(0, 0, 640, 820);
  grad.addColorStop(0, identity.bg);
  grad.addColorStop(0.58, identity.bg);
  grad.addColorStop(1, identity.panel);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 820);

  // Double editorial frame: the card feels like a collectible archive object.
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 620, 800);
  ctx.strokeStyle = identity.accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, 596, 776);
  ctx.globalAlpha = 1;

  ctx.fillStyle = identity.accent;
  ctx.fillRect(44, 48, 86, 7);

  const logoX = 48;
  const logoY = 92;
  const logoSize = 150;
  ctx.fillStyle = identity.panel;
  ctx.strokeStyle = identity.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 28);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Brand image, with initials as a resilient fallback.
  ctx.fillStyle = identity.accent;
  ctx.font = '700 52px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((journey.name || 'BT').slice(0, 2).toUpperCase(), logoX + logoSize / 2, logoY + logoSize / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (journey.imageUrl) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX + 10, logoY + 10, logoSize - 20, logoSize - 20, 20);
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(logoX + 10, logoY + 10, logoSize - 20, logoSize - 20);
      const ratio = Math.min((logoSize - 20) / image.width, (logoSize - 20) / image.height);
      const drawW = image.width * ratio;
      const drawH = image.height * ratio;
      ctx.drawImage(image, logoX + logoSize / 2 - drawW / 2, logoY + logoSize / 2 - drawH / 2, drawW, drawH);
      ctx.restore();
      texture.needsUpdate = true;
    };
    image.onerror = () => {};
    image.src = journey.imageUrl;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = identity.muted;
  ctx.font = '700 16px "IBM Plex Mono", monospace';
  ctx.fillText(isFr ? 'BRAND ARCHIVE' : 'BRAND ARCHIVE', 48, 305);

  ctx.fillStyle = identity.text;
  ctx.font = '700 58px "Space Grotesk", sans-serif';
  ctx.fillText(journey.name || 'Brand', 48, 610);

  ctx.fillStyle = identity.muted;
  ctx.font = '20px "IBM Plex Mono", monospace';
  ctx.fillText(`${journey.totalCount || 0} ${isFr ? 'modèles' : 'models'}`, 48, 652);
  ctx.fillText(`${journey.periodStart} — ${journey.periodEnd}`, 48, 684);

  ctx.fillStyle = identity.accent;
  ctx.font = '700 14px "IBM Plex Mono", monospace';
  ctx.fillText(isFr ? 'CHRONOLOGIE HARDWARE' : 'HARDWARE TIMELINE', 48, 754);

  return texture;
}

export default function Explore3DCanvas({ journeys, activeIndex, onActiveIndexChange, onOpenHistory, locale = 'fr' }) {
  const containerRef = useRef(null);
  const stateRef = useRef({ activeIndex, targetAngle: 0, currentAngle: 0, isDragging: false, startX: 0, startAngle: 0, pointerVelocity: 0, lastX: 0, lastTime: 0 });
  stateRef.current.activeIndex = activeIndex;

  useEffect(() => {
    if (!journeys.length) return;
    stateRef.current.targetAngle = -(activeIndex * (2 * Math.PI / journeys.length));
  }, [activeIndex, journeys.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !journeys.length) return undefined;
    const count = journeys.length;
    const isFr = locale !== 'en';
    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isMobile ? 40 : 45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.15, isMobile ? 4.8 : 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const whiteKeyLight = new THREE.SpotLight(0xffffff, 3.2, 12, Math.PI / 4, 0.5, 1.1);
    whiteKeyLight.position.set(0, 2.5, 4);
    whiteKeyLight.target.position.set(0, 0, 0);
    scene.add(whiteKeyLight, whiteKeyLight.target);
    const rimLight = new THREE.PointLight(0x8a8f98, 1.1, 8);
    rimLight.position.set(0, -1, 1);
    scene.add(rimLight);

    const starCount = isMobile ? 450 : 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 20;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 15 - 2;
      const neutral = Math.random() > 0.85;
      starColors[i3] = neutral ? 0.8 : 0.68;
      starColors[i3 + 1] = neutral ? 0.8 : 0.7;
      starColors[i3 + 2] = neutral ? 0.85 : 0.76;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: isMobile ? 0.032 : 0.04, vertexColors: true, transparent: true, opacity: 0.72 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const cardWidth = isMobile ? 0.92 : 1.15;
    const cardHeight = isMobile ? 1.26 : 1.58;
    const cardDepth = isMobile ? 0.10 : 0.13;
    const radius = Math.max(isMobile ? 2.15 : 2.55, (count * (cardWidth + 0.28)) / (2 * Math.PI));
    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    const cardMeshes = journeys.map((journey, i) => {
      const identity = getBrandIdentity(journey);
      const texture = createCardTexture(journey, isFr);
      const sideMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(identity.accent), roughness: 0.5, metalness: 0.25 });
      const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.32, metalness: 0.08, transparent: true });
      const material = [sideMaterial, sideMaterial, sideMaterial, sideMaterial, faceMaterial, faceMaterial];
      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.userData = { index: i, journey };
      cardGroup.add(mesh);
      return mesh;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const angleStep = (2 * Math.PI) / count;
    const normalize = (index) => ((index % count) + count) % count;

    function onPointerDown(e) {
      stateRef.current.isDragging = true;
      stateRef.current.startX = e.clientX;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastTime = performance.now();
      stateRef.current.startAngle = stateRef.current.targetAngle;
      stateRef.current.pointerVelocity = 0;
      container.setPointerCapture?.(e.pointerId);
    }
    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!stateRef.current.isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - stateRef.current.lastTime);
      const dx = e.clientX - stateRef.current.lastX;
      stateRef.current.pointerVelocity = dx / dt;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastTime = now;
      stateRef.current.targetAngle = stateRef.current.startAngle + (e.clientX - stateRef.current.startX) * 0.0035;
    }
    function onPointerUp(e) {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      const finalAngle = stateRef.current.targetAngle + stateRef.current.pointerVelocity * 0.12;
      const snappedIndex = Math.round(-finalAngle / angleStep);
      const normalized = normalize(snappedIndex);
      stateRef.current.targetAngle = -snappedIndex * angleStep;
      onActiveIndexChange?.(normalized);
      if (Math.abs(e.clientX - stateRef.current.startX) < 6) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cardMeshes);
        if (intersects.length) {
          const clickedIndex = intersects[0].object.userData.index;
          if (clickedIndex === stateRef.current.activeIndex) onOpenHistory?.(clickedIndex);
          else {
            onActiveIndexChange?.(clickedIndex);
            stateRef.current.targetAngle = -clickedIndex * angleStep;
          }
        }
      }
    }

    let wheelAcc = 0;
    let wheelTimer = null;
    function onWheel(e) {
      e.preventDefault();
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) < 45) return;
      const dir = wheelAcc > 0 ? 1 : -1;
      wheelAcc = 0;
      const currentIdx = Math.round(-stateRef.current.targetAngle / angleStep);
      const nextIdx = currentIdx + dir;
      stateRef.current.targetAngle = -nextIdx * angleStep;
      onActiveIndexChange?.(normalize(nextIdx));
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAcc = 0; }, 250);
    }
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    function onResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    let animationFrameId;
    function animate(time) {
      animationFrameId = requestAnimationFrame(animate);
      camera.position.x += (mouse.x * 0.2 - camera.position.x) * 0.05;
      camera.position.y += (0.15 + mouse.y * 0.15 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      const lerpSpeed = stateRef.current.isDragging ? 0.18 : 0.055;
      stateRef.current.currentAngle += (stateRef.current.targetAngle - stateRef.current.currentAngle) * lerpSpeed;
      cardMeshes.forEach((mesh, i) => {
        const cardAngle = i * angleStep + stateRef.current.currentAngle;
        const x = Math.sin(cardAngle) * radius;
        const z = Math.cos(cardAngle) * radius - radius + 0.3;
        mesh.position.set(x, 0, z);
        mesh.rotation.y = cardAngle;
        const cosDist = Math.cos(cardAngle);
        const scale = cosDist > 0.88 ? (isMobile ? 0.94 : 1.0) : Math.max(isMobile ? 0.52 : 0.55, cosDist * 0.82);
        mesh.scale.set(scale, scale, scale);
        mesh.material.forEach((material) => { material.opacity = Math.max(0.2, (cosDist + 1) / 2); });
      });
      stars.rotation.y = time * 0.00004;
      stars.rotation.x = time * 0.00002;
      renderer.render(scene, camera);
    }
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(wheelTimer);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      starGeometry.dispose();
      starMaterial.dispose();
      cardGeometry.dispose();
      cardMeshes.forEach((mesh) => {
        mesh.material.forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [journeys, locale, onActiveIndexChange, onOpenHistory]);

  return <div ref={containerRef} className="explore-3d-canvas" aria-label="3D brand selector" />;
}
