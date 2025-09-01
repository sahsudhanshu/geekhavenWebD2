import React from 'react'
export default function HealthzPage(){
  return <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-10"><h1 className="text-3xl font-bold text-[var(--seed-accent)]">Frontend Alive!</h1><p className="text-sm text-gray-600 dark:text-gray-400">ok:true ts:{Date.now()}</p></div>
}