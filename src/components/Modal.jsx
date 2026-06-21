import React from 'react';

export default function Modal({ onClose, children, center = false }) {
  return (
    <div className={`overlay${center ? ' center' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      {center ? <div className="dialog">{children}</div> : <div className="sheet">{children}</div>}
    </div>
  );
}
