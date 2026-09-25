import { useState, useEffect, useCallback } from 'react';
import { ProState } from '../types';
import { proService } from '../services/proService';

export function usePro() {
  const [proState, setProState] = useState<ProState>(() => proService.getProState());
  const [isProLoading, setIsProLoading] = useState(true);

  const refresh = useCallback(() => {
    setProState(proService.getProState());
  }, []);

  useEffect(() => {
    // Initial check from localStorage
    refresh();
    // Check remote status — só mostra PaywallGate depois que isso terminar
    proService.checkRemoteProStatus().then(() => {
      refresh();
    }).finally(() => {
      setIsProLoading(false);
    });
  }, [refresh]);

  const activatePro = useCallback(() => {
    proService.activatePro();
    refresh();
  }, [refresh]);

  const resetTrial = useCallback(() => {
    proService.resetTrial();
    refresh();
  }, [refresh]);

  const expireTrial = useCallback(() => {
    proService.expireTrial();
    refresh();
  }, [refresh]);

  return {
    ...proState,
    isProLoading,
    refresh,
    activatePro,
    resetTrial,
    expireTrial,
  };
}
