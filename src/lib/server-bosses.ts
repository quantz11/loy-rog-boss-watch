
import type { LucideIcon } from 'lucide-react';
import { Skull, Crown, Gem, BookOpen } from 'lucide-react';

export type ServerBoss = {
  id: string;
  name: string;
  respawnHours: number;
  Icon: LucideIcon;
};

export const serverBosses: ServerBoss[] = [
  { id: 'server-chaos-3f', name: 'Temple of Chaos 3F Normal', respawnHours: 12, Icon: Skull },
  { id: 'server-crossroads', name: 'Crossroads of Ragnarok', respawnHours: 12, Icon: Crown },
  { id: 'server-vale', name: 'Vale of Ragnarok', respawnHours: 12, Icon: Gem },
  { id: 'server-canyon-4f', name: 'Canyon of the World Tree 4F', respawnHours: 12, Icon: BookOpen },
];
