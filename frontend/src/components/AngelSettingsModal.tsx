import React, { useState } from 'react';
import { X, Shield, Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { saveAngelConfig } from '../services/apiClient';
import type { AngelStatus } from '../services/apiClient';

interface AngelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AngelStatus | null;
  onStatusRefresh: () => void;
}

export const AngelSettingsModal: React.FC<AngelSettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusRefresh,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [clientCode, setClientCode] = useState(status?.client_code || '');
  const [pin, setPin] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResultMsg(null);

    const res = await saveAngelConfig({
      api_key: apiKey,
      client_code: clientCode,
      pin,
      totp_secret: totpSecret,
    });

    setIsLoading(false);
    if (res.success && res.is_connected) {
      setResultMsg({ text: 'Angel One SmartAPI Successfully Connected! 🎉', isError: false });
      onStatusRefresh();
    } else {
      setResultMsg({
        text: res.error || 'Failed to authenticate with Angel One. Check credentials.',
        isError: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn text-slate-200">
      <div className="bg-[#0e1320] border border-slate-700/80 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#121828] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                Angel One SmartAPI Setup
              </h2>
              <p className="text-xs text-slate-400">Live Market Data & WebSocket Feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Status Banner */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-3 ${
              status?.is_connected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            {status?.is_connected ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">
                  {status?.is_connected ? 'Angel One Connected' : 'SmartAPI Not Connected (Simulation Active)'}
                </span>
                <span className="text-[10px] font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {status?.stock_count ? `${status.stock_count} Scrips Indexed` : 'Index Ready'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {status?.is_connected
                  ? `Live ticks and real-time 5-min candles active for Client: ${status.client_code}`
                  : status?.last_error || 'Credentials enter કરીને અસલ Live Angel One market data જોડો.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                SmartAPI App Key
              </label>
              <input
                type="text"
                placeholder="e.g. aB1cD2eF..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full bg-[#080b11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Angel Client Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. A123456"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  required
                  className="w-full bg-[#080b11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Angel MPIN / PIN
                </label>
                <input
                  type="password"
                  placeholder="4-digit MPIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="w-full bg-[#080b11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>TOTP Secret Key</span>
                <span className="text-[10px] text-cyan-400 font-normal">
                  (SmartAPI TOTP setup code)
                </span>
              </label>
              <input
                type="password"
                placeholder="e.g. JBSWY3DPEHPK3PXP..."
                value={totpSecret}
                onChange={(e) => setTotpSecret(e.target.value)}
                required
                className="w-full bg-[#080b11] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {resultMsg && (
              <div
                className={`p-2.5 rounded text-xs ${
                  resultMsg.isError
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                {resultMsg.text}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLoading ? 'Connecting to SmartAPI...' : 'Save Credentials & Connect'}</span>
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="bg-[#080b11] border border-slate-800 rounded p-2.5 text-[10px] text-slate-500 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Credentials સ્થાનિક <strong>.env</strong> ફાઈલમાં સુરક્ષિત સંગ્રહાય છે. કોઈ થર્ડ-પાર્ટી સર્વર પર શેર થતાં નથી.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
