
import React, { useRef } from 'react';
import { BodyPartCategory, Product } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ProductUploaderProps {
    category: BodyPartCategory;
    label: string;
    description: string;
    onProductUpload: (category: BodyPartCategory, file: File) => void;
    product: Product | null;
}

export const ProductUploader: React.FC<ProductUploaderProps> = ({ category, label, description, onProductUpload, product }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onProductUpload(category, event.target.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
            <div 
                className="w-16 h-16 rounded-md bg-gray-600 border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-colors flex-shrink-0"
                onClick={handleClick}
            >
                {product ? (
                    <img src={product.preview} alt={`${label} preview`} className="object-contain w-full h-full rounded-md" />
                ) : (
                    <UploadIcon className="w-6 h-6 text-gray-400" />
                )}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-gray-100">{label}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
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
