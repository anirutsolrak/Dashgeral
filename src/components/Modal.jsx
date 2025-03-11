import React, { useState, useRef, useEffect } from 'react';
import '../styles/Modal.css';

function Modal({
    isOpen,
    onClose,
    title,
    children,
    overlayClassName = "",
    contentClassName = "",
    headerClassName = "",
    titleClassName = "",
    closeButtonClassName = "",
    bodyClassName = "",
    scrollIndicatorClassName = ""
}) {
    if (!isOpen) return null;

    const [isScrolling, setIsScrolling] = useState(false);
    const [isContentScrollable, setIsContentScrollable] = useState(false); // 1. New state to track scrollability
    const modalContentRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIsScrolling(false);

            // 2. Check if content is scrollable when modal opens
            if (modalContentRef.current) {
                const contentElement = modalContentRef.current;
                setIsContentScrollable(contentElement.scrollHeight > contentElement.clientHeight);
            } else {
                setIsContentScrollable(false); // Default to not scrollable if ref is not yet available
            }
        }
    }, [isOpen]);


    const handleScrollButtonClick = () => {
        setIsScrolling(true);

        if (modalContentRef.current) {
            modalContentRef.current.scrollBy({
                top: modalContentRef.current.clientHeight,
                behavior: 'smooth',
            });
        }
    };


    return (
        <div
            data-name="modal-overlay"
            className={`modal-overlay ${overlayClassName}`}
            onClick={onClose}
        >
            <div
                ref={modalContentRef}
                data-name="modal-content"
                className={`modal-content ${contentClassName}`}
                style={{ maxWidth: '95%', width: 'fit-content', scrollbarWidth: 'thin', scrollbarColor: '#888 #f0f0f0' }}
                onClick={e => e.stopPropagation()}
            >
                <div className={`modal-header ${headerClassName}`}>
                    <h2 className={`modal-title ${titleClassName}`}>{title}</h2>
                    <button
                        data-name="modal-close"
                        className={`modal-close-button ${closeButtonClassName}`}
                        onClick={onClose}
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
                <div className={`modal-body ${bodyClassName}`}>
                    {children}
                    {/* Scroll Indicator - Now Conditional on isContentScrollable */}
                    {!isScrolling && isContentScrollable && ( // 3. Conditional rendering: !isScrolling AND isContentScrollable
                        <button
                            className={`modal-scroll-indicator ${scrollIndicatorClassName}`}
                            onClick={handleScrollButtonClick}
                            type="button"
                        >
                            <i className="fas fa-chevron-down text-2xl"></i>
                            <p className="text-sm">Role para mais</p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Modal;