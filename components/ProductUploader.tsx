import React, { useRef, useState } from 'react';
import { BodyPartCategory, Product, ProductAdjustments, Fit, Fabric } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { XIcon } from './icons/XIcon';
import { getTranslator } from '../lib/i18n';

const t = getTranslator();

const FITS: Fit[] = ['Tight', 'Regular', 'Loose'];
const FABRICS: Fabric[] = ['Cotton', 'Denim', 'Leather', 'Silk', 'Wool'];

interface ProductUploaderProps {
    category: BodyPartCategory;
    label: string;
    description: string;
    product: Product | null;
    onProductUpload: (category: BodyPartCategory, file: File) => void;
    onRemoveProduct: (category: BodyPartCategory) => void;
    onAdjustmentChange: (category: BodyPartCategory, adjustments: ProductAdjustments) => void;
}

export const ProductUploader: React.FC<ProductUploaderProps> = ({ category, label, description, product, onProductUpload, onRemoveProduct, onAdjustmentChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onProductUpload(category, event.target.files[0]);
        }
    };

    const handleClick = () => {
        if (!product) {
            fileInputRef.current?.click();
        }
    };

    const handleAdjustmentChange = (adjustment: keyof ProductAdjustments, value: string) => {
        if (value === 'none') {
             onAdjustmentChange(category, { [adjustment]: undefined });
        } else {
             onAdjustmentChange(category, { [adjustment]: value });
        }
    };

    return (
        <div className="bg-gray-700/80 p-3 rounded-lg flex flex-col gap-3 transition-all">
            <div className="flex items-center gap-3">
                 <div 
                    className="w-16 h-16 rounded-md bg-gray-600 border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-colors flex-shrink-0 relative group"
                    onClick={handleClick}
                >
                    {product ? (
                        <>
                            <img src={product.preview} alt={`${label} preview`} className="object-contain w-full h-full rounded-md" />
                            <button 
                                onClick={() => onRemoveProduct(category)} 
                                className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                aria-label={t('remove')}
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <UploadIcon className="w-6 h-6 text-gray-400" />
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-gray-100">{label}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>

            {product && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {/* Fit Dropdown */}
                    <select value={product.adjustments.fit || 'none'} onChange={(e) => handleAdjustmentChange('fit', e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-md p-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="none">{t('selectFit')}</option>
                        {FITS.map(f => <option key={f} value={f}>{t(f.toLowerCase())}</option>)}
                    </select>
                    {/* Fabric Dropdown */}
                    <select value={product.adjustments.fabric || 'none'} onChange={(e) => handleAdjustmentChange('fabric', e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-md p-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="none">{t('selectFabric')}</option>
                        {FABRICS.map(f => <option key={f} value={f}>{t(f.toLowerCase())}</option>)}
                    </select>
                    {/* Styling Notes */}
                    <div className="md:col-span-2">
                         <input 
                            type="text" 
                            placeholder={t('stylingNotesPlaceholder')}
                            value={product.adjustments.notes || ''}
                            onChange={(e) => handleAdjustmentChange('notes', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>
            )}
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
            />
        </div>
    );
};
