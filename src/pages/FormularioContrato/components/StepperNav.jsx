import React from 'react';
import { HiCheck } from 'react-icons/hi';

export const StepperNav = ({ steps, currentStep, goToStep }) => {
    return (
        <nav className="mb-8">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <li key={step} className={`flex w-full items-center ${stepNumber < steps.length ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:inline-block" : ""}`}>
                            <button
                                type="button"
                                onClick={() => goToStep(stepNumber)}
                                disabled={!isCompleted}
                                className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0
                                    ${isCompleted ? 'bg-sky-600 text-white cursor-pointer hover:bg-sky-700' : ''}
                                    ${isCurrent ? 'bg-sky-100 text-sky-600 border-2 border-sky-500' : ''}
                                    ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-500' : ''}
                                `}
                            >
                                {isCompleted ? <HiCheck className="w-6 h-6" /> : <span className="font-bold">{stepNumber}</span>}
                            </button>
                            <div className="ml-2">
                                <h3 className={`font-medium ${isCurrent ? 'text-sky-600' : 'text-gray-700'}`}>{step}</h3>
                                <p className="text-xs text-gray-500">Paso {stepNumber}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};