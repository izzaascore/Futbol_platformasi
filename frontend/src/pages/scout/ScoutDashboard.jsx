import React from 'react';

const ScoutDashboard = () => {
  return (
    <div className="text-stone-300">
      <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">Skaut Xulosalari</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-emerald-500 font-bold uppercase tracking-widest mb-2">Yangi O'yinchilar</h3>
          <p className="text-4xl font-bold text-white">24</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-amber-500 font-bold uppercase tracking-widest mb-2">Ko'rib chiqilmagan</h3>
          <p className="text-4xl font-bold text-white">7</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-blue-500 font-bold uppercase tracking-widest mb-2">Tanlanganlar</h3>
          <p className="text-4xl font-bold text-white">3</p>
        </div>
      </div>
    </div>
  );
};

export default ScoutDashboard;
