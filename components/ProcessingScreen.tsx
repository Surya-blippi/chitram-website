import React, { useState, useEffect } from 'react';

interface ProcessingScreenProps {
    posterTitle: string;
}

// Generic steps suitable for Movies, Gods, Travel, etc.
const PRODUCTION_STEPS = [
    "Initializing creative engine...",
    "Analyzing your photo's features...",
    "Mapping facial structure...",
    "Adapting scene lighting...",
    "Blending textures and shadows...",
    "Applying artistic filters...",
    "Enhancing resolution...",
    "Finalizing your masterpiece..."
];

// Generic tips/facts about AI and the process
const TIPS_AND_FACTS = [
    "Tip: High-quality selfies produce the most realistic results.",
    "Did you know? Our AI analyzes over 1,000 facial landmarks for a perfect blend.",
    "Creating art takes time! We're ensuring every pixel is perfect.",
    "We support various styles: Movies, Devotional, Travel, and more.",
    "Tip: Try different angles in your photos for different results.",
    "Almost there! We are polishing the final details.",
    "Fun Fact: This process involves millions of calculations per second."
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ posterTitle }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Total expected wait time in milliseconds (1.5 minutes = 90000ms)
    // We'll aim for the progress bar to reach ~95% in this time.
    const TOTAL_DURATION = 90000;
    const UPDATE_INTERVAL = 500; // Update progress every 500ms

    useEffect(() => {
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const calculatedProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 98); // Cap at 98% until done

            setProgress(calculatedProgress);

            // Calculate which step we should be on based on progress
            // We have PRODUCTION_STEPS.length steps.
            // If progress is 50%, we should be roughly halfway through steps.
            const stepIndex = Math.floor((calculatedProgress / 100) * PRODUCTION_STEPS.length);
            setCurrentStep(Math.min(stepIndex, PRODUCTION_STEPS.length - 1));

        }, UPDATE_INTERVAL);

        return () => clearInterval(timer);
    }, []);

    // Cycle through tips/facts independently
    useEffect(() => {
        const timer = setInterval(() => {
            setFactIndex(prev => (prev + 1) % TIPS_AND_FACTS.length);
        }, 8000); // Change fact every 8 seconds (slower read time)
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full">

            {/* Main Animation */}
            <div className="relative mb-12">
                {/* Pulsing Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400/20 rounded-full animate-ping duration-[3000ms]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400/30 rounded-full animate-pulse duration-[2000ms]"></div>

                {/* Central Icon */}
                <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-50">
                    <div className="text-5xl animate-bounce duration-[2000ms]">🎨</div>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-2xl">✨</div>
                </div>
            </div>

            {/* Header */}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 text-center tracking-tight">
                Creating Your Art <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 text-2xl md:text-3xl">
                    "{posterTitle}"
                </span>
            </h2>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden mt-8 max-w-md border border-slate-200">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-linear rounded-full relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>

            {/* Production Log (Steps) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg w-full max-w-md mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex justify-between">
                    <span>Status Log</span>
                    <span>{Math.round(progress)}%</span>
                </h3>
                <div className="space-y-3">
                    {PRODUCTION_STEPS.map((step, index) => {
                        // Show only current, previous, and next step to keep list compact? 
                        // Or just show all but style them. Let's show all but compact.

                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isPending = index > currentStep;

                        // Only show steps around the current one to save space if list is long
                        if (Math.abs(currentStep - index) > 2) return null;

                        return (
                            <div key={index} className={`flex items-center gap-3 transition-all duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-yellow-400 border-yellow-400 text-slate-900 animate-pulse' : ''}
                  ${isPending ? 'border-slate-300 text-slate-300' : ''}
                `}>
                                    {isCompleted && '✓'}
                                    {isActive && <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce"></div>}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-slate-900 scale-105 origin-left' : 'text-slate-500'} transition-transform duration-300`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fun Fact Toast */}
            <div className="animate-fade-in-up bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-medium shadow-xl flex items-start gap-3 max-w-md text-left border border-slate-700">
                <span className="text-yellow-400 text-lg mt-0.5">💡</span>
                <span key={factIndex} className="animate-fade-in leading-relaxed">
                    {TIPS_AND_FACTS[factIndex]}
                </span>
            </div>

        </div>
    );
};
