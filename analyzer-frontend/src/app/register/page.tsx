'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/authApi';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pass: string) => {
    if (pass.length < 6) return 'Password must be at least 6 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.register({
        email,
        displayName,
        username,
        password,
      });

      if (response.accessToken) {
        document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        window.location.href = '/';
      } else {
        setError('Registration failed. No token received.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during registration.');
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
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Start tracking and analyzing stocks today</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="displayName" className={styles.label}>Full Name</label>
            <TextInput 
              id="displayName"
              type="text" 
              icon="person" 
              placeholder="John Doe" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <TextInput 
              id="username"
              type="text" 
              icon="badge" 
              placeholder="johndoe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <TextInput 
              id="email"
              type="email" 
              icon="mail" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <TextInput 
              id="password"
              type="password" 
              icon="lock" 
              placeholder="Create a strong password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" glow className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register Account'}
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link href="/login" className={styles.footerLink}>Log in</Link>
        </div>
      </GlassCard>
    </main>
  );
}
