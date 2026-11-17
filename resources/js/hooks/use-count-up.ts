import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Menganimasikan angka dari nilai sebelumnya ke `target` (default 800ms). */
export function useCountUp(target: number, duration = 0.8) {
    const reduceMotion = useReducedMotion();
    const [value, setValue] = useState(reduceMotion ? target : 0);
    const current = useRef(reduceMotion ? target : 0);

    useEffect(() => {
        if (reduceMotion) {
            current.current = target;
            setValue(target);

            return;
        }

        const controls = animate(current.current, target, {
            duration,
            ease: 'easeOut',
            onUpdate: (latest) => {
                current.current = latest;
                setValue(latest);
            },
        });

        return () => controls.stop();
    }, [target, duration, reduceMotion]);

    return value;
}
