
import { BodyPart, BodyPartCategory } from './types';

export const BODY_PART_CONFIG: BodyPart[] = [
    { id: BodyPartCategory.Head, label: 'Headwear', description: 'Hats, caps, etc.' },
    { id: BodyPartCategory.Face, label: 'Face Accessories', description: 'Makeup, earrings, etc.' },
    { id: BodyPartCategory.Neck, label: 'Neckwear', description: 'Necklaces, scarves, etc.' },
    { id: BodyPartCategory.Chest, label: 'Tops', description: 'Shirts, t-shirts, etc.' },
    { id: BodyPartCategory.Shoulders, label: 'Outerwear', description: 'Jackets, blouses, etc.' },
    { id: BodyPartCategory.Torso, label: 'Full Body', description: 'Dresses, costumes, etc.' },
    { id: BodyPartCategory.Arms, label: 'Armwear', description: 'Watches, bracelets, etc.' },
    { id: BodyPartCategory.Waist, label: 'Waist Accessories', description: 'Belts, etc.' },
    { id: BodyPartCategory.Legs, label: 'Hosiery', description: 'Socks, tights, etc.' },
    { id: BodyPartCategory.Feet, label: 'Footwear', description: 'Shoes, sandals, etc.' },
];
