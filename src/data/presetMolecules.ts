import { MoleculeData } from '@/context/ExperienceContext';

const ATOM_COLORS: Record<string, string> = {
  H: '#E8E8E8',
  C: '#404040',
  O: '#FF4444',
  N: '#3344FF',
  S: '#DDCC22',
  P: '#FF8800',
  F: '#22CC44',
  Cl: '#22CC44',
  Br: '#992200',
};

export { ATOM_COLORS };

const BL = 80; // bond length
const HBL = 48; // H bond length

function h(id: string, parent: { x: number; y: number }, angleDeg: number): { id: string; symbol: string; x: number; y: number; color: string } {
  const rad = (angleDeg * Math.PI) / 180;
  return { id, symbol: 'H', x: Math.round(parent.x + HBL * Math.cos(rad)), y: Math.round(parent.y + HBL * Math.sin(rad)), color: ATOM_COLORS.H };
}

export const presetMolecules: (MoleculeData & { description: string; stability: number })[] = [
  // Água
  {
    name: 'Água (H₂O)',
    description: 'A molécula essencial para a vida',
    stability: 0.9,
    atoms: [
      { id: 'o1', symbol: 'O', x: 300, y: 220, color: ATOM_COLORS.O },
      h('h1', { x: 300, y: 220 }, -150),
      h('h2', { x: 300, y: 220 }, -30),
    ],
    bonds: [
      { id: 'b1', from: 'o1', to: 'h1' },
      { id: 'b2', from: 'o1', to: 'h2' },
    ],
  },
  // Metano
  {
    name: 'Metano (CH₄)',
    description: 'O gás natural mais simples',
    stability: 0.85,
    atoms: [
      { id: 'c1', symbol: 'C', x: 300, y: 220, color: ATOM_COLORS.C },
      h('h1', { x: 300, y: 220 }, -90),
      h('h2', { x: 300, y: 220 }, 0),
      h('h3', { x: 300, y: 220 }, 90),
      h('h4', { x: 300, y: 220 }, 180),
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'h1' },
      { id: 'b2', from: 'c1', to: 'h2' },
      { id: 'b3', from: 'c1', to: 'h3' },
      { id: 'b4', from: 'c1', to: 'h4' },
    ],
  },
  // Amônia
  {
    name: 'Amônia (NH₃)',
    description: 'Presente em fertilizantes e produtos de limpeza',
    stability: 0.7,
    atoms: [
      { id: 'n1', symbol: 'N', x: 300, y: 220, color: ATOM_COLORS.N },
      h('h1', { x: 300, y: 220 }, -120),
      h('h2', { x: 300, y: 220 }, -60),
      h('h3', { x: 300, y: 220 }, 90),
    ],
    bonds: [
      { id: 'b1', from: 'n1', to: 'h1' },
      { id: 'b2', from: 'n1', to: 'h2' },
      { id: 'b3', from: 'n1', to: 'h3' },
    ],
  },
  // CO₂
  {
    name: 'Dióxido de Carbono (CO₂)',
    description: 'Gás carbônico — vilão do efeito estufa',
    stability: 0.95,
    atoms: [
      { id: 'o1', symbol: 'O', x: 220, y: 220, color: ATOM_COLORS.O },
      { id: 'c1', symbol: 'C', x: 300, y: 220, color: ATOM_COLORS.C },
      { id: 'o2', symbol: 'O', x: 380, y: 220, color: ATOM_COLORS.O },
    ],
    bonds: [
      { id: 'b1', from: 'o1', to: 'c1' },
      { id: 'b2', from: 'c1', to: 'o2' },
    ],
  },
  // Etanol
  (() => {
    const c1 = { x: 240, y: 220 };
    const c2 = { x: 240 + BL, y: 220 };
    const o1 = { x: 240 + BL * 2, y: 220 };
    return {
      name: 'Etanol (C₂H₆O)',
      description: 'Presente em bebidas e combustíveis',
      stability: 0.6,
      atoms: [
        { id: 'c1', symbol: 'C', ...c1, color: ATOM_COLORS.C },
        { id: 'c2', symbol: 'C', ...c2, color: ATOM_COLORS.C },
        { id: 'o1', symbol: 'O', ...o1, color: ATOM_COLORS.O },
        h('h1', c1, -90), h('h2', c1, 180), h('h3', c1, 90),
        h('h4', c2, -90), h('h5', c2, 90),
        h('h6', o1, 0),
      ],
      bonds: [
        { id: 'b1', from: 'c1', to: 'c2' },
        { id: 'b2', from: 'c2', to: 'o1' },
        { id: 'b3', from: 'c1', to: 'h1' },
        { id: 'b4', from: 'c1', to: 'h2' },
        { id: 'b5', from: 'c1', to: 'h3' },
        { id: 'b6', from: 'c2', to: 'h4' },
        { id: 'b7', from: 'c2', to: 'h5' },
        { id: 'b8', from: 'o1', to: 'h6' },
      ],
    };
  })(),
  // Ácido Acético
  (() => {
    const c1 = { x: 220, y: 220 };
    const c2 = { x: 300, y: 220 };
    const o1 = { x: 380, y: 180 };
    const o2 = { x: 380, y: 260 };
    return {
      name: 'Ácido Acético (CH₃COOH)',
      description: 'O ácido do vinagre',
      stability: 0.65,
      atoms: [
        { id: 'c1', symbol: 'C', ...c1, color: ATOM_COLORS.C },
        { id: 'c2', symbol: 'C', ...c2, color: ATOM_COLORS.C },
        { id: 'o1', symbol: 'O', ...o1, color: ATOM_COLORS.O },
        { id: 'o2', symbol: 'O', ...o2, color: ATOM_COLORS.O },
        h('h1', c1, -90), h('h2', c1, 90), h('h3', c1, 180),
        h('h4', o2, 90),
      ],
      bonds: [
        { id: 'b1', from: 'c1', to: 'c2' },
        { id: 'b2', from: 'c2', to: 'o1' },
        { id: 'b3', from: 'c2', to: 'o2' },
        { id: 'b4', from: 'c1', to: 'h1' },
        { id: 'b5', from: 'c1', to: 'h2' },
        { id: 'b6', from: 'c1', to: 'h3' },
        { id: 'b7', from: 'o2', to: 'h4' },
      ],
    };
  })(),
  // Benzeno
  (() => {
    const cx = 310, cy = 230, r = 75;
    const carbons = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 90) * Math.PI / 180;
      return { id: `c${i+1}`, symbol: 'C', x: Math.round(cx + r * Math.cos(angle)), y: Math.round(cy + r * Math.sin(angle)), color: ATOM_COLORS.C };
    });
    const hydrogens = carbons.map((c, i) => {
      const angle = (i * 60 - 90);
      return h(`h${i+1}`, c, angle);
    });
    const bondList = carbons.map((c, i) => ({
      id: `b${i+1}`, from: c.id, to: carbons[(i+1) % 6].id
    }));
    const hBonds = carbons.map((c, i) => ({
      id: `bh${i+1}`, from: c.id, to: `h${i+1}`
    }));
    return {
      name: 'Benzeno (C₆H₆)',
      description: 'Anel aromático — base da química orgânica',
      stability: 0.88,
      atoms: [...carbons, ...hydrogens],
      bonds: [...bondList, ...hBonds],
    };
  })(),
  // Glicose simplificada (cadeia aberta)
  (() => {
    const atoms: MoleculeData['atoms'] = [];
    const bonds: MoleculeData['bonds'] = [];
    // 6 carbons in a zigzag chain
    for (let i = 0; i < 6; i++) {
      const x = 160 + i * 70;
      const y = 200 + (i % 2 === 0 ? -20 : 20);
      atoms.push({ id: `c${i+1}`, symbol: 'C', x, y, color: ATOM_COLORS.C });
      if (i > 0) bonds.push({ id: `bc${i}`, from: `c${i}`, to: `c${i+1}` });
    }
    // O on C1 (aldehyde)
    atoms.push({ id: 'o_ald', symbol: 'O', x: 130, y: 150, color: ATOM_COLORS.O });
    bonds.push({ id: 'bo_ald', from: 'c1', to: 'o_ald' });
    // OH groups on C2-C5
    for (let i = 1; i < 5; i++) {
      const c = atoms.find(a => a.id === `c${i+1}`)!;
      const oDir = i % 2 === 0 ? -1 : 1;
      atoms.push({ id: `oh${i}`, symbol: 'O', x: c.x, y: c.y + oDir * 55, color: ATOM_COLORS.O });
      bonds.push({ id: `boh${i}`, from: `c${i+1}`, to: `oh${i}` });
    }
    // CH2OH on C6
    atoms.push({ id: 'o6', symbol: 'O', x: 530, y: 230, color: ATOM_COLORS.O });
    bonds.push({ id: 'bo6', from: 'c6', to: 'o6' });
    return {
      name: 'Glicose (simplificada)',
      description: 'Açúcar essencial — fonte de energia celular',
      stability: 0.5,
      atoms,
      bonds,
    };
  })(),
  // Cafeína simplificada
  (() => {
    // Simplified purine ring system
    const atoms: MoleculeData['atoms'] = [
      { id: 'n1', symbol: 'N', x: 220, y: 180, color: ATOM_COLORS.N },
      { id: 'c2', symbol: 'C', x: 290, y: 150, color: ATOM_COLORS.C },
      { id: 'n3', symbol: 'N', x: 360, y: 180, color: ATOM_COLORS.N },
      { id: 'c4', symbol: 'C', x: 360, y: 260, color: ATOM_COLORS.C },
      { id: 'c5', symbol: 'C', x: 290, y: 290, color: ATOM_COLORS.C },
      { id: 'c6', symbol: 'C', x: 220, y: 260, color: ATOM_COLORS.C },
      { id: 'n7', symbol: 'N', x: 420, y: 300, color: ATOM_COLORS.N },
      { id: 'c8', symbol: 'C', x: 420, y: 220, color: ATOM_COLORS.C },
      { id: 'o_c2', symbol: 'O', x: 290, y: 80, color: ATOM_COLORS.O },
      { id: 'o_c6', symbol: 'O', x: 160, y: 290, color: ATOM_COLORS.O },
    ];
    const bonds: MoleculeData['bonds'] = [
      { id: 'b1', from: 'n1', to: 'c2' },
      { id: 'b2', from: 'c2', to: 'n3' },
      { id: 'b3', from: 'n3', to: 'c4' },
      { id: 'b4', from: 'c4', to: 'c5' },
      { id: 'b5', from: 'c5', to: 'c6' },
      { id: 'b6', from: 'c6', to: 'n1' },
      { id: 'b7', from: 'c4', to: 'n7' },
      { id: 'b8', from: 'n7', to: 'c8' },
      { id: 'b9', from: 'c2', to: 'o_c2' },
      { id: 'b10', from: 'c6', to: 'o_c6' },
    ];
    return {
      name: 'Cafeína (simplificada)',
      description: 'O estimulante do café ☕',
      stability: 0.72,
      atoms,
      bonds,
    };
  })(),
  // Propano
  (() => {
    const c1 = { x: 220, y: 220 };
    const c2 = { x: 300, y: 220 };
    const c3 = { x: 380, y: 220 };
    return {
      name: 'Propano (C₃H₈)',
      description: 'Gás usado em botijões de cozinha',
      stability: 0.75,
      atoms: [
        { id: 'c1', symbol: 'C', ...c1, color: ATOM_COLORS.C },
        { id: 'c2', symbol: 'C', ...c2, color: ATOM_COLORS.C },
        { id: 'c3', symbol: 'C', ...c3, color: ATOM_COLORS.C },
        h('h1', c1, -90), h('h2', c1, 180), h('h3', c1, 90),
        h('h4', c2, -90), h('h5', c2, 90),
        h('h6', c3, -90), h('h7', c3, 0), h('h8', c3, 90),
      ],
      bonds: [
        { id: 'b1', from: 'c1', to: 'c2' },
        { id: 'b2', from: 'c2', to: 'c3' },
        { id: 'b3', from: 'c1', to: 'h1' }, { id: 'b4', from: 'c1', to: 'h2' }, { id: 'b5', from: 'c1', to: 'h3' },
        { id: 'b6', from: 'c2', to: 'h4' }, { id: 'b7', from: 'c2', to: 'h5' },
        { id: 'b8', from: 'c3', to: 'h6' }, { id: 'b9', from: 'c3', to: 'h7' }, { id: 'b10', from: 'c3', to: 'h8' },
      ],
    };
  })(),
  // Formaldeído
  {
    name: 'Formaldeído (CH₂O)',
    description: 'Conservante e desinfetante',
    stability: 0.55,
    atoms: [
      { id: 'c1', symbol: 'C', x: 300, y: 220, color: ATOM_COLORS.C },
      { id: 'o1', symbol: 'O', x: 380, y: 220, color: ATOM_COLORS.O },
      h('h1', { x: 300, y: 220 }, -120),
      h('h2', { x: 300, y: 220 }, 120),
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'o1' },
      { id: 'b2', from: 'c1', to: 'h1' },
      { id: 'b3', from: 'c1', to: 'h2' },
    ],
  },
  // Ácido clorídrico
  {
    name: 'Ácido Clorídrico (HCl)',
    description: 'Ácido forte presente no estômago',
    stability: 0.8,
    atoms: [
      { id: 'cl1', symbol: 'Cl', x: 300, y: 220, color: ATOM_COLORS.Cl },
      h('h1', { x: 300, y: 220 }, 180),
    ],
    bonds: [
      { id: 'b1', from: 'cl1', to: 'h1' },
    ],
  },
];
