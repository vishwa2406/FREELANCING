import { useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { money } from '../../utils/finance'

export default function CalculatorsPage() {
  const { toast } = useToast()
  const [emi, setEmi] = useState({ principal: 500000, annualRate: 10, months: 60 })
  const [sip, setSip] = useState({ monthlyInvestment: 5000, annualRate: 12, years: 5 })
  const [inflation, setInflation] = useState({ currentAmount: 100000, annualRate: 6, years: 10 })
  const [results, setResults] = useState({})

  const run = async (kind, params) => {
    try {
      const { data } = await financeAPI.calculator({ kind, ...params })
      setResults((prev) => ({ ...prev, [kind]: data.result }))
    } catch (err) {
      toast(err.response?.data?.message || 'Calculation failed', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-brand-300 font-medium">Module B</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Calculators</h1>
        <p className="text-surface-400 mt-1">Use quick EMI, SIP and Inflation tools inside the finance module.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">EMI Calculator</h2>
          <div className="space-y-4">
            <Input label="Principal" type="number" value={emi.principal} onChange={(e) => setEmi({ ...emi, principal: e.target.value })} />
            <Input label="Annual Rate (%)" type="number" value={emi.annualRate} onChange={(e) => setEmi({ ...emi, annualRate: e.target.value })} />
            <Input label="Months" type="number" value={emi.months} onChange={(e) => setEmi({ ...emi, months: e.target.value })} />
            <Button onClick={() => run('emi', emi)}>Calculate EMI</Button>
            {results.emi && <div className="text-sm text-surface-300 space-y-1"><p>EMI: {money(results.emi.emi)}</p><p>Total Payable: {money(results.emi.totalPayable)}</p><p>Total Interest: {money(results.emi.totalInterest)}</p></div>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">SIP Calculator</h2>
          <div className="space-y-4">
            <Input label="Monthly Investment" type="number" value={sip.monthlyInvestment} onChange={(e) => setSip({ ...sip, monthlyInvestment: e.target.value })} />
            <Input label="Annual Rate (%)" type="number" value={sip.annualRate} onChange={(e) => setSip({ ...sip, annualRate: e.target.value })} />
            <Input label="Years" type="number" value={sip.years} onChange={(e) => setSip({ ...sip, years: e.target.value })} />
            <Button onClick={() => run('sip', sip)}>Calculate SIP</Button>
            {results.sip && <div className="text-sm text-surface-300 space-y-1"><p>Invested: {money(results.sip.investedAmount)}</p><p>Returns: {money(results.sip.estimatedReturns)}</p><p>Maturity: {money(results.sip.maturityValue)}</p></div>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Inflation Calculator</h2>
          <div className="space-y-4">
            <Input label="Current Amount" type="number" value={inflation.currentAmount} onChange={(e) => setInflation({ ...inflation, currentAmount: e.target.value })} />
            <Input label="Annual Inflation (%)" type="number" value={inflation.annualRate} onChange={(e) => setInflation({ ...inflation, annualRate: e.target.value })} />
            <Input label="Years" type="number" value={inflation.years} onChange={(e) => setInflation({ ...inflation, years: e.target.value })} />
            <Button onClick={() => run('inflation', inflation)}>Calculate Inflation</Button>
            {results.inflation && <div className="text-sm text-surface-300 space-y-1"><p>Future Cost: {money(results.inflation.futureCost)}</p><p>Present Buying Power: {money(results.inflation.presentPower)}</p></div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
