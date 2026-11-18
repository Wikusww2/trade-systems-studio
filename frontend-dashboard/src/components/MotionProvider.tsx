"use client";

import React from "react";
import { MotionConfig } from "framer-motion";

/**
 * Global Framer Motion reduced-motion provider (WCAG 2.2 AA / M10).
 * Automatically respects user prefers-reduced-motion OS preference across all pages.
 */
export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
};
