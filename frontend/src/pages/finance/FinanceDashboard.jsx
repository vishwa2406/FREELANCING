// import { useEffect, useState } from 'react'
// import { financeAPI } from '../../services/api'
// import { useToast } from '../../context/ToastContext'
// import Card, { StatCard } from '../../components/ui/Card'
// import ProgressBar from '../../components/ui/ProgressBar'
// import Badge from '../../components/ui/Badge'
// import { money, monthNow, shortDate } from '../../utils/finance'

// export default function FinanceDashboard() {
//   const { toast } = useToast()
//   const [month, setMonth] = useState(monthNow())
//   const [data, setData] = useState(null)

//   useEffect(() => {
//     let ignore = false
//     financeAPI.dashboard(month)
//       .then(({ data }) => {
//         if (!ignore) setData(data)
//       })
//       .catch((err) => {
//         if (!ignore) toast(err.response?.data?.message || 'Failed to load finance dashboard', 'error')
//       })
//     return () => { ignore = true }
//   }, [month, toast])

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <p className="text-sm text-brand-300 font-medium">Module B</p>
//           <h1 className="text-2xl md:text-3xl font-bold text-white">Finance Dashboard</h1>
//           <p className="text-surface-400 mt-1">Overview of transactions, budgets, saving goals and finance tips.</p>
//         </div>
//         <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-surface-900 border border-surface-700 rounded-xl px-3.5 py-2.5 text-surface-100" />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         <StatCard label="Income" value={money(data?.summary?.income)} color="success" />
//         <StatCard label="Expense" value={money(data?.summary?.expense)} color="danger" />
//         <StatCard label="Balance" value={money(data?.summary?.balance)} color="brand" />
//         <StatCard label="Active Goals" value={data?.goals?.length || 0} color="warning" />
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
//             <Badge variant="brand">Latest</Badge>
//           </div>
//           <div className="space-y-3">
//             {(data?.recentTransactions?.length ? data.recentTransactions : []).map((tx) => (
//               <div key={tx._id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-900/70 border border-surface-800">
//                 <div>
//                   <p className="text-sm font-medium text-white">{tx.category}</p>
//                   <p className="text-xs text-surface-400">{shortDate(tx.date)} · {tx.mode || 'Cash'}</p>
//                 </div>
//                 <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
//                   {tx.type === 'income' ? '+' : '-'} {money(tx.amount)}
//                 </p>
//               </div>
//             )) : (<p className="text-sm text-surface-500">No transactions added yet.</p>)}
//           </div>
//         </Card>

//         <Card>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-white">Budget Alerts</h2>
//             <Badge variant="warning">Monthly</Badge>
//           </div>
//           <div className="space-y-4">
//             {(data?.budgets?.length ? data.budgets : []).map((budget) => (
//               <div key={budget._id} className="space-y-2">
//                 <div className="flex items-center justify-between gap-4">
//                   <div>
//                     <p className="text-sm font-medium text-white">{budget.category}</p>
//                     <p className="text-xs text-surface-400">Spent {money(budget.spent)} of {money(budget.limitAmount)}</p>
//                   </div>
//                   <Badge variant={budget.alert === 'Safe' ? 'success' : 'warning'}>{budget.alert}</Badge>
//                 </div>
//                 <ProgressBar value={budget.percent} max={100} color={budget.percent >= 100 ? 'danger' : budget.percent >= budget.alertAtPercent ? 'warning' : 'success'} />
//               </div>
//             )) : (<p className="text-sm text-surface-500">No budgets created for this month.</p>)}
//           </div>
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <h2 className="text-lg font-semibold text-white mb-4">Saving Goals</h2>
//           <div className="space-y-4">
//             {(data?.goals?.length ? data.goals : []).map((goal) => (
//               <div key={goal._id} className="p-3 rounded-xl bg-surface-900/70 border border-surface-800">
//                 <div className="flex items-center justify-between gap-4 mb-2">
//                   <p className="text-sm font-medium text-white">{goal.title}</p>
//                   <span className="text-xs text-surface-300">{Number(goal.progress || 0).toFixed(0)}%</span>
//                 </div>
//                 <ProgressBar value={goal.progress} max={100} color={goal.status === 'completed' ? 'success' : 'brand'} />
//                 <p className="text-xs text-surface-400 mt-2">{money(goal.savedAmount)} / {money(goal.targetAmount)} · Target {shortDate(goal.targetDate)}</p>
//               </div>
//             )) : <p className="text-sm text-surface-500">No saving goals added yet.</p>}
//           </div>
//         </Card>

//         <Card>
//           <h2 className="text-lg font-semibold text-white mb-4">Finance Tips</h2>
//           <div className="space-y-3">
//             {(data?.tips?.length ? data.tips : []).map((tip) => (
//               <div key={tip._id} className="p-3 rounded-xl bg-surface-900/70 border border-surface-800">
//                 <p className="text-sm font-medium text-white">{tip.title}</p>
//                 <p className="text-sm text-surface-400 mt-1 leading-6">{tip.content}</p>
//               </div>
//             )) : <p className="text-sm text-surface-500">Finance tips can be added later by admin. The finance module is ready for user CRUD operations.</p>}
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }
import { useEffect, useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card, { StatCard } from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import { money, monthNow, shortDate } from '../../utils/finance'

export default function FinanceDashboard() {
  const { toast } = useToast()
  const [month, setMonth] = useState(monthNow())
  const [data, setData] = useState(null)

  useEffect(() => {
    let ignore = false
    financeAPI.dashboard(month)
      .then(({ data }) => {
        if (!ignore) setData(data)
      })
      .catch((err) => {
        if (!ignore) toast(err.response?.data?.message || 'Failed to load finance dashboard', 'error')
      })
    return () => { ignore = true }
  }, [month, toast])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-brand-300 font-medium">Module B</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Finance Dashboard</h1>
          <p className="text-surface-400 mt-1">Overview of transactions, budgets, saving goals and finance tips.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-surface-900 border border-surface-700 rounded-xl px-3.5 py-2.5 text-surface-100"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Income" value={money(data?.summary?.income)} color="success" />
        <StatCard label="Expense" value={money(data?.summary?.expense)} color="danger" />
        <StatCard label="Balance" value={money(data?.summary?.balance)} color="brand" />
        <StatCard label="Active Goals" value={data?.goals?.length || 0} color="warning" />
      </div>

      {/* Transactions & Budgets */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Badge variant="brand">Latest</Badge>
          </div>

          <div className="space-y-3">
            {data?.recentTransactions?.length > 0 ? (
              data.recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-900/70 border border-surface-800">
                  <div>
                    <p className="text-sm font-medium text-white">{tx.category}</p>
                    <p className="text-xs text-surface-400">{shortDate(tx.date)} · {tx.mode || 'Cash'}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} {money(tx.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No transactions added yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Budget Alerts</h2>
            <Badge variant="warning">Monthly</Badge>
          </div>

          <div className="space-y-4">
            {data?.budgets?.length > 0 ? (
              data.budgets.map((budget) => (
                <div key={budget._id} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{budget.category}</p>
                      <p className="text-xs text-surface-400">Spent {money(budget.spent)} of {money(budget.limitAmount)}</p>
                    </div>
                    <Badge variant={budget.alert === 'Safe' ? 'success' : 'warning'}>
                      {budget.alert}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={budget.percent}
                    max={100}
                    color={
                      budget.percent >= 100
                        ? 'danger'
                        : budget.percent >= budget.alertAtPercent
                        ? 'warning'
                        : 'success'
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No budgets created for this month.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Goals & Tips */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Saving Goals</h2>
          <div className="space-y-4">
            {data?.goals?.length > 0 ? (
              data.goals.map((goal) => (
                <div key={goal._id} className="p-3 rounded-xl bg-surface-900/70 border border-surface-800">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="text-sm font-medium text-white">{goal.title}</p>
                    <span className="text-xs text-surface-300">{Number(goal.progress || 0).toFixed(0)}%</span>
                  </div>
                  <ProgressBar
                    value={goal.progress}
                    max={100}
                    color={goal.status === 'completed' ? 'success' : 'brand'}
                  />
                  <p className="text-xs text-surface-400 mt-2">
                    {money(goal.savedAmount)} / {money(goal.targetAmount)} · Target {shortDate(goal.targetDate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No saving goals added yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Finance Tips</h2>
          <div className="space-y-3">
            {data?.tips?.length > 0 ? (
              data.tips.map((tip) => (
                <div key={tip._id} className="p-3 rounded-xl bg-surface-900/70 border border-surface-800">
                  <p className="text-sm font-medium text-white">{tip.title}</p>
                  <p className="text-sm text-surface-400 mt-1 leading-6">{tip.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">
                Finance tips can be added later by admin. The finance module is ready for user CRUD operations.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}