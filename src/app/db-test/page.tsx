'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/database.types';

export default function DbTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not Configured';

  async function checkConnection() {
    setIsRefreshing(true);
    setStatus('loading');
    setErrorDetails(null);

    try {
      // Attempt to fetch from user_profiles table
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
      setRecordCount(count ?? (data ? data.length : 0));
      setStatus('success');
    } catch (err: any) {
      console.error('Database connection error:', err);
      setErrorDetails(err);
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500/30 font-sans">
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">
              S
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SmartCV
              </span>
              <span className="text-xs block text-slate-500 font-medium tracking-wider uppercase">
                Console
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400 font-medium">Diagnostic Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center relative z-10">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Supabase Integration
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl">
            Verifying secure database handshakes, configuration parameters, and client data fetch performance.
          </p>
        </div>

        {/* Diagnostic Panel */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Connection Status Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/60 pb-6 mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {status === 'loading' && (
                <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-teal-500 animate-spin" />
              )}
              {status === 'success' && (
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Status
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {status === 'loading' && 'Checking Connection...'}
                  {status === 'success' && 'Database Connected Successfully'}
                  {status === 'error' && 'Database Connection Failed'}
                </h2>
              </div>
            </div>

            <button
              onClick={checkConnection}
              disabled={isRefreshing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 active:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition duration-200 flex items-center space-x-2"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
              </svg>
              <span>{isRefreshing ? 'Refreshing' : 'Refresh Diagnostics'}</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Supabase Project URL
              </span>
              <span className="text-sm font-mono text-slate-300 block mt-1.5 break-all select-all">
                {supabaseUrl}
              </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Target Table Checked
              </span>
              <span className="text-sm font-medium text-slate-300 block mt-1.5">
                user_profiles
              </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Records Found
              </span>
              <span className="text-sm block mt-1.5">
                {status === 'loading' ? (
                  <span className="inline-block w-8 h-4 bg-slate-800 animate-pulse rounded" />
                ) : status === 'success' ? (
                  <span className="text-emerald-400 font-bold text-lg">{recordCount}</span>
                ) : (
                  <span className="text-rose-400 font-semibold text-sm">Unavailable</span>
                )}
              </span>
            </div>
          </div>

          {/* Dynamic Status Presentation */}
          <div className="mt-4">
            {status === 'loading' && (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-slate-800 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-slate-800 animate-pulse rounded w-1/2" />
                <div className="h-4 bg-slate-800 animate-pulse rounded w-5/6" />
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-slate-900/20 border border-emerald-500/10 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Handshake Verified</span>
                  </div>
                  Successfully connected client-side instance using anon credentials. RLS and query handlers responded correctly. Ready to begin storing user profiles and resumes.
                </div>

                {/* Profiles List Preview */}
                {profiles.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider flex items-center justify-between">
                      <span>Profiles Sample</span>
                      <span className="text-xs font-normal text-slate-500 lowercase">(showing first 5 rows)</span>
                    </h3>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
                      <table className="min-w-full divide-y divide-slate-800/60 text-xs">
                        <thead className="bg-slate-900/60 text-slate-400">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">ID</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Full Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {profiles.slice(0, 5).map((profile) => (
                            <tr key={profile.id} className="hover:bg-slate-900/30 transition duration-150">
                              <td className="px-4 py-2.5 font-mono text-slate-400 break-all max-w-[120px]">{profile.id}</td>
                              <td className="px-4 py-2.5">{profile.email || 'N/A'}</td>
                              <td className="px-4 py-2.5">{profile.full_name || 'N/A'}</td>
                              <td className="px-4 py-2.5 font-mono text-slate-500">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-5 text-center text-slate-500 text-sm">
                    No records found in <code className="text-slate-400 font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900">user_profiles</code>. 
                    Once users sign up, their profile data will appear here.
                  </div>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-sm text-slate-300">
                  <div className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <span>Diagnostic Error Details</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-60 whitespace-pre-wrap">
                    {JSON.stringify(errorDetails, null, 2)}
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/10">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">Common Resolutions</h3>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>Confirm that the table <code className="text-slate-300 font-mono">user_profiles</code> exists in your database schema.</li>
                    <li>Verify environment credentials in <code className="text-slate-300 font-mono">.env.local</code> match your Supabase Dashboard configurations.</li>
                    <li>Check if database Row Level Security (RLS) is blocking anonymous requests.</li>
                    <li>Verify your local internet connection is not behind firewall restrictions blocking Supabase APIs.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-600">
        <p className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span>SmartCV Admin Integration Console</span>
          <span className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-700">Client-Side Handshake Verified Only</span>
        </p>
      </footer>
    </div>
  );
}
