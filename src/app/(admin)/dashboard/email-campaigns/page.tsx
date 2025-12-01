'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Stats {
  total: number;
  verified: number;
  pending: number;
  unsubscribed: number;
}

export default function EmailCampaignsPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('third-download-gate');

  // Form state
  const [includeVerified, setIncludeVerified] = useState(true);
  const [includePending, setIncludePending] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [excludeAlreadySent, setExcludeAlreadySent] = useState(true);
  const [collectionSlug, setCollectionSlug] = useState('uke-1-fargebilder-desember-2025');

  // Send result state
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    sent?: number;
    failed?: number;
    message?: string;
    errors?: string[];
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/lead-campaigns');
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const campaignIds = data.map((c: any) => c.campaignId);
        setCampaigns(campaignIds);

        // If current selection is not in the list, use first campaign
        if (campaignIds.length > 0 && !campaignIds.includes(selectedCampaign)) {
          setSelectedCampaign(campaignIds[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lead-campaigns/submissions?campaignId=${selectedCampaign}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || { total: 0, verified: 0, pending: 0, unsubscribed: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCampaigns();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && selectedCampaign) {
      fetchStats();
    }
  }, [status, selectedCampaign]);

  // Calculate recipient count
  const getRecipientCount = () => {
    let count = 0;
    if (includeVerified) count += stats.verified;
    if (includePending) count += stats.pending;
    return count;
  };

  // Handle send campaign
  const handleSendCampaign = async () => {
    const recipientCount = getRecipientCount();

    // In test mode, we don't need recipients selected (sends to admin email)
    if (!testMode && recipientCount === 0) {
      alert('Ingen mottakere valgt. Velg minst én mottakergruppe.');
      return;
    }

    // Confirmation dialog (skip if dry run or test mode)
    if (!dryRun && !testMode) {
      const confirmMessage = `Er du sikker på at du vil sende e-post til ${recipientCount} mottakere?`;
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: selectedCampaign,
          collectionSlug: collectionSlug || undefined, // Only include if provided
          filters: {
            includeVerified,
            includePending,
            testMode,
            excludeAlreadySent,
          },
          dryRun,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSendResult({
          success: result.sent > 0, // Only success if at least one sent
          sent: result.sent,
          failed: result.failed,
          message: result.message,
          errors: result.errors,
        });
      } else {
        setSendResult({
          success: false,
          message: result.error || 'Feil ved sending av kampanje',
          errors: result.errors,
        });
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      setSendResult({
        success: false,
        message: 'Nettverksfeil ved sending av kampanje',
      });
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send E-postkampanje</h1>
        <p className="text-sm text-gray-600 mt-1">
          Send e-post til dine lead-registreringer. Start med en test før du sender til alle.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verifiserte</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Venter</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avmeldte</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{stats.unsubscribed}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Send Campaign Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Kampanje</h2>

        <div className="space-y-4">
          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velg kampanje
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {campaigns.map((campaignId) => (
                <option key={campaignId} value={campaignId}>
                  {campaignId}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Velg hvilken kampanje du vil sende e-post til.
            </p>
          </div>

          {/* Collection Slug Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ukentlig samling (slug)
            </label>
            <input
              type="text"
              value={collectionSlug}
              onChange={(e) => setCollectionSlug(e.target.value)}
              placeholder="f.eks. uke-1-fargebilder-desember-2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              La stå tom for å sende velkomst-e-post uten lenke til spesifikk samling.
            </p>
          </div>

          {/* Exclude Already Sent Filter */}
          {collectionSlug && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={excludeAlreadySent}
                  onChange={(e) => setExcludeAlreadySent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Ekskluder brukere som allerede har mottatt denne samlingen
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Anbefalt: Forhindrer at samme brukere mottar samme ukentlige samling flere ganger.
                    Kun nye brukere eller de som ikke har mottatt "{collectionSlug}" tidligere vil få e-posten.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Recipient Selection */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velg mottakere
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeVerified}
                  onChange={(e) => setIncludeVerified(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Verifiserte brukere ({stats.verified})
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includePending}
                  onChange={(e) => setIncludePending(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Ventende brukere ({stats.pending})
                </span>
              </label>
            </div>
          </div>

          {/* Test Mode */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Test-modus (send kun til min egen e-post)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              I test-modus sendes e-posten kun til din egen e-postadresse for testing.
            </p>
          </div>

          {/* Dry Run */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Tørrkjøring (ikke send, bare vis hva som vil skje)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              I tørrkjøring-modus sendes ingen e-poster, men du får se en rapport over hva som ville blitt sendt.
            </p>
          </div>

          {/* Recipient Count */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              {testMode
                ? 'Test-e-post vil bli sendt til din egen e-post'
                : dryRun
                ? `Tørrkjøring: Vil vise rapport for ${getRecipientCount()} mottakere`
                : `Vil sende til ${getRecipientCount()} mottakere`}
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendCampaign}
            disabled={sending || (!testMode && getRecipientCount() === 0)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              sending || (!testMode && getRecipientCount() === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : dryRun
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : testMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {sending
              ? 'Sender...'
              : dryRun
              ? 'Kjør tørrkjøring'
              : testMode
              ? 'Send test-e-post'
              : `Send til ${getRecipientCount()} mottakere`}
          </button>
        </div>
      </div>

      {/* Send Result */}
      {sendResult && (
        <div
          className={`rounded-lg p-6 ${
            sendResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                sendResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {sendResult.success ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  sendResult.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {sendResult.success ? 'Suksess!' : 'Feil'}
              </h3>
              <p
                className={`text-sm mt-1 ${
                  sendResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {sendResult.message}
              </p>
              {sendResult.success && sendResult.sent !== undefined && (
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Sendt: <span className="font-medium">{sendResult.sent}</span>
                  </p>
                  {sendResult.failed !== undefined && sendResult.failed > 0 && (
                    <p>
                      Feilet: <span className="font-medium">{sendResult.failed}</span>
                    </p>
                  )}
                </div>
              )}
              {sendResult.errors && sendResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-900">Feilmeldinger:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                    {sendResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Start alltid med test-modus for å se hvordan e-posten ser ut</li>
              <li>Bruk tørrkjøring for å se hvem som vil motta e-posten uten å faktisk sende</li>
              <li>Du har {100 - getRecipientCount()} e-poster igjen på Resend Free tier (100/dag)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
