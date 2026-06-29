import { fetchApi } from './apiClient';
import type {
  Broker,
  BrokerCreateRequest,
  BrokerUpdateRequest,
  BrokerClick,
  BrokerClickCreateRequest,
  BrokerClickUpdateRequest,
} from '../types';



export const brokerApi = {

  createBroker: (data: BrokerCreateRequest) =>
    fetchApi<Broker>('/brokers', { method: 'POST', body: JSON.stringify(data) }),


  updateBroker: (data: BrokerUpdateRequest) =>
    fetchApi<Broker>(`/brokers`, { method: 'PUT', body: JSON.stringify(data) }),


  getBroker: (brokerId: number) =>
    fetchApi<Broker>(`/brokers/${brokerId}`),


  getAllBrokers: () =>
    fetchApi<Broker[]>('/brokers'),


  getAllBidAmounts: () =>
    fetchApi<number[]>('/brokers/bid-amounts'),
};



export const brokerClickApi = {

  createBrokerClick: (data: BrokerClickCreateRequest) =>
    fetchApi<BrokerClick>('/broker-clicks', { method: 'POST', body: JSON.stringify(data) }),


  updateBrokerClick: (clickId: number, data: BrokerClickUpdateRequest) =>
    fetchApi<BrokerClick>(`/broker-clicks/${clickId}`, { method: 'PUT', body: JSON.stringify(data) }),


  getBrokerClick: (clickId: number) =>
    fetchApi<BrokerClick>(`/broker-clicks/${clickId}`),


  getClicksByBroker: (brokerId: number) =>
    fetchApi<BrokerClick[]>(`/broker-clicks/by-broker/${brokerId}`),
};
