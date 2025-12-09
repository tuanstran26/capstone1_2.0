'use client'
import { useState, useEffect } from 'react';

export interface NavLink {
  name: string;
  target: string;
  offset?: number;
}

export const useActiveLink = (navLinks: NavLink[]) => {
  const [activeLink, setActiveLink] = useState('');

  const handleSetActive = (linkName: string) => {
    setActiveLink(linkName);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => ({
        id: link.target,
        element: document.getElementById(link.target),
        offset: link.offset || -100,
      }));

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop + section.offset;
          if (scrollPosition >= sectionTop) {
            setActiveLink(section.id);
            break;
          }
        }
      }

      // If at the very top of the page
      if (window.scrollY < 100) {
        setActiveLink(navLinks[0]?.target || '');
      }
    };

    // Set initial active link
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navLinks]);

  return { activeLink, handleSetActive };
};
