
import type { LucideIcon } from 'lucide-react';
import { Skull, Ghost, Flame, Snowflake, Mountain, Wind, Zap, Droplets, Swords, Shield, Wand, Music } from 'lucide-react';

export type FieldBoss = {
  id: string;
  name: string;
  zone: string;
  respawnHours: number;
  windowHours: number; // For the "countdown to max spawn"
  Icon: LucideIcon;
};

export const fieldBosses: FieldBoss[] = [
  // Canyon of the world tree Depth
  { id: 'field-tree-depth-pulverizer', name: 'Lv. 56 Trembling Jotunn Pulverizer', zone: 'Canyon of the world tree Depth', respawnHours: 0.5, windowHours: 0.5, Icon: Mountain },
  { id: 'field-tree-depth-lindwurm', name: 'Lv. 58 Golden Lindwurm Variant', zone: 'Canyon of the world tree Depth', respawnHours: 0.5, windowHours: 0.5, Icon: Flame },
  { id: 'field-tree-depth-skeleton', name: 'Lv. 60 Ferocious Skeleton Exterminator', zone: 'Canyon of the world tree Depth', respawnHours: 0.5, windowHours: 0.5, Icon: Skull },

  // Myrkrheim
  { id: 'field-myrkrheim-sol', name: 'Lv. 66 Tre Sol Invading Captain', zone: 'Myrkrheim', respawnHours: 0.5, windowHours: 0.5, Icon: Swords },
  { id: 'field-myrkrheim-troll', name: 'Lv. 67 Elder Troll Invading Captain', zone: 'Myrkrheim', respawnHours: 0.5, windowHours: 0.5, Icon: Shield },
  { id: 'field-myrkrheim-jotunn-combat', name: 'Lv. 68 Villainous Jotunn Combat Captain', zone: 'Myrkrheim', respawnHours: 0.5, windowHours: 0.5, Icon: Skull },
  { id: 'field-myrkrheim-jotunn-fire', name: 'Lv. 68 Ferocious Fire Jotunn Fight Captain', zone: 'Myrkrheim', respawnHours: 0.5, windowHours: 0.5, Icon: Flame },

  // King's Tomb
  { id: 'field-kings-tomb-gand', name: 'Lv. 66 Cruel Outlaw Gand', zone: "King's Tomb", respawnHours: 0.5, windowHours: 0.5, Icon: Ghost },
  { id: 'field-kings-tomb-gatekeeper', name: 'Lv. 67 External Gatekeeper', zone: "King's Tomb", respawnHours: 0.5, windowHours: 0.5, Icon: Shield },
  { id: 'field-kings-tomb-hawler', name: 'Lv. 68 Ruthless Destroyer Hawler', zone: "King's Tomb", respawnHours: 0.5, windowHours: 0.5, Icon: Swords },
  { id: 'field-kings-tomb-laudd', name: 'Lv. 69 Assaulter of Tombs Laudd', zone: "King's Tomb", respawnHours: 0.5, windowHours: 0.5, Icon: Skull },

  // Canyon of Nidavellir
  { id: 'field-nidavellir-varulfr', name: 'Lv. 65 Darkening Varulfr Honcho', zone: 'Canyon of Nidavellir', respawnHours: 0.5, windowHours: 0.5, Icon: Wind },
  { id: 'field-nidavellir-jotunn-ground', name: 'Lv. 67 Darkening Ground Jotunn Captain', zone: 'Canyon of Nidavellir', respawnHours: 0.5, windowHours: 0.5, Icon: Mountain },
  { id: 'field-nidavellir-jotunn-frost', name: 'Lv. 69 Darkening Frost Jotunn Captain', zone: 'Canyon of Nidavellir', respawnHours: 0.5, windowHours: 0.5, Icon: Snowflake },
];
