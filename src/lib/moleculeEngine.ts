import { Atom, Bond } from '@/context/ExperienceContext';
import { ATOM_COLORS } from '@/data/presetMolecules';

// --- Valence rules ---
export const VALENCE: Record<string, number> = {
  H: 1, C: 4, O: 2, N: 3, S: 2, P: 3, F: 1, Cl: 1, Br: 1,
};

let _idCounter = Date.now();
export const genId = () => `a${++_idCounter}`;

export const BOND_LENGTH = 80;

// Preferred angles based on hybridization / neighbor count
const GEOMETRY_ANGLES: Record<number, number[]> = {
  0: [0],                          // first bond: rightward
  1: [120, -120, 180, 60, -60],    // sp3-like: ~120° from existing
  2: [120, -120, 180],             // trigonal
  3: [90, -90, 180],               // tetrahedral-ish remainder
};

export interface BondWithOrder extends Bond {
  order: number;
}

// --- Valence helpers ---
export function getBondCount(atomId: string, bonds: BondWithOrder[]): number {
  return bonds
    .filter(b => b.from === atomId || b.to === atomId)
    .reduce((sum, b) => sum + b.order, 0);
}

export function getRemainingValence(atomId: string, atoms: Atom[], bonds: BondWithOrder[]): number {
  const atom = atoms.find(a => a.id === atomId);
  if (!atom) return 0;
  const maxValence = VALENCE[atom.symbol] ?? 4;
  return Math.max(0, maxValence - getBondCount(atomId, bonds));
}

export function canBond(atomIdA: string, atomIdB: string, atoms: Atom[], bonds: BondWithOrder[], order = 1): boolean {
  if (atomIdA === atomIdB) return false;
  const existingBond = bonds.find(
    b => (b.from === atomIdA && b.to === atomIdB) || (b.from === atomIdB && b.to === atomIdA)
  );
  if (existingBond) return false;
  return getRemainingValence(atomIdA, atoms, bonds) >= order &&
         getRemainingValence(atomIdB, atoms, bonds) >= order;
}

export function canIncreaseBondOrder(bondId: string, atoms: Atom[], bonds: BondWithOrder[]): boolean {
  const bond = bonds.find(b => b.id === bondId);
  if (!bond || bond.order >= 3) return false;
  const fromAtom = atoms.find(a => a.id === bond.from);
  const toAtom = atoms.find(a => a.id === bond.to);
  if (!fromAtom || !toAtom) return false;
  const fromMax = VALENCE[fromAtom.symbol] ?? 4;
  const toMax = VALENCE[toAtom.symbol] ?? 4;
  return (fromMax - getBondCount(bond.from, bonds) >= 1) && (toMax - getBondCount(bond.to, bonds) >= 1);
}

// --- Geometry helpers ---
function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleDeg(from: { x: number; y: number }, to: { x: number; y: number }): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function normalizeAngle(a: number): number {
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

function getNeighborAngles(atomId: string, atoms: Atom[], bonds: BondWithOrder[]): number[] {
  return bonds
    .filter(b => b.from === atomId || b.to === atomId)
    .map(b => {
      const otherId = b.from === atomId ? b.to : b.from;
      const atom = atoms.find(a => a.id === atomId)!;
      const other = atoms.find(a => a.id === otherId);
      if (!other) return 0;
      return angleDeg(atom, other);
    });
}

/**
 * Get candidate positions around an atom for placing a new bond.
 * Returns positions sorted by quality (best first).
 */
export function getCandidatePositions(
  fromAtom: Atom,
  atoms: Atom[],
  bonds: BondWithOrder[],
  count = 6
): { x: number; y: number; angle: number }[] {
  const neighborAngles = getNeighborAngles(fromAtom.id, atoms, bonds);
  const nNeighbors = neighborAngles.length;

  let candidateAngles: number[];

  if (nNeighbors === 0) {
    // No neighbors: offer a ring of angles
    candidateAngles = [0, 60, -60, 120, -120, 180];
  } else if (nNeighbors === 1) {
    // One neighbor: place at ~120° offsets from existing bond (zigzag chain)
    const existing = neighborAngles[0];
    candidateAngles = [
      existing + 120,
      existing - 120,
      existing + 180,
      existing + 60,
      existing - 60,
    ];
  } else if (nNeighbors === 2) {
    // Two neighbors: bisect the largest gap
    const sorted = [...neighborAngles].sort((a, b) => a - b);
    candidateAngles = [];
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      let gap = next - sorted[i];
      if (gap <= 0) gap += 360;
      candidateAngles.push(sorted[i] + gap / 2);
    }
    // Also add opposite of each neighbor
    for (const na of neighborAngles) {
      candidateAngles.push(na + 180);
    }
  } else {
    // 3+ neighbors: find gaps
    const sorted = [...neighborAngles].sort((a, b) => a - b);
    candidateAngles = [];
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      let gap = next - sorted[i];
      if (gap <= 0) gap += 360;
      if (gap > 45) {
        candidateAngles.push(sorted[i] + gap / 2);
      }
    }
    if (candidateAngles.length === 0) {
      // Fallback
      for (let a = 0; a < 360; a += 60) candidateAngles.push(a);
    }
  }

  // Score candidates: prefer those far from existing neighbors and other atoms
  const scored = candidateAngles.map(angle => {
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(fromAtom.x + BOND_LENGTH * Math.cos(rad));
    const y = Math.round(fromAtom.y + BOND_LENGTH * Math.sin(rad));

    // Min angular distance from existing neighbors
    const minAngularDist = neighborAngles.length > 0
      ? Math.min(...neighborAngles.map(na => Math.abs(normalizeAngle(angle - na))))
      : 180;

    // Min spatial distance from other atoms
    const minAtomDist = atoms.length > 0
      ? Math.min(...atoms.filter(a => a.id !== fromAtom.id).map(a => distance({ x, y }, a)))
      : 999;

    const score = minAngularDist * 2 + Math.min(minAtomDist, BOND_LENGTH) * 0.5;
    return { x, y, angle, score };
  });

  // Deduplicate (close angles)
  const unique: typeof scored = [];
  for (const s of scored) {
    if (!unique.some(u => Math.abs(normalizeAngle(u.angle - s.angle)) < 15)) {
      unique.push(s);
    }
  }

  return unique
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function findBestPosition(
  fromAtom: Atom,
  atoms: Atom[],
  bonds: BondWithOrder[],
  targetPos?: { x: number; y: number }
): { x: number; y: number } {
  const candidates = getCandidatePositions(fromAtom, atoms, bonds, 12);
  
  if (!targetPos || candidates.length === 0) {
    return candidates[0] ?? { x: fromAtom.x + BOND_LENGTH, y: fromAtom.y };
  }

  // Snap to the candidate closest to where the user clicked
  let best = candidates[0];
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = distance(c, targetPos);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return { x: best.x, y: best.y };
}

// --- Auto-hydrogens ---
export function computeImplicitHydrogens(
  atoms: Atom[],
  bonds: BondWithOrder[]
): { hydrogenAtoms: Atom[]; hydrogenBonds: BondWithOrder[] } {
  const hAtoms: Atom[] = [];
  const hBonds: BondWithOrder[] = [];

  for (const atom of atoms) {
    if (atom.symbol === 'H') continue;
    const remaining = getRemainingValence(atom.id, atoms, bonds);
    if (remaining <= 0) continue;

    const existingAngles = getNeighborAngles(atom.id, atoms, bonds);
    const allAngles = [...existingAngles];

    for (let i = 0; i < remaining; i++) {
      // Find best angle away from existing
      let bestAngle = 0;
      if (allAngles.length === 0) {
        bestAngle = i * (360 / remaining) - 90;
      } else {
        // Pick angle farthest from all existing
        let bestMin = -1;
        for (let a = 0; a < 360; a += 15) {
          const minDist = Math.min(...allAngles.map(e => Math.abs(normalizeAngle(a - e))));
          if (minDist > bestMin) {
            bestMin = minDist;
            bestAngle = a;
          }
        }
      }

      const hDist = BOND_LENGTH * 0.55;
      const rad = (bestAngle * Math.PI) / 180;
      const hId = `${atom.id}_h${i}`;
      hAtoms.push({
        id: hId,
        symbol: 'H',
        x: Math.round(atom.x + hDist * Math.cos(rad)),
        y: Math.round(atom.y + hDist * Math.sin(rad)),
        color: ATOM_COLORS.H,
      });
      hBonds.push({ id: `${hId}_bond`, from: atom.id, to: hId, order: 1 });
      allAngles.push(bestAngle);
    }
  }

  return { hydrogenAtoms: hAtoms, hydrogenBonds: hBonds };
}

// --- Find atom at position ---
export function findAtomAtPosition(
  pos: { x: number; y: number },
  atoms: Atom[],
  threshold = 30
): Atom | null {
  let closest: Atom | null = null;
  let minDist = threshold;
  for (const a of atoms) {
    const d = distance(pos, a);
    if (d < minDist) {
      minDist = d;
      closest = a;
    }
  }
  return closest;
}

// --- Organize structure (force-directed with angular constraints) ---
export function organizeStructure(atoms: Atom[], bonds: BondWithOrder[]): Atom[] {
  if (atoms.length === 0) return atoms;

  // Build adjacency
  const adj = new Map<string, string[]>();
  for (const a of atoms) adj.set(a.id, []);
  for (const b of bonds) {
    adj.get(b.from)?.push(b.to);
    adj.get(b.to)?.push(b.from);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const heavyAtoms = atoms.filter(a => a.symbol !== 'H');
  const hAtoms = atoms.filter(a => a.symbol === 'H');

  if (heavyAtoms.length === 0) {
    // All H — just spread them
    atoms.forEach((a, i) => {
      const angle = (i * 2 * Math.PI) / atoms.length;
      positions.set(a.id, { x: 350 + 60 * Math.cos(angle), y: 250 + 60 * Math.sin(angle) });
    });
    return atoms.map(a => ({ ...a, ...positions.get(a.id)! }));
  }

  // BFS layout from first heavy atom for initial placement
  const visited = new Set<string>();
  const queue: { id: string; x: number; y: number; fromAngle: number }[] = [];
  const first = heavyAtoms[0];
  positions.set(first.id, { x: 350, y: 250 });
  visited.add(first.id);

  // Add neighbors
  const addNeighbors = (atomId: string) => {
    const pos = positions.get(atomId)!;
    const neighbors = (adj.get(atomId) || []).filter(n => !visited.has(n) && atoms.find(a => a.id === n)?.symbol !== 'H');
    if (neighbors.length === 0) return;

    // Determine incoming angle
    const parentBond = bonds.find(b =>
      (b.from === atomId || b.to === atomId) &&
      visited.has(b.from === atomId ? b.to : b.from) &&
      atoms.find(a => a.id === (b.from === atomId ? b.to : b.from))?.symbol !== 'H'
    );
    let incomingAngle = 0;
    if (parentBond) {
      const parentId = parentBond.from === atomId ? parentBond.to : parentBond.from;
      const parentPos = positions.get(parentId);
      if (parentPos) incomingAngle = angleDeg(parentPos, pos);
    }

    const nTotal = neighbors.length;
    for (let i = 0; i < nTotal; i++) {
      let angle: number;
      if (nTotal === 1) {
        // Continue chain with zigzag: alternate ±60° from incoming
        const zigzag = visited.size % 2 === 0 ? 30 : -30;
        angle = incomingAngle + zigzag;
      } else if (nTotal === 2) {
        angle = incomingAngle + (i === 0 ? 60 : -60);
      } else if (nTotal === 3) {
        angle = incomingAngle + [-60, 0, 60][i];
      } else {
        angle = incomingAngle + (i - (nTotal - 1) / 2) * (120 / Math.max(nTotal - 1, 1));
      }

      const rad = (angle * Math.PI) / 180;
      const nx = pos.x + BOND_LENGTH * Math.cos(rad);
      const ny = pos.y + BOND_LENGTH * Math.sin(rad);
      const nId = neighbors[i];
      positions.set(nId, { x: nx, y: ny });
      visited.add(nId);
    }
    neighbors.forEach(n => addNeighbors(n));
  };

  addNeighbors(first.id);

  // Handle disconnected heavy atoms
  for (const a of heavyAtoms) {
    if (!visited.has(a.id)) {
      positions.set(a.id, { x: a.x, y: a.y });
      visited.add(a.id);
      addNeighbors(a.id);
    }
  }

  // Force-directed refinement (short)
  for (let iter = 0; iter < 80; iter++) {
    for (const atom of heavyAtoms) {
      const pos = positions.get(atom.id)!;
      let fx = 0, fy = 0;

      // Repulsion from other heavy atoms
      for (const other of heavyAtoms) {
        if (other.id === atom.id) continue;
        const op = positions.get(other.id)!;
        const d = Math.max(distance(pos, op), 1);
        const idealMin = BOND_LENGTH * 0.9;
        if (d < idealMin) {
          const force = (idealMin - d) * 0.3;
          fx += ((pos.x - op.x) / d) * force;
          fy += ((pos.y - op.y) / d) * force;
        }
      }

      // Bond spring
      const atomBonds = bonds.filter(b => b.from === atom.id || b.to === atom.id);
      for (const b of atomBonds) {
        const otherId = b.from === atom.id ? b.to : b.from;
        if (atoms.find(a => a.id === otherId)?.symbol === 'H') continue;
        const op = positions.get(otherId);
        if (!op) continue;
        const d = distance(pos, op);
        const diff = d - BOND_LENGTH;
        fx += ((op.x - pos.x) / Math.max(d, 1)) * diff * 0.08;
        fy += ((op.y - pos.y) / Math.max(d, 1)) * diff * 0.08;
      }

      positions.set(atom.id, { x: pos.x + fx * 0.1, y: pos.y + fy * 0.1 });
    }
  }

  // Center
  let cx = 0, cy = 0;
  heavyAtoms.forEach(a => { const p = positions.get(a.id)!; cx += p.x; cy += p.y; });
  cx /= heavyAtoms.length;
  cy /= heavyAtoms.length;
  const offsetX = 350 - cx;
  const offsetY = 250 - cy;

  // Position H atoms around their parents
  for (const h of hAtoms) {
    const bond = bonds.find(b => b.from === h.id || b.to === h.id);
    if (bond) {
      const parentId = bond.from === h.id ? bond.to : bond.from;
      const parentPos = positions.get(parentId);
      if (parentPos) {
        // Find open angle
        const parentNeighborAngles = bonds
          .filter(b => (b.from === parentId || b.to === parentId) && (b.from !== h.id && b.to !== h.id))
          .map(b => {
            const oId = b.from === parentId ? b.to : b.from;
            const oPos = positions.get(oId);
            if (!oPos) return 0;
            return angleDeg(parentPos, oPos);
          });

        // Get already placed H angles for this parent
        const placedHAngles = hAtoms
          .filter(hh => hh.id !== h.id && positions.has(hh.id))
          .filter(hh => {
            const hBond = bonds.find(b => b.from === hh.id || b.to === hh.id);
            if (!hBond) return false;
            return (hBond.from === parentId || hBond.to === parentId);
          })
          .map(hh => angleDeg(parentPos, positions.get(hh.id)!));

        const allAngles = [...parentNeighborAngles, ...placedHAngles];
        let bestAngle = 0;
        let bestMin = -1;
        for (let a = 0; a < 360; a += 15) {
          const minDist = allAngles.length > 0
            ? Math.min(...allAngles.map(e => Math.abs(normalizeAngle(a - e))))
            : 180;
          if (minDist > bestMin) {
            bestMin = minDist;
            bestAngle = a;
          }
        }

        const rad = (bestAngle * Math.PI) / 180;
        const hDist = BOND_LENGTH * 0.55;
        positions.set(h.id, {
          x: parentPos.x + hDist * Math.cos(rad),
          y: parentPos.y + hDist * Math.sin(rad),
        });
        continue;
      }
    }
    positions.set(h.id, { x: h.x + offsetX, y: h.y + offsetY });
  }

  return atoms.map(a => {
    const p = positions.get(a.id)!;
    return { ...a, x: Math.round(p.x + (a.symbol !== 'H' || !bonds.find(b => b.from === a.id || b.to === a.id) ? offsetX : 0)), y: Math.round(p.y + (a.symbol !== 'H' || !bonds.find(b => b.from === a.id || b.to === a.id) ? offsetY : 0)) };
  });
}

export function createAtom(symbol: string, x: number, y: number): Atom {
  return {
    id: genId(),
    symbol,
    x: Math.round(x),
    y: Math.round(y),
    color: ATOM_COLORS[symbol] || '#888',
  };
}

export function createBond(fromId: string, toId: string, order = 1): BondWithOrder {
  return { id: genId(), from: fromId, to: toId, order };
}
