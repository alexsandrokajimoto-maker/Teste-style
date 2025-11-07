import React, { useState, useRef, useEffect, useCallback } from 'react';
import { identifyAndGenerateLook } from '../services/geminiService';
import { getTranslator } from '../lib/i18n';
import { XIcon } from './icons/XIcon';

const t = getTranslator();

interface LightningCaptureModalProps {
    onClose: () => void;
    onSuccess: (result: { model: string, generated: string }) => void;
    onError: (error: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
);

export const LightningCaptureModal: React.FC<LightningCaptureModalProps> = ({ onClose, onSuccess, onError }) => {
    const [step, setStep] = useState<'person' | 'product' | 'processing'>('person');
    const [personImage, setPersonImage] = useState<Blob | null>(null);
    const [productImage, setProductImage] = useState<Blob | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: step === 'person' ? 'user' : 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            onError("Could not access camera. Please check permissions.");
            onClose();
        }
    }, [step, onClose, onError]);

    useEffect(() => {
        startCamera();
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [startCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    if (step === 'person') {
                        setPersonImage(blob);
                        setStep('product');
                    } else if (step === 'product') {
                        setProductImage(blob);
                        setStep('processing');
                    }
                }
            }, 'image/jpeg');
        }
    };
    
    useEffect(() => {
        const processImages = async () => {
            if (step === 'processing' && personImage && productImage) {
                stream?.getTracks().forEach(track => track.stop());
                try {
                    const generatedBase64 = await identifyAndGenerateLook(personImage, productImage);
                    
                    const personImageUrl = URL.createObjectURL(personImage);
                    const generatedImageUrl = `data:image/png;base64,${generatedBase64}`;

                    onSuccess({ model: personImageUrl, generated: generatedImageUrl });
                } catch (err: any) {
                    console.error("Lightning generation failed:", err);
                    onError(err.message || "Failed to generate look.");
                } finally {
                    onClose();
                }
            }
        };
        processImages();
    }, [step, personImage, productImage, stream, onSuccess, onError, onClose]);

    const getTitle = () => {
        switch (step) {
            case 'person': return t('step1');
            case 'product': return t('step2');
            case 'processing': return t('processing');
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl text-white border border-gray-700">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('lightningTryOn')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>

                <div className="p-6">
                    <h3 className="text-lg text-center font-semibold mb-4">{getTitle()}</h3>
                    
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                        {step === 'processing' ? (
                            <div className="flex flex-col items-center">
                                <LoadingSpinner />
                                <p className="mt-4">{t('generatingFinalLook')}</p>
                            </div>
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {step !== 'processing' && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleCapture}
                                className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
                            >
                                {t('capture')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
