import React from 'react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import image1 from '../assets/hero/image1.jpeg'
import image2 from '../assets/hero/image2.png'
import image3 from '../assets/hero/image.png'
import image4 from '../assets/hero/image3.png'
import image5 from '../assets/hero/image4.png'

function Hero() {
    const slides = [
        {
            image: image1,
            title: "Buy & Sell With Your Campus",
            subtitle: "No more word-of-mouth. Find what you need, right where you are.",
            link: "/search",
            linkText: "Start Browsing",
        },
        {
            image: image2,
            title: "Got Something to Sell?",
            subtitle: "List it in minutes. Reach students at your campus instantly.",
            link: "/sell",
            linkText: "Post a Listing",
        },
        {
            image: image4,
            title: "Chat & Close on WhatsApp",
            subtitle: "Contact sellers directly. No middleman, no fees.",
            link: "/how-to-buy",
            linkText: "How Buying Works",
        },
        {
            image: image5,
            title: "Meet on Campus. Pay in Person.",
            subtitle: "Inspect the item first. Cash or M-Pesa — your choice.",
            link: "/safety-tips",
            linkText: "Safety Tips",
        },
        {
            image: image3,
            title: "Safe. Simple. Student Life.",
            subtitle: "Buy, sell, rent housing, book services, and find bikes around campus.",
            link: "/how-to-sell",
            linkText: "Learn More",
        },
    ];

    const [currentSlide, setCurrentSlide] = React.useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const navigate = useNavigate();

    // ✅ FIX 2: Timer resets on EVERY slide change (manual or auto).
    // Before, the interval kept its own schedule — clicking "next" then got
    // an auto-advance 1 second later, which felt like "going faster".
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [currentSlide, slides.length]);   // ← depends on currentSlide now

    const goTo = (index) => { setCurrentSlide(index) };
    const nextSlide = () => { setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length) };
    const prevSlide = () => { setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length) };

    const handleTouchStart = (e) => {
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].screenX;
        handleSwipe();
    };

    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX.current - touchEndX.current;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    };

    // ✅ FIX 3: Text legibility WITHOUT any background overlay.
    // The trick: layered text-shadow + a thin dark stroke. The shadow
    // creates a "halo" around each letter, so it reads on light AND dark
    // parts of the photo. No scrim, no box, just stronger type.
    const titleClass =
        "text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 text-white " +
        "[text-shadow:0_1px_3px_rgba(0,0,0,0.8),0_4px_18px_rgba(0,0,0,0.6)] " +
        "[-webkit-text-stroke:0.5px_rgba(0,0,0,0.35)]";
    const subtitleClass =
        "text-base md:text-xl mb-5 text-white font-semibold " +
        "[text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_2px_10px_rgba(0,0,0,0.7)]";

    return (
        <div
            // ✅ FIX 1: Taller on desktop — the old max of 25rem (400px) looked
            // small on wide screens. Now it grows properly with breakpoints.
            className="relative w-full h-[24rem] sm:h-[28rem] md:h-[32rem] lg:h-[34rem] overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white p-4 max-w-2xl">
                            <h2 className={titleClass}>{slide.title}</h2>
                            <p className={subtitleClass}>{slide.subtitle}</p>
                            <button
                                type="button"
                                onClick={() => navigate(slide.link)}
                                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-7 rounded-lg shadow-lg shadow-black/30 transition focus:outline-none focus:ring-2 focus:ring-white/80"
                            >
                                {slide.linkText}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                        onClick={() => goTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>

            <button
                className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white shadow-md transition hover:bg-black/60 sm:left-4"
                onClick={prevSlide}
                aria-label="Previous slide"
            >
                &#10094;
            </button>
            <button
                className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white shadow-md transition hover:bg-black/60 sm:right-4"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                &#10095;
            </button>
        </div>
  )
}

export default Hero