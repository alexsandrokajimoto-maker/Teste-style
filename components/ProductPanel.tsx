import React from 'react';
import { BodyPartCategory, Product, ProductAdjustments } from '../types';
import { BODY_PART_CONFIG } from '../constants';
import { ProductUploader } from './ProductUploader';

interface ProductPanelProps {
    onProductUpload: (category: BodyPartCategory, file: File) => void;
    onRemoveProduct: (category: BodyPartCategory) => void;
    onAdjustmentChange: (category: BodyPartCategory, adjustments: ProductAdjustments) => void;
    products: Partial<Record<BodyPartCategory, Product>>;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({ onProductUpload, onRemoveProduct, onAdjustmentChange, products }) => {
    return (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {BODY_PART_CONFIG.map((part) => (
                <ProductUploader
                    key={part.id}
                    category={part.id}
                    label={part.label}
                    description={part.description}
                    product={products[part.id] ?? null}
                    onProductUpload={onProductUpload}
                    onRemoveProduct={onRemoveProduct}
                    onAdjustmentChange={onAdjustmentChange}
                />
            ))}
        </div>
    );
};
