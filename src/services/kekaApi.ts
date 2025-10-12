import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

const loginUrl = "https://login.keka.com/connect/token";
interface KekaProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  progress?: number;
  department?: string;
}

export const getAccessToken = async () => {
  const urlParams = {
    grant_type: 'kekaapi',
    scope: 'kekaapi',
    client_id: import.meta.env.VITE_KEKA_CLIENT_ID,
    client_secret: import.meta.env.VITE_KEKA_CLIENT_SECRET,
    api_key: import.meta.env.VITE_KEKA_API_KEY
  }

  console.log("urlParams", urlParams);
  const response = await axios.post(`${loginUrl}`,
    new URLSearchParams(urlParams),
    {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data;
};

export const fetchProjects = async () => {
  const accessToken = localStorage.getItem('keka_access_token');

  if (!accessToken) {
    throw new Error('No access token available. Please refresh the page to get a new token.');
  }

  const response = await axios.get('https://foxsense.keka.com/api/v1/psa/projects', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  console.log("Keka projects response", response);
  return response.data;
}

// Helper function to get cached Keka projects from localStorage
export const getCachedKekaProjects = (): KekaProject[] => {
  try {
    const cached = localStorage.getItem('keka_projects');
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error parsing cached Keka projects:', error);
    return [];
  }
}

export const isConfigured = (): boolean => {
  // Since we're using Supabase secrets, always return true
  return true;
}