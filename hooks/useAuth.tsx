"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

import useSWR from 'swr';

interface User {
  id: string;
  username: string;
  role: string;
  cafeSlug?: string;
  cafeName?: string;
  exp?: number;
}

export function useAuth() {
  const router = useRouter();
  const params = useParams();
  const menupages = params?.menupages as string;

  const fetcher = useCallback(async (url: string) => {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) {
        // Try refreshing
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (refreshRes.ok) {
          const retryRes = await fetch(url, { credentials: 'include' });
          if (retryRes.ok) return retryRes.json();
        }
      }
      throw new Error('Unauthorized');
    }
    return res.json();
  }, []);

  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000, // Cache for 1 min
  });

  const user = data?.success ? data.user : null;

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear cookies by setting expired date
      document.cookie = 'token_superadmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken_superadmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token_cafeadmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken_cafeadmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      mutate(null, false);

      // Redirect to login
      if (menupages) {
        router.replace(`/${menupages}/adminlogin`);
      } else {
        router.replace('/adminlogin');
      }
    }
  }, [router, menupages, mutate]);

  return {
    user,
    isLoading,
    error: error?.message || null,
    logout,
    checkAuth: mutate,
  };
}