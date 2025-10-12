export type ErrorKind =
  | "unauthorized"
  | "payment_required"
  | "too_many_requests"
  | "payload_too_large"
  | "gateway"
  | "server"
  | "network";

export function classifyStatus(status: number): ErrorKind | null {
  if (status === 401) return "unauthorized";
  if (status === 402) return "payment_required";
  if (status === 413) return "payload_too_large";
  if (status === 429) return "too_many_requests";
  if (status === 502 || status === 503 || status === 504) return "gateway";
  if (status >= 500) return "server";
  return null;
}


