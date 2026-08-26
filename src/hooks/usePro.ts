import { useState, useEffect, useCallback } from 'react';
import { ProState } from '../types';
import { proService } from '../services/proService';

export function usePro() {
  const [proState, setProState] = useState<ProState>(() => proService.getProState());

  const refresh = useCallback(() => {
    setProState(proService.getProState());
  }, []);

  useEffect(() => {
    // Initial check
    refresh();
    // Check remote status in background
    proService.checkRemoteProStatus().then(() => {
      refresh();
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
    refresh,
    activatePro,
    resetTrial,
    expireTrial,
  };
}
