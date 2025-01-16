export interface FamilySearchTourHistory {
  importFamilyTree?: boolean;
  switchArchives?: boolean;
}

export interface GuidedTourHistory {
  familysearch?: FamilySearchTourHistory;
}

export type TourName = keyof GuidedTourHistory;

export type TourStep = keyof FamilySearchTourHistory;
