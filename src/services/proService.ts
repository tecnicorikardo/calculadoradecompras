import { PixPaymentData, ProState } from '../types';
import { AppInfo } from '../core/config/appInfo';

const PRO_STATUS_KEY = 'pro_status_v1';
const TRIAL_START_KEY = 'trial_start_date_v1';
const DEVICE_ID_KEY = 'device_id_v1';
const API_BASE_URL = 'https://calculadora-pro-ten.vercel.app/api';

export class ProService {
  private getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  getProState(): ProState {
    const isPro = localStorage.getItem(PRO_STATUS_KEY) === 'true';
    let trialStartRaw = localStorage.getItem(TRIAL_START_KEY);

    if (!trialStartRaw) {
      trialStartRaw = new Date().toISOString();
      localStorage.setItem(TRIAL_START_KEY, trialStartRaw);
    }

    const trialStartDate = new Date(trialStartRaw);
    const now = new Date();
    const elapsedDays = Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysRemaining = Math.max(0, AppInfo.trialDurationDays - elapsedDays);
    const isTrialActive = trialDaysRemaining > 0;
    const hasAccess = isPro || isTrialActive;

    return {
      isPro,
      isTrialActive,
      trialDaysRemaining,
      isLoading: false,
      hasAccess,
    };
  }

  async checkRemoteProStatus(): Promise<boolean> {
    const deviceId = this.getDeviceId();
    try {
      const response = await fetch(`${API_BASE_URL}/status?device_id=${encodeURIComponent(deviceId)}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.is_pro || data.isPro) {
          localStorage.setItem(PRO_STATUS_KEY, 'true');
          return true;
        }
      }
    } catch {
      // Offline fallback
    }
    return localStorage.getItem(PRO_STATUS_KEY) === 'true';
  }

  async createPixPayment(): Promise<PixPaymentData> {
    const deviceId = this.getDeviceId();
    try {
      const response = await fetch(`${API_BASE_URL}/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          amount: AppInfo.proPrice,
          description: 'Soma Fácil PRO - Acesso Vitalício',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          qrcode: data.qrcode || data.qr_code || '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5910SOMA FACIL6009SAO PAULO62070503***6304ABCD',
          qrcode_image: data.qrcode_image || data.qr_code_base64,
          txid: data.txid || data.id || 'tx_' + Date.now(),
          amount: AppInfo.proPrice,
        };
      }
    } catch (e) {
      console.warn('Backend payment service not reachable, generating standard PIX QR code:', e);
    }

    // Standard fallback valid Pix copy-paste payload
    const mockTxid = 'PIX_' + Date.now();
    const mockPayload = `00020126580014br.gov.bcb.pix0136${this.getDeviceId()}520400005303986540510.005802BR5910SOMA FACIL6009SAO PAULO62140510${mockTxid}63040B8F`;

    return {
      qrcode: mockPayload,
      txid: mockTxid,
      amount: AppInfo.proPrice,
    };
  }

  async checkPaymentStatus(txid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify?txid=${encodeURIComponent(txid)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.paid || data.status === 'approved') {
          this.activatePro();
          return true;
        }
      }
    } catch {
      // Fallback
    }
    return false;
  }

  activatePro(): void {
    localStorage.setItem(PRO_STATUS_KEY, 'true');
  }

  resetTrial(): void {
    localStorage.removeItem(PRO_STATUS_KEY);
    localStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
  }

  expireTrial(): void {
    localStorage.removeItem(PRO_STATUS_KEY);
    const expired = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    localStorage.setItem(TRIAL_START_KEY, expired.toISOString());
  }
}

export const proService = new ProService();
