'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Generates a high-resolution 2D canvas texture for a brand card.
 */
function createCardTexture(journey, isFr) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 700);
  grad.addColorStop(0, '#161618');
  grad.addColorStop(0.7, '#0E0E10');
  grad.addColorStop(1, '#08080A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 700);

  // Subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 692);

  // Top accent bar
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.fillRect(40, 40, 60, 6);

  // Brand Icon / Initials Box
  ctx.fillStyle = '#1A1A1E';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 70, 90, 90, 16);
  ctx.fill();
  ctx.stroke();

  // Initials
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = (journey.name || 'BT').slice(0, 2).toUpperCase();
  ctx.fillText(initials, 85, 115);

  // Brand Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(journey.name || 'Brand', 40, 540);

  // Subtitle / Meta
  ctx.fillStyle = '#A3A3A3';
  ctx.font = '22px "IBM Plex Mono", monospace';
  const meta = `${journey.totalCount || 0} ${isFr ? 'modèles' : 'models'} · ${journey.periodStart}–${journey.periodEnd}`;
  ctx.fillText(meta, 40, 590);

  // Historical indicator
  ctx.fillStyle = journey.color || '#22D07A';
  ctx.font = 'bold 18px "IBM Plex Mono", monospace';
  ctx.fillText(isFr ? 'CHRONOLOGIE HARDWARE' : 'HARDWARE TIMELINE', 40, 635);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function Explore3DCanvas({
  journeys,
  activeIndex,
  onActiveIndexChange,
  mode,
  onOpenHistory,
  locale = 'fr',
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    activeIndex,
    targetAngle: 0,
    currentAngle: 0,
    isDragging: false,
    startX: 0,
    startAngle: 0,
    pointerVelocity: 0,
    lastX: 0,
    lastTime: 0,
    mode,
  });

  stateRef.current.activeIndex = activeIndex;
  stateRef.current.mode = mode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !journeys.length) return;

    const count = journeys.length;
    const isFr = locale !== 'en';

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.2, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const greenSpot = new THREE.SpotLight(0x22d07a, 3.5, 12, Math.PI / 4, 0.4, 1.2);
    greenSpot.position.set(0, 2.5, 4);
    greenSpot.target.position.set(0, 0, 0);
    scene.add(greenSpot);
    scene.add(greenSpot.target);

    const backRimLight = new THREE.PointLight(0x22d07a, 1.2, 8);
    backRimLight.position.set(0, -1, 1);
    scene.add(backRimLight);

    // 4. Interactive 3D Starfield
    const starCount = 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 20;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 15 - 2;

      const isGreen = Math.random() > 0.85;
      starColors[i3] = isGreen ? 0.13 : 0.8;
      starColors[i3 + 1] = isGreen ? 0.81 : 0.8;
      starColors[i3 + 2] = isGreen ? 0.48 : 0.85;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 5. 3D Brand Cards Carousel
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // Card radius based on count
    const cardWidth = 1.35;
    const cardHeight = 1.85;
    const radius = Math.max(2.4, (count * (cardWidth + 0.3)) / (2 * Math.PI));

    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const cardMeshes = [];

    journeys.forEach((journey, i) => {
      const texture = createCardTexture(journey, isFr);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.25,
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.userData = { index: i, journey };
      cardGroup.add(mesh);
      cardMeshes.push(mesh);
    });

    // 6. Raycaster for clicks/hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 7. Smooth Physics & Interactions
    const angleStep = (2 * Math.PI) / count;

    function setTargetByActiveIndex(idx) {
      stateRef.current.targetAngle = -idx * angleStep;
    }
    setTargetByActiveIndex(activeIndex);
    stateRef.current.currentAngle = stateRef.current.targetAngle;

    // Pointer events
    function onPointerDown(e) {
      stateRef.current.isDragging = true;
      stateRef.current.startX = e.clientX;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastTime = performance.now();
      stateRef.current.startAngle = stateRef.current.targetAngle;
      stateRef.current.pointerVelocity = 0;
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

      const totalDelta = e.clientX - stateRef.current.startX;
      const sensitivity = 0.0035;
      stateRef.current.targetAngle = stateRef.current.startAngle + totalDelta * sensitivity;
    }

    function onPointerUp(e) {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;

      // Inertia on release
      const inertia = stateRef.current.pointerVelocity * 0.12;
      const finalAngle = stateRef.current.targetAngle + inertia;

      // Snap to nearest card
      const rawIndex = -finalAngle / angleStep;
      const snappedIndex = Math.round(rawIndex);
      const normalizedIndex = ((snappedIndex % count) + count) % count;

      stateRef.current.targetAngle = -snappedIndex * angleStep;
      onActiveIndexChange?.(normalizedIndex);

      // Check click without drag
      const dragDistance = Math.abs(e.clientX - stateRef.current.startX);
      if (dragDistance < 6) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cardMeshes);
        if (intersects.length > 0) {
          const clickedIndex = intersects[0].object.userData.index;
          if (clickedIndex === stateRef.current.activeIndex) {
            onOpenHistory?.(clickedIndex);
          } else {
            onActiveIndexChange?.(clickedIndex);
            setTargetByActiveIndex(clickedIndex);
          }
        }
      }
    }

    // Wheel event with smooth momentum accumulator
    let wheelAcc = 0;
    let wheelTimer = null;
    function onWheel(e) {
      e.preventDefault();
      wheelAcc += e.deltaY;
      const threshold = 45;

      if (Math.abs(wheelAcc) >= threshold) {
        const dir = wheelAcc > 0 ? 1 : -1;
        wheelAcc = 0;

        const currentIdx = Math.round(-stateRef.current.targetAngle / angleStep);
        const nextIdx = currentIdx + dir;
        const normalized = ((nextIdx % count) + count) % count;

        stateRef.current.targetAngle = -nextIdx * angleStep;
        onActiveIndexChange?.(normalized);
      }

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAcc = 0;
      }, 250);
    }

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 8. Resize Listener
    function onResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    // 9. Animation Loop
    let animationFrameId;
    function animate(time) {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera parallax
      camera.position.x += (mouse.x * 0.2 - camera.position.x) * 0.05;
      camera.position.y += (0.2 + mouse.y * 0.15 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Lerp carousel rotation
      const lerpSpeed = stateRef.current.isDragging ? 0.18 : 0.055;
      stateRef.current.currentAngle +=
        (stateRef.current.targetAngle - stateRef.current.currentAngle) * lerpSpeed;

      // Position cards on orbit ring
      cardMeshes.forEach((mesh, i) => {
        const cardAngle = i * angleStep + stateRef.current.currentAngle;
        const x = Math.sin(cardAngle) * radius;
        const z = Math.cos(cardAngle) * radius - radius + 0.3;

        mesh.position.set(x, 0, z);
        mesh.rotation.y = cardAngle;

        // Scale & opacity based on distance to center front
        const cosDist = Math.cos(cardAngle);
        const isFront = cosDist > 0.88;
        const scale = isFront ? 1.05 : Math.max(0.55, cosDist * 0.85);
        mesh.scale.set(scale, scale, scale);

        // Highlight material emission for active card
        if (mesh.material) {
          mesh.material.opacity = Math.max(0.2, (cosDist + 1) / 2);
          mesh.material.transparent = true;
        }
      });

      // Starfield subtle slow drift
      stars.rotation.y = time * 0.00004;
      stars.rotation.x = time * 0.00002;

      renderer.render(scene, camera);
    }

    animationFrameId = requestAnimationFrame(animate);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      starGeometry.dispose();
      starMaterial.dispose();
      cardGeometry.dispose();
      cardMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [journeys, locale, onActiveIndexChange, onOpenHistory]);

  return <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden cursor-grab active:cursor-grabbing" />;
}
