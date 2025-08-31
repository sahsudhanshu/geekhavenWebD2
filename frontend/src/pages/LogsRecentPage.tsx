import React from 'react';
import { useActionLog } from '../hooks/useActionLog';

const timeFmt = (t: number) => new Date(t).toLocaleTimeString();

const LogsRecentPage: React.FC = () => {
  const { logs } = useActionLog();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
  <h1 className="text-3xl font-bold tracking-tight text-seed-accent">Recent Actions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last {logs.length} recorded interactions (persisted locally, max 20).</p>
      </header>
      <div className="rounded-xl border bg-white/70 dark:bg-slate-800/70 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--seed-accent-subtle)] text-left">
            <tr>
              <th className="py-2 px-3 font-medium">Time</th>
              <th className="py-2 px-3 font-medium">Type</th>
              <th className="py-2 px-3 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice().reverse().map(l => (
              <tr key={l.t} className="border-t last:border-b hover:bg-[var(--seed-accent-subtle)]/60">
                <td className="py-2 px-3 font-mono text-xs">{timeFmt(l.t)}</td>
                <td className="py-2 px-3">{l.type}</td>
                <td className="py-2 px-3 max-w-[280px] truncate font-mono text-[10px]">{typeof l.payload === 'object' ? JSON.stringify(l.payload) : String(l.payload ?? '')}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 px-3 text-center text-gray-500 text-sm">No actions logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>Note: These logs are stored in <code className="font-mono">localStorage</code> and capped at 20 entries.</p>
      </div>
    </div>
  );
};

export default LogsRecentPage;
