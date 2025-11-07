
import React from 'react';
import { SaveIcon } from './icons/SaveIcon';
import { PrintIcon } from './icons/PrintIcon';

interface ResultDisplayProps {
    generatedImage: string | null;
    generatedVideo: string | null;
    isLoadingImage: boolean;
    isLoadingVideo: boolean;
    videoStatus: string;
    modelImage: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    generatedImage,
    generatedVideo,
    isLoadingImage,
    isLoadingVideo,
    videoStatus,
    modelImage
}) => {
    const handleSave = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'stylesync-look.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (!generatedImage) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Print StyleSync Look</title></head>
                    <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
                        <img src="${generatedImage}" style="max-width: 100%; max-height: 100%;" onload="window.print(); window.close();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const renderContent = () => {
        if (isLoadingImage) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-semibold text-gray-300">Generating Your Look...</p>
                    <p className="text-gray-400">The AI stylist is working its magic!</p>
                </div>
            );
        }
        if (isLoadingVideo) {
            return (
                 <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-semibold text-gray-300">Creating Your Video...</p>
                    <p className="text-gray-400 text-center px-4">{videoStatus}</p>
                </div>
            );
        }
        if (generatedVideo) {
             return <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />;
        }
        if (generatedImage) {
            return <img src={generatedImage} alt="Generated look" className="w-full h-full object-contain rounded-lg" />;
        }
        if (modelImage) {
             return <img src={modelImage} alt="Model" className="w-full h-full object-contain rounded-lg" />;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
                 <div className="w-24 h-24 text-gray-600 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-gray-200">Your Style Awaits</h3>
                 <p className="mt-2">Upload a photo and add products to see your virtual try-on.</p>
            </div>
        );
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-900 rounded-lg p-4 relative min-h-[400px] lg:min-h-[60vh]">
            <div className="w-full h-full flex items-center justify-center">
                 {renderContent()}
            </div>
            {generatedImage && !isLoadingImage && !isLoadingVideo && (
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={handleSave} className="p-2 bg-gray-700 rounded-full text-white hover:bg-purple-600 transition-colors">
                        <SaveIcon />
                    </button>
                    <button onClick={handlePrint} className="p-2 bg-gray-700 rounded-full text-white hover:bg-teal-500 transition-colors">
                        <PrintIcon />
                    </button>
                </div>
            )}
        </div>
    );
};
