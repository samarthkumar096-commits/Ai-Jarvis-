
import * as React from 'react';
import { 
  ShieldCheck, 
  History, 
  Upload, 
  ArrowRight,
  MessageSquare,
  Clock,
  ChevronRight,
  Info,
  Check,
  Copy,
  FileDown,
  Zap,
  X,
  Camera,
  RefreshCw,
  Settings,
  Shield,
  Mail,
  Home,
  Bell,
  Cpu,
  Radio,
  Scan,
  Database,
  Lock,
  Eye,
  Activity,
  Globe
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type AppState = 'splash' | 'dashboard' | 'analyze' | 'result' | 'history' | 'settings';
type Language = 'en' | 'hi';
type ComplaintType = 'cyber' | 'bank' | 'consumer';

interface EvidenceResult {
  platform: string;
  date: string;
  summary: string;
  trustScore: number;
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keyPoints: string[];
  complaints: { cyber: string; bank: string; consumer: string; };
  image: string;
  timestamp: string;
  hash: string;
}

const content = {
  en: {
    title: "J.A.R.V.I.S.",
    subtitle: "Just A Rather Intelligent System",
    dashboard: "SYSTEM HUD",
    vault: "INTEL VAULT",
    settings: "CONFIG",
    camera: "SCANNER",
    upload: "UPLINK",
    btnDownload: "EXPORT INTEL",
    disclaimer: "STARK INDUSTRIES SECURE PROTOCOL",
    guide: "SYSTEM DIAGNOSTICS"
  },
  hi: {
    title: "जाार्विस",
    subtitle: "इंटेलिजेंट सिस्टम",
    dashboard: "सिस्टम HUD",
    vault: "इंटेल वॉल्ट",
    settings: "कॉन्फ़िगर",
    camera: "स्कैनर",
    upload: "अपलिंक",
    btnDownload: "PDF एक्सपोर्ट",
    disclaimer: "स्टार्क इंडस्ट्रीज सुरक्षित प्रोटोकॉल",
    guide: "सिस्टम डायग्नोस्टिक्स"
  }
};

export default function JarvisApp() {
  const [lang, setLang] = React.useState<Language>('en');
  const [activeTab, setActiveTab] = React.useState<AppState>('splash');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<EvidenceResult | null>(null);
  const [history, setHistory] = React.useState<EvidenceResult[]>([]);
  const [analysisStep, setAnalysisStep] = React.useState(0);
  const [complaintType, setComplaintType] = React.useState<ComplaintType>('cyber');
  const [isCopied, setIsCopied] = React.useState(false);
  const [showCamera, setShowCamera] = React.useState(false);
  const [systemOnline, setSystemOnline] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const t = content[lang];

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([10, 30, 10]);
    }
  };

  const copyToClipboard = async (text: string) => {
    triggerHaptic();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const steps = [
    "BOOTING SYSTEM CORES...",
    "ACCESSING STARK MAINFRAME...",
    "EXTRACTING OPTICAL DATA...",
    "DECRYPTING METADATA STRINGS...",
    "GENERATING NEURAL SUMMARY..."
  ];

  React.useEffect(() => {
    if (activeTab === 'splash') {
      setTimeout(() => {
        setActiveTab('dashboard');
        setSystemOnline(true);
      }, 3000);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const startCamera = async () => {
    triggerHaptic();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      alert("Holographic Scanner Offline: Check Permissions");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const capturePhoto = () => {
    triggerHaptic();
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      analyzeImage(canvas.toDataURL('image/jpeg'), 'image/jpeg');
      stopCamera();
    }
  };

  const analyzeImage = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setActiveTab('analyze');
    setAnalysisStep(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as JARVIS (Stark AI). Use futuristic/analytical language.
        Analyze the provided image for evidence. Return JSON:
        platform, date, summary, trustScore(0-100), trustLevel(LOW/MEDIUM/HIGH), keyPoints(string array),
        complaints: {cyber, bank, consumer template drafts in ${lang === 'en' ? 'English' : 'Hindi'}}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data.split(',')[1], mimeType } },
            { text: prompt }
          ]
        },
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      const newResult = {
        ...data,
        image: base64Data,
        timestamp: new Date().toLocaleString(),
        hash: 'MARK-' + Math.random().toString(16).substring(2, 10).toUpperCase()
      };

      setResult(newResult);
      setHistory(p => [newResult, ...p]);
      setActiveTab('result');
    } catch (e) {
      setActiveTab('dashboard');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-[#22d3ee] flex flex-col overflow-hidden relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#083344_0%,transparent_70%)]" />
         <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="absolute h-[1px] bg-cyan-500/30 w-full" style={{ top: `${i * 10}%` }} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="absolute w-[1px] bg-cyan-500/30 h-full" style={{ left: `${i * 10}%` }} />
            ))}
         </div>
      </div>

      {/* SPLASH SCREEN */}
      <AnimatePresence>
        {activeTab === 'splash' && (
          <motion.div 
            exit={{ opacity: 0, scale: 1.5 }} 
            className="fixed inset-0 bg-[#020617] z-[500] flex flex-col items-center justify-center text-cyan-400"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="relative w-64 h-64 border-2 border-dashed border-cyan-500/50 rounded-full flex items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-4 border-t-2 border-cyan-400 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center glow-cyan"
              >
                <Cpu size={48} />
              </motion.div>
            </motion.div>
            <h1 className="mt-12 text-5xl font-black tracking-[0.3em] font-['Orbitron']">{t.title}</h1>
            <p className="mt-4 text-[10px] font-bold tracking-[0.8em] text-cyan-500/60 uppercase">{t.subtitle}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="px-6 pt-safe pb-4 bg-slate-900/40 backdrop-blur-md border-b border-cyan-500/20 flex items-center justify-between sticky top-0 z-[100] no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-cyan-400 flex items-center justify-center glow-cyan">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest font-['Orbitron']">{t.title}</span>
            <span className="text-[7px] font-black text-cyan-600 uppercase tracking-[0.2em]">Mark 1.5 // Online</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-cyan-500/50 rounded-full p-0.5 glow-cyan">
             <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=JARVIS" className="w-full h-full rounded-full grayscale hue-rotate-180" />
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28 relative">
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Scan size={80} /></div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 font-['Orbitron']">Neural Link Active.</h2>
                    <p className="text-[10px] font-medium text-cyan-500/60 max-w-[200px] mb-6">Environment analysis protocol initiated.</p>
                    <div className="flex gap-4">
                       <button onClick={startCamera} className="px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest glow-cyan active:scale-95 transition-all">Start Scanner</button>
                       <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 border border-cyan-500 text-cyan-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500/10 transition-all">Upload Data</button>
                    </div>
                 </div>
                 <HudMiniCard icon={<History size={20}/>} label="INTEL LOGS" value={history.length} />
                 <HudMiniCard icon={<Activity size={20}/>} label="CORE TEMP" value="42°C" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-600 mb-2">System Feed</h3>
                 <LogEntry text="JARVIS Core initialized..." time="00:01" />
                 <LogEntry text="Stark VPN encrypted tunnel active." time="00:03" />
              </div>
            </motion.div>
          )}

          {activeTab === 'analyze' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="relative mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-32 h-32 border-4 border-cyan-900 border-t-cyan-400 rounded-full glow-cyan" />
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 flex items-center justify-center text-cyan-400"><Cpu size={40} /></motion.div>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-widest font-['Orbitron']">DECRYPTING...</h3>
              <p className="text-cyan-500 font-bold uppercase tracking-[0.3em] text-[10px] h-4">{steps[analysisStep]}</p>
            </motion.div>
          )}

          {activeTab === 'result' && result && (
            <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveTab('dashboard')} className="p-2 border border-cyan-500/30 rounded-full text-cyan-400 active:scale-90 transition-all"><X size={24} /></button>
                <button onClick={() => { triggerHaptic(); window.print(); }} className="bg-cyan-500 text-slate-950 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">{t.btnDownload}</button>
              </div>
              <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-[2.5rem] overflow-hidden backdrop-blur-xl p-8 space-y-8">
                 <h2 className="text-2xl font-black text-white mb-1 font-['Orbitron'] tracking-tighter">CASE LOG: {result.hash}</h2>
                 <p className="text-[8px] font-black text-cyan-500/70 uppercase tracking-widest">TIMESTAMP: {result.timestamp}</p>
                 <div className="text-[#a5f3fc] font-medium text-[13px] leading-relaxed p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl italic">"{result.summary}"</div>
                 <div className="w-full aspect-square rounded-[2rem] overflow-hidden border border-cyan-500/20 shadow-2xl">
                    <img src={result.image} className="w-full h-full object-cover grayscale brightness-75" />
                 </div>
                 <div className="space-y-2">
                    {result.keyPoints.map((p, i) => (
                      <div key={i} className="flex gap-3 text-[11px] text-cyan-200/80 font-bold items-start bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10">
                        <span className="text-cyan-500 mt-0.5">[{i+1}]</span> {p}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-950 border border-cyan-500/20 rounded-[2.5rem] p-8">
                 <div className="flex gap-3 mb-6">
                   {['cyber', 'bank', 'consumer'].map(c => (
                     <button key={c} onClick={() => { triggerHaptic(); setComplaintType(c as ComplaintType); }} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${complaintType === c ? 'bg-cyan-500 text-slate-950 glow-cyan' : 'text-cyan-600 border border-cyan-500/20'}`}>SEC: {c}</button>
                   ))}
                 </div>
                 <div className="relative">
                    <button onClick={() => copyToClipboard(result.complaints[complaintType])} className="absolute top-4 right-4 p-3 bg-cyan-500/10 rounded-xl text-cyan-400 hover:bg-cyan-500 transition-colors"><Copy size={18}/></button>
                    <pre className="text-[10px] text-cyan-200/60 font-mono whitespace-pre-wrap leading-relaxed p-6 bg-black/40 rounded-3xl border border-cyan-500/20 max-h-[300px] overflow-y-auto">{result.complaints[complaintType]}</pre>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-3xl font-black text-white tracking-tighter font-['Orbitron']">INTEL ARCHIVE</h2>
               <div className="space-y-4">
                 {history.map((h, i) => (
                   <div key={i} onClick={() => { triggerHaptic(); setResult(h); setActiveTab('result'); }} className="p-5 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 flex items-center gap-5">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cyan-500/30"><img src={h.image} className="w-full h-full object-cover grayscale" /></div>
                     <div className="flex-1 min-w-0"><p className="text-xs font-black text-white uppercase tracking-widest truncate">{h.platform} AUDIT</p></div>
                     <ChevronRight className="text-cyan-500/30" />
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <h2 className="text-3xl font-black text-white tracking-tighter font-['Orbitron']">CONFIG</h2>
               <div className="space-y-4">
                  <ConfigItem icon={<Globe size={18}/>} title="UI LANGUAGE" value={lang === 'en' ? 'ENGLISH' : 'हिन्दी'} onClick={() => { triggerHaptic(); setLang(lang === 'en' ? 'hi' : 'en'); }} />
                  <ConfigItem icon={<Shield size={18}/>} title="STARK TUNNEL" value="SECURE" />
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#020617]/80 backdrop-blur-2xl border-t border-cyan-500/10 flex items-center justify-around px-4 pb-safe z-[200] no-print">
        <NavButton icon={<Home size={22}/>} label="HOME" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon={<History size={22}/>} label="INTEL" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <div className="relative -top-8">
          <button onClick={() => { triggerHaptic(); fileInputRef.current?.click(); }} className="w-20 h-20 bg-cyan-500 rounded-full shadow-[0_0_30px_#22d3ee] flex items-center justify-center border-4 border-[#020617] active:scale-90 transition-all arc-pulse"><Upload size={32} className="text-slate-950" /></button>
        </div>
        <NavButton icon={<Camera size={22}/>} label="SCAN" active={showCamera} onClick={startCamera} />
        <NavButton icon={<Settings size={22}/>} label="CFG" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      {/* SCANNER OVERLAY */}
      <AnimatePresence>
        {showCamera && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black flex flex-col pt-safe pb-safe no-print">
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10"><button onClick={stopCamera} className="p-4 bg-cyan-500/20 rounded-full text-cyan-400 border border-cyan-500/30"><X size={28}/></button></div>
            <div className="flex-1 relative"><video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-50 contrast-125" /></div>
            <div className="p-12 flex flex-col items-center"><button onClick={capturePhoto} className="w-24 h-24 bg-cyan-500 rounded-full p-2 shadow-[0_0_50px_#22d3ee] active:scale-90 transition-all border-4 border-slate-900"><div className="w-full h-full border-2 border-slate-950 rounded-full flex items-center justify-center bg-cyan-400 shadow-inner" /></button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => analyzeImage(reader.result as string, file.type);
          reader.readAsDataURL(file);
        }
      }} />

      <style>{`
        @media print { .no-print { display: none !important; } }
        * { -webkit-tap-highlight-color: transparent; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- Helpers ---

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 h-full ${active ? 'text-cyan-400' : 'text-cyan-800'}`}>
      {icon}
      <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function HudMiniCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10 flex flex-col items-center gap-2">
      <div className="text-cyan-600">{icon}</div>
      <div className="flex flex-col items-center">
         <span className="text-[7px] font-black text-cyan-800 uppercase tracking-widest">{label}</span>
         <span className="text-xs font-black text-white tracking-widest uppercase">{value}</span>
      </div>
    </div>
  );
}

function ConfigItem({ icon, title, value, onClick }: { icon: React.ReactNode, title: string, value: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 flex items-center justify-between active:bg-cyan-500/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-cyan-500/5 rounded-xl flex items-center justify-center text-cyan-600 border border-cyan-500/10">{icon}</div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{title}</span>
      </div>
      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full">{value}</span>
    </div>
  );
}

function LogEntry({ text, time }: { text: string, time: string }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-cyan-500/5">
       <span className="text-[7px] font-mono text-cyan-800">{time}</span>
       <p className="text-[9px] font-bold text-cyan-200/40 uppercase tracking-widest truncate">{text}</p>
    </div>
  );
}
