import { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho link
export interface NavLink {
  name: string;
  target: string;
  offset: number;
}

export const useActiveLink = (links: NavLink[]) => {
  const [activeLink, setActiveLink] = useState('home');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Xử lý sự kiện cuộn trang
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if we're at the bottom of the page
      const isAtBottom = scrollPosition + windowHeight >= documentHeight - 20;
      
      if (isAtBottom) {
        // If at bottom, set the last link as active (contact)
        const lastLink = links[links.length - 1];
        setActiveLink(lastLink.name);
        return;
      }
      
      // Find the section currently in view
      for (let i = links.length - 1; i >= 0; i--) {
        const link = links[i];
        const element = document.getElementById(link.target);
        
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const offsetPosition = element.offsetTop - 150;
        
        // Get the next section if it exists
        const nextElement = i < links.length - 1 ? document.getElementById(links[i + 1].target) : null;
        const nextOffsetPosition = nextElement ? nextElement.offsetTop - 150 : documentHeight;
        
        // Consider a section visible if its top is in the viewport or if we've scrolled past it
        // but not yet reached the next section
        if (
          (rect.top <= 150 && rect.bottom > 0) || 
          (scrollPosition >= offsetPosition && scrollPosition < nextOffsetPosition)
        ) {
          setActiveLink(link.name);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Gọi khi component mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [links, mounted]);
  
  // Xử lý việc nhấp chuột vào liên kết
  const handleSetActive = (name: string) => {
    setActiveLink(name);
  };
  
  return { activeLink, handleSetActive };
}; 