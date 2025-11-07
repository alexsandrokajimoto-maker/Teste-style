
import { useState, useEffect, useCallback } from 'react';

// Fix: Removed duplicate global type declaration for window.aistudio, which is now centralized in types.ts.

export const useApiKey = () => {
    const [hasApiKey, setHasApiKey] = useState(false);

    const checkApiKey = useCallback(async () => {
        if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
            const result = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(result);
            return result;
        }
        // Fallback for environments where the function might not exist
        console.warn("aistudio.hasSelectedApiKey function not found.");
        return false;
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const checkAndPromptApiKey = useCallback(async (): Promise<boolean> => {
        let keyExists = hasApiKey;
        if (!keyExists) {
           keyExists = await checkApiKey();
        }

        if (!keyExists) {
            if (typeof window.aistudio?.openSelectKey === 'function') {
                await window.aistudio.openSelectKey();
                // Assume success after prompt and update state optimistically.
                // A failed API call will handle the actual invalid key state.
                setHasApiKey(true); 
                return true; 
            } else {
                console.error("aistudio.openSelectKey function not found.");
                alert("Could not open API key selection. Please ensure you are in the correct environment.");
                return false;
            }
        }
        return true;
    }, [hasApiKey, checkApiKey]);
    
    const resetApiKey = useCallback(() => {
        setHasApiKey(false);
    }, []);

    return { hasApiKey, checkAndPromptApiKey, resetApiKey };
};