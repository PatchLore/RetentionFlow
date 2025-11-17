"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StylistPerformanceData } from "@/lib/analytics-utils";

interface StylistPerformanceChartProps {
  data: StylistPerformanceData[];
}

export function StylistPerformanceChart({
  data,
}: StylistPerformanceChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stylist Performance</CardTitle>
          <CardDescription>
            Client count and average cycle length by stylist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            No stylist data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stylist Performance</CardTitle>
        <CardDescription>
          Client count and average cycle length by stylist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stylist" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="clientCount"
              fill="#8884d8"
              name="Client Count"
            />
            <Bar
              yAxisId="right"
              dataKey="averageCycleDays"
              fill="#82ca9d"
              name="Avg Cycle (Days)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

