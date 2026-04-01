import React from 'react';
import { presetMolecules } from '@/data/presetMolecules';
import { Atom } from '@/context/ExperienceContext';
import { BondWithOrder } from '@/lib/moleculeEngine';

interface PresetsPanelProps {
  onLoad: (atoms: Atom[], bonds: BondWithOrder[]) => void;
}

export default function PresetsPanel({ onLoad }: PresetsPanelProps) {
  const handleLoad = (preset: typeof presetMolecules[0]) => {
    const bonds: BondWithOrder[] = preset.bonds.map(b => ({ ...b, order: 1 }));
    onLoad(preset.atoms, bonds);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Escolha uma molécula pronta para editar:</p>
      {presetMolecules.map((m, i) => (
        <button
          key={i}
          onClick={() => handleLoad(m)}
          className="glass-card p-4 text-left rounded-xl hover:glow-border transition-all"
        >
          <p className="font-display font-semibold text-foreground">{m.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
        </button>
      ))}
    </div>
  );
}
