
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ModelUploader } from './components/ModelUploader';
import { ProductPanel } from './components/ProductPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { generateStyledImage, generateOutfitVideo } from './services/geminiService';
import { BodyPartCategory, Product, BodyPart } from './types';
import { BODY_PART_CONFIG } from './constants';
import { PersonIcon } from './components/icons/PersonIcon';
import { VideoIcon } from './components/icons/VideoIcon';
import { useApiKey } from './hooks/useApiKey';

const App: React.FC = () => {
    const [modelImage, setModelImage] = useState<string | null>(null);
    const [products, setProducts] = useState<Partial<Record<BodyPartCategory, Product>>>({});
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
    const [videoStatus, setVideoStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const { hasApiKey, checkAndPromptApiKey, resetApiKey } = useApiKey();

    const handleModelImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setModelImage(reader.result as string);
            setGeneratedImage(null);
            setGeneratedVideo(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleProductUpload = (category: BodyPartCategory, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProducts(prev => ({
                ...prev,
                [category]: {
                    file,
                    preview: reader.result as string
                }
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateImage = useCallback(async () => {
        if (!modelImage) {
            setError("Please upload a model image first.");
            return;
        }

        const activeProducts = Object.entries(products).filter(([, product]) => product);
        if (activeProducts.length === 0) {
            setError("Please add at least one product to generate a look.");
            return;
        }

        setIsLoadingImage(true);
        setError(null);
        setGeneratedImage(null);
        setGeneratedVideo(null);

        try {
            const result = await generateStyledImage(modelImage, products);
            setGeneratedImage(`data:image/png;base64,${result}`);
        } catch (err) {
            console.error(err);
            setError("Failed to generate image. Please try again.");
        } finally {
            setIsLoadingImage(false);
        }
    }, [modelImage, products]);
    
    const handleGenerateVideo = useCallback(async () => {
        if (!generatedImage) {
            setError("Please generate an image first.");
            return;
        }

        const canProceed = await checkAndPromptApiKey();
        if (!canProceed) {
            return; 
        }

        setIsLoadingVideo(true);
        setError(null);
        setGeneratedVideo(null);

        try {
            await generateOutfitVideo(
                generatedImage,
                setVideoStatus,
                (videoUrl) => {
                    setGeneratedVideo(videoUrl);
                    setIsLoadingVideo(false);
                },
                (err) => {
                    if (err.message.includes("Requested entity was not found")) {
                        setError("API Key error. Please re-select your API key.");
                        resetApiKey();
                    } else {
                        setError("Failed to generate video. Please try again.");
                    }
                    setIsLoadingVideo(false);
                    console.error(err);
                }
            );
        } catch (err: any) {
            setError(`An unexpected error occurred: ${err.message}`);
            setIsLoadingVideo(false);
        }
    }, [generatedImage, checkAndPromptApiKey, resetApiKey]);

    const activeProductsCount = Object.values(products).filter(p => p).length;

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-fixed" 
            style={{backgroundImage: "url('https://picsum.photos/seed/stylesyncbg/1920/1080')"}}
        >
            <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm">
                <Header />
                <main className="p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                        
                        {/* Left Panel: Uploader & Products */}
                        <div className="lg:col-span-4 bg-gray-800 bg-opacity-70 rounded-2xl p-6 shadow-2xl border border-gray-700">
                            <ModelUploader onImageUpload={handleModelImageUpload} modelImage={modelImage} />
                            {modelImage && (
                                <div className="mt-6">
                                    <h2 className="text-xl font-bold text-gray-200 mb-4">Add Products</h2>
                                    <ProductPanel onProductUpload={handleProductUpload} products={products} />
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Results & Actions */}
                        <div className="lg:col-span-8 bg-gray-800 bg-opacity-70 rounded-2xl p-6 shadow-2xl flex flex-col border border-gray-700">
                            <ResultDisplay 
                                generatedImage={generatedImage} 
                                generatedVideo={generatedVideo}
                                isLoadingImage={isLoadingImage}
                                isLoadingVideo={isLoadingVideo}
                                videoStatus={videoStatus}
                                modelImage={modelImage}
                            />
                            
                            {error && <div className="mt-4 text-center text-red-400 bg-red-900 bg-opacity-50 p-3 rounded-lg">{error}</div>}

                            <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={!modelImage || isLoadingImage || isLoadingVideo || activeProductsCount === 0}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                                >
                                    <PersonIcon />
                                    {isLoadingImage ? 'Styling...' : 'Generate Look'}
                                </button>
                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={!generatedImage || isLoadingVideo || isLoadingImage}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                                >
                                    <VideoIcon />
                                    {isLoadingVideo ? 'Creating Video...' : 'Create Video'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
