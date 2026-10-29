import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * ModernSelect: Premium Baby Zone styled replacement for native browser <select>.
 * Completely eliminates the rigid OS blue native select popups with a floating,
 * rounded-2xl card styled to match Baby Zone's palette.
 */
export default function ModernSelect({
  value,
  onChange,
  options = [],
  children,
  placeholder = 'اختر...',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  name,
  id,
  dir = 'rtl'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const internalId = useId();
  const selectId = id || internalId;

  // Normalize options from either options prop or option children
  const parsedOptions = (() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === 'string' || typeof opt === 'number') {
          return { value: opt, label: String(opt) };
        }
        return {
          value: opt.value,
          label: opt.label || String(opt.value),
          icon: opt.icon,
          badge: opt.badge,
          badgeColor: opt.badgeColor,
          desc: opt.desc,
          disabled: Boolean(opt.disabled)
        };
      });
    }

    // Support JSX <option> children
    if (children) {
      const childArray = Array.isArray(children) ? children : [children];
      return childArray
        .filter((child) => child && child.props)
        .map((child) => ({
          value: child.props.value !== undefined ? child.props.value : child.props.children,
          label: child.props.children || String(child.props.value),
          disabled: Boolean(child.props.disabled)
        }));
    }

    return [];
  })();

  // Find currently selected option
  const selectedOption = parsedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal, optDisabled) => {
    if (optDisabled) return;
    setIsOpen(false);

    if (onChange) {
      // Create synthetic event with full compatibility whether caller expects e.target.value or raw value
      const syntheticEvent = {
        target: {
          value: optVal,
          name: name || selectId
        },
        currentTarget: {
          value: optVal,
          name: name || selectId
        },
        value: optVal,
        toString() {
          return String(optVal);
        },
        valueOf() {
          return optVal;
        },
        [Symbol.toPrimitive](hint) {
          return hint === 'number' ? Number(optVal) : String(optVal);
        }
      };
      onChange(syntheticEvent, optVal);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-right select-none ${className}`}
      dir={dir}
    >
      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all text-right cursor-pointer ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-rawaa-primary ring-2 ring-rawaa-primary/15 text-rawaa-dark shadow-soft-xs'
            : 'bg-rawaa-soft/60 hover:bg-rawaa-soft border-rawaa-border text-rawaa-dark'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-rawaa-primary">
              <selectedOption.icon size={15} />
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                selectedOption.badgeColor || 'bg-rawaa-primary/10 text-rawaa-primary'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`shrink-0 text-rawaa-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rawaa-primary' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu matching the Baby Zone popup design */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute z-[999999] top-full mt-1.5 inset-x-0 bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-1.5 text-right animate-fadeIn max-h-60 overflow-y-auto custom-modal-scroll ${menuClassName}`}
        >
          {parsedOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-rawaa-muted">لا توجد خيارات متاحة</div>
          ) : (
            parsedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-right ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed bg-transparent text-gray-400'
                      : isSelected
                      ? 'bg-rawaa-primary/10 text-rawaa-primary shadow-2xs'
                      : 'text-rawaa-dark hover:bg-rawaa-soft hover:text-rawaa-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {opt.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-rawaa-primary' : 'text-rawaa-muted'}`}>
                        <opt.icon size={15} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1 truncate">
                      <span className="block truncate">{opt.label}</span>
                      {opt.desc && (
                        <span className="block text-[10px] text-rawaa-muted font-normal mt-0.5 truncate">
                          {opt.desc}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          opt.badgeColor || 'bg-rawaa-primary/10 text-rawaa-primary'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check size={14} className="text-rawaa-primary shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
