'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatAxisValue } from '@/lib/chartHelpers'

interface Props {
  data: Record<string, string | number | null>[]
  unit: string
}

export default function RevenueChart({ data, unit }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={formatAxisValue} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={formatAxisValue} />
        <Tooltip formatter={(value, name) => [Number(value).toLocaleString() + unit, name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="売上高" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
        <Bar yAxisId="left" dataKey="営業利益" fill="#1e6db5" radius={[3, 3, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="当期純利益" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
