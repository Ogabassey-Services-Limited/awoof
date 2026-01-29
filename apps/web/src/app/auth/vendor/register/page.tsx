/**
 * Vendor Register Page (Multi-step)
 * 
 * Refactored to follow SOLID principles:
 * - Single Responsibility: Only orchestrates steps
 * - Open/Closed: Easy to extend with new steps
 * - Dependency Inversion: Uses abstracted components and hooks
 */

'use client';

import React from 'react';
import { MultiStepForm, type StepConfig } from '@/components/forms/MultiStepForm';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useVendorRegistration } from './hooks/useVendorRegistration';
import { Step1CompanyInfo } from './components/Step1CompanyInfo';
import { Step2BusinessDetails } from './components/Step2BusinessDetails';
import { Step3DocumentUpload } from './components/Step3DocumentUpload';

export default function VendorRegisterPage() {
    const { currentStep, nextStep, previousStep, goToStep } = useMultiStepForm({
        initialStep: 1,
        totalSteps: 3,
    });

    const {
        registrationData,
        error,
        isLoading,
        saveStep1Data,
        saveStep2Data,
        saveFiles,
        submitRegistration,
        clearError,
    } = useVendorRegistration();

    // Wrap step components with necessary props
    const Step1Wrapper = ({ progressIndicator }: { progressIndicator?: React.ReactNode }) => (
        <Step1CompanyInfo
            onNext={(data) => {
                saveStep1Data(data);
                nextStep();
            }}
            error={error}
            isLoading={isLoading}
            progressIndicator={progressIndicator}
        />
    );

    const Step2Wrapper = ({ progressIndicator }: { progressIndicator?: React.ReactNode }) => (
        <Step2BusinessDetails
            onNext={(data) => {
                saveStep2Data(data);
                nextStep();
            }}
            onPrevious={previousStep}
            error={error}
            isLoading={isLoading}
            progressIndicator={progressIndicator}
        />
    );

    const Step3Wrapper = ({ progressIndicator }: { progressIndicator?: React.ReactNode }) => (
        <Step3DocumentUpload
            onNext={() => {
                // Registration complete, redirect handled by AuthContext
            }}
            onPrevious={previousStep}
            onSubmit={async () => {
                clearError();
                await submitRegistration();
            }}
            onFilesChange={saveFiles}
            existingFiles={registrationData.files}
            error={error}
            isLoading={isLoading}
            progressIndicator={progressIndicator}
        />
    );

    const steps: StepConfig[] = [
        { id: 1, component: Step1Wrapper },
        { id: 2, component: Step2Wrapper },
        { id: 3, component: Step3Wrapper },
    ];

    return (
        <MultiStepForm
            steps={steps}
            currentStep={currentStep}
            onStepChange={goToStep}
            showProgress={true}
        />
    );
}
