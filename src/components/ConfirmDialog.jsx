import React, { useState, useEffect } from 'react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog component for critical actions requiring double confirmation
 * Implements defense-in-depth by requiring two separate confirmation steps
 * 
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {string} title - Dialog title
 * @param {string} message - Primary message to display
 * @param {string} confirmText - Text for the final confirm button
 * @param {string} itemName - Name of item being deleted (for typing confirmation)
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 */
function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Delete',
  itemName,
  onConfirm, 
  onCancel 
}) {
  const [step, setStep] = useState(1);
  const [typedName, setTypedName] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTypedName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    onConfirm();
    setStep(1);
    setTypedName('');
  };

  const handleCancel = () => {
    onCancel();
    setStep(1);
    setTypedName('');
  };

  const isNameMatch = typedName.trim() === itemName.trim();

  return (
    <div className="confirm-dialog-overlay" onClick={handleCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h2>{title}</h2>
        </div>
        
        <div className="confirm-dialog-content">
          {step === 1 ? (
            <>
              <p className="confirm-message">{message}</p>
              <div className="confirm-warning">
                <strong>⚠️ Warning:</strong> This action cannot be undone.
              </div>
            </>
          ) : (
            <>
              <p className="confirm-message">
                To confirm deletion, please type the party name exactly:
              </p>
              <div className="confirm-item-name">
                <strong>{itemName}</strong>
              </div>
              <input
                type="text"
                className="confirm-input"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type party name here"
                autoFocus
                aria-label="Type party name to confirm deletion"
              />
              {typedName && !isNameMatch && (
                <p className="confirm-error">Party name does not match</p>
              )}
            </>
          )}
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="btn-cancel" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          
          {step === 1 ? (
            <button 
              className="btn-confirm-warning" 
              onClick={handleFirstConfirm}
            >
              Continue
            </button>
          ) : (
            <button 
              className="btn-confirm-danger" 
              onClick={handleFinalConfirm}
              disabled={!isNameMatch}
              aria-label="Final confirmation to delete party"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
