// path: client/src/components/SplashScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SplashScreen.css';

const WORD = 'ELECTROLAND';

export default function SplashScreen({ onDone }) {
    const [visibleCount, setVisibleCount]   = useState(0);
    const [flickerSet,   setFlickerSet]     = useState(new Set());
    const [masterGlow,   setMasterGlow]     = useState(false);
    const [taglineShow,  setTaglineShow]    = useState(false);
    const [progress,     setProgress]       = useState(0);
    const [exiting,      setExiting]        = useState(false);
    const doneRef = useRef(false);

    // ── Sequence controller ─────────────────────────────────────
    useEffect(() => {
        const timers = [];

        // Reveal letters one-by-one, with a tiny flicker on each
        WORD.split('').forEach((_, i) => {
            timers.push(setTimeout(() => {
                setVisibleCount(i + 1);
                // flicker flag — cleared after its animation finishes
                setFlickerSet(prev => new Set([...prev, i]));
                setTimeout(() => {
                    setFlickerSet(prev => {
                        const next = new Set(prev);
                        next.delete(i);
                        return next;
                    });
                }, 400);
            }, 420 + i * 95));
        });

        // After all letters are in → master glow pulse
        const glowDelay = 420 + WORD.length * 95 + 80;
        timers.push(setTimeout(() => setMasterGlow(true), glowDelay));

        // Tagline fade
        timers.push(setTimeout(() => setTaglineShow(true), glowDelay + 200));

        // Progress bar (runs from 0 → 100 over ~1800ms starting at 800ms)
        const barStart  = 800;
        const barTotal  = 1800;
        const barStep   = 40;
        let elapsed     = 0;
        const barTimer  = setInterval(() => {
            elapsed += barStep;
            setProgress(Math.min((elapsed / barTotal) * 100, 100));
            if (elapsed >= barTotal) clearInterval(barTimer);
        }, barStep);
        timers.push(barTimer);

        // Exit — total ~3.4 s
        timers.push(setTimeout(() => {
            if (doneRef.current) return;
            setExiting(true);
            setTimeout(() => {
                if (!doneRef.current) {
                    doneRef.current = true;
                    onDone?.();
                }
            }, 900);
        }, 3400));

        return () => timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`sp-root${exiting ? ' sp-root--exit' : ''}`}>

            {/* Grid + scanlines */}
            <div className="sp-grid"      aria-hidden="true" />
            <div className="sp-scanlines" aria-hidden="true" />

            {/* Ambient glow */}
            <div className="sp-ambient"   aria-hidden="true" />

            {/* Corner markers */}
            <div className="sp-corner sp-corner--tl" aria-hidden="true" />
            <div className="sp-corner sp-corner--tr" aria-hidden="true" />
            <div className="sp-corner sp-corner--bl" aria-hidden="true" />
            <div className="sp-corner sp-corner--br" aria-hidden="true" />

            {/* Floating sparks */}
            {[1,2,3,4].map(n => (
                <div key={n} className={`sp-spark sp-spark--${n}`} aria-hidden="true" />
            ))}

            {/* ── Main stage ── */}
            <div className="sp-stage" role="img" aria-label="Electroland">

                <div className="sp-eyebrow">Premium Home Appliances</div>

                <div className={`sp-wordmark${masterGlow ? ' sp-wordmark--glow' : ''}`}>
                    {WORD.split('').map((char, i) => {
                        const isVisible = i < visibleCount;
                        const isFlicker = flickerSet.has(i);
                        let cls = 'sp-letter';
                        if (isVisible) cls += isFlicker ? ' sp-letter--flicker' : ' sp-letter--in';
                        return (
                            <span
                                key={i}
                                className={cls}
                                style={{ animationDelay: isFlicker ? '0s' : undefined }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </div>

                <div className="sp-rule" aria-hidden="true" />

                <div className={`sp-tagline${taglineShow ? ' sp-tagline--visible' : ''}`}>
                    Engineered for life
                </div>
            </div>

            {/* Loading bar */}
            <div className="sp-bar-wrap" aria-hidden="true">
                <div className="sp-bar-track">
                    <div className="sp-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="sp-bar-label">Initialising experience</div>
            </div>

        </div>
    );
}