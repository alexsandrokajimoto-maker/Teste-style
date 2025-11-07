import React, { useRef } from 'react';
import { PersonIcon } from './icons/PersonIcon';
import { UploadIcon } from './icons/UploadIcon';
import { getTranslator } from '../lib/i18n';

const t = getTranslator();

interface ModelUploaderProps {
    onImageUpload: (file: File) => void;
    modelImage: string | null;
}

export const ModelUploader: React.FC<ModelUploaderProps> = ({ onImageUpload, modelImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageUpload(event.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('uploadYourPhoto')}</h2>
            <div 
                className="w-full aspect-w-3 aspect-h-4 rounded-lg bg-gray-700 border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={handleUploadClick}
            >
                {modelImage ? (
                    <img src={modelImage} alt={t('modelPreviewAlt')} className="object-cover w-full h-full rounded-lg" />
                ) : (
                    <div className="text-center text-gray-400 p-4">
                        <PersonIcon className="w-16 h-16 mx-auto mb-2" />
                        <p className="font-semibold">{t('clickToUpload')}</p>
                        <p className="text-sm">{t('imageFormats')}</p>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
            />
             <button
                onClick={handleUploadClick}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
            >
                <UploadIcon />
                {modelImage ? t('changePhoto') : t('selectPhoto')}
            </button>
        </div>
    );
};
