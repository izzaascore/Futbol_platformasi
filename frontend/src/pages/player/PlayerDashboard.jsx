import React from 'react';

const PlayerDashboard = () => {
  const userStr = localStorage.getItem('talaqCurrentUser');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">Mening Statistikam</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-2">Intizom Balli</h3>
          <p className="text-4xl font-bold text-white">100</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">Qabul qilingan Gollar</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm shadow-xl">
          <h3 className="text-purple-500 font-bold text-xs uppercase tracking-widest mb-2">Profil Holati</h3>
          <p className="text-xl font-bold text-white">Aktiv</p>
        </div>
      </div>
      
      <div className="bg-stone-900 border border-stone-800 p-8 rounded-sm shadow-xl text-center">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Mening Videolarim</h3>
        <p className="text-stone-400 text-sm">Hali videolar yuklanmagan.</p>
        <button className="mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-amber-500/20">
            Video Yuklash
        </button>
      </div>
    </div>
  );
};

export default PlayerDashboard;
