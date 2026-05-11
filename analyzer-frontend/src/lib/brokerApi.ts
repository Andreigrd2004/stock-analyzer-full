import { fetchApi } from './apiClient';
import type {
  Broker,
  BrokerCreateRequest,
  BrokerUpdateRequest,
  BrokerClick,
  BrokerClickCreateRequest,
  BrokerClickUpdateRequest,
} from '../types';

// ── /brokers ──────────────────────────────────────────────────────────────────

export const brokerApi = {
  /** POST /brokers */
  createBroker: (data: BrokerCreateRequest) =>
    fetchApi<Broker>('/brokers', { method: 'POST', body: JSON.stringify(data) }),

  /** PUT /brokers/{brokerId} */
  updateBroker: (data: BrokerUpdateRequest) =>
    fetchApi<Broker>(`/brokers`, { method: 'PUT', body: JSON.stringify(data) }),

  /** GET /brokers/{brokerId} */
  getBroker: (brokerId: number) =>
    fetchApi<Broker>(`/brokers/${brokerId}`),

  /** GET /brokers */
  getAllBrokers: () =>
    fetchApi<Broker[]>('/brokers'),

  /** GET /brokers/bid-amounts  →  List<BigDecimal> (arrives as number[]) */
  getAllBidAmounts: () =>
    fetchApi<number[]>('/brokers/bid-amounts'),
};

// ── /broker-clicks ────────────────────────────────────────────────────────────

export const brokerClickApi = {
  /** POST /broker-clicks */
  createBrokerClick: (data: BrokerClickCreateRequest) =>
    fetchApi<BrokerClick>('/broker-clicks', { method: 'POST', body: JSON.stringify(data) }),

  /** PUT /broker-clicks/{clickId} */
  updateBrokerClick: (clickId: number, data: BrokerClickUpdateRequest) =>
    fetchApi<BrokerClick>(`/broker-clicks/${clickId}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** GET /broker-clicks/{clickId} */
  getBrokerClick: (clickId: number) =>
    fetchApi<BrokerClick>(`/broker-clicks/${clickId}`),

  /** GET /broker-clicks/by-broker/{brokerId} */
  getClicksByBroker: (brokerId: number) =>
    fetchApi<BrokerClick[]>(`/broker-clicks/by-broker/${brokerId}`),
};
