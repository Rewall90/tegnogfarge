interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

/**
 * MetricCard - Reusable card component for displaying metrics
 * Used in dashboard overview section
 */
export function MetricCard({ title, value, icon, subtitle, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          {subtitle && <div className="h-3 bg-gray-200 rounded w-1/3"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="flex-shrink-0 text-blue-600">{icon}</div>}
      </div>
    </div>
  );
}
