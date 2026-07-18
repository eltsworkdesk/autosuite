import React from 'react';
import { colors, spacing, radius, shadows, zIndex } from '../../design-system/tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, footer, size = 'md' }, ref) => {
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeMap: Record<string, string> = {
      sm: '400px',
      md: '600px',
      lg: '800px',
    };

    const overlayStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal,
      animation: 'fadeIn 150ms ease-in-out',
    };

    const modalStyles: React.CSSProperties = {
      backgroundColor: '#ffffff',
      borderRadius: radius.lg,
      boxShadow: shadows.xl,
      maxWidth: sizeMap[size],
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
    };

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.xl,
      borderBottom: `1px solid ${colors.neutral[200]}`,
    };

    const titleStyles: React.CSSProperties = {
      fontSize: '20px',
      fontWeight: 700,
      color: colors.ink.primary,
      margin: 0,
    };

    const closeButtonStyles: React.CSSProperties = {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: colors.ink.tertiary,
      padding: 0,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      transition: 'all 150ms ease-in-out',
    };

    const contentStyles: React.CSSProperties = {
      padding: spacing.xl,
    };

    const footerStyles: React.CSSProperties = {
      padding: spacing.xl,
      borderTop: `1px solid ${colors.neutral[200]}`,
      display: 'flex',
      gap: spacing.lg,
      justifyContent: 'flex-end',
    };

    return (
      <div style={overlayStyles} onClick={onClose}>
        <div
          ref={ref}
          style={modalStyles}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div style={headerStyles}>
              <h2 style={titleStyles}>{title}</h2>
              <button
                style={closeButtonStyles}
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          )}
          <div style={contentStyles}>{children}</div>
          {footer && <div style={footerStyles}>{footer}</div>}
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
