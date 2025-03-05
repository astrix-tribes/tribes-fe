import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

interface NoticeBarProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  variant?: 'warning' | 'info' | 'success' | 'error';
}

const noticeVariants = {
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  success: 'bg-success-main/10 border-success-main/20 text-success-main',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
};

export function NoticeBar({ 
  message, 
  actionText, 
  onAction, 
  onClose,
  variant = 'warning'
}: NoticeBarProps) {
  return (
    <div className={cn(
      'border-b backdrop-blur-sm transition-colors',
      noticeVariants[variant]
    )}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-sm">{message}</p>
          {actionText && (
            <button
              onClick={onAction}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
            >
              {actionText}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
} 