import { useEffect } from "react";
import { useRef } from "react";

export const useWithSound = (audioSource) => {
    const soundRef = useRef();

    useEffect(() => {
        soundRef.current = new Audio(audioSource);
    }, [audioSource]);

    const playSound = () => {
        soundRef.current.currentTime = 0
        soundRef.current.play()
    }

    return {
        playSound
    }
}