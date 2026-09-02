'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createCardTexture(journey, isFr) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const grad = ctx.createLinearGradient(0, 0, 512, 700);
  grad.addColorStop(0, '#161618');
  grad.addColorStop(0.7, '#0E0E10');
  grad.addColorStop(1, '#08080A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 700);
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 692);
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.fillRect(40, 40, 60, 6);
  ctx.fillStyle = '#1A1A1E';
  ctx.strokeStyle = 'rgba(255,255,255,.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 70, 90, 90, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((journey.name || 'BT').slice(0, 2).toUpperCase(), 85, 115);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(journey.name || 'Brand', 40, 540);
  ctx.fillStyle = '#A3A3A3';
  ctx.font = '22px "IBM Plex Mono", monospace';
  ctx.fillText(`${journey.totalCount || 0} ${isFr ? 'modèles' : 'models'} · ${journey.periodStart}–${journey.periodEnd}`, 40, 590);
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.font = 'bold 18px "IBM Plex Mono", monospace';
  ctx.fillText(isFr ? 'CHRONOLOGIE HARDWARE' : 'HARDWARE TIMELINE', 40, 635);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function Explore3DCanvas({ journeys, activeIndex, onActiveIndexChange, onOpenHistory, locale = 'fr' }) {
  const containerRef = useRef(null);
  const stateRef = useRef({ activeIndex, targetAngle: 0, currentAngle: 0, isDragging: false, startX: 0, startAngle: 0, pointerVelocity: 0, lastX: 0, lastTime: 0 });
  stateRef.current.activeIndex = activeIndex;

  // Keep the WebGL scene alive while React changes the selected brand.
  useEffect(() => {
    if (!journeys.length) return;
    stateRef.current.targetAngle = -(activeIndex * (2 * Math.PI / journeys.length));
  }, [activeIndex, journeys.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !journeys.length) return undefined;
    const count = journeys.length;
    const isFr = locale !== 'en';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const greenSpot = new THREE.SpotLight(0x22d07a, 3.5, 12, Math.PI / 4, 0.4, 1.2);
    greenSpot.position.set(0, 2.5, 4);
    greenSpot.target.position.set(0, 0, 0);
    scene.add(greenSpot, greenSpot.target);
    const backRimLight = new THREE.PointLight(0x22d07a, 1.2, 8);
    backRimLight.position.set(0, -1, 1);
    scene.add(backRimLight);

    const starCount = 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 20;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 15 - 2;
      const green = Math.random() > 0.85;
      starColors[i3] = green ? 0.13 : 0.8;
      starColors[i3 + 1] = green ? 0.81 : 0.8;
      starColors[i3 + 2] = green ? 0.48 : 0.85;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.75 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const cardWidth = 1.35;
    const cardHeight = 1.85;
    const radius = Math.max(2.4, (count * (cardWidth + 0.3)) / (2 * Math.PI));
    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const cardMeshes = journeys.map((journey, i) => {
      const texture = createCardTexture(journey, isFr);
      const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.25, transparent: true });
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
          else { onActiveIndexChange?.(clickedIndex); stateRef.current.targetAngle = -clickedIndex * angleStep; }
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
      camera.position.y += (0.2 + mouse.y * 0.15 - camera.position.y) * 0.05;
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
        const scale = cosDist > 0.88 ? 1.05 : Math.max(0.55, cosDist * 0.85);
        mesh.scale.set(scale, scale, scale);
        mesh.material.opacity = Math.max(0.2, (cosDist + 1) / 2);
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
      cardMeshes.forEach((mesh) => { if (mesh.material.map) mesh.material.map.dispose(); mesh.material.dispose(); });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [journeys, locale, onActiveIndexChange, onOpenHistory]);

  return <div ref={containerRef} className="explore-3d-canvas" aria-label="3D brand selector" />;
}
