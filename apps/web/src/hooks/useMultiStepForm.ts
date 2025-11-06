/**
 * Custom Hook for Multi-Step Form State Management
 * 
 * Single Responsibility: Only manages step state and navigation
 */

import { useState, useCallback } from 'react';

export interface UseMultiStepFormOptions {
    initialStep?: number;
    totalSteps: number;
    onStepChange?: (step: number) => void;
}

export function useMultiStepForm({ initialStep = 1, totalSteps, onStepChange }: UseMultiStepFormOptions) {
    const [currentStep, setCurrentStep] = useState(initialStep);

    const goToStep = useCallback(
        (step: number) => {
            if (step >= 1 && step <= totalSteps) {
                setCurrentStep(step);
                onStepChange?.(step);
            }
        },
        [totalSteps, onStepChange]
    );

    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        }
    }, [currentStep, totalSteps, goToStep]);

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    }, [currentStep, goToStep]);

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return {
        currentStep,
        goToStep,
        nextStep,
        previousStep,
        isFirstStep,
        isLastStep,
        totalSteps,
    };
}

