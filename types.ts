
// Fix: Centralized window.aistudio type declaration to avoid re-declaration errors.
declare global {
    interface Window {
        aistudio: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
    }
}

export enum BodyPartCategory {
    Head = 'Head',
    Face = 'Face',
    Neck = 'Neck',
    Chest = 'Chest',
    Shoulders = 'Shoulders',
    Torso = 'Torso',
    Arms = 'Arms',
    Waist = 'Waist',
    Legs = 'Legs',
    Feet = 'Feet',
}

export interface Product {
    file: File;
    preview: string;
}

export interface BodyPart {
    id: BodyPartCategory;
    label: string;
    description: string;
}