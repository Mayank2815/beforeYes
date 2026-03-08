'use client'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { scoreToColor } from '@/lib/utils'

interface BarChartProps {
  data: { name: string; score: number }[]
}

export function BarChartComponent({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsBar data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E2" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#8A7F76' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#8A7F76' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value}/100`, 'Score']}
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, border: '1px solid #EDE8E2' }}
        />
        <Bar dataKey="score" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={scoreToColor(entry.score)} />
          ))}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  )
}
