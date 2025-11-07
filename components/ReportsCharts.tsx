'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendData {
  date: string
  executions: number
}

interface CategoryData {
  category: string
  count: number
}

interface ReportsChartsProps {
  trendData: TrendData[]
  categoryData: CategoryData[]
}

const COLORS = ['#14b8a6', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b']

export default function ReportsCharts({ trendData, categoryData }: ReportsChartsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* Execution Trend */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Execution Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="executions" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ fill: '#14b8a6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Executions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.category} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
