"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MissedFollowup } from "@/lib/analytics-utils";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface MissedFollowupsTableProps {
  data: MissedFollowup[];
}

export function MissedFollowupsTable({ data }: MissedFollowupsTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Missed Follow-ups</CardTitle>
          <CardDescription>
            Clients past due date without completed follow-up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No missed follow-ups. Great job!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missed Follow-ups</CardTitle>
        <CardDescription>
          Clients past due date without completed follow-up ({data.length}{" "}
          total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Stylist</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((followup) => (
                <TableRow key={followup.client_id}>
                  <TableCell className="font-medium">
                    {followup.client_name}
                  </TableCell>
                  <TableCell>{followup.service_type}</TableCell>
                  <TableCell>{followup.stylist || "N/A"}</TableCell>
                  <TableCell>
                    {format(new Date(followup.next_due), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        followup.daysOverdue > 30
                          ? "text-destructive font-semibold"
                          : followup.daysOverdue > 14
                          ? "text-orange-600 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {followup.daysOverdue} days
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

