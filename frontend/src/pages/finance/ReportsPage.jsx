import { useMemo, useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { money, monthNow } from '../../utils/finance'

export default function ReportsPage() {
  const { toast } = useToast()
  const [month, setMonth] = useState(monthNow())
  const [transactions, setTransactions] = useState([])

  const loadData = async () => {
    try {
      const from = `${month}-01`
      const lastDay = new Date(`${month}-01`)
      lastDay.setMonth(lastDay.getMonth() + 1)
      lastDay.setDate(0)
      const to = lastDay.toISOString().slice(0, 10)
      const { data } = await financeAPI.transactions({ from, to })
      setTransactions(data.transactions || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load reports', 'error')
    }
  }

  const stats = useMemo(() => ({
    income: transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    expense: transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
  }), [transactions])

  const byCategory = useMemo(() => {
    const map = {}
    transactions.filter((tx) => tx.type === 'expense').forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + Number(tx.amount || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [transactions])

  const openBlob = async (request, fileName) => {
    try {
      const response = await request()
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast(err.response?.data?.message || 'Download failed', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-brand-300 font-medium">Module B</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Reports</h1>
          <p className="text-surface-400 mt-1">View monthly totals and download CSV or PDF from the finance module.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button onClick={loadData}>Load Report</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Income</p><p className="text-2xl font-bold text-success-400 mt-2">{money(stats.income)}</p></Card>
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Expense</p><p className="text-2xl font-bold text-danger-400 mt-2">{money(stats.expense)}</p></Card>
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Balance</p><p className="text-2xl font-bold text-brand-400 mt-2">{money(stats.income - stats.expense)}</p></Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Expense by Category</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => openBlob(() => financeAPI.exportCsv(), 'transactions.csv')}>Export CSV</Button>
            <Button onClick={() => openBlob(() => financeAPI.exportPdf(month), `${month}-report.pdf`)}>Download PDF</Button>
          </div>
        </div>
        <div className="space-y-3">
          {byCategory.length ? byCategory.map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/70 border border-surface-800">
              <p className="text-sm text-white">{category}</p>
              <p className="text-sm text-surface-300">{money(amount)}</p>
            </div>
          )) : <p className="text-surface-500">Load a month to view category breakdown.</p>}
        </div>
      </Card>
    </div>
  )
}
