import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://mixo-fe-backend-task.vercel.app";

// --- Fetch Functions ---

export async function fetchCampaigns() {
  const res = await fetch(`${BASE_URL}/campaigns`);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function fetchCampaign(id) {
  const res = await fetch(`${BASE_URL}/campaigns/${id}`);
  if (!res.ok) throw new Error("Failed to fetch campaign details");
  const data = await res.json();
  return data.campaign;
}

// --- Hooks ---

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });
}

export function useCampaign(id) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign(id),
    enabled: !!id,
  });
}

// --- Helper for SSE ---
export const getCampaignStreamUrl = (id) => `${BASE_URL}/campaigns/${id}/insights/stream`;
