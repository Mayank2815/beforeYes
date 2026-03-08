'use client'
import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarChartProps {
  data: { subject: string; score: number; fullMark: number }[]
}

export function RadarChartComponent({ data }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius={100}>
        <PolarGrid stroke="#EDE8E2" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#8A7F76' }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#B8955A"
          fill="#B8955A"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value: number) => [`${value}/100`, 'Score']}
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, border: '1px solid #EDE8E2' }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
