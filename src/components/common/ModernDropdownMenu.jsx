import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ModernDropdownMenu: Reusable popover container matching the Baby Zone popup design.
 * Renders a trigger element and a floating rounded-2xl white card with soft shadows.
 */
export default function ModernDropdownMenu({
  trigger,
  children,
  align = 'right',
  className = '',
  menuClassName = '',
  isOpen: controlledIsOpen,
  onOpenChange
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback((nextVal) => {
    if (!isControlled) {
      setInternalIsOpen(nextVal);
    }
    if (onOpenChange) {
      onOpenChange(nextVal);
    }
  }, [isControlled, onOpenChange]);

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
  }, [isOpen, setIsOpen]);

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {typeof trigger === 'function'
        ? trigger({ isOpen, toggle: () => setIsOpen(!isOpen) })
        : (
          <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            {trigger}
          </div>
        )}

      {isOpen && (
        <div
          className={`absolute z-[999999] top-full mt-1.5 ${alignClass} bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-1.5 text-right animate-fadeIn min-w-[180px] ${menuClassName}`}
          onClick={(e) => {
            // Close when an action item inside is clicked unless prevented
            if (e.target.closest('button') || e.target.closest('a')) {
              setIsOpen(false);
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

