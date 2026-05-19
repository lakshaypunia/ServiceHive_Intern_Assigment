import api from './axios';
import type { ApiResponse, Lead, LeadFilters, LeadStatus, LeadSource } from '../types';

export interface CreateLeadPayload {
  name: string;
  email: string;
  source: LeadSource;
  status?: LeadStatus;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

export const getLeadsApi = (filters: LeadFilters = {}) =>
  api.get<ApiResponse<Lead[]>>('/leads', { params: filters });

export const getLeadByIdApi = (id: string) =>
  api.get<ApiResponse<Lead>>(`/leads/${id}`);

export const createLeadApi = (data: CreateLeadPayload) =>
  api.post<ApiResponse<Lead>>('/leads', data);

export const updateLeadApi = (id: string, data: UpdateLeadPayload) =>
  api.put<ApiResponse<Lead>>(`/leads/${id}`, data);

export const deleteLeadApi = (id: string) =>
  api.delete<ApiResponse<null>>(`/leads/${id}`);

export const exportLeadsApi = (filters: Omit<LeadFilters, 'page'> = {}) =>
  api.get('/leads/export', { params: filters, responseType: 'blob' });
