import type { Scene } from '@babylonjs/core/scene';
import { Vector3, Matrix } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { CreateRibbon } from '@babylonjs/core/Meshes/Builders/ribbonBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { WaveService } from '../contracts/visual';
import { WaveLedger, WAVE_SECONDS, clampLabel, waveOpacity } from './core';

export function createWaveService(scene: Scene, root: HTMLElement): WaveService {
  const ledger = new WaveLedger();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:21;overflow:hidden';
  const active: { id: string; label: HTMLSpanElement; ribbon: Mesh; material: StandardMaterial; origin: Vector3; age: number }[] = [];
  root.append(layer);
  let disposed = false;
  const remove = (wave: typeof active[number]) => {
    wave.label.remove();
    wave.ribbon.dispose();
    wave.material.dispose();
    ledger.finish(wave.id);
  };
  return {
    show(id, text, position) {
      if (disposed || !ledger.accept(id, text)) return false;
      const label = document.createElement('span');
      label.textContent = text;
      label.setAttribute('role', 'status');
      label.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-50%);padding:10px 16px;max-width:calc(100vw - 32px);border-radius:24px;border:1px solid #f1d49570;color:#fff4d8;background:#23312dd9;font:500 18px/1.35 system-ui;text-align:center;opacity:0;white-space:normal;text-shadow:0 1px 3px #000';
      layer.append(label);
      const paths = [-0.06, 0.06].map(edge => Array.from({ length: 17 }, (_, index) => {
        const x = (index / 16 - 0.5) * 2.4;
        return new Vector3(x, Math.sin(index / 16 * Math.PI * 2) * 0.12 + edge, 0);
      }));
      const ribbon = CreateRibbon(`thought-${id}`, { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene);
      ribbon.billboardMode = Mesh.BILLBOARDMODE_ALL;
      ribbon.isPickable = false;
      ribbon.position.copyFrom(position);
      ribbon.position.y += 2.3;
      const material = new StandardMaterial(`thought-material-${id}`, scene);
      material.disableLighting = true;
      material.emissiveColor = new Color3(0.94, 0.76, 0.42);
      material.alpha = 0;
      material.backFaceCulling = false;
      ribbon.material = material;
      active.push({ id, label, ribbon, material, origin: position.clone(), age: 0 });
      return true;
    },
    update(dt, _position) {
      if (disposed) return;
      const camera = scene.activeCamera;
      const engine = scene.getEngine();
      const width = window.innerWidth;
      const height = window.innerHeight;
      for (let index = active.length - 1; index >= 0; index--) {
        const wave = active[index];
        wave.age += Math.max(0, Math.min(dt, 0.05));
        if (wave.age >= WAVE_SECONDS) { remove(wave); active.splice(index, 1); continue; }
        const opacity = waveOpacity(wave.age);
        wave.material.alpha = opacity * 0.5;
        wave.label.style.opacity = String(opacity);
        wave.ribbon.position.y = wave.origin.y + 2.3 + (motion.matches ? 0 : wave.age * 0.12);
        if (!camera) { wave.label.hidden = true; continue; }
        const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
        const projected = Vector3.Project(wave.ribbon.position, Matrix.IdentityReadOnly, scene.getTransformMatrix(), viewport);
        const viewZ = Vector3.TransformCoordinates(wave.ribbon.position, camera.getViewMatrix()).z;
        const behind = scene.useRightHandedSystem ? viewZ >= 0 : viewZ <= 0;
        wave.label.hidden = behind;
        const point = clampLabel(projected.x * width / engine.getRenderWidth(), projected.y * height / engine.getRenderHeight(), width, height, wave.label.offsetWidth, wave.label.offsetHeight);
        wave.label.style.left = `${point.x}px`;
        wave.label.style.top = `${point.y}px`;
      }
    },
    count: () => ledger.count(),
    dispose() { if (disposed) return; disposed = true; active.forEach(remove); active.length = 0; layer.remove(); },
  };
}
