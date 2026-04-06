import { useEffect, useState } from 'react'
import { financeAdminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card, { StatCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { money, shortDate } from '../../utils/finance'

export default function FinanceAdminDashboard() {
  const { toast } = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    financeAdminAPI.overview()
      .then(({ data }) => setData(data))
      .catch((err) => toast(err.response?.data?.message || 'Failed to load finance admin dashboard', 'error'))
  }, [toast])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-brand-300 font-medium">Module B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Finance Admin Dashboard</h1>
        <p className="text-surface-400 mt-1">Separate admin panel for the Finance module.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Finance Users" value={data?.summary?.users || 0} color="brand" />
        <StatCard label="Transactions" value={data?.summary?.transactions || 0} color="success" />
        <StatCard label="Budgets" value={data?.summary?.budgets || 0} color="warning" />
        <StatCard label="Saving Goals" value={data?.summary?.goals || 0} color="danger" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income" value={money(data?.summary?.totalIncome)} color="success" />
        <StatCard label="Total Expense" value={money(data?.summary?.totalExpense)} color="danger" />
        <StatCard label="Balance" value={money(data?.summary?.balance)} color="brand" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Badge variant="brand">All Users</Badge>
          </div>
          <div className="space-y-3">
            {data?.recentTransactions?.length > 0 ? (
              data.recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-900/70 border border-surface-800">
                  <div>
                    <p className="text-sm font-medium text-white">{tx.category}</p>
                    <p className="text-xs text-surface-400">{tx.user?.name || 'User'} · {shortDate(tx.date)}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} {money(tx.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No transactions available.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Finance Tips Overview</h2>
            <Badge variant="warning">Admin</Badge>
          </div>
          <div className="space-y-3">
            {data?.tips?.length > 0 ? (
              data.tips.slice(0, 5).map((tip) => (
                <div key={tip._id} className="p-3 rounded-xl bg-surface-900/70 border border-surface-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{tip.title}</p>
                    <Badge variant={tip.active ? 'success' : 'danger'}>{tip.active ? 'Active' : 'Hidden'}</Badge>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{tip.tag || 'general'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No tips added yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
