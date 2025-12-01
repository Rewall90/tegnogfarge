'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EmailStats {
  campaignId: string;
  summary: {
    totalSent: number;
    uniqueOpens: number;
    totalOpens: number;
    uniqueClicks: number;
    totalClicks: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
  };
  recipients: Array<{
    email: string;
    emailsSent: number;
    lastSentAt: string | null;
    isTestRecipient: boolean;
    opened: boolean;
    openCount: number;
    lastOpenedAt: string | null;
    clicked: boolean;
    clickCount: number;
    lastClickedAt: string | null;
    clickedLinks: Array<{
      url: string;
      clickedAt: string;
    }>;
  }>;
}

export default function EmailStatsPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const router = useRouter();

  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState('third-download-gate'); // Default campaign
  const [filterStatus, setFilterStatus] = useState<'all' | 'opened' | 'clicked' | 'unopened'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

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
        if (campaignIds.length > 0 && !campaignIds.includes(campaignId)) {
          setCampaignId(campaignIds[0]);
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
      const response = await fetch(`/api/admin/email-stats?campaignId=${campaignId}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error fetching stats:', data.error);
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
    if (status === 'authenticated' && campaignId) {
      fetchStats();
    }
  }, [status, campaignId]);

  // Filter recipients
  const filteredRecipients = stats?.recipients.filter((recipient) => {
    // Filter by status
    if (filterStatus === 'opened' && !recipient.opened) return false;
    if (filterStatus === 'clicked' && !recipient.clicked) return false;
    if (filterStatus === 'unopened' && recipient.opened) return false;

    // Filter by search
    if (searchQuery && !recipient.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  }) || [];

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Delete lead
  const handleDelete = async (email: string) => {
    if (!confirm(`Er du sikker på at du vil slette ${email}? Dette vil fjerne all sporingsdata og kan ikke angres.`)) {
      return;
    }

    setDeletingEmail(email);
    try {
      const response = await fetch(`/api/admin/delete-lead?email=${encodeURIComponent(email)}&campaignId=${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh stats after deletion
        await fetchStats();
      } else {
        const data = await response.json();
        alert(`Feil ved sletting: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Kunne ikke slette. Prøv igjen.');
    } finally {
      setDeletingEmail(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster statistikk...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Kunne ikke laste statistikk</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-poststatistikk</h1>
        <p className="text-sm text-gray-600 mt-1">
          Se hvem som har åpnet og klikket i e-postene dine
        </p>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Velg kampanje
        </label>
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {campaigns.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">E-poster sendt</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.summary.totalSent}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Åpnet</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.summary.uniqueOpens}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.summary.openRate}% åpningsrate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Klikket</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.summary.uniqueClicks}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.summary.clickRate}% klikkrate</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total åpninger</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.summary.totalOpens}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.summary.totalClicks} totale klikk</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer etter status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle ({stats.recipients.length})</option>
              <option value="opened">Åpnet ({stats.recipients.filter(r => r.opened).length})</option>
              <option value="clicked">Klikket ({stats.recipients.filter(r => r.clicked).length})</option>
              <option value="unopened">Ikke åpnet ({stats.recipients.filter(r => !r.opened).length})</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Søk etter e-post</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Skriv inn e-postadresse..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Recipients Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-postadresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sendt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åpnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klikket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klikkede lenker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Ingen mottakere funnet
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((recipient) => (
                  <tr key={recipient.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{recipient.email}</div>
                        {recipient.isTestRecipient && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            TEST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{recipient.emailsSent}x</div>
                      <div className="text-xs text-gray-400">{formatDate(recipient.lastSentAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {recipient.opened ? (
                        <div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {recipient.openCount}x åpnet
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(recipient.lastOpenedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                          Ikke åpnet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {recipient.clicked ? (
                        <div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {recipient.clickCount}x klikk
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(recipient.lastClickedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                          Ingen klikk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {recipient.clickedLinks.length > 0 ? (
                        <div className="space-y-1">
                          {recipient.clickedLinks.map((link, idx) => (
                            <div key={idx} className="text-xs">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate block max-w-xs"
                              >
                                {link.url}
                              </a>
                              <span className="text-gray-400">{formatDate(link.clickedAt)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(recipient.email)}
                        disabled={deletingEmail === recipient.email}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Slett mottaker"
                      >
                        {deletingEmail === recipient.email ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            <p className="font-medium mb-1">Om statistikken:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Åpninger spores via en usynlig piksel i e-posten</li>
              <li>Klikk spores via en omdirigeringslenke</li>
              <li>Noen e-postklienter blokkerer bilder, så åpningsraten kan være lavere enn faktisk</li>
              <li>Statistikk oppdateres i sanntid når brukere åpner og klikker</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
