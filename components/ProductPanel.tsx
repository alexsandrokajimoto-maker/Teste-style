
import React from 'react';
import { BodyPartCategory, Product } from '../types';
import { BODY_PART_CONFIG } from '../constants';
import { ProductUploader } from './ProductUploader';

interface ProductPanelProps {
    onProductUpload: (category: BodyPartCategory, file: File) => void;
    products: Partial<Record<BodyPartCategory, Product>>;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({ onProductUpload, products }) => {
    return (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {BODY_PART_CONFIG.map((part) => (
                <ProductUploader
                    key={part.id}
                    category={part.id}
                    label={part.label}
                    description={part.description}
                    onProductUpload={onProductUpload}
                    product={products[part.id] ?? null}
                />
            ))}
        </div>
    );
};
