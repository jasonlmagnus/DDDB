export interface WorkshopData {
  request: string;
  discipline: string;
  fearDig: string;
  valueDig: string;
  realityDig: string;
  currentStep: 'request' | 'fear' | 'value' | 'reality' | 'summary' | 'build' | 'output' | 'final';
  customFearPrompt?: string;
  customValuePrompt?: string;
  customRealityPrompt?: string;
  nowBuilding?: string;
  buildOutput?: string;
}

const STORAGE_KEY = 'stopDigBuild_workshop_data';

export const saveWorkshopData = (data: WorkshopData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save workshop data:', error);
  }
};

export const loadWorkshopData = (): WorkshopData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as WorkshopData;
  } catch (error) {
    console.error('Failed to load workshop data:', error);
    return null;
  }
};

export const clearWorkshopData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear workshop data:', error);
  }
};

