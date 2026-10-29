import React from 'react';
import { Check } from 'lucide-react';

/**
 * ModernCheckbox: High-fidelity branded replacement for native OS checkboxes.
 * Eliminates the default browser/OS blue square and renders a smoothly animated,
 * rounded-lg checkbox matching Baby Zone's aesthetic palette.
 */
export default function ModernCheckbox({
  checked = false,
  onChange,
  disabled = false,
  color = 'primary', // 'primary' (#C25E3E) | 'amber' (#D97706) | 'emerald'
  size = 'md', // 'sm' (16px) | 'md' (20px) | 'lg' (24px)
  id,
  label,
  description,
  className = '',
  boxClassName = '',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (onChange) {
      onChange(!checked, e);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (onChange) {
        onChange(!checked, e);
      }
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4 rounded-md',
    md: 'w-5 h-5 rounded-lg',
    lg: 'w-6 h-6 rounded-xl'
  }[size] || 'w-5 h-5 rounded-lg';

  const checkIconSizes = {
    sm: 11,
    md: 14,
    lg: 16
  }[size] || 14;

  const colorClasses = {
    primary: checked
      ? 'bg-rawaa-primary border-rawaa-primary text-white shadow-soft-xs'
      : 'bg-white border-rawaa-border hover:border-rawaa-primary/60',
    amber: checked
      ? 'bg-amber-600 border-amber-600 text-white shadow-soft-xs'
      : 'bg-white border-amber-300 hover:border-amber-500',
    emerald: checked
      ? 'bg-emerald-600 border-emerald-600 text-white shadow-soft-xs'
      : 'bg-white border-rawaa-border hover:border-emerald-500'
  }[color] || (
    checked
      ? 'bg-rawaa-primary border-rawaa-primary text-white shadow-soft-xs'
      : 'bg-white border-rawaa-border hover:border-rawaa-primary/60'
  );

  const Box = (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`shrink-0 flex items-center justify-center border transition-all duration-150 select-none cursor-pointer ${sizeClasses} ${colorClasses} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
      } ${boxClassName}`}
      {...props}
    >
      {checked && (
        <Check
          size={checkIconSizes}
          className="stroke-[3.5] animate-scaleUp text-white"
        />
      )}
    </div>
  );

  if (!label && !description) {
    return Box;
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-2.5 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="pt-0.5">{Box}</div>
      <div className="min-w-0 flex-1">
        {label && (
          <span className={`block text-xs font-bold leading-tight ${checked ? 'text-rawaa-dark' : 'text-rawaa-dark/80'}`}>
            {label}
          </span>
        )}
        {description && (
          <span className="block text-[11px] text-rawaa-muted mt-0.5 leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

