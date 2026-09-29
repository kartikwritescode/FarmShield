'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  QrCode,
  Flashlight,
  RefreshCw,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Milk,
  Info,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { useAuth } from '../../providers/AuthProvider';

export default function BrowserScannerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const scannerRef = useRef<any>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Synthesizes a clean audio beep using Web Audio API on successful scan
  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  /**
   * Intelligent QR Parser:
   * Supports:
   * 1. Full URLs: https://farmshield.in/qr/COW-101 -> COW-101
   * 2. Raw tokens: SHW-9102-MRL-SECURE, COW-101
   * 3. JSON strings: {"qr_token": "...", "animal_code": "..."}
   * 4. UUIDs
   */
  const parseQRToken = useCallback((decodedText: string): string => {
    const raw = decodedText.trim();

    // Check if JSON format
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.qr_token) return String(parsed.qr_token).trim();
        if (parsed.animal_code) return String(parsed.animal_code).trim();
        if (parsed.token) return String(parsed.token).trim();
        if (parsed.animal_id) return String(parsed.animal_id).trim();
        if (parsed.id) return String(parsed.id).trim();
      } catch {}
    }

    // Check if full URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const url = new URL(raw);
        const segments = url.pathname.split('/').filter(Boolean);
        const qrIndex = segments.indexOf('qr');
        if (qrIndex !== -1 && segments.length > qrIndex + 1) {
          return decodeURIComponent(segments[qrIndex + 1]).trim();
        }
        // If last segment exists
        if (segments.length > 0) {
          return decodeURIComponent(segments[segments.length - 1]).trim();
        }
      } catch {}
    }

    return raw;
  }, []);

  // Handle successful code detection
  const handleDecodedCode = useCallback(
    (decodedText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      playSuccessBeep();

      const extractedToken = parseQRToken(decodedText);
      setScanResult(extractedToken);

      // Stop scanner before redirecting
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
      }

      // Short delay for visual checkmark before navigation
      setTimeout(() => {
        router.push(`/qr/${encodeURIComponent(extractedToken)}`);
      }, 700);
    },
    [isProcessing, parseQRToken, router]
  );

  // Initialize html5-qrcode
  useEffect(() => {
    let html5QrCode: any = null;
    let isMounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!isMounted) return;

        html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: cameraFacing },
          config,
          (decodedText: string) => {
            handleDecodedCode(decodedText);
          },
          () => {
            // Ignore frame error during continuous scanning
          }
        );

        if (isMounted) {
          setCameraActive(true);
          setScannerError(null);

          // Get active video track for torch/flashlight capability
          try {
            const videoElem = document.querySelector('#qr-reader-container video') as HTMLVideoElement | null;
            if (videoElem && videoElem.srcObject) {
              const stream = videoElem.srcObject as MediaStream;
              const tracks = stream.getVideoTracks();
              if (tracks.length > 0) {
                videoTrackRef.current = tracks[0];
              }
            }
          } catch {}
        }
      } catch (err: any) {
        console.warn('html5-qrcode start failed:', err);
        if (isMounted) {
          setCameraActive(false);
          setScannerError(
            err.message?.includes('Permission')
              ? 'Camera permission was denied. Please grant camera access in your browser settings or use manual lookup below.'
              : 'Unable to start camera feed. Please check camera connections or use manual lookup below.'
          );
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode) {
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [cameraFacing, handleDecodedCode]);

  // Flip front/back camera
  const handleFlipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle flashlight / torch
  const handleToggleTorch = async () => {
    if (!videoTrackRef.current) return;
    try {
      const nextState = !torchOn;
      await (videoTrackRef.current as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch {
      alert('Torch is not supported on this device/browser.');
    }
  };

  // Manual lookup
  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const token = parseQRToken(manualCode);
    router.push(`/qr/${encodeURIComponent(token)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-24 lg:pb-12 space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/livestock"
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  National Food Safety & MRL Verification
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Camera className="w-6 h-6 text-teal-600" />
                  Web Camera QR Scanner
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs ${
                  cameraActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{cameraActive ? 'Camera Live' : 'Camera Standby'}</span>
              </span>
            </div>
          </div>

          {/* Scanner Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
            {/* Viewfinder Viewport Container */}
            <div className="relative mx-auto w-full max-w-md bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800">
              {/* html5-qrcode mount target */}
              <div id="qr-reader-container" className="w-full min-h-[320px] aspect-square" />

              {/* Custom Animated Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 4 Corner Reticle Brackets */}
                <div className="relative w-64 h-64 border-2 border-dashed border-teal-400/80 rounded-2xl flex items-center justify-center">
                  {/* Top-Left Corner */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                  {/* Top-Right Corner */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                  {/* Bottom-Left Corner */}
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                  {/* Bottom-Right Corner */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                  {/* Animated Teal Scan Laser */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_8px_#2dd4bf] animate-[bounce_2.5s_infinite]" />

                  {/* Centered Instruction */}
                  <span className="text-[11px] font-mono font-bold text-teal-300 bg-slate-950/80 px-3 py-1 rounded-full border border-teal-500/40">
                    ALIGN EAR-TAG QR IN RETICLE
                  </span>
                </div>
              </div>

              {/* Floating Camera Controls (Parity with Flutter QRScannerView) */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={handleToggleTorch}
                  title="Toggle Torch Flashlight"
                  className={`p-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                    torchOn
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                >
                  <Flashlight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  title="Flip Front / Rear Camera"
                  className="p-2.5 rounded-xl bg-black/60 text-white hover:bg-black/80 text-xs font-bold transition shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Successful Scan Splash Overlay */}
              {scanResult && (
                <div className="absolute inset-0 bg-teal-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-30 animate-in fade-in zoom-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center mb-3 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">QR Verified!</h3>
                  <p className="text-xs text-teal-200 font-mono mt-1 mb-2">Token: {scanResult}</p>
                  <span className="text-xs text-teal-300 font-medium">
                    Loading Food Safety Passport...
                  </span>
                </div>
              )}
            </div>

            {/* Camera Error / Instructions */}
            {scannerError && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Camera Feed Notice:</span>
                  <span>{scannerError}</span>
                </div>
              </div>
            )}

            {/* Manual Entry Fallback Form */}
            <div className="max-w-md mx-auto space-y-3 pt-2">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Or Enter Code Manually
                </span>
              </div>

              <form onSubmit={handleManualLookup} className="space-y-3">
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter QR Token, Tag ID, or URL (e.g. COW-101)..."
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify Food Safety Passport</span>
                </button>
              </form>
            </div>

            {/* Evaluator 1-Click Fast Presets */}
            <div className="max-w-md mx-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Evaluator Instant Test Presets (1-Click):
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/qr/MRH-8841-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold shadow-xs transition"
                >
                  🟢 Murrah Buffalo (MRL Cleared)
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/qr/SHW-9102-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 text-xs font-bold shadow-xs transition"
                >
                  🔴 Sahiwal Cow (Withholding Active)
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/qr/GIR-4412-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold shadow-xs transition"
                >
                  🟢 Gir Cattle (Zero Residue)
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/qr/COW-101')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold shadow-xs transition"
                >
                  📋 Standard Tag (COW-101)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
