import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { brokerApi, brokerClickApi } from '@/lib/brokerApi';
import type { Broker } from '@/types';
import styles from './BrokerModal.module.css';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({ isOpen, onClose, symbol }) => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchBrokers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await brokerApi.getAllBrokers();
        if (active) {
          // Filter active brokers and sort by bidAmount descending
          const activeBrokers = data.filter(b => b.active);
          const sorted = activeBrokers.sort((a, b) => {
            const bidA = parseFloat(a.bidAmount) || 0;
            const bidB = parseFloat(b.bidAmount) || 0;
            return bidB - bidA;
          });
          setBrokers(sorted);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load brokers');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBrokers();

    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBrokerClick = async (broker: Broker) => {
    try {
      // Record the click in the backend
      await brokerClickApi.createBrokerClick({
        brokerName: broker.companyName,
      });
    } catch (err) {
      console.error('Failed to record broker click:', err);
      // Continue to redirect even if analytics fail
    }

    // Handle redirect URL gracefully
    let url = broker.redirectUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Open in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <GlassCard className={styles.modalContent} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Select a Broker</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <p className={styles.subtitle}>
          Trade {symbol} with our top partners
        </p>

        {loading ? (
          <div className={styles.loading}>
            <span className={`material-symbols-outlined ${styles.spinIcon}`}>refresh</span>
            Loading brokers...
          </div>
        ) : error ? (
          <div className={styles.error}>
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : brokers.length === 0 ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">info</span>
            No active brokers available at the moment.
          </div>
        ) : (
          <div className={styles.brokerList}>
            {brokers.map((broker) => (
              <div 
                key={broker.id} 
                className={styles.brokerItem}
                onClick={() => handleBrokerClick(broker)}
              >
                <div className={styles.brokerInfo}>
                  <span className={styles.brokerName}>{broker.companyName}</span>
                </div>
                <button className={styles.tradeActionBtn}>
                  Trade
                  <span className="material-symbols-outlined">open_in_new</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
