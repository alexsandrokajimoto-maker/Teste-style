// Fix: Removed the conflicting global declaration for `window.aistudio` to resolve type errors.
// It is assumed that this type is already declared in the global scope.
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

export type Fit = 'Tight' | 'Regular' | 'Loose';
export type Fabric = 'Cotton' | 'Denim' | 'Leather' | 'Silk' | 'Wool';

export interface ProductAdjustments {
    fit?: Fit;
    fabric?: Fabric;
    notes?: string;
}

export interface Product {
    file: File;
    preview: string;
    adjustments: ProductAdjustments;
}

export interface BodyPart {
    id: BodyPartCategory;
    label: string;
    description: string;
}

// i18n Types
export interface Translations {
    [key: string]: string;
}

export type Locale = 'en-US' | 'pt-BR';