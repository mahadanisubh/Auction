import './modal.css';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm && (
            <button className="btn-confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
