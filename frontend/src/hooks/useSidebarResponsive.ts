import { useState, useEffect } from "react";

export const useSidebarResponsive = (initialState: boolean = true) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsOpen(false);
        setIsMobile(true);
      } else if (width < 1024) {
        setIsOpen(false);
        setIsMobile(false);
      } else {
        setIsOpen(true);
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);

  return { isOpen, setIsOpen, isMobile, toggle };
};
