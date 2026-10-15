import React, { useRef, useCallback, useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';

function Lightbox({ images = [], startindex = 0, onClose }) {
    const [index, setIndex] = useState(startindex);
    const touchStartX = useRef(null);
    const total = images.length;

    const goNext = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
    const goPrev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev, onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;

        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) goNext();
        if (diff < -50) goPrev();
        touchStartX.current = null;
    };

    if (!total) return null;

    const arrow =
        'absolute top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-3xl text-white"
                aria-label="Close image viewer"
            >
                &times;
            </button>

            {total > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                    }}
                    aria-label="Previous image"
                    className={`${arrow} left-2 sm:left-4`}
                >
                    ‹
                </button>
            )}

            <img
                src={getImageUrl(images[index])}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[90vw] select-none object-contain"
                draggable="false"
            />

            {total > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                    }}
                    aria-label="Next image"
                    className={`${arrow} right-2 sm:right-4`}
                >
                    ›
                </button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {index + 1} / {total}
            </div>
        </div>
    );
}

export default Lightbox;