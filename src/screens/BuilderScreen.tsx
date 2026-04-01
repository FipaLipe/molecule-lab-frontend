import React, { useState, useEffect, useCallback } from 'react';
import { useExperience } from '@/context/ExperienceContext';
import { useMoleculeBuilder } from '@/hooks/useMoleculeBuilder';
import { Button } from '@/components/ui/button';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import BuilderToolbar from '@/components/builder/BuilderToolbar';
import AtomPalette from '@/components/builder/AtomPalette';
import GuidedPanel from '@/components/builder/GuidedPanel';
import PresetsPanel from '@/components/builder/PresetsPanel';
import { ArrowLeft, Flame } from 'lucide-react';

type Tool = 'add' | 'move' | 'delete';
type Tab = 'free' | 'guided' | 'presets';

export default function BuilderScreen() {
  const { setScreen, setMolecule } = useExperience();
  const builder = useMoleculeBuilder();
  const [tool, setTool] = useState<Tool>('add');
  const [tab, setTab] = useState<Tab>('free');

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) builder.redo();
        else builder.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        builder.redo();
      }
      if (e.key === 'a') setTool('add');
      if (e.key === 'm') setTool('move');
      if (e.key === 'd') setTool('delete');
      if (e.key === 'b') builder.setBondOrder(builder.bondOrder >= 3 ? 1 : builder.bondOrder + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [builder]);

  const handleTest = () => {
    // Convert to MoleculeData format for simulation
    setMolecule({
      atoms: builder.atoms,
      bonds: builder.bonds.map(b => ({ id: b.id, from: b.from, to: b.to })),
    });
    setScreen('simulation');
  };

  const handleSelectAtom = useCallback((symbol: string) => {
    builder.setSelectedAtomType(symbol);
    setTool('add');
  }, [builder]);

  const hasHeavyAtoms = builder.atoms.some(a => a.symbol !== 'C' && a.symbol !== 'H');

  return (
    <div className="min-h-screen flex flex-col gradient-bg-subtle">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border/50">
        <Button variant="ghost" size="sm" onClick={() => setScreen('landing')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h2 className="font-display text-lg font-semibold gradient-text">Construa sua molécula</h2>
        <Button variant="hero" size="sm" onClick={handleTest} disabled={builder.atoms.length < 2}>
          <Flame className="w-4 h-4 mr-1" /> Testar
        </Button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 p-3 flex flex-col gap-3 overflow-y-auto">
          {/* Mode tabs */}
          <div className="flex gap-1 glass-card p-1 rounded-xl">
            {([['free', 'Livre'], ['guided', 'Guiado'], ['presets', 'Prontas']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 text-xs py-2 rounded-lg transition-all font-medium ${
                  tab === key ? 'gradient-bg text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {(tab === 'free' || tab === 'guided') && (
            <AtomPalette
              selectedAtomType={builder.selectedAtomType}
              onSelect={handleSelectAtom}
            />
          )}

          {tab === 'guided' && (
            <GuidedPanel
              atomCount={builder.atoms.length}
              bondCount={builder.bonds.length}
              hasHeavyAtoms={hasHeavyAtoms}
            />
          )}

          {tab === 'presets' && (
            <PresetsPanel onLoad={builder.loadPreset} />
          )}

          {tab === 'free' && (
            <div className="glass-card p-3 rounded-xl text-xs text-muted-foreground mt-auto">
              <p className="font-medium text-foreground mb-1">💡 Como usar</p>
              <ul className="space-y-1">
                <li>• Escolha um átomo e clique no canvas</li>
                <li>• Cada clique cria e liga automaticamente</li>
                <li>• Clique em um átomo para selecioná-lo</li>
                <li>• Bolinhas = ligações disponíveis</li>
              </ul>
            </div>
          )}
        </aside>

        {/* Canvas + Toolbar */}
        <main className="flex-1 relative p-3 flex gap-2">
          {/* Floating toolbar */}
          <div className="z-10">
            <BuilderToolbar
              tool={tool}
              setTool={setTool}
              canUndo={builder.canUndo}
              canRedo={builder.canRedo}
              onUndo={builder.undo}
              onRedo={builder.redo}
              onClear={builder.clearAll}
              onComplete={builder.completeWithHydrogens}
              onOrganize={builder.organize}
              showHydrogens={builder.showHydrogens}
              onToggleH={() => builder.setShowHydrogens(!builder.showHydrogens)}
              hasAtoms={builder.atoms.length > 0}
              bondOrder={builder.bondOrder}
              setBondOrder={builder.setBondOrder}
            />
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <BuilderCanvas
              atoms={builder.atoms}
              bonds={builder.bonds}
              activeAtomId={builder.activeAtomId}
              selectedAtomType={builder.selectedAtomType}
              showHydrogens={builder.showHydrogens}
              implicitH={builder.implicitH}
              tool={tool}
              onCanvasClick={builder.addAtom}
              onAtomClick={builder.clickAtom}
              onAtomDelete={builder.deleteAtom}
              onBondClick={builder.deleteBond}
              onAtomMove={builder.moveAtom}
              onMoveEnd={builder.finishMove}
              getGhostPosition={builder.getGhostPosition}
              findAtomAt={builder.findAtomAt}
            />
          </div>

          {/* Valence error toast */}
          {builder.valenceError && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card glow-border px-5 py-3 rounded-full text-sm text-accent animate-scale-in z-20">
              ⚠️ {builder.valenceError}
            </div>
          )}

          {/* Floating hint */}
          {builder.atoms.length > 0 && builder.atoms.length < 3 && !builder.valenceError && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card px-4 py-2 rounded-full text-sm text-muted-foreground animate-fade-in z-10">
              💡 Continue clicando para expandir a molécula
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
