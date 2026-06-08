import { useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { useNetwork } from '../lib/network-context';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function NetworkWrapper() {
  const { networkId } = useParams();
  const { setNetworkId, networkId: currentNetworkId } = useNetwork();

  useEffect(() => {
    if (networkId && networkId !== currentNetworkId) {
      setNetworkId(networkId);
      
      // Fetch network metadata from Firestore
      const fetchTheme = async () => {
        try {
          const snap = await getDoc(doc(db, 'networks', networkId));
          if (snap.exists() && snap.data().theme) {
            const theme = snap.data().theme;
            document.documentElement.className = theme === 'dark' ? '' : `theme-${theme}`;
          } else {
            document.documentElement.className = '';
          }
        } catch (err) {
          console.error('Failed to fetch network theme:', err);
        }
      };
      fetchTheme();
    }
  }, [networkId, currentNetworkId, setNetworkId]);

  return <Outlet />;
}
