import React from 'react';

export default function LoadingSkeletonView() {
  return (
    <div id="loading-state-skeleton-flow" className="space-y-8 animate-pulse select-none">
      
      {/* Header Loading Title info */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 bg-slate-250/70 rounded-lg"></div>
        <div className="h-4 w-72 bg-slate-200/60 rounded-md"></div>
      </div>

      {/* KPI Skeletons (Account Balances grid representation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200/70 rounded-md"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-150/70"></div>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="h-7 w-32 bg-slate-250/80 rounded-lg"></div>
              <div className="h-3.5 w-20 bg-slate-150/65 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main stats visual + recent ledger logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heat Map Card Graph Skeleton */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4.5 w-36 bg-slate-200/75 rounded-md"></div>
              <div className="h-3 w-56 bg-slate-150/65 rounded-md"></div>
            </div>
            <div className="h-6 w-24 bg-slate-150/70 rounded-full"></div>
          </div>
          
          {/* Chart SVG Loader mock line block */}
          <div className="h-40 w-full bg-slate-100/60 rounded-2xl relative overflow-hidden flex items-end p-4">
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between px-6 pb-6 pt-10">
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[40%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[65%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[50%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[80%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[30%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[70%]"></div>
              <div className="w-[8%] bg-slate-200/60 rounded-t-lg h-[95%]"></div>
            </div>
          </div>
        </div>

        {/* Action controls / specs list skeleton */}
        <div className="bg-slate-900/95 text-white p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="pb-4 border-b border-white/10">
            <div className="h-5 w-32 bg-white/15 rounded-md"></div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <div className="h-3 w-32 bg-white/10 rounded-md"></div>
                <div className="h-4 w-20 bg-white/20 rounded-md"></div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="h-3.5 w-full bg-white/10 rounded-md mb-1.5"></div>
            <div className="h-2.5 w-3/4 bg-white/10 rounded-md"></div>
          </div>
        </div>

      </div>

      {/* Recents simulated events table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-105 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="h-4.5 w-40 bg-slate-200/70 rounded-md"></div>
          <div className="h-6 w-24 bg-slate-200/60 rounded-lg"></div>
        </div>

        <div className="divide-y divide-slate-100 p-4 space-y-4">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 rounded-full bg-slate-150/70"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-1/4 bg-slate-200/70 rounded-md"></div>
                  <div className="h-3 w-1/2 bg-slate-150/65 rounded-md"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200/75 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
