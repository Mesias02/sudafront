import axios from "axios";

const API = process.env.REACT_APP_API_URL || "/api";


export interface AuditLogDTO {
  id: number;
  userEmail: string;
  action: string;
  entity: string | null;
  entityId: number | null;
  timestamp: string;
  details: string | null;
}

export interface AuditLogFilters {
  userEmail?: string;
  action?: string;
  from?: string; // formato ISO: '2024-06-09T00:00:00'
  to?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}, token: string): Promise<AuditLogDTO[]> {
  const params = new URLSearchParams();
  if (filters.userEmail) params.append("userEmail", filters.userEmail);
  if (filters.action) params.append("action", filters.action);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  const url = `${API}/audit-logs?${params.toString()}`;

  const res = await axios.get<AuditLogDTO[]>(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
