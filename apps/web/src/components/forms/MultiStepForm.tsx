/**
 * Reusable Multi-Step Form Component
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only handles step navigation and layout
 * - Open/Closed: Extensible via step configuration
 * - Dependency Inversion: Accepts step components as props
 */

'use client';

import React from 'react';

export interface StepConfig {
    id: number;
    component: React.ComponentType<{ progressIndicator?: React.ReactNode }>;
    title?: string;
}

interface MultiStepFormProps {
    steps: StepConfig[];
    currentStep: number;
    onStepChange?: (step: number) => void;
    showProgress?: boolean;
    progressComponent?: React.ComponentType<{ currentStep: number; totalSteps: number }>;
}

export function MultiStepForm({
    steps,
    currentStep,
    showProgress = true,
    progressComponent: ProgressComponent,
}: MultiStepFormProps) {
    const totalSteps = steps.length;
    const currentStepConfig = steps.find((step) => step.id === currentStep);
    const CurrentStepComponent = currentStepConfig?.component;

    if (!CurrentStepComponent) {
        return null;
    }

    return (
        <div className="min-h-screen flex bg-white">
            <div className="flex-[2] flex items-center justify-center px-8 lg:px-16">
                <div className="w-full max-w-md">
                    <CurrentStepComponent
                        progressIndicator={
                            showProgress
                                ? ProgressComponent ? (
                                    <ProgressComponent currentStep={currentStep} totalSteps={totalSteps} />
                                ) : (
                                    <DefaultProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
                                )
                                : null
                        }
                    />
                </div>
            </div>
            <div className="hidden lg:block flex-[3] bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/auth.png)' }}>
                <div className="h-full flex items-center justify-end p-8">
                    <div className="text-black text-right">
                        <h2 className="text-3xl font-bold mb-4">Awoof</h2>
                        <p className="text-lg">Connect with students</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                    <React.Fragment key={stepNum}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${stepNum <= currentStep
                                ? 'bg-primary text-white'
                                : 'bg-gray-300 text-gray-600'
                                }`}
                        >
                            {stepNum}
                        </div>
                        {stepNum < totalSteps && (
                            <div
                                className={`w-16 h-0.5 mx-2 ${stepNum < currentStep ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

