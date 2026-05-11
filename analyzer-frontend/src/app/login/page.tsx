'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/authApi';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ username, password });
      if (response.accessToken) {
        document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        // Use a full-page navigation so the Next.js middleware re-runs
        // and reads the newly-set cookie before rendering the home page.
        window.location.href = '/';
      } else {
        setError('Login failed. No token received.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgGlow} />
      
      <GlassCard className={styles.card} glow="primary">
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              insights
            </span>
          </Link>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <TextInput 
              id="username"
              type="text" 
              icon="person" 
              placeholder="Your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Link href="#" className={styles.forgotPassword}>Forgot password?</Link>
            </div>
            <TextInput 
              id="password"
              type="password" 
              icon="lock" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" glow className={styles.submitBtn} disabled={loading}>
            {loading ? 'Logging in...' : 'Secure Login'}
          </Button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account?
          <Link href="/register" className={styles.footerLink}>Sign up</Link>
        </div>
      </GlassCard>
    </main>
  );
}
