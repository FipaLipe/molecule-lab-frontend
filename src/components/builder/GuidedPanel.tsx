import React from 'react';

interface GuidedPanelProps {
  atomCount: number;
  bondCount: number;
  hasHeavyAtoms: boolean;
}

export default function GuidedPanel({ atomCount, bondCount, hasHeavyAtoms }: GuidedPanelProps) {
  const steps = [
    { text: 'Escolha um átomo na barra lateral', done: true, active: atomCount === 0 },
    { text: 'Clique no canvas para posicioná-lo', done: atomCount > 0, active: atomCount === 0 },
    { text: 'Clique novamente para expandir a cadeia', done: atomCount > 1, active: atomCount === 1 },
    { text: 'Conecte átomos diferentes (O, N)', done: hasHeavyAtoms, active: atomCount > 1 && !hasHeavyAtoms },
    { text: 'Use "Completar H" para finalizar', done: false, active: bondCount > 0 },
  ];

  const currentStep = steps.findIndex(s => s.active);
  const tips = [
    'Dica: Cada clique no canvas cria um átomo e liga ao anterior automaticamente!',
    'Dica: Clique em um átomo existente para selecioná-lo como ponto de partida.',
    'Dica: Use o botão ≡ na barra de ferramentas para criar ligações duplas ou triplas.',
    'Dica: O número de bolinhas ao redor do átomo indica ligações disponíveis.',
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground font-medium">Siga os passos:</p>
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
            step.done
              ? 'glass-card text-accent'
              : i === currentStep
              ? 'glass-card glow-border text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              step.done
                ? 'gradient-bg text-primary-foreground'
                : i === currentStep
                ? 'bg-primary/30 text-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.done ? '✓' : i + 1}
          </div>
          <span>{step.text}</span>
        </div>
      ))}

      {currentStep >= 0 && currentStep < tips.length && (
        <div className="glass-card p-3 rounded-xl text-xs text-muted-foreground mt-2 animate-fade-in">
          💡 {tips[currentStep]}
        </div>
      )}
    </div>
  );
}
