'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LeadSubmission {
  _id: string;
  email: string;
  campaignId: string;
  isVerified: boolean;
  submittedAt: string;
  verifiedAt: string | null;
  unsubscribedAt: string | null;
  metadata: {
    campaignName?: string;
    trigger?: string | { event: string; threshold?: number };
    downloadCount?: number;
    userAgent?: string;
  };
}

interface Stats {
  total: number;
  verified: number;
  pending: number;
  unsubscribed: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LeadsPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const router = useRouter();

  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0, unsubscribed: 0 });
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [campaigns, setCampaigns] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch campaigns list for filter
  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/lead-campaigns');
      if (response.ok) {
        const data = await response.json();
        const uniqueCampaigns = Array.from(new Set(data.map((c: any) => c.campaignId)));
        setCampaigns(uniqueCampaigns as string[]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Fetch leads
  const fetchLeads = async (page = 1, status = filterStatus, campaign = filterCampaign, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(status !== 'all' && { status }),
        ...(campaign !== 'all' && { campaignId: campaign }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/lead-campaigns/submissions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLeads(data.submissions || []);
        setStats(data.stats || { total: 0, verified: 0, pending: 0, unsubscribed: 0 });
        setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCampaigns();
      fetchLeads();
    }
  }, [status, filterStatus, filterCampaign, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  // Handle delete
  const handleDelete = async (email: string, campaignId: string) => {
    if (!confirm(`Er du sikker på at du vil slette denne registreringen: ${email} for kampanje ${campaignId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/lead-campaigns/submissions?email=${encodeURIComponent(email)}&campaignId=${encodeURIComponent(campaignId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Registrering slettet');
        fetchLeads(pagination.page);
      } else {
        alert('Feil ved sletting av registrering');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Feil ved sletting av registrering');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvHeaders = ['Email', 'Kampanje', 'Status', 'Registrert', 'Verifisert', 'Avmeldt', 'Nedlastinger', 'Trigger'];
    const csvRows = leads.map(lead => [
      lead.email,
      lead.metadata.campaignName || lead.campaignId,
      lead.unsubscribedAt ? 'Unsubscribed' : lead.isVerified ? 'Verified' : 'Pending',
      new Date(lead.submittedAt).toLocaleDateString('no-NO'),
      lead.verifiedAt ? new Date(lead.verifiedAt).toLocaleDateString('no-NO') : '-',
      lead.unsubscribedAt ? new Date(lead.unsubscribedAt).toLocaleDateString('no-NO') : '-',
      lead.metadata.downloadCount || '0',
      lead.metadata.trigger
        ? (typeof lead.metadata.trigger === 'string' ? lead.metadata.trigger : lead.metadata.trigger.event)
        : '-',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lead-submissions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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

  // Get status badge
  const getStatusBadge = (lead: LeadSubmission) => {
    if (lead.unsubscribedAt) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">Avmeldt</span>;
    }
    if (lead.isVerified) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verifisert</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Venter</span>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster registreringer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead-kampanje registreringer</h1>
          <p className="text-sm text-gray-600 mt-1">Administrer alle e-postregistreringer fra lead-kampanjer</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Eksporter CSV
        </button>
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

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle</option>
              <option value="verified">Verifiserte</option>
              <option value="pending">Venter</option>
              <option value="unsubscribed">Avmeldte</option>
            </select>
          </div>

          {/* Campaign Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kampanje</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle kampanjer</option>
              {campaigns.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Søk etter e-post</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Skriv inn e-postadresse..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-end"
            >
              Søk
            </button>
          </form>

          {/* Clear Search */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchInput('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors self-end"
            >
              Nullstill
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-postadresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kampanje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verifisert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nedlastinger
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Ingen registreringer funnet
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.metadata.campaignName || lead.campaignId}</div>
                      {lead.metadata.trigger && (
                        <div className="text-xs text-gray-500">
                          Trigger: {typeof lead.metadata.trigger === 'string'
                            ? lead.metadata.trigger
                            : lead.metadata.trigger.event}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lead)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.verifiedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.metadata.downloadCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(lead.email, lead.campaignId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Slett
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Viser side <span className="font-medium">{pagination.page}</span> av{' '}
              <span className="font-medium">{pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLeads(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forrige
              </button>
              <button
                onClick={() => fetchLeads(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Neste
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
