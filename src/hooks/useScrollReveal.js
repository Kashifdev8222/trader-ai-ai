import { useEffect, useRef } from 'react';

export default function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (options.once !== false) {
              observer.unobserve(entry.target);
            }
          } else if (options.reset) {
            entry.target.classList.remove('visible');
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    const el = ref.current;
    if (el) {
      el.classList.add('reveal');
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [options.threshold, options.rootMargin, options.once, options.reset]);

  return ref;
}
