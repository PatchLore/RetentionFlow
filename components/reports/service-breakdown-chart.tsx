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
import { ServiceBreakdownData } from "@/lib/analytics-utils";

interface ServiceBreakdownChartProps {
  data: ServiceBreakdownData[];
}

export function ServiceBreakdownChart({
  data,
}: ServiceBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Breakdown</CardTitle>
          <CardDescription>
            Client distribution and average cycle length by service type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Breakdown</CardTitle>
        <CardDescription>
          Client distribution and average cycle length by service type
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
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="service_type"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
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
              dataKey="count"
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

