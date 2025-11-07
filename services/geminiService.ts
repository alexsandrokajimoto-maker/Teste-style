import { GoogleGenAI, Modality, Type } from '@google/genai';
import { BodyPartCategory, Product } from '../types';
import { getTranslator } from '../lib/i18n';

const t = getTranslator();

const getApiKey = (): string => {
    const key = process.env.API_KEY;
    if (!key) {
        throw new Error("API_KEY environment variable not set");
    }
    return key;
};

const fileToGenerativePart = async (file: File | Blob, mimeType?: string) => {
    const reader = new FileReader();
    const promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    });
    reader.readAsDataURL(file);
    const base64EncodedData = await promise;

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: mimeType || file.type,
        },
    };
};

const dataUrlToBase64 = (dataUrl: string) => {
    return dataUrl.split(',')[1];
}

export const generateStyledImage = async (
    modelImage: string,
    products: Partial<Record<BodyPartCategory, Product>>
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const modelImagePart = {
        inlineData: {
            mimeType: 'image/jpeg', // Assuming model is jpg, might need to be more robust
            data: dataUrlToBase64(modelImage)
        }
    };

    let promptParts: any[] = [
        modelImagePart,
        { text: t('stylePrompt') }
    ];

    for (const [category, product] of Object.entries(products)) {
        if (product) {
            const productPart = await fileToGenerativePart(product.file);
            promptParts.push(productPart);
            let description = `${t('placeItemOn')} ${t(category.toLowerCase())}.`;
            if (product.adjustments.fit) description += ` ${t('fitPrompt')} ${t(product.adjustments.fit.toLowerCase())}.`;
            if (product.adjustments.fabric) description += ` ${t('fabricPrompt')} ${t(product.adjustments.fabric.toLowerCase())}.`;
            if (product.adjustments.notes) description += ` ${t('notesPrompt')} "${product.adjustments.notes}".`;
            promptParts.push({ text: description });
        }
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: promptParts,
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }

    throw new Error(t('errorNoImageGenerated'));
};


const VIDEO_STATUS_MESSAGES = [
    "Initializing video synthesis...",
    "Warming up the digital runway...",
    "Analyzing style composition...",
    "Generating photorealistic frames...",
    "Stitching scenes together...",
    "Applying final lighting effects...",
    "Rendering high-definition video...",
    "Almost ready for the premiere...",
];

export const generateOutfitVideo = async (
    styledImage: string,
    onStatusUpdate: (status: string) => void,
    onComplete: (videoUrl: string) => void,
    onError: (error: Error) => void
) => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: t('videoPrompt'),
            image: {
                imageBytes: dataUrlToBase64(styledImage),
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16',
            }
        });

        let statusIndex = 0;
        onStatusUpdate(VIDEO_STATUS_MESSAGES[statusIndex]);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            statusIndex = (statusIndex + 1) % VIDEO_STATUS_MESSAGES.length;
            onStatusUpdate(VIDEO_STATUS_MESSAGES[statusIndex]);
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        onStatusUpdate(t('videoGenerated'));

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const videoResponse = await fetch(`${downloadLink}&key=${getApiKey()}`);
            if (!videoResponse.ok) {
                throw new Error(`${t('errorDownloadVideo')}: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            onComplete(videoUrl);
        } else {
            throw new Error(t('errorNoDownloadLink'));
        }
    } catch (err: any) {
        onError(err);
    }
};

export const identifyAndGenerateLook = async (
    personBlob: Blob,
    productBlob: Blob
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    // Step 1: Identify the product and its body part
    const productPart = await fileToGenerativePart(productBlob, productBlob.type);
    
    const identificationResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                productPart,
                { text: t('identifyPrompt') }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING },
                    bodyPart: {
                        type: Type.STRING,
                        enum: Object.values(BodyPartCategory),
                    },
                },
                required: ["productName", "bodyPart"],
            },
        },
    });
    
    const identificationText = identificationResponse.text.trim();
    const identificationResult = JSON.parse(identificationText);
    const { productName, bodyPart } = identificationResult;

    if (!productName || !bodyPart) {
        throw new Error(t('errorIdentification'));
    }

    // Step 2: Generate the styled image
    const personPart = await fileToGenerativePart(personBlob, personBlob.type);

    const generationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                personPart,
                productPart,
                { text: `${t('stylePrompt')} ${t('placeItemOn')} ${t(bodyPart.toLowerCase())}. ${t('theItemIs')} ${productName}.` }
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = generationResponse.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }

    throw new Error(t('errorNoImageGenerated'));
};
