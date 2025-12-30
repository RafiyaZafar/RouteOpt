import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  // Demo credentials (hard-coded for interview/demo)
  const ADMIN_EMAIL = 'admin@routeopt.local';
  const ADMIN_PASSWORD = 'admin123';
  const DRIVER_PHONE = '+9999999999';
  const DRIVER_PIN = '1234';

  // Which tab is active? "admin" or "driver"
  const [activeTab, setActiveTab] = useState('admin');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState(ADMIN_PASSWORD);

  // Driver form state
  const [driverPhone, setDriverPhone] = useState(DRIVER_PHONE);
  const [driverPin, setDriverPin] = useState(DRIVER_PIN);

  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');

    try {
      if (activeTab === 'admin') {
        await login({ email: adminEmail, password: adminPassword });
      } else {
        await login({ phone: driverPhone, pin: driverPin });
      }
      nav('/dispatch');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-6">RouteOpt</h1>

        <div className="bg-white p-6 rounded-2xl shadow">
          {/* Tabs */}
          <div className="flex mb-4 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={
                'flex-1 py-2 rounded-lg text-sm font-medium ' +
                (activeTab === 'admin'
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500')
              }
            >
              Admin / Ops
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('driver')}
              className={
                'flex-1 py-2 rounded-lg text-sm font-medium ' +
                (activeTab === 'driver'
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500')
              }
            >
              Driver
            </button>
          </div>

          {/* Shared form wrapper */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'admin' ? (
              <>
                <h2 className="text-lg font-medium">Admin / Ops Login</h2>
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border rounded"
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border rounded"
                />
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded"
                  type="submit"
                >
                  Sign in as Admin
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Demo credentials are pre-filled.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-medium">Driver Login (Phone + PIN)</h2>
                <input
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full px-4 py-3 border rounded"
                />
                <input
                  value={driverPin}
                  onChange={(e) => setDriverPin(e.target.value)}
                  placeholder="PIN"
                  className="w-full px-4 py-3 border rounded"
                />
                <button
                  className="w-full bg-green-600 text-white py-3 rounded"
                  type="submit"
                >
                  Sign in as Driver
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Demo credentials are pre-filled.
                </p>
              </>
            )}
          </form>

          {err && <div className="mt-3 text-red-600">{err}</div>}
        </div>
      </div>
    </div>
  );
}
