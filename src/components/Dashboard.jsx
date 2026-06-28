import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { api } from './api';
import { FormattedMarkdown } from './FormattedMarkdown';

function Dashboard() {
  // 1. CORE STATES
  const [activeTab, setActiveTab] = useState('diabetes');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  // 2. GEMINI CO-PILOT STATES
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "System connection initialized. I have complete access to your computed risk probabilities and clinical input vectors. How can I assist you with your health profile optimization today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 3. UI REFERENCES
  const resultsRef = useRef(null);

  // 4. FORM STATES
  const [diabetesForm, setDiabetesForm] = useState({
    age: '', genHlth: '1', height: '', weight: '', sex: '1', 
    highBP: 0, highChol: 0, diffWalk: 0, heavyAlcohol: 0, stroke: 0, smoker: 0,
  });

  const [heartForm, setHeartForm] = useState({
    age: '', genHlth: '1', sex: '1', highBP: 0, highChol: 0, diffWalk: 0, 
    height: '', weight: '', stroke: 0, smoker: 0, diabetes: 0, heavyAlcohol: 0,
  });

  // 5. FORM HANDLERS
  const handleDiabetesChange = (e) => {
    const {name, type, checked, value} = e.target;
    setDiabetesForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const handleHeartChange = (e) => {
    const { name, type, checked, value } = e.target;
    setHeartForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  // 6. MAIN ENGINE HANDLER
  const runPredictionEngine = async () => {
    setIsLoading(true);
    setPredictionResult(null);

    setChatMessages([{ role: 'assistant', text: "System connection initialized. I have complete access to your computed risk probabilities and clinical input vectors. How can I assist you with your health profile optimization today?" }]);
    setLoadingStep('Assembling metric telemetry matrix...');

    const isDiabetes = activeTab === 'diabetes';
    const currentForm = isDiabetes ? diabetesForm : heartForm;
    const { height, weight } = currentForm;

    let calculatedBmi = 25.0; 
    if (height && weight && Number(height) > 0) {
      const heightInMeters = Number(height) / 100;
      calculatedBmi = parseFloat((Number(weight) / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const backendPayload = {
      HighBP: parseFloat(currentForm.highBP),
      GenHlth: parseFloat(currentForm.genHlth),
      HighChol: parseFloat(currentForm.highChol),
      RawAge: parseInt(currentForm.age) || 30, 
      BMI: calculatedBmi,
      Sex: parseFloat(currentForm.sex),
      Stroke: parseFloat(currentForm.stroke),
      Smoker: parseFloat(currentForm.smoker),
      HvyAlcoholConsump: parseFloat(currentForm.heavyAlcohol),
      DiffWalk: parseFloat(currentForm.diffWalk),
      ...(isDiabetes ? { HeartDiseaseorAttack: 0.0 } : { Diabetes: parseFloat(currentForm.diabetes) })
    };

    console.log(`\n============== ALIGNED TELEMETRY: ${activeTab.toUpperCase()} ENGINE ==============`);
    console.table(backendPayload);
    console.log("====================================================================\n");

    try {
      setLoadingStep('Transmitting payload through api.js network portal...');
      
      const data = isDiabetes 
        ? await api.predictDiabetes(backendPayload)
        : await api.predictHeartRisk(backendPayload);

      setLoadingStep('Compiling diagnostic calculations...');

      setPredictionResult({
        riskScore: data.risk_probability_percentage, 
        status: 'Calculated Successfully',
        bmi: calculatedBmi
      });

      // 🔥 Safely trigger scroll animation
      setTimeout(() => {
        if (resultsRef && resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);

    } catch (error) {
      console.error("API Pipeline Execution Failure:", error);
      alert(`Backend Communication Error: ${error.message}. Please verify parameters match model definitions.`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 7. 🔥 THE MISSING GEMINI CHAT HANDLER
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const activeForm = activeTab === 'diabetes' ? diabetesForm : heartForm;
      const data = await api.sendChatMessage(
        userMessage,
        activeTab === 'diabetes' ? predictionResult?.riskScore : null,
        activeTab === 'heart' ? predictionResult?.riskScore : null,
        activeForm
      );

      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (error) {
      console.error("LLM Communication Interface Failure:", error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "Service interruption occurred. Failed to securely synchronize data vectors with the AI core." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  // 8. RENDER UI
  return(
    <main className='min-h-[calc(100vh-4rem)] flex flex-col bg-neutral-50 p-6 md:p-12 text-neutral-950 font-sans antialiased'>
      {/* Widened from max-w-xl to max-w-5xl for the grid layout */}
      <div className='w-full max-w-5xl mx-auto space-y-6'>
            <div class="my-6 text-center">
  
  <p class="text-sm font-medium text-slate-700 mt-2 max-w-sm mx-auto leading-relaxed">
    Select your preferred model from the options below to begin analyzing your data.
  </p>
</div>
            {/* Top Tab Selector */}
            <div className='grid grid-cols-2 gap-2 bg-neutral-200/50 p-1 rounded-xl max-w-xl mx-auto'>
              <button onClick={()=>setActiveTab('diabetes')} 
                className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-widest transition-all cursor-pointer md:py-3 md:px-6 rounded-lg ${
                  activeTab === 'diabetes' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/20' : 'bg-transparent text-neutral-400 hover:text-neutral-900'
                }`}>
                DIABETES PREDICTOR
              </button>
              <button onClick={()=>setActiveTab('heart')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-widest transition-all cursor-pointer md:py-3 md:px-6 rounded-lg ${
                  activeTab === 'heart' ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/20' : 'bg-transparent text-neutral-400 hover:text-neutral-900'
                }`}>
                HEART HEALTH PREDICTOR
              </button>
            </div>

            {/* Form Container */}
            <div className='bg-white border border-neutral-200/60 rounded-2xl p-6 md:p-8 shadow-xs max-w-xl mx-auto'>
              
              {/* DIABETES FORM */}
              {activeTab === 'diabetes' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Primary Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Age</label>
                        <input type="number" name="age" value={diabetesForm.age} onChange={handleDiabetesChange} placeholder="e.g. 24" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">General Health</label>
                        <select name="genHlth" value={diabetesForm.genHlth} onChange={handleDiabetesChange} className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all cursor-pointer">
                          <option value="1">Excellent</option>
                          <option value="2">Very Good</option>
                          <option value="3">Good</option>
                          <option value="4">Fair</option>
                          <option value="5">Poor</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Height (cm)</label>
                        <input type="number" name="height" value={diabetesForm.height} onChange={handleDiabetesChange} placeholder="e.g. 175" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Weight (kg)</label>
                        <input type="number" name="weight" value={diabetesForm.weight} onChange={handleDiabetesChange} placeholder="e.g. 70" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>

                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Risk Indicators & History</h3>
                    <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200/40 rounded-xl">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Biological Sex</span>
                      <div className="flex gap-6 mt-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 cursor-pointer">
                          <input type="radio" name="sex" value="1" checked={diabetesForm.sex === '1'} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4" /> Male
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 cursor-pointer">
                          <input type="radio" name="sex" value="0" checked={diabetesForm.sex === '0'} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4" /> Female
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">High Blood Pressure</span>
                        <input type="checkbox" name="highBP" checked={diabetesForm.highBP === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">High Cholesterol</span>
                        <input type="checkbox" name="highChol" checked={diabetesForm.highChol === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Difficulty Walking</span>
                        <input type="checkbox" name="diffWalk" checked={diabetesForm.diffWalk === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Heavy Alcohol</span>
                        <input type="checkbox" name="heavyAlcohol" checked={diabetesForm.heavyAlcohol === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">History of Stroke</span>
                        <input type="checkbox" name="stroke" checked={diabetesForm.stroke === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Regular smoker</span>
                        <input type="checkbox" name="smoker" checked={diabetesForm.smoker === 1} onChange={handleDiabetesChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                    </div>
                  </div>

                  <button type="button" onClick={runPredictionEngine} disabled={isLoading} className="w-full mt-8 flex items-center justify-center gap-3 py-3.5 px-4 bg-neutral-950 hover:bg-neutral-900 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed">
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin text-neutral-400" /><span className="text-neutral-300 animate-pulse">{loadingStep}</span></>
                    ) : (
                      <><span>Analyze Risk Profile</span><ChevronRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              )}

              {/* HEART FORM */}
              {activeTab === 'heart' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Primary Risk Indicators</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Age</label>
                        <input type="number" name="age" value={heartForm.age} onChange={handleHeartChange} placeholder="e.g. 45" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">General Health</label>
                        <select name="genHlth" value={heartForm.genHlth} onChange={handleHeartChange} className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all cursor-pointer">
                          <option value="1">Excellent</option>
                          <option value="2">Very Good</option>
                          <option value="3">Good</option>
                          <option value="4">Fair</option>
                          <option value="5">Poor</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200/40 rounded-xl">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Biological Sex</span>
                      <div className="flex gap-6 mt-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 cursor-pointer">
                          <input type="radio" name="sex" value="1" checked={heartForm.sex === '1'} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4" /> Male
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 cursor-pointer">
                          <input type="radio" name="sex" value="0" checked={heartForm.sex === '0'} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4" /> Female
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">High Blood Pressure</span>
                        <input type="checkbox" name="highBP" checked={heartForm.highBP === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">High Cholesterol</span>
                        <input type="checkbox" name="highChol" checked={heartForm.highChol === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer sm:col-span-2">
                        <span className="text-sm font-medium text-neutral-800">Difficulty Walking</span>
                        <input type="checkbox" name="diffWalk" checked={heartForm.diffWalk === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Secondary Risk & Biometrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Height (cm)</label>
                        <input type="number" name="height" value={heartForm.height} onChange={handleHeartChange} placeholder="e.g. 175" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Weight (kg)</label>
                        <input type="number" name="weight" value={heartForm.weight} onChange={handleHeartChange} placeholder="e.g. 68" className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200/60 rounded-lg focus:bg-white focus:border-neutral-950 focus:outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">History of Stroke</span>
                        <input type="checkbox" name="stroke" checked={heartForm.stroke === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Smoker</span>
                        <input type="checkbox" name="smoker" checked={heartForm.smoker === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Diabetic History</span>
                        <input type="checkbox" name="diabetes" checked={heartForm.diabetes === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/40 rounded-xl transition-all cursor-pointer">
                        <span className="text-sm font-medium text-neutral-800">Heavy Alcohol</span>
                        <input type="checkbox" name="heavyAlcohol" checked={heartForm.heavyAlcohol === 1} onChange={handleHeartChange} className="accent-neutral-950 h-4 w-4 rounded" />
                      </label>
                    </div>
                  </div>
                  
                  <button type="button" onClick={runPredictionEngine} disabled={isLoading} className="w-full mt-8 flex items-center justify-center gap-3 py-3.5 px-4 bg-neutral-950 hover:bg-neutral-900 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed">
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin text-neutral-400" /><span className="text-neutral-300 animate-pulse">{loadingStep}</span></>
                    ) : (
                      <><span>Analyze Risk Profile</span><ChevronRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* RESULTS & AI CO-PILOT SECTION */}
            <div ref={resultsRef}>
              {predictionResult && (
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-neutral-200/80 pt-12 animate-fade-in">
                  
                  {/* LEFT COLUMN: TELEMETRY METRICS (5 Columns) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-6 shadow-sm">
                      <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Evaluation Outcome</span>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-6xl font-bold tracking-tight text-neutral-950">{predictionResult.riskScore}%</span>
                        <span className="text-sm font-medium text-neutral-500">Risk Probability</span>
                      </div>
                      
                      <div className="mt-6 space-y-2">
                        <div className="p-3.5 bg-white border border-neutral-150 rounded-lg flex justify-between text-sm">
                          <span className="text-neutral-500">Computed BMI</span>
                          <span className="font-semibold text-neutral-950">{predictionResult.bmi}</span>
                        </div>
                        <div className="p-3.5 bg-white border border-neutral-150 rounded-lg flex justify-between text-sm">
                          <span className="text-neutral-500">Engine Core Status</span>
                          <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Synchronized
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PREMIUM PRISMARCH CO-PILOT (7 Columns) */}
                  <div className="lg:col-span-7 border border-neutral-200/80 rounded-xl bg-white flex flex-col overflow-hidden h-[520px] shadow-sm">
                    
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-neutral-950 animate-pulse"></div>
                        <span className="text-sm font-semibold tracking-tight text-neutral-950">Prismarch Clinical Intelligence Vector</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 bg-neutral-200/50 px-2 py-0.5 rounded">
                        Context Aware
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-white">
                      {chatMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`max-w-[85%] text-sm leading-relaxed px-4 py-3 rounded-xl transform transition-all duration-200 ${
                            msg.role === 'user' 
                              ? 'bg-neutral-950 text-white self-end rounded-tr-none shadow-sm' 
                              : 'bg-neutral-50 border border-neutral-100 text-neutral-800 self-start rounded-tl-none'
                          }`}
                        >
                          <FormattedMarkdown text={msg.text} />
                        </div>
                      ))}
                      
                      {isChatLoading && (
                        <div className="bg-neutral-50 border border-neutral-100 text-neutral-500 self-start text-sm px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-2.5 animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-950" />
                          <span>Synthesizing medical telemetry context...</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChatMessage} className="p-3.5 border-t border-neutral-100 bg-neutral-50/50 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about lifestyle optimizations, anomalies, or dietary adjustments..."
                        disabled={isChatLoading}
                        className="flex-1 bg-white border border-neutral-200/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-950 disabled:bg-neutral-100 transition-all placeholder-neutral-400"
                      />
                      <button
                        type="submit"
                        disabled={isChatLoading || !chatInput.trim()}
                        className="bg-neutral-950 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-neutral-900 transition-all active:scale-[0.98] disabled:opacity-40 disabled:scale-100 flex items-center gap-1"
                      >
                        <span>Send</span>
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </div>

      </div>
    </main>
  );
}
export default Dashboard;