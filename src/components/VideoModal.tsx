import React, { useState } from 'react';

type VideoModalProps = {
    videoId: string;
    title: string;
    description: string;
    coverImage: string;
};

export default function VideoModal({ videoId, title, description, coverImage }: VideoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <div className="video-card" onClick={() => setIsOpen(true)}>
                <img src={coverImage} className="video-thumb no-zoom" style={{ objectFit: 'contain', background: '#333' }} alt={title} />
                <div className="video-play-btn"></div>
                <div className="video-info">
                    <div className="video-title">{title}</div>
                    <div className="video-meta">{description}</div>
                </div>
            </div>

            {isOpen && (
                <div className="video-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="video-modal-close" onClick={() => setIsOpen(false)}>×</button>
                        <div className="video-modal-player-wrapper">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title={title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="video-modal-info">
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
