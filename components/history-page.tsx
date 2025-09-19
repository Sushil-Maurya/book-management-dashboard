"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Filter, History, BookOpen, User, Calendar } from "lucide-react"
import { historyApi } from "@/lib/historyApi"
import type { ActivityRecord } from "@/lib/types"

const filterFormSchema = z.object({
  type: z.string(),
  status: z.string(),
  dateRange: z.string(),
  user: z.string().optional(),
})

type FilterFormValues = z.infer<typeof filterFormSchema>

export function HistoryPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityRecord[]>([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      type: "all",
      status: "all",
      dateRange: "all",
      user: "",
    },
  })

  const onSubmit = (values: FilterFormValues) => {
    let filtered = activities

    if (values.type !== "all") {
      filtered = filtered.filter((activity) => activity.type === values.type)
    }

    if (values.status !== "all") {
      filtered = filtered.filter((activity) => activity.status === values.status)
    }

    if (values.user) {
      filtered = filtered.filter((activity) => activity.user.toLowerCase().includes(values.user!.toLowerCase()))
    }

    if (values.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (values.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((activity) => new Date(activity.timestamp) >= filterDate)
    }

    setFilteredActivities(filtered)
    setShowFilterModal(false)
  }

  const resetFilters = () => {
    form.reset({
      type: "all",
      status: "all",
      dateRange: "all",
      user: "",
    })
    setFilteredActivities(activities)
    setShowFilterModal(false)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const list = await historyApi.list()
        setActivities(list)
        setFilteredActivities(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Dynamic stats derived from activities
  const totalActivities = activities.length
  const totalBorrowed = activities.filter((a) => a.type === "Borrow").length
  const totalMemberActions = activities.filter((a) => a.type === "Register").length
  const todayCount = activities.filter((a) => {
    const d = new Date(a.timestamp)
    const now = new Date()
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  }).length

  const getActivityColor = (type: string) => {
    switch (type) {
      case "Borrow":
        return "default"
      case "Return":
        return "secondary"
      case "Register":
        return "outline"
      case "Update":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "default"
      case "Pending":
        return "secondary"
      case "Failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Activity History</h1>
          <p className="text-muted-foreground">Track all library transactions and activities</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilterModal(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filter History
        </Button>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBorrowed}</div>
            <p className="text-xs text-muted-foreground">Borrow events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Actions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemberActions}</div>
            <p className="text-xs text-muted-foreground">Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activity Timeline
            {filteredActivities.length !== activities.length && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredActivities.length} of {activities.length} activities)
              </span>
            )}
          </CardTitle>
          <CardDescription>Recent library activities and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant={getActivityColor(activity.type) as any}>{activity.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  {/* Avoid locale/timezone differences between SSR and client */}
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(activity.status) as any}>{activity.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Activity History</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Borrow">Borrow</SelectItem>
                        <SelectItem value="Return">Return</SelectItem>
                        <SelectItem value="Register">Register</SelectItem>
                        <SelectItem value="Update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Success">Success</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
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
                    <FormLabel>Date Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <FormControl>
                      <Input placeholder="Search by user name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowFilterModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Apply Filters</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
