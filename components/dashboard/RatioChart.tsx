'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: Record<string, string | number | null>[]
}

export default function RatioChart({ data }: Props) {
  const fmt = (v: unknown) => {
    const n = Number(v)
    return isNaN(n) ? String(v) : n.toFixed(1) + '%'
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip formatter={(value, name) => [fmt(value), name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="ROE" stroke="#1e6db5" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="ROA" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="営業利益率" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="自己資本比率" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
