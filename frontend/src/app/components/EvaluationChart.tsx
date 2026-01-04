import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Document } from '../types/knowledge';

interface EvaluationChartProps {
  documents: Document[];
}

export function EvaluationChart({ documents }: EvaluationChartProps) {
  // 上位5件のナレッジ（評価順）
  const topDocuments = [...documents]
    .sort((a, b) => b.helpfulness_score - a.helpfulness_score)
    .slice(0, 5)
    .map((doc) => ({
      name: doc.title.length > 20 ? doc.title.substring(0, 20) + '...' : doc.title,
      score: doc.helpfulness_score,
      views: doc.view_count,
      helpful: doc.helpful_count,
    }));

  // 評価分布
  const scoreDistribution = [
    {
      name: '優秀 (4.5+)',
      value: documents.filter((d) => d.helpfulness_score >= 4.5).length,
      color: '#10b981',
    },
    {
      name: '良好 (4.0-4.4)',
      value: documents.filter((d) => d.helpfulness_score >= 4.0 && d.helpfulness_score < 4.5).length,
      color: '#3b82f6',
    },
    {
      name: '普通 (3.5-3.9)',
      value: documents.filter((d) => d.helpfulness_score >= 3.5 && d.helpfulness_score < 4.0).length,
      color: '#f59e0b',
    },
    {
      name: '要改善 (3.5未満)',
      value: documents.filter((d) => d.helpfulness_score < 3.5).length,
      color: '#ef4444',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>評価の高いナレッジ TOP5</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDocuments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#3b82f6" name="評価スコア" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>評価分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>閲覧数と評価数の比較</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDocuments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#10b981" name="閲覧数" />
              <Bar dataKey="helpful" fill="#f59e0b" name="評価数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
