import { useEffect, useState } from 'react';

// Same breakpoint as the CSS: top bar and the details panel next to the card from here up
const QUERY = '(min-width: 1024px)';

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};
