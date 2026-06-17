import React, { useState, useRef } from 'react';
import { Icon } from '@site/src/components/icons';

type VideoItem = {
    videoId: string;
    title: string;
};

type VideoCarouselProps = {
    videos: VideoItem[];
};

export default function VideoCarousel({ videos }: VideoCarouselProps) {
    // Logic: translate the track based on index
    // We want to show 3 items at a time on Desktop.

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3;
    const totalItems = videos.length;
    const maxIndex = Math.max(0, totalItems - itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    // Determine if buttons should be disabled
    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex >= maxIndex;

    return (
        <div className="carousel-wrapper">
            <button
                className="carousel-btn prev"
                onClick={prevSlide}
                disabled={isPrevDisabled}
                aria-label="Previous"
            >
                <Icon.ChevronLeft size={24} />
            </button>

            <div className="carousel-viewport">
                <div
                    className="carousel-track"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                    }}
                >
                    {videos.map((video) => (
                        <div className="carousel-item" key={video.videoId} style={{ flex: `0 0 ${100 / itemsPerPage}%` }}>
                            <div className="carousel-video-container">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${video.videoId}`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ aspectRatio: '9/16', borderRadius: '12px', display: 'block' }}
                                ></iframe>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="carousel-btn next"
                onClick={nextSlide}
                disabled={isNextDisabled}
                aria-label="Next"
            >
                <Icon.ChevronRight size={24} />
            </button>
        </div>
    );
}
