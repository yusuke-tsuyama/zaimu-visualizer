'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { formatAxisValue } from '@/lib/chartHelpers'

interface Props {
  data: Record<string, string | number | null>[]
  unit: string
}

export default function CfChart({ data, unit }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={formatAxisValue} />
        <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1} />
        <Tooltip formatter={(value, name) => [Number(value).toLocaleString() + unit, name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="営業CF" fill="#34d399" radius={[3, 3, 0, 0]} />
        <Bar dataKey="投資CF" fill="#f87171" radius={[3, 3, 0, 0]} />
        <Bar dataKey="財務CF" fill="#a78bfa" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="フリーCF" stroke="#0369a1" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
