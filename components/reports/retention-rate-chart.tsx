"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { RetentionRateData } from "@/lib/analytics-utils";

interface RetentionRateChartProps {
  data: RetentionRateData;
}

const COLORS = ["#10b981", "#ef4444"];

export function RetentionRateChart({ data }: RetentionRateChartProps) {
  const chartData = [
    { name: "Returning Clients", value: data.returningClients },
    { name: "Not Returning", value: data.totalClients - data.returningClients },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Retention Rate</CardTitle>
        <CardDescription>
          Percentage of clients returning within expected cycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {data.retentionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {data.returningClients} of {data.totalClients} clients
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

