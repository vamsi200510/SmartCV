'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationInstrumentation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origPush = window.history.pushState;
    window.history.pushState = function (...args: any[]) {
      const url = args[2];
      const err = new Error();
      const stack = err.stack ? err.stack.split('\n').slice(1, 4).join('\n') : '';
      console.log(`[NAV LOG] history.pushState -> target: ${url}\nStack:\n${stack}`);
      return origPush.apply(this, args as any);
    };

    const origReplace = window.history.replaceState;
    window.history.replaceState = function (...args: any[]) {
      const url = args[2];
      const err = new Error();
      const stack = err.stack ? err.stack.split('\n').slice(1, 4).join('\n') : '';
      console.log(`[NAV LOG] history.replaceState -> target: ${url}\nStack:\n${stack}`);
      return origReplace.apply(this, args as any);
    };

    const handlePopState = () => {
      console.log(`[NAV LOG] popstate event fired! Current location: ${window.location.href}`);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    console.log(`[NAV LOG] Next.js Route Active: ${fullUrl}`);
  }, [pathname, searchParams]);

  return null;
}
