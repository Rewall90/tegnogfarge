'use client';

import { useState, useRef, DragEvent, ChangeEvent, useCallback } from 'react';
import Image from 'next/image';
import { CTAButton } from './CTAButton';

// ============================================================================
// COMPARISON SLIDER COMPONENT
// ============================================================================

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

function ComparisonSlider({ beforeImage, afterImage, beforeAlt = 'Original', afterAlt = 'Coloring page' }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none max-w-[340px] mx-auto rounded-xl shadow-lg"
    >
      {/* Before image (original photo) - clipped using clip-path */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="w-full h-auto aspect-[3/4] object-cover"
          draggable={false}
        />
      </div>

      {/* After image (coloring page) - full size background */}
      <div>
        <img
          src={afterImage}
          alt={afterAlt}
          className="w-full h-auto aspect-[3/4] object-cover"
          draggable={false}
        />
      </div>

      {/* Slider input - invisible range input covering the whole area */}
      <div className="absolute top-0 left-0 w-full h-full">
        <label className="block w-full h-full cursor-ew-resize">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={sliderPosition}
            onChange={handleChange}
            className="w-full h-full bg-transparent appearance-none cursor-ew-resize focus:outline-none opacity-0"
          />
        </label>
      </div>

      {/* Slider handle line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center gap-1 border-2 border-gray-200">
          <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">
        Ekte Bilde
      </div>
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">
        Fargelegging
      </div>
    </div>
  );
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PopupState =
  | 'upload'      // Initial state - user can upload image
  | 'preview'     // User sees their uploaded image
  | 'processing'  // AI is generating coloring page
  | 'result'      // Show the generated coloring page
  | 'email'       // Collect email before download (optional gate)
  | 'success';    // Final thank you state

export interface PhotoColoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit?: (email: string) => Promise<void>; // Optional email collection
  onUploadAttempt?: () => void; // Track when user attempts to upload
  onGenerationComplete?: () => void; // Track when AI generation completes
  campaignId?: string; // Campaign ID for tracking
  requireEmail?: boolean; // If true, require email before download (deprecated)
}

interface GeneratedImage {
  data: string; // Base64
  mimeType: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============================================================================
// COMPONENT
// ============================================================================

export function PhotoColoringPopup({
  isOpen,
  onClose,
  onEmailSubmit,
  onUploadAttempt,
  onGenerationComplete,
  campaignId,
}: PhotoColoringPopupProps) {
  // State
  const [state, setState] = useState<PopupState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Don't render if not open
  if (!isOpen) return null;

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Vennligst velg et bilde (JPG, PNG eller WebP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Bildet er for stort. Maks 10MB.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Track upload attempt
    onUploadAttempt?.();

    // Clear any previous errors
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setState('preview');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ============================================================================
  // AI PROCESSING
  // ============================================================================

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateColoring = async () => {
    if (!selectedFile) {
      setError('Ingen bilde valgt');
      return;
    }

    setError(null);
    setState('processing');

    try {
      // Convert file to base64
      const base64Image = await fileToBase64(selectedFile);

      // Call API
      const response = await fetch('/api/photo-to-coloring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          mimeType: selectedFile.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke generere fargeleggingsbilde');
      }

      if (!data.image) {
        throw new Error('Ingen bilde i responsen');
      }

      // Store generated image
      setGeneratedImage({
        data: data.image.data,
        mimeType: data.image.mimeType,
      });

      // Track generation complete
      onGenerationComplete?.();

      setState('result');

    } catch (err) {
      console.error('[PhotoColoringPopup] Generation error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
      setState('preview'); // Go back to preview state
    }
  };

  // ============================================================================
  // DOWNLOAD
  // ============================================================================

  const handleDownload = () => {
    if (!generatedImage) return;

    // Create download link
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    link.download = 'fargeleggingsbilde.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Go to success state after download
    setState('success');
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const handleChangeImage = () => {
    // Clean up URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
    setError(null);
    setState('upload');
  };

  const handleTryAnother = () => {
    handleChangeImage();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Vennligst skriv inn en gyldig e-postadresse');
      return;
    }

    if (!generatedImage) {
      setError('Ingen bilde å sende');
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      // Send the coloring page via email
      const response = await fetch('/api/send-coloring-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          image: generatedImage.data,
          mimeType: generatedImage.mimeType,
          campaignId, // Include for email stats tracking
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke sende e-post');
      }

      // Optional callback
      if (onEmailSubmit) {
        await onEmailSubmit(email);
      }

      setState('success');
    } catch (err) {
      console.error('[PhotoColoringPopup] Email send error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Vennligst prøv igjen.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    // Clean up
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
    setEmail('');
    setError(null);
    setState('upload');
    onClose();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderUploadState = () => (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#264653] mb-3">
        Lag fargeleggingsbilde av ditt eget bilde!
      </h2>
      <p className="text-base sm:text-lg text-gray-600 mb-4">
        Last opp et bilde, og vi gjor det om til en fargeleggingstegning
      </p>

      {/* Demo Comparison Slider */}
      <div className="mb-6">
        <ComparisonSlider
          beforeImage="/images/photo-coloring-demo/demo-before.png"
          afterImage="/images/photo-coloring-demo/demo-after.png"
          beforeAlt="Original foto"
          afterAlt="Fargeleggingstegning"
        />
        <p className="text-xs text-gray-400 mt-2">Dra for a se for/etter</p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleUploadClick}
        className={`
          border-3 border-dashed rounded-xl p-8 cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-[#2EC4B6] bg-[#2EC4B6]/10 scale-[1.02]'
            : 'border-gray-300 hover:border-[#2EC4B6] hover:bg-gray-50'
          }
        `}
      >
        {/* Upload Icon */}
        <div className="flex justify-center mb-4">
          <svg
            className={`w-16 h-16 transition-colors ${isDragging ? 'text-[#2EC4B6]' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? 'Slipp bildet her!' : 'Dra og slipp bilde her'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          eller
        </p>
        <span className="inline-flex items-center px-6 py-3 bg-[#2EC4B6] text-white font-semibold rounded-lg hover:bg-[#27a89a] transition-colors">
          Velg bilde
        </span>
        <p className="text-xs text-gray-400 mt-4">
          JPG, PNG eller WebP. Maks 10MB.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          For best resultat, bruk bilder over 1000 piksler.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {/* Skip option */}
      <button
        type="button"
        onClick={handleClose}
        className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Nei takk, bare last ned bildet
      </button>
    </div>
  );

  const renderPreviewState = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#264653] mb-4">
        Ser bra ut!
      </h2>

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative w-full max-w-sm mx-auto mb-6 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={previewUrl}
            alt="Forhandsvisning av valgt bilde"
            width={400}
            height={300}
            className="w-full h-auto object-cover"
            unoptimized
          />
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Klar til a lage fargeleggingstegning av dette bildet?
      </p>

      {/* Error message */}
      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <CTAButton
          text="Lag fargeleggingsbilde!"
          onClick={handleGenerateColoring}
        />
        <button
          type="button"
          onClick={handleChangeImage}
          className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Velg et annet bilde
        </button>
      </div>

      {/* Skip option */}
      <button
        type="button"
        onClick={handleClose}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Nei takk, bare last ned bildet
      </button>
    </div>
  );

  const renderProcessingState = () => (
    <div className="text-center py-8">
      {/* Animated spinner */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-[#2EC4B6]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-[#2EC4B6] rounded-full animate-spin" />
        {/* Pencil icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#264653]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#264653] mb-2">
        Lager fargeleggingstegning...
      </h2>
      <p className="text-gray-600 mb-2">
        Vår AI tegner opp bildet ditt
      </p>
      <p className="text-sm text-gray-400">
        Dette tar vanligvis 10-30 sekunder
      </p>

      {/* Small preview */}
      {previewUrl && (
        <div className="mt-6 relative w-16 h-16 mx-auto rounded-lg overflow-hidden shadow opacity-50">
          <Image
            src={previewUrl}
            alt="Original"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );

  const renderResultState = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#264653] mb-2">
        Fargeleggingsbildet er klart!
      </h2>
      <p className="text-gray-600 mb-4">
        Skriv inn e-posten din for å motta bildet
      </p>

      {/* Generated image preview */}
      {generatedImage && (
        <div className="max-w-[240px] mx-auto mb-6">
          <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-[#2EC4B6]">
            <Image
              src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`}
              alt="Generert fargeleggingsbilde"
              width={240}
              height={320}
              className="w-full h-auto object-cover"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Email form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          className="w-full py-3 px-4 border-2 border-gray-300 focus:border-[#2EC4B6] rounded-lg text-[#264653] placeholder:text-gray-400 outline-none transition-colors"
          autoFocus
          disabled={isSending}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <CTAButton
          type="submit"
          text={isSending ? "Sender..." : "Send meg bildet på e-post"}
          disabled={isSending}
        />
      </form>

      {!isSending && (
        <button
          type="button"
          onClick={handleTryAnother}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Prøv med et annet bilde
        </button>
      )}
    </div>
  );

  const renderEmailState = () => (
    <div className="text-center">
      <div className="text-green-600 text-4xl mb-3">✓</div>
      <h2 className="text-2xl font-bold text-[#264653] mb-3">
        Bildet ditt er lastet ned!
      </h2>
      <p className="text-base text-gray-600 mb-6">
        Vil du motta flere gratis fargeleggingsbilder? Skriv inn e-posten din!
      </p>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          className="w-full py-3 px-4 border-2 border-[#2EC4B6] rounded-lg text-[#264653] placeholder:text-[#264653]/50"
          autoFocus
        />

        {error && (
          <p className="text-sm text-red-600 text-left">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <CTAButton
            type="submit"
            text="Ja, send meg tegninger!"
          />
          <button
            type="button"
            onClick={() => setState('success')}
            className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Nei takk
          </button>
        </div>
      </form>
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center py-6">
      <div className="text-green-600 text-5xl mb-4">✓</div>
      <h2 className="text-2xl font-bold text-[#264653] mb-3">
        Bildet er sendt!
      </h2>
      <p className="text-gray-600 mb-4">
        Sjekk innboksen din på <span className="font-medium">{email}</span> for fargeleggingsbildet ditt.
      </p>
      <p className="text-sm text-gray-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
        💡 <strong>Tips:</strong> Sjekk søppelpost/spam-mappen hvis du ikke finner e-posten.
      </p>
      <div className="flex flex-col gap-3">
        <CTAButton
          text="Lag et nytt bilde"
          onClick={handleTryAnother}
        />
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Lukk
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (state) {
      case 'upload':
        return renderUploadState();
      case 'preview':
        return renderPreviewState();
      case 'processing':
        return renderProcessingState();
      case 'result':
        return renderResultState();
      case 'email':
        return renderEmailState();
      case 'success':
        return renderSuccessState();
      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="photo-coloring-popup-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={state !== 'processing' ? handleClose : undefined}
        />

        {/* Modal panel */}
        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
          {/* Close button */}
          {state !== 'processing' && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
              aria-label="Lukk"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Content */}
          <div className="bg-white px-6 pt-8 pb-6 sm:p-8">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-xs text-gray-500">
              {state === 'processing'
                ? 'Bildene behandles av AI og lagres ikke.'
                : 'Vi respekterer personvernet ditt. Bildene dine blir ikke lagret.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
