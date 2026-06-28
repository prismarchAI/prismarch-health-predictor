import React, { useState, useEffect } from 'react';
import { Activity, Heart, ShieldCheck, Database, Search } from 'lucide-react';

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔌 CONNECT LIVE TELEMETRY STREAM TO FASTAPI BACKEND
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/admin/telemetry')
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setLiveData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed fetching live database streaming metrics:", err);
        setLoading(false);
      });
  }, []);

  const filteredData = liveData.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.genHlth.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = filterTab === 'all' || item.type === filterTab;
    return matchesSearch && matchesTab;
  });

  // Calculate dynamic metrics directly from the live database rows
  const totalRuns = liveData.length;
  const diabetesRuns = liveData.filter(d => d.type === 'diabetes').length;
  const heartRuns = liveData.filter(d => d.type === 'heart').length;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 p-6 md:p-12 font-sans antialiased">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-neutral-950" />
              <span>Administrative Console</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Data Telemetry Hub</h1>
          </div>
          <div className="text-xs font-semibold text-neutral-500 bg-neutral-200/50 border border-neutral-200/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${loading ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            {loading ? "Syncing Ledger..." : "Live Core Streaming"}
          </div>
        </div>

        {/* Dynamic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-neutral-200/60 p-6 rounded-xl flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Total Analysis Runs</span>
              <span className="text-4xl font-bold tracking-tight text-neutral-950 mt-1 block">{totalRuns}</span>
            </div>
            <Database className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="bg-white border border-neutral-200/60 p-6 rounded-xl flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Diabetes Runs</span>
              <span className="text-4xl font-bold tracking-tight text-neutral-950 mt-1 block">{diabetesRuns}</span>
            </div>
            <Activity className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="bg-white border border-neutral-200/60 p-6 rounded-xl flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Heart Runs</span>
              <span className="text-4xl font-bold tracking-tight text-neutral-950 mt-1 block">{heartRuns}</span>
            </div>
            <Heart className="h-5 w-5 text-neutral-400" />
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 bg-neutral-50/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-1 bg-neutral-200/50 p-1 rounded-lg">
              {['all', 'diabetes', 'heart'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-md cursor-pointer ${
                    filterTab === tab ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-64 flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[10px] uppercase font-bold tracking-widest text-neutral-400 bg-neutral-50/20">
                  <th className="py-4 px-6">ID / Timestamp</th>
                  <th className="py-4 px-6">Pipeline</th>
                  <th className="py-4 px-6">Risk Probability</th>
                  <th className="py-4 px-6">Age</th>
                  <th className="py-4 px-6">Computed BMI</th>
                  <th className="py-4 px-6">General Health</th>
                  <th className="py-4 px-6 text-right">Core Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-neutral-400 font-medium">
                      {loading ? "Loading database matrix..." : "No real-world transaction data logged in core database yet."}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="py-4 px-6 font-mono font-semibold text-neutral-950">
                        {row.id}
                        <span className="text-[10px] text-neutral-400 block font-sans font-normal">{row.timestamp}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] uppercase tracking-wider font-semibold">{row.type}</span>
                      </td>
                      <td className="py-4 px-6 text-neutral-950 font-bold text-sm">{row.riskScore}%</td>
                      <td className="py-4 px-6 font-medium">{row.age}</td>
                      <td className="py-4 px-6 font-medium">{row.bmi}</td>
                      <td className="py-4 px-6">{row.genHlth}</td>
                      <td className="py-4 px-6 text-right font-mono text-[10px] text-neutral-400">
                        HBP:{row.highBP} | HC:{row.highChol}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}