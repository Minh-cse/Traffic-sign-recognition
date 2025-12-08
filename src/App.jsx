import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam'; 
import axios from 'axios'; 
import { Camera, Users, Info, Play, AlertTriangle, Check, Activity, User, Navigation2Icon } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('detection');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detections, setDetections] = useState([]);
  
  const webcamRef = useRef(null);

  // NEW: Function to process backend response into your UI format
  const processBackendResponse = (backendData) => {
    // Assuming backend returns: { label: "Stop Sign", score: 0.98 }
    return {
      id: Date.now(), // Unique ID
      type: backendData.label || "Unknown Object", 
      confidence: `${(backendData.score * 100).toFixed(0)}%`,
      time: 'Just now',
      color: backendData.label === 'Stop Sign' ? 'text-red-500' : 'text-[#69c280]' // Simple color logic
    };
  };

  // NEW: The Capture Logic
  const captureAndDetect = useCallback(async () => {
    if (webcamRef.current) {
      // 1. Capture Base64
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        try {
          // 2. Send to Python Backend
          // Replace URL with your actual Python endpoint
          const response = await axios.post("http://localhost:5000/upload_image", {
            image: imageSrc
          });

          // 3. Update State with Real Data
          // We assume the backend returns a "detection" object
          if (response.data && response.data.detection) {
            const newDetection = processBackendResponse(response.data.detection);
            
            setDetections(prev => {
              const newDetections = [newDetection, ...prev].slice(0, 5);
              return newDetections;
            });
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
      }
    }
  }, [webcamRef]);

  // NEW: Modified Effect Hook
  useEffect(() => {
    let interval;
    if (isCameraActive) {
      // capture every 2 seconds to avoid network congestion
      interval = setInterval(() => {
        captureAndDetect(); 
      }, 2000); 
    } else {
      setDetections([]);
    }
    return () => clearInterval(interval);
  }, [isCameraActive, captureAndDetect]);
  

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  const renderContent = () => {
    const contentKey = activeTab;

    switch (activeTab) {
      case 'detection':
        return (
          <div key={contentKey} className="space-y-6">
            <div className="text-center text-white mb-6 animate-fly-in" style={{ animationDelay: '0ms' }}>
              <h2 className="text-xl font-semibold opacity-90">Traffic Sign Detection</h2>
              <p className="text-sm opacity-75">Point your camera at traffic signs and watch our AI detect them in real-time!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Camera Feed Area */}
              <div className="lg:col-span-2 animate-fly-in" style={{ animationDelay: '100ms' }}>
                <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden shadow-xl border-4 border-white/20 flex flex-col items-center justify-center">
                  
                  {!isCameraActive ? (
                    // OFF STATE
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-20 bg-slate-900">
                      <Camera size={64} className="mb-4 opacity-50" />
                      <p className="mb-6 font-medium">Camera is off</p>
                      <button 
                        onClick={toggleCamera}
                        className="bg-[#69c280] hover:bg-[#5ab370] text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-[#69c280]/40"
                      >
                        <Play size={20} />
                        Start Camera
                      </button>
                    </div>
                  ) : (
                    // ON STATE
                    <div className="relative w-full h-full">
                      
                      {/* NEW: The Actual Webcam Component */}
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="absolute inset-0 w-full h-full object-cover"
                        videoConstraints={{ facingMode: "environment" }} // Uses back camera on mobile
                      />

                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-sm animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          LIVE FEED
                        </div>
                        
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-auto">
                          <button 
                            onClick={toggleCamera}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg backdrop-blur-sm bg-opacity-90"
                          >
                            Stop Camera
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-fly-in" style={{ animationDelay: '200ms' }}>
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                    <div className="w-10 h-10 bg-[#69c280]/20 rounded-full flex items-center justify-center text-[#69c280] mb-3">
                      <Camera size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-700 text-sm">Real-time Detection</h3>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                    <div className="w-10 h-10 bg-[#ebe46c]/30 rounded-full flex items-center justify-center text-yellow-700 mb-3">
                      <Check size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-700 text-sm">High Accuracy</h3>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-700 text-sm">Instant Alerts</h3>
                  </div>
                </div>
              </div>

              {/* Sidebar Detection List */}
              <div className="bg-white rounded-xl shadow-xl p-6 h-full min-h-[400px] flex flex-col animate-fly-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-2 mb-6 text-slate-700">
                  <div className="w-8 h-8 bg-[#69c280]/20 rounded-full flex items-center justify-center text-[#69c280]">
                    <Activity size={16} />
                  </div>
                  <h3 className="font-bold">Recent Detections</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {detections.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                      <AlertTriangle size={48} className="mb-4 opacity-20" />
                      <p className="text-sm">No detections yet</p>
                      <p className="text-xs opacity-75 mt-1">Start the camera to begin</p>
                    </div>
                  ) : (
                    detections.map((det, index) => (
                      <div key={`${det.id}-${index}`} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 animate-slide-in">
                        <div className={`p-2 rounded-lg bg-white shadow-sm mr-3 ${det.color}`}>
                          <Navigation2Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-700">{det.type}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">{det.time}</span>
                            <span className="text-xs font-bold text-[#69c280] bg-[#69c280]/10 px-2 py-0.5 rounded-full">
                              {det.confidence} //can change 
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'about-us':
        return (
          <div key={contentKey} className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 md:p-12 animate-fly-in">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Meet the Team</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  We are a group of passionate developers and AI researchers dedicated to making roads safer through intelligent technology.
                </p>
              </div>
              {/* Team Members */}
              <div className="flex flex-wrap justify-center gap-8">
                {[1, 2, 3, 4, 5].map((member, index) => {
                  // --- LOGIC STARTS HERE ---
                  let roleTitle = "";

                  if (member <= 3) {
                    roleTitle = "AI Engineer";
                  } else if (member === 4) {
                    roleTitle = "Frontend Developer";
                  } else {
                    roleTitle = "Reporter";
                  }
                  // --- LOGIC ENDS HERE ---

                  // Now we explicitly return the JSX
                  return (
                    <div key={member} className="group relative w-full md:w-[calc(33.333%-2rem)] min-w-[250px] animate-fly-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 h-full">
                        <div className="w-24 h-24 bg-white mx-auto rounded-full mb-4 shadow-md flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                          <User size={40} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Team Member {member}</h3>
                        
                        {/* We use the variable we calculated above */}
                        <p className="text-[#69c280] text-sm font-medium mb-2">{roleTitle}</p>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'about-project':
        // ... (Keep existing 'about-project' code exactly as is)
        return (
          <div key={contentKey} className="max-w-4xl mx-auto animate-fly-in">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#69c280] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 animate-fly-in" style={{ animationDelay: '100ms' }}>
                  <h2 className="text-3xl font-bold mb-4">Project Overview</h2>
                  <p className="text-slate-300 max-w-2xl">
                    TrafficSignal is a state-of-the-art computer vision system designed to identify and classify road signs in real-time using lightweight neural networks.
                  </p>
                </div>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6 animate-fly-in" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="text-[#69c280]" />
                      Technical Stack
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#69c280] mt-2"></div>
                        <div>
                          <span className="font-semibold text-slate-700 block">YOLOv8 Architecture</span>
                          <span className="text-sm text-slate-500">Utilized for high-speed object detection with 99.2% mAP.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#69c280] mt-2"></div>
                        <div>
                          <span className="font-semibold text-slate-700 block">TensorFlow.js</span>
                          <span className="text-sm text-slate-500">Enables client-side inference directly in the browser without server latency.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#69c280] mt-2"></div>
                        <div>
                          <span className="font-semibold text-slate-700 block">React & Tailwind</span>
                          <span className="text-sm text-slate-500">For a responsive, accessible, and performant user interface.</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 animate-fly-in" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Key Capabilities</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Speed Limit Detection</span>
                        <span className="font-bold text-[#69c280]">98% Accuracy</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#69c280] h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-slate-600">Stop Sign Recognition</span>
                        <span className="font-bold text-[#69c280]">99.5% Accuracy</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#69c280] h-2 rounded-full" style={{ width: '99.5%' }}></div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-slate-600">Low Light Performance</span>
                        <span className="font-bold text-[#69c280]">92% Accuracy</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#69c280] h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#69c280] via-[#ebe46c] to-[#69c280] font-sans text-slate-800">
      {/* Header */}
      <header className="px-6 pt-6 pb-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <Navigation2Icon size={24} className="text-[#69c280]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">TrafficSignAI</h1>
            <p className="text-xs text-white/90 font-medium tracking-wide">Smart Detection System</p>
          </div>
        </div>
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-4">
          <button onClick={() => setActiveTab('detection')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${activeTab === 'detection' ? 'bg-white text-[#69c280] translate-y-0 shadow-md' : 'bg-white/30 text-white hover:bg-white/40 hover:-translate-y-0.5'}`}>
            <Camera size={18} /> Detection
          </button>
          <button onClick={() => setActiveTab('about-us')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${activeTab === 'about-us' ? 'bg-white text-[#69c280] translate-y-0 shadow-md' : 'bg-white/30 text-white hover:bg-white/40 hover:-translate-y-0.5'}`}>
            <Users size={18} /> About Us
          </button>
          <button onClick={() => setActiveTab('about-project')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${activeTab === 'about-project' ? 'bg-white text-[#69c280] translate-y-0 shadow-md' : 'bg-white/30 text-white hover:bg-white/40 hover:-translate-y-0.5'}`}>
            <Info size={18} /> About Project
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 pt-4">
        {renderContent()}
      </main>

      <footer className="text-center text-emerald-900/60 py-6 text-sm">
        <p>&copy; 2025 TrafficSignal AI. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          box-shadow: 0 0 15px rgba(105, 194, 128, 0.5);
        }
        @keyframes flyInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fly-in {
          animation: flyInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default App;