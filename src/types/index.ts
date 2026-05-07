export type SpacingDensity = 1 | 2 | 4 | 8 | 9 | 16;
export type SunRequirement = 'full-sun' | 'partial-shade' | 'full-shade';
export type PlantingStatus =
  | 'planned'
  | 'seeds-started'
  | 'transplanted'
  | 'direct-sown'
  | 'growing'
  | 'harvested'
  | 'failed';
export type BedType = 'raised' | 'in-ground';
export type AppView = 'canvas' | 'calendar' | 'plants';
export type CanvasTool = 'select' | 'add-bed' | 'paint-plant' | 'erase-plant';

export interface Plant {
  id: string;
  name: string;
  variety?: string;
  spacingDensity: SpacingDensity;
  daysToHarvest: number;
  /** weeks before last frost to start indoors; null = direct sow only */
  indoorStartWeeks: number | null;
  /** weeks relative to last frost for outdoor planting; negative = before frost */
  transplantWeeksAfterFrost: number;
  sunRequirement: SunRequirement;
  color: string;
  isCustom: boolean;
  notes: string;
}

export interface Garden {
  id: string;
  name: string;
  location?: string;
  lastFrostDate: string | null;
  firstFrostDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  gardenId: string;
  name: string;
  bedType: BedType;
  x: number;
  y: number;
  widthFt: number;
  heightFt: number;
  color: string;
  notes: string;
  createdAt: string;
}

export interface Square {
  id: string;
  bedId: string;
  col: number;
  row: number;
  useSubgrid: boolean;
}

export interface Planting {
  id: string;
  squareId: string;
  plantId: string;
  subCol: number | null;
  subRow: number | null;
  successionIndex: number;
  seedStartDate: string | null;
  transplantOrSowDate: string | null;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  status: PlantingStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportEnvelope {
  schemaVersion: number;
  exportedAt: string;
  gardens: Garden[];
  beds: Bed[];
  squares: Square[];
  plantings: Planting[];
  plants: Plant[];
}
