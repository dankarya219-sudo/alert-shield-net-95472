import { useEffect, useCallback, useState } from "react";

interface GestureDetectionOptions {
  shakeEnabled: boolean;
  powerButtonEnabled: boolean;
  onGestureDetected: () => void;
}

export const useGestureDetection = ({ shakeEnabled, powerButtonEnabled, onGestureDetected }: GestureDetectionOptions) => {
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [powerButtonCount, setPowerButtonCount] = useState(0);
  const [lastPowerButtonTime, setLastPowerButtonTime] = useState(0);

  const handleShake = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastShakeTime;

    // Reset if more than 2 seconds between shakes
    if (timeDiff > 2000) {
      setShakeCount(1);
      setLastShakeTime(now);
      return;
    }

    const newCount = shakeCount + 1;
    setShakeCount(newCount);
    setLastShakeTime(now);

    // Trigger emergency if shaken 3 times quickly
    if (newCount >= 3) {
      setShakeCount(0);
      onGestureDetected();
    }
  }, [shakeCount, lastShakeTime, onGestureDetected]);

  const handlePowerButton = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastPowerButtonTime;

    // Reset if more than 2 seconds between presses
    if (timeDiff > 2000) {
      setPowerButtonCount(1);
      setLastPowerButtonTime(now);
      return;
    }

    const newCount = powerButtonCount + 1;
    setPowerButtonCount(newCount);
    setLastPowerButtonTime(now);

    // Trigger emergency if pressed 3 times quickly
    if (newCount >= 3) {
      setPowerButtonCount(0);
      onGestureDetected();
    }
  }, [powerButtonCount, lastPowerButtonTime, onGestureDetected]);

  // Shake detection
  useEffect(() => {
    if (!shakeEnabled || typeof window === 'undefined') return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const currentTime = Date.now();
      if (currentTime - lastUpdate < 100) return;

      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Detect significant shake
      if (deltaX + deltaY + deltaZ > 30) {
        handleShake();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
      lastUpdate = currentTime;
    };

    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [shakeEnabled, handleShake]);

  // Power button detection (using visibility API as proxy)
  useEffect(() => {
    if (!powerButtonEnabled || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handlePowerButton();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [powerButtonEnabled, handlePowerButton]);

  return { shakeCount, powerButtonCount };
};
