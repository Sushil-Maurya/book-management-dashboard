"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react"

const exportFormSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  format: z.enum(["PDF", "Excel", "CSV"], {
    required_error: "Format is required",
  }),
  dateRange: z.string().min(1, "Date range is required"),
})

type ExportFormValues = z.infer<typeof exportFormSchema>

interface ReportData {
  id: string
  title: string
  type: "PDF" | "Excel" | "CSV"
  generatedDate: string
  status: "Ready" | "Generating" | "Failed"
}

const mockReports: ReportData[] = [
  {
    id: "1",
    title: "Monthly Borrowing Report",
    type: "PDF",
    generatedDate: "2024-01-15",
    status: "Ready",
  },
  {
    id: "2",
    title: "Member Activity Analysis",
    type: "Excel",
    generatedDate: "2024-01-14",
    status: "Ready",
  },
  {
    id: "3",
    title: "Book Inventory Summary",
    type: "CSV",
    generatedDate: "2024-01-13",
    status: "Ready",
  },
]

export function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>(mockReports)
  const [showExportModal, setShowExportModal] = useState(false)

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      reportType: "",
      format: "PDF",
      dateRange: "",
    },
  })

  const onSubmit = (values: ExportFormValues) => {
    const newReport: ReportData = {
      id: Date.now().toString(),
      title: getReportTitle(values.reportType),
      type: values.format,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "Generating",
    }

    setReports([newReport, ...reports])
    setShowExportModal(false)
    form.reset()

    // Simulate report generation
    setTimeout(() => {
      setReports((prev) => prev.map((r) => (r.id === newReport.id ? { ...r, status: "Ready" as const } : r)))
    }, 3000)
  }

  const getReportTitle = (type: string) => {
    switch (type) {
      case "borrowing":
        return "Borrowing Activity Report"
      case "members":
        return "Member Analytics Report"
      case "inventory":
        return "Book Inventory Report"
      case "overdue":
        return "Overdue Books Report"
      default:
        return "Library Report"
    }
  }

  const handleDownloadReport = (report: ReportData) => {
    // Simulate file download
    const link = document.createElement("a")
    link.href = "#"
    link.download = `${report.title.replace(/\s+/g, "_")}.${report.type.toLowerCase()}`
    link.click()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track library performance and generate insights</p>
        </div>
        <Button onClick={() => setShowExportModal(true)}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Genre</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Fiction</div>
            <p className="text-xs text-muted-foreground">42% of all borrows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18%</div>
            <p className="text-xs text-muted-foreground">Compared to last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Borrow Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Per book borrowed</p>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and download your generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Title</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Generated Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.generatedDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "Ready"
                          ? "default"
                          : report.status === "Generating"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report)}
                      disabled={report.status !== "Ready"}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Report Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export New Report</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="borrowing">Borrowing Activity</SelectItem>
                        <SelectItem value="members">Member Analytics</SelectItem>
                        <SelectItem value="inventory">Book Inventory</SelectItem>
                        <SelectItem value="overdue">Overdue Books</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowExportModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Report</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
