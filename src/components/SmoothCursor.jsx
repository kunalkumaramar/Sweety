"use client"
import React from "react";
import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DefaultCursorSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      style={{ scale: 1 }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12.001 20.727c-.316 0-.63-.098-.892-.293-1.93-1.435-3.54-2.84-4.854-4.2-.134-.139-.298-.268-.482-.387C2.257 10.063 2 9.111 2 8.145 2 5.76 3.85 4 6.09 4c1.148 0 2.183.45 2.96 1.268l.944.985.944-.985A4.214 4.214 0 0 1 13.897 4c2.241 0 4.103 1.76 4.103 4.145 0 .966-.257 1.918-.373 2.215-.584 1.186-1.542 2.487-2.882 3.874-1.313 1.36-2.924 2.765-4.854 4.2-.262.195-.576.293-.892.293Z"
        fill="#ff4d8d"
      />
      <path
        d="M12 19.9c-1.83-1.36-3.348-2.694-4.595-3.998-1.202-1.258-2.053-2.418-2.57-3.47-.24-.488-.502-1.355-.502-2.287C4.333 7.12 5.64 5.833 7.35 5.833c.84 0 1.6.33 2.18.93L12 9.333l2.47-2.57c.58-.6 1.34-.93 2.18-.93 1.71 0 3.017 1.286 3.017 3.313 0 .932-.262 1.799-.502 2.287-.517 1.052-1.368 2.212-2.57 3.47C15.348 17.206 13.83 18.54 12 19.9Z"
        fill="white"
        opacity="0.15"
      />
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed (e.g., 768 for tablet/mobile)
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.cursor = "auto";
      return;
    }

    const updateVelocity = (currentPos) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;
      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }
      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const smoothMouseMove = (e) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      updateVelocity(currentPos);
      const speed = Math.sqrt(Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2));
      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);
      if (speed > 0.1) {
        const currentAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;
        scale.set(0.95);
        setIsMoving(true);
        const timeout = setTimeout(() => {
          scale.set(1);
          setIsMoving(false);
        }, 150);
        return () => clearTimeout(timeout);
      }
    };

    let rafId;
    const throttledMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    };

    document.body.style.cursor = "none";
    window.addEventListener("mousemove", throttledMouseMove);
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      document.body.style.cursor = "auto";
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, rotation, scale, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {cursor}
    </motion.div>
  );
}