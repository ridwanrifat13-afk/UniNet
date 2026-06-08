import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NetworkData {
  id: string;
  name: string;
  departmentName: string;
  batchName: string;
  memberCount: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  visionStatement: string;
  address: string;
  inviteCode: string;
}

interface NetworkContextType {
  networkId: string | null;
  networkData: NetworkData | null;
  setNetworkId: (id: string | null) => void;
  setNetworkData: (data: NetworkData | null) => void;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedNetworkId = localStorage.getItem('activeNetworkId');
    if (storedNetworkId) {
      setNetworkId(storedNetworkId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (networkId) {
      localStorage.setItem('activeNetworkId', networkId);
    } else {
      localStorage.removeItem('activeNetworkId');
    }
  }, [networkId]);

  return (
    <NetworkContext.Provider value={{ networkId, networkData, setNetworkId, setNetworkData, isLoading }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
