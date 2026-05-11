import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, ref, get, set, onValue } from '@/lib/firebase';

const ADMIN_USERNAME = 'admin@gmail.com';
const DEFAULT_PASSWORD = 'rujakuleg12345';
const ADMIN_EMAIL = 'wildanspndi24@gmail.com';
const OTP_EXPIRY_MINUTES = 30;

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  currentPassword: string;
  requestPasswordChange: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtpAndChangePassword: (otp: string) => Promise<{ success: boolean; error?: string }>;
  otpSent: boolean;
  clearOtpState: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('smk_auth') === 'true';
  });
  const [currentPassword, setCurrentPassword] = useState(DEFAULT_PASSWORD);
  const [pendingNewPass, setPendingNewPass] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const passRef = ref(db, 'settings/password');
    const unsubscribe = onValue(passRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentPassword(snapshot.val());
      } else {
        set(passRef, DEFAULT_PASSWORD);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username.toLowerCase() !== ADMIN_USERNAME) return false;
    const passRef = ref(db, 'settings/password');
    const snapshot = await get(passRef);
    const storedPass = snapshot.exists() ? snapshot.val() : DEFAULT_PASSWORD;
    if (password === storedPass) {
      setIsLoggedIn(true);
      localStorage.setItem('smk_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('smk_auth');
  };

  const requestPasswordChange = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentPass !== currentPassword) {
      return { success: false, error: 'Password saat ini salah' };
    }
    if (newPass.length < 6) {
      return { success: false, error: 'Password baru minimal 6 karakter' };
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    await set(ref(db, 'passwordChangeRequest'), {
      otp,
      expiresAt,
      requestedAt: Date.now(),
    });

    setPendingNewPass(newPass);
    setOtpSent(true);

    const subject = encodeURIComponent('[SMK DARUL MUTTAQIN] Kode OTP Ganti Password');
    const lines = [
      'Halo Admin,',
      '',
      'Ada permintaan penggantian password Sistem Kesiangan SMK Darul Muttaqin Cianjur.',
      '',
      'KODE OTP: ' + otp,
      '',
      'Berlaku: ' + OTP_EXPIRY_MINUTES + ' menit',
      'Waktu: ' + new Date().toLocaleString('id-ID'),
      '',
      'Berikan kode ini jika Anda menyetujui perubahan password.',
      'Jika tidak, abaikan email ini.',
    ];
    const body = encodeURIComponent(lines.join('\r\n'));
    window.open('mailto:' + ADMIN_EMAIL + '?subject=' + subject + '&body=' + body, '_blank');

    return { success: true };
  };

  const verifyOtpAndChangePassword = async (
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const requestRef = ref(db, 'passwordChangeRequest');
    const snapshot = await get(requestRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Tidak ada permintaan OTP aktif. Minta OTP terlebih dahulu.' };
    }

    const data = snapshot.val() as { otp: string; expiresAt: number };

    if (Date.now() > data.expiresAt) {
      await set(requestRef, null);
      setOtpSent(false);
      return { success: false, error: 'Kode OTP sudah kadaluarsa. Minta kode OTP baru.' };
    }

    if (otp.trim() !== data.otp) {
      return { success: false, error: 'Kode OTP salah. Periksa email wildanspndi24@gmail.com.' };
    }

    await set(ref(db, 'settings/password'), pendingNewPass);
    setCurrentPassword(pendingNewPass);
    await set(requestRef, null);
    setOtpSent(false);
    setPendingNewPass('');

    return { success: true };
  };

  const clearOtpState = () => {
    setOtpSent(false);
    setPendingNewPass('');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        currentPassword,
        requestPasswordChange,
        verifyOtpAndChangePassword,
        otpSent,
        clearOtpState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
