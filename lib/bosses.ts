
import type { LucideIcon } from 'lucide-react';
import { Swords, Shield, Skull, Crown, Gem, Wand, Music, BookOpen } from 'lucide-react';

export type Boss = {
  id: string;
  name: string;
  floor: number;
  type: 'normal' | 'inter';
  respawnHours: number;
  Icon: LucideIcon;
};

export const bosses: Boss[] = [
  // Inter-Server (8 hours) - Floors 1-5
  { id: 'inter-1-warlord', name: 'Warlord', floor: 1, type: 'inter', respawnHours: 8, Icon: Swords },
  { id: 'inter-1-berserker', name: 'Berserker', floor: 1, type: 'inter', respawnHours: 8, Icon: Shield },
  { id: 'inter-1-skald', name: 'Skald', floor: 1, type: 'inter', respawnHours: 8, Icon: Music },
  { id: 'inter-1-volva', name: 'Volva', floor: 1, type: 'inter', respawnHours: 8, Icon: Wand },

  { id: 'inter-2-warlord', name: 'Warlord', floor: 2, type: 'inter', respawnHours: 8, Icon: Swords },
  { id: 'inter-2-berserker', name: 'Berserker', floor: 2, type: 'inter', respawnHours: 8, Icon: Shield },
  { id: 'inter-2-skald', name: 'Skald', floor: 2, type: 'inter', respawnHours: 8, Icon: Music },
  { id: 'inter-2-volva', name: 'Volva', floor: 2, type: 'inter', respawnHours: 8, Icon: Wand },

  { id: 'inter-3-warlord', name: 'Warlord', floor: 3, type: 'inter', respawnHours: 8, Icon: Swords },
  { id: 'inter-3-berserker', name: 'Berserker', floor: 3, type: 'inter', respawnHours: 8, Icon: Shield },
  { id: 'inter-3-skald', name: 'Skald', floor: 3, type: 'inter', respawnHours: 8, Icon: Music },
  { id: 'inter-3-volva', name: 'Volva', floor: 3, type: 'inter', respawnHours: 8, Icon: Wand },

  { id: 'inter-4-warlord', name: 'Warlord', floor: 4, type: 'inter', respawnHours: 8, Icon: Swords },
  { id: 'inter-4-berserker', name: 'Berserker', floor: 4, type: 'inter', respawnHours: 8, Icon: Shield },
  { id: 'inter-4-skald', name: 'Skald', floor: 4, type: 'inter', respawnHours: 8, Icon: Music },
  { id: 'inter-4-volva', name: 'Volva', floor: 4, type: 'inter', respawnHours: 8, Icon: Wand },

  { id: 'inter-5-warlord', name: 'Warlord', floor: 5, type: 'inter', respawnHours: 8, Icon: Swords },
  { id: 'inter-5-berserker', name: 'Berserker', floor: 5, type: 'inter', respawnHours: 8, Icon: Shield },
  { id: 'inter-5-skald', name: 'Skald', floor: 5, type: 'inter', respawnHours: 8, Icon: Music },
  { id: 'inter-5-volva', name: 'Volva', floor: 5, type: 'inter', respawnHours: 8, Icon: Wand },
  
  // Normal (2 hours) - Floors 1-5
  { id: 'normal-1-warlord', name: 'Warlord', floor: 1, type: 'normal', respawnHours: 2, Icon: Swords },
  { id: 'normal-1-berserker', name: 'Berserker', floor: 1, type: 'normal', respawnHours: 2, Icon: Shield },
  { id: 'normal-1-skald', name: 'Skald', floor: 1, type: 'normal', respawnHours: 2, Icon: Music },
  { id: 'normal-1-volva', name: 'Volva', floor: 1, type: 'normal', respawnHours: 2, Icon: Wand },

  { id: 'normal-2-warlord', name: 'Warlord', floor: 2, type: 'normal', respawnHours: 2, Icon: Swords },
  { id: 'normal-2-berserker', name: 'Berserker', floor: 2, type: 'normal', respawnHours: 2, Icon: Shield },
  { id: 'normal-2-skald', name: 'Skald', floor: 2, type: 'normal', respawnHours: 2, Icon: Music },
  { id: 'normal-2-volva', name: 'Volva', floor: 2, type: 'normal', respawnHours: 2, Icon: Wand },
  
  { id: 'normal-3-warlord', name: 'Warlord', floor: 3, type: 'normal', respawnHours: 2, Icon: Swords },
  { id: 'normal-3-berserker', name: 'Berserker', floor: 3, type: 'normal', respawnHours: 2, Icon: Shield },
  { id: 'normal-3-skald', name: 'Skald', floor: 3, type: 'normal', respawnHours: 2, Icon: Music },
  { id: 'normal-3-volva', name: 'Volva', floor: 3, type: 'normal', respawnHours: 2, Icon: Wand },

  { id: 'normal-4-warlord', name: 'Warlord', floor: 4, type: 'normal', respawnHours: 2, Icon: Swords },
  { id: 'normal-4-berserker', name: 'Berserker', floor: 4, type: 'normal', respawnHours: 2, Icon: Shield },
  { id: 'normal-4-skald', name: 'Skald', floor: 4, type: 'normal', respawnHours: 2, Icon: Music },
  { id: 'normal-4-volva', name: 'Volva', floor: 4, type: 'normal', respawnHours: 2, Icon: Wand },

  { id: 'normal-5-warlord', name: 'Warlord', floor: 5, type: 'normal', respawnHours: 2, Icon: Swords },
  { id: 'normal-5-berserker', name: 'Berserker', floor: 5, type: 'normal', respawnHours: 2, Icon: Shield },
  { id: 'normal-5-skald', name: 'Skald', floor: 5, type: 'normal', respawnHours: 2, Icon: Music },
  { id: 'normal-5-volva', name: 'Volva', floor: 5, type: 'normal', respawnHours: 2, Icon: Wand },
];
