import React from 'react';
import { AlertTriangle, WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button.js';

interface ErrorDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  /** 'error' = generic error, 'disconnected' = connection/room closed */
  type?: 'error' | 'disconnected';
  onRetry?: () => void;
  onGoHome: () => void;
  buttonText?: string;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'error',
  onRetry,
  onGoHome,
  buttonText = 'Go to Home',
}) => {
  if (!isOpen) return null;

  const isDisconnected = type === 'disconnected';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center gap-5 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        style={{
          background: 'var(--color-card-bg)',
          backdropFilter: 'blur(24px)',
          border: isDisconnected
            ? '1px solid rgba(239,68,68,0.20)'
            : '1px solid rgba(245,158,11,0.20)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: isDisconnected
              ? 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(220,38,38,0.10) 100%)'
              : 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.10) 100%)',
            border: isDisconnected
              ? '1px solid rgba(239,68,68,0.25)'
              : '1px solid rgba(245,158,11,0.25)',
          }}
        >
          {isDisconnected ? (
            <WifiOff size={28} style={{ color: '#f87171' }} />
          ) : (
            <AlertTriangle size={28} style={{ color: '#fbbf24' }} />
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="text-base font-black uppercase tracking-wider"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title ?? (isDisconnected ? 'Connection Lost' : 'Something Went Wrong')}
          </h3>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {message}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'var(--color-card-border)' }} />

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          {onRetry && (
            <Button variant="primary" size="md" fullWidth onClick={onRetry} className="gap-2">
              <RefreshCw size={15} />
              Try Again
            </Button>
          )}
          <Button variant="secondary" size="md" fullWidth onClick={onGoHome} className="gap-2">
            {buttonText.includes('Refresh') ? <RefreshCw size={15} /> : <Home size={15} />}
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
