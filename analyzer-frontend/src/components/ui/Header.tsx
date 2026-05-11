'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TextInput } from './TextInput';
import { Button } from './Button';
import { useRole } from '@/context/RoleContext';
import styles from './Header.module.css';

interface HeaderProps {
  activePage?: 'dashboard' | 'watchlist' | 'broker-admin' | 'register-broker';
}

export const Header: React.FC<HeaderProps> = ({ activePage = 'dashboard' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { role } = useRole();

  useEffect(() => {
    // Get username from cookie/JWT
    const getUsername = () => {
      const match = document.cookie.match(/(^|;)\s*accessToken\s*=\s*([^;]+)/);
      if (match) {
        const token = match[2];
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);
          return payload.sub || payload.username || 'User';
        } catch (e) {
          return 'User';
        }
      }
      return null;
    };

    setUsername(getUsername());

    // Click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              insights
            </span>
          </div>
          <Link href="/" className={styles.brandName}>
            StockGen.ai
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={activePage === 'dashboard' ? styles.activeLink : styles.navLink}>Dashboard</Link>
            <Link href="/watchlist" className={activePage === 'watchlist' ? styles.activeLink : styles.navLink}>Watchlist</Link>
            {role === 'BROKER' && (
              <Link href="/broker-admin" className={activePage === 'broker-admin' ? styles.activeLink : styles.navLink}>Broker Admin</Link>
            )}
            {role === 'ADMIN' && (
              <Link href="/register-broker" className={activePage === 'register-broker' ? styles.activeLink : styles.navLink}>Register Broker</Link>
            )}
          </nav>
        </div>

        <div className={styles.actionSection}>
          
          <div className={styles.userActions} ref={dropdownRef}>
            <button 
              className={styles.avatar} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              <span className="material-symbols-outlined">person</span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.userLabel}>Signed in as</p>
                  <p className={styles.userName}>{username || 'Guest'}</p>
                </div>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

