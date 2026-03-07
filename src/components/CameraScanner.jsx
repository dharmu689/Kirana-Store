import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { VideoCameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const CameraScanner = ({ isOpen, onScanSuccess, scannerActive }) => {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef(null);
    const lastScanTimeRef = useRef(0);
    const lastScannedCodeRef = useRef('');

    // Fetch available cameras when component mounts
    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setCameras(devices);
                // Try back camera by default if multiple, else first available
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
                if (backCamera) {
                    setSelectedCamera(backCamera.id);
                } else {
                    // fallback exact mobile facingMode constraint instead of string ID if on phone
                    setSelectedCamera(devices[0].id);
                }
            }
        }).catch(err => {
            console.error("Camera detection failed", err);
        });

        return () => {
            stopScanner();
        };
    }, []);

    // Start/Stop scanner strictly bound to isOpen AND scannerActive context
    useEffect(() => {
        if (isOpen && scannerActive && selectedCamera) {
            startScanner();
        } else {
            stopScanner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, scannerActive, selectedCamera]);

    const startScanner = async () => {
        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode("camera-reader");
            }

            if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }

            // On mobile, force rear camera if possible by passing facingMode instead of deviceId
            const cameraConfig = selectedCamera ? selectedCamera : { facingMode: "environment" };

            await html5QrCodeRef.current.start(
                cameraConfig,
                {
                    fps: 30,    // max fps for rapid parsing
                    aspectRatio: 1.0, // strict 1:1 prevents weird mobile stretching
                    disableFlip: false, // allow omni-directional scanning (upside down, slanted)
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.CODE_93,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                        Html5QrcodeSupportedFormats.QR_CODE
                    ]
                },
                (decodedText) => {
                    const now = Date.now();
                    // Prevent rapid duplicate scans of the SAME barcode (1.5s cooldown)
                    if (decodedText === lastScannedCodeRef.current && now - lastScanTimeRef.current < 1500) {
                        return; // ignore exact duplicate too fast
                    }

                    // Accept scan if it's a new product, or if enough time passed for the same product
                    lastScannedCodeRef.current = decodedText;
                    lastScanTimeRef.current = now;
                    onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // background noise
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Failed to start scanner", err);
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-full flex justify-center mt-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-4 h-full">
            <div className="w-full max-w-lg flex flex-col h-full">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <VideoCameraIcon className="h-5 w-5 text-indigo-500" />
                        Live Camera Scanner
                    </h2>

                    <div className="flex items-center">
                        <select
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 max-w-[200px]"
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                        >
                            {cameras.map(camera => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label || `Camera ${camera.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="w-full bg-black/10 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center min-h-[50vh] xl:min-h-[400px]">
                    {!isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                            <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Initializing Optical Lens...</p>
                        </div>
                    )}
                    <div id="camera-reader" className="w-full h-full flex flex-col items-center justify-center"></div>

                    {/* Modern UI Scanner Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                            {/* Animated Red Laser Line (Full width now) */}
                            <div className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                </div>

                <div className="text-center py-3 bg-gray-50 dark:bg-gray-900 rounded-xl mt-2">
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        System Active & Scanning
                    </p>
                </div>

            </div>

            <style>
                {/* CSS to ensure html5-qrcode scales cleanly without weird stretching */}
                {`
                    #camera-reader { width: 100%; border: none !important; text-align: center; }
                    #camera-reader video { 
                        width: 100% !important; 
                        height: auto !important; 
                        max-height: 60vh !important;
                        border-radius: 0.75rem; 
                        margin: 0 auto; 
                        display: block; 
                        object-fit: contain !important; 
                    }
                    
                    @keyframes scan {
                        0% { top: 10%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 90%; opacity: 0; }
                    }
                    
                    /* Hide html5-qrcode's ugly default permission buttons if they momentarily flash */
                    #camera-reader button {
                        background-color: #6366f1 !important;
                        color: white !important;
                        border-radius: 0.5rem !important;
                        padding: 0.5rem 1rem !important;
                        font-weight: 600 !important;
                        border: none !important;
                        margin-top: 1rem !important;
                    }
                    #camera-reader select { display: none !important; }
                `}
            </style>
        </div>
    );
};

export default CameraScanner;
