import React, { useState, useMemo, useEffect } from 'react';
import { AppStep, MoviePoster } from './types';
import { Gallery } from './components/Gallery';
import { CategoryTabs } from './components/GenreTabs';
import { StepIndicator } from './components/StepIndicator';
import { Button } from './components/Button';
import { ImageUploader } from './components/ImageUploader';
import { PricingPlans, Plan } from './components/PricingPlans';
import { generateMoviePoster } from './services/geminiService';
import { fetchCategories, fetchPosters, getUserCredits, updateUserCredits, fetchUserHistory, saveUserHistory, HistoryItem, recordTransaction } from './services/dataService';
import { STATIC_POSTERS } from './constants';
import { HistoryGallery } from './components/HistoryGallery';
import { SocialProofGallery } from './components/SocialProofGallery';
import { SocialProofMarquee } from './components/SocialProofMarquee';
import { ProcessingScreen } from './components/ProcessingScreen';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// REPLACE THIS WITH YOUR ACTUAL RAZORPAY KEY ID
const RAZORPAY_KEY_ID = "rzp_live_r61z3m38RzvGJu";
// ------------------------------------------------------------------

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Simple ID Generator (6 chars)
const generateSimpleId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars (I, 1, O, 0)
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SELECT_TEMPLATE);

  // User State
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // UI State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Data State
  const [categories, setCategories] = useState<string[]>([]);
  const [posters, setPosters] = useState<MoviePoster[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<MoviePoster | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

  // Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    async function initData() {
      console.log('[App] 🚀 Starting data initialization...');
      setLoadingData(true);

      // Initialize User
      let currentUserId = localStorage.getItem('cine_user_id');
      if (!currentUserId) {
        currentUserId = generateSimpleId();
        localStorage.setItem('cine_user_id', currentUserId);
        console.log('[App] 👤 Created new user ID:', currentUserId);
      } else {
        console.log('[App] 👤 Found existing user ID:', currentUserId);
      }
      setUserId(currentUserId);

      try {
        console.log('[App] 📡 Fetching data from Supabase...');

        // Attempt fetch from Supabase
        const [fetchedCategories, fetchedPosters, fetchedCredits] = await Promise.all([
          fetchCategories(),
          fetchPosters(),
          getUserCredits(currentUserId)
        ]);

        // Fetch history in background (don't await)
        fetchUserHistory(currentUserId).then(h => {
          setHistory(h || []);
          console.log('[App] � Background loaded history:', h?.length);
        }).catch(err => console.error('[App] ❌ Background history load failed:', err));

        console.log('[App] 📊 Fetched Categories:', fetchedCategories);
        console.log('[App] � Fetched Posters:', fetchedPosters);
        console.log('[App] � Fetched Credits:', fetchedCredits);

        setCredits(fetchedCredits);
        // setHistory moved to background fetch

        // Validate results are not null and are valid arrays with data
        if (
          Array.isArray(fetchedCategories) &&
          Array.isArray(fetchedPosters) &&
          fetchedCategories.length > 0 &&
          fetchedPosters.length > 0
        ) {
          console.log('[App] ✅ Supabase data is valid, using it!');
          console.log(`[App] ✅ Loaded ${fetchedCategories.length} categories and ${fetchedPosters.length} posters`);

          setCategories(fetchedCategories);
          setPosters(fetchedPosters);
          setSelectedCategory(fetchedCategories[0]);
          setUsingFallback(false);
        } else {
          throw new Error(`Invalid or empty data: categories=${fetchedCategories?.length || 0}, posters=${fetchedPosters?.length || 0}`);
        }
      } catch (err) {
        console.error("[App] ❌ Error loading data from Supabase:", err);
        console.warn("[App] ⚠️ Falling back to static data");

        // Fallback to static data
        const uniqueCategories = [...new Set(STATIC_POSTERS.map(p => p.category))].sort();
        setCategories(uniqueCategories);
        setPosters(STATIC_POSTERS);
        setSelectedCategory(uniqueCategories[0]);
        setUsingFallback(true);
      } finally {
        setLoadingData(false);
        console.log('[App] 🏁 Data initialization complete');
      }
    }

    initData();
  }, []);

  const filteredPosters = useMemo(() => {
    if (!selectedCategory || !Array.isArray(posters)) return [];
    const filtered = posters.filter(p => p.category === selectedCategory);
    console.log(`[App] Filtered ${filtered.length} posters for category: ${selectedCategory}`);
    return filtered;
  }, [selectedCategory, posters]);

  const handleCategorySelect = (category: string) => {
    console.log('[App] Category selected:', category);
    setSelectedCategory(category);
    setSelectedPoster(null);
  };

  const handlePosterSelect = (poster: MoviePoster) => {
    console.log('[App] Poster selected:', poster.title);
    setSelectedPoster(poster);
  };

  const confirmTemplate = () => {
    if (selectedPoster) {
      console.log('[App] Confirming poster and moving to photo upload');
      setCurrentStep(AppStep.UPLOAD_PHOTO);
      window.scrollTo(0, 0);
    }
  };

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleImageUpload = async (base64: string) => {
    if (!selectedPoster) return;
    setPendingPhoto(base64);

    if (credits > 0 && userId) {
      console.log('[App] 🎫 Using existing credit, skipping payment...');
      showToastNotification("Using 1 Credit from your balance...");

      const newCredits = credits - 1;
      setCredits(newCredits); // Optimistic update
      await updateUserCredits(userId, newCredits);

      // Record usage transaction (optional, but good for tracking)
      await recordTransaction(userId, 0, -1, 'credit_usage', 'success');

      proceedToGeneration(base64);
    } else {
      setCurrentStep(AppStep.PAYMENT);
      window.scrollTo(0, 0);
    }
  };

  const handleUseCredit = async () => {
    if (credits > 0 && userId) {
      const newCredits = credits - 1;
      setCredits(newCredits); // Optimistic update
      await updateUserCredits(userId, newCredits);
      proceedToGeneration();
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    // Check if Razorpay script is loaded
    if (typeof window.Razorpay === 'undefined') {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      alert("Razorpay Key ID is missing. Please check your configuration.");
      return;
    }

    try {
      // 1. Create Order on Backend (Vercel Function)
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Amount in paise
          currency: "INR"
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If JSON parse fails, it might be an HTML error page (e.g. 404 from Vite)
          throw new Error(`API Error ${response.status}: Non-JSON response`);
        }
        const errorMessage = errorData?.details || errorData?.error || `Failed to create order (${response.status})`;
        throw new Error(errorMessage);
      }

      const order = await response.json();
      console.log('[App] 📦 Order Created:', order);

      // 2. Initialize Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chitram",
        description: `Purchase ${plan.credits} Credits`,
        order_id: order.id, // This is the key part!
        handler: async function (response: any) {
          console.log("Payment Successful", response);

          if (userId) {
            // Record the purchase transaction
            await recordTransaction(
              userId,
              plan.price,
              plan.credits,
              response.razorpay_payment_id,
              'success'
            );

            if (selectedPoster && pendingPhoto) {
              // Scenario A: User is in the middle of a flow
              const newCredits = credits + plan.credits - 1;
              setCredits(newCredits);
              await updateUserCredits(userId, newCredits);
              await recordTransaction(userId, 0, -1, 'credit_usage_after_purchase', 'success');
              proceedToGeneration();
            } else {
              // Scenario B: Direct purchase
              const newCredits = credits + plan.credits;
              setCredits(newCredits);
              await updateUserCredits(userId, newCredits);

              showToastNotification(`Successfully added ${plan.credits} credits!`);
              setCurrentStep(AppStep.SELECT_TEMPLATE);
              window.scrollTo(0, 0);
            }
          }
        },
        theme: {
          color: "#FACC15"
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        console.error("Payment Failed:", response.error);
        alert("Payment Failed: " + (response.error.description || "Please try again."));
      });
      rzp1.open();

    } catch (err: any) {
      console.error("Payment Initialization Error:", err);
      alert(`Failed to initialize payment: ${err.message}`);
    }
  };

  const proceedToGeneration = async (photoOverride?: string) => {
    const photoToUse = photoOverride || pendingPhoto;

    if (!selectedPoster || !photoToUse) {
      console.error('[App] Missing poster or photo for generation');
      return;
    }

    console.log('[App] 🎬 Starting poster generation...');
    console.log('[App] Poster:', selectedPoster.title);
    console.log('[App] Using prompt:', selectedPoster.prompts);

    setCurrentStep(AppStep.PROCESSING);
    setError(null);

    try {
      const result = await generateMoviePoster(
        selectedPoster.imageUrl,
        photoToUse,
        selectedPoster.prompts  // ✅ Using custom prompts from database
      );

      setGeneratedImage(result);

      // Save to History
      if (userId && result) {
        console.log('[App] 💾 Saving to history...');
        await saveUserHistory(userId, result, selectedPoster.id);
        // Refresh history
        const updatedHistory = await fetchUserHistory(userId);
        setHistory(updatedHistory);
      }

      setCurrentStep(AppStep.RESULT);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate the image. Please check your API Key and try again.");
      setCurrentStep(AppStep.ERROR);
    }
  };

  const resetApp = () => {
    console.log('[App] 🔄 Resetting app to initial state');
    setCurrentStep(AppStep.SELECT_TEMPLATE);
    setSelectedPoster(null);
    setGeneratedImage(null);
    setPendingPhoto(null);
    setError(null);
    window.scrollTo(0, 0);
  };

  // Loading Screen for Initial Data
  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Loading Studio</h1>
        <p className="text-slate-400">Connecting to database...</p>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!generatedImage || !selectedPoster) return;

    try {
      // Convert Base64 to Blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Create Object URL
      const url = window.URL.createObjectURL(blob);

      // Create temporary link
      const link = document.createElement('a');
      link.href = url;
      link.download = `chitram-${selectedPoster.id}.png`;
      document.body.appendChild(link);

      // Trigger click
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: Open in new tab
      window.open(generatedImage, '_blank');
    }
  };

  const handleShare = async () => {
    if (!generatedImage || !selectedPoster) return;

    try {
      // Convert Base64 to Blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `chitram-${selectedPoster.id}.png`, { type: 'image/png' });

      // Check if Web Share API is supported and can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Chitram Studio',
          text: `Check out my image created with Chitram! https://chitram-website.vercel.app/`,
        });
      } else {
        // Fallback for desktop or unsupported browsers
        // Try to open WhatsApp Web with text
        const text = encodeURIComponent(`Check out my image created with Chitram! https://chitram-website.vercel.app/`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200 selection:text-slate-900 relative overflow-hidden">

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-200/40 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-orange-100/40 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={resetApp}>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-lg blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg text-slate-900 shadow-lg shadow-yellow-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Chitram
              </span>
              {usingFallback && (
                <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 rounded w-fit mt-0.5">
                  Offline Mode
                </span>
              )}
            </div>
          </div>
          {currentStep !== AppStep.SELECT_TEMPLATE && (
            <button
              onClick={resetApp}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100"
            >
              Start Over
            </button>
          )}

          <button
            onClick={() => setShowHistory(true)}
            className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100"
          >
            My History
          </button>

          <button
            onClick={() => setCurrentStep(AppStep.PAYMENT)}
            className="ml-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors px-3 py-1.5 rounded-full hover:bg-yellow-50"
          >
            Buy Credits
          </button>

          {credits > 0 && (
            <div className="ml-4 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              {credits} Credits
            </div>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {
        showToast && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
              <span className="text-yellow-400 text-xl">✨</span>
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )
      }

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {currentStep === AppStep.SELECT_TEMPLATE ? (
          <SocialProofMarquee />
        ) : (
          <StepIndicator currentStep={currentStep} />
        )}

        {/* Step 1: Select Template */}
        {currentStep === AppStep.SELECT_TEMPLATE && (
          <div className="space-y-8 animate-fade-in">

            {categories.length > 0 ? (
              <>
                <CategoryTabs
                  categories={categories}
                  selectedCategory={selectedCategory || (categories[0] ? categories[0] : '')}
                  onSelect={handleCategorySelect}
                />

                <Gallery
                  posters={filteredPosters}
                  onSelect={handlePosterSelect}
                  selectedId={selectedPoster?.id}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No styles found in database.</p>
                <p className="text-sm text-slate-400 mt-2">Please run the SQL seed script in your Supabase dashboard.</p>
              </div>
            )}

            {/* Sticky Action Bar */}
            <div className={`fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 w-auto sm:w-[400px] z-40 transition-all duration-500 transform ${selectedPoster ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="p-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl shadow-yellow-500/20">
                <Button
                  disabled={!selectedPoster}
                  onClick={confirmTemplate}
                  fullWidth
                  className="shadow-lg shadow-yellow-500/30"
                >
                  Continue with Selection
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Upload Photo */}
        {currentStep === AppStep.UPLOAD_PHOTO && selectedPoster && (
          <div className="animate-fade-in py-4">
            <ImageUploader
              selectedTemplate={selectedPoster}
              onImageSelected={handleImageUpload}
              onBack={() => setCurrentStep(AppStep.SELECT_TEMPLATE)}
            />
            <div className="mt-12 border-t border-slate-200 pt-12">
              <SocialProofGallery />
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === AppStep.PAYMENT && (
          <div className="animate-fade-in py-4">
            <PricingPlans
              onPlanSelect={handlePlanSelect}
              onBack={() => setCurrentStep(AppStep.UPLOAD_PHOTO)}
              currentCredits={credits}
              onUseCredit={handleUseCredit}
            />
            <div className="mt-12 border-t border-slate-200 pt-12">
              <SocialProofGallery />
            </div>
          </div>
        )}

        {/* Step 4: Processing */}
        {currentStep === AppStep.PROCESSING && (
          <ProcessingScreen posterTitle={selectedPoster?.title || "Movie Poster"} />
        )}

        {/* Step 5: Result */}
        {currentStep === AppStep.RESULT && generatedImage && (
          <div className="animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center mb-10">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 mb-4 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Generated Successfully
              </span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Final Cut</h2>
              <p className="text-slate-500 text-lg">You look amazing! Download your poster below.</p>
            </div>

            <div className="group relative bg-white p-4 rounded-3xl shadow-2xl shadow-slate-300/50 transition-all duration-500 hover:shadow-yellow-500/20 border border-slate-100 mb-10 rotate-1 hover:rotate-0">
              <img
                src={generatedImage}
                alt="Generated Result"
                className="w-full rounded-2xl shadow-inner bg-slate-100"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 pointer-events-none"></div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 pb-20 sm:pb-0">
              <div className="w-full sm:w-auto">
                <Button
                  fullWidth
                  className="shadow-yellow-500/30"
                  onClick={handleDownload}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Original
                </Button>
              </div>
              <div className="w-full sm:w-auto">
                <Button
                  fullWidth
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                  onClick={handleShare}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM12.05 20.21c-1.5 0-2.97-.4-4.26-1.16l-.3-.18-3.16.83.84-3.08-.2-.32a8.26 8.26 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c.25-.12 1.47-.72 1.68-.81.21-.09.36-.13.52.12.15.25.6 1.02.73 1.23.13.22.23.37-.02.5-.25.13-1.05.39-2 .81-.75.33-1.26.74-1.41.92-.15.18-.32.39-.32.74 0 .35.18.59.38.8.2.21.9.35 1.23.35.33 0 .66-.01.92-.01.26 0 .54.01.83 1.35.29 1.35.17 2.37.13 2.49-.04.12-.15.18-.32.27z" />
                  </svg>
                  Share
                </Button>
              </div>
              <Button variant="secondary" onClick={resetApp} fullWidth className="sm:w-auto">
                Try Another Style
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentStep === AppStep.ERROR && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <div className="inline-block p-6 bg-red-50 rounded-3xl mb-6 border border-red-100 shadow-lg shadow-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Cut! Something went wrong.</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
              <Button onClick={() => setCurrentStep(AppStep.UPLOAD_PHOTO)} fullWidth>Try Again</Button>
              <Button variant="outline" onClick={resetApp} fullWidth>Return Home</Button>
            </div>
          </div>
        )}
      </main>

      {/* History Gallery Modal */}
      {
        showHistory && (
          <HistoryGallery
            history={history}
            onClose={() => setShowHistory(false)}
          />
        )
      }

      {/* Footer / Sync Section */}
      <footer className="relative z-10 py-8 bg-slate-50 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Your ID:</span>
            <code className="bg-slate-200 px-2 py-1 rounded text-xs font-mono select-all" title="Keep this ID safe to restore your credits">{userId}</code>
            <button
              onClick={() => {
                if (userId) {
                  navigator.clipboard.writeText(userId);
                  alert("User ID copied to clipboard!");
                }
              }}
              className="text-yellow-600 hover:text-yellow-700 underline text-xs"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/918587880823"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-green-600 font-medium hover:underline"
            >
              Need Help?
            </a>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                const id = prompt("Enter your User ID to restore credits:");
                if (id && id.trim()) {
                  if (confirm("Switching users will reload the page. Continue?")) {
                    localStorage.setItem('cine_user_id', id.trim());
                    window.location.reload();
                  }
                }
              }}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline"
            >
              Restore Purchases
            </button>
            <span className="text-slate-300">|</span>
            <span>Chitram © 2025</span>
          </div>
        </div>
      </footer>
    </div >
  );
}
