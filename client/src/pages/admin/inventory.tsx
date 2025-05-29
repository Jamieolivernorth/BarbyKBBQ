import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BBQEquipment, BBQStatus } from "@shared/schema";
import { format } from "date-fns";

const statusColors = {
  available: "bg-green-100 text-green-800",
  in_use: "bg-blue-100 text-blue-800",
  cleaning: "bg-yellow-100 text-yellow-800",
  maintenance: "bg-red-100 text-red-800",
  transit_delivery: "bg-purple-100 text-purple-800",
  transit_pickup: "bg-orange-100 text-orange-800"
};

const statusLabels = {
  available: "Available",
  in_use: "In Use",
  cleaning: "Being Cleaned",
  maintenance: "Under Maintenance",
  transit_delivery: "Out for Delivery",
  transit_pickup: "Being Picked Up"
};

export default function BBQInventoryAdmin() {
  const [selectedBBQ, setSelectedBBQ] = useState<BBQEquipment | null>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<BBQStatus>("available");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bbqEquipment, isLoading } = useQuery<BBQEquipment[]>({
    queryKey: ["/api/admin/bbq-equipment"],
  });

  const updateBBQMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BBQEquipment> }) => {
      const response = await apiRequest("PATCH", `/api/admin/bbq-equipment/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bbq-equipment"] });
      toast({
        title: "BBQ Updated",
        description: "BBQ equipment status has been updated successfully",
      });
      setSelectedBBQ(null);
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update BBQ equipment",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (bbq: BBQEquipment) => {
    setSelectedBBQ(bbq);
    setNewStatus(bbq.status as BBQStatus);
    setNotes(bbq.notes || "");
  };

  const submitUpdate = () => {
    if (!selectedBBQ) return;

    const updateData: Partial<BBQEquipment> = {
      status: newStatus,
      notes: notes,
    };

    // Update cleaning timestamp if changing to available from cleaning
    if (newStatus === "available" && selectedBBQ.status === "cleaning") {
      updateData.lastCleaned = new Date();
    }

    updateBBQMutation.mutate({
      id: selectedBBQ.id,
      data: updateData
    });
  };

  const getStatusIcon = (status: BBQStatus) => {
    switch (status) {
      case "available":
        return "✅";
      case "in_use":
        return "🔥";
      case "cleaning":
        return "🧽";
      case "maintenance":
        return "🔧";
      case "transit_delivery":
        return "🚚";
      case "transit_pickup":
        return "📦";
      default:
        return "❓";
    }
  };

  const getDaysAgo = (date: Date | null) => {
    if (!date) return "Never";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const availableCount = bbqEquipment?.filter(bbq => bbq.status === "available").length || 0;
  const inUseCount = bbqEquipment?.filter(bbq => bbq.status === "in_use").length || 0;
  const cleaningCount = bbqEquipment?.filter(bbq => bbq.status === "cleaning").length || 0;
  const maintenanceCount = bbqEquipment?.filter(bbq => bbq.status === "maintenance").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">BBQ Equipment Inventory</h1>
          <p className="text-gray-600">Manage and track BBQ equipment status in real-time</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-800">{availableCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-800">{inUseCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-700">Cleaning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-800">{cleaningCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-800">{maintenanceCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      <div className="grid gap-4">
        {bbqEquipment?.map((bbq) => (
          <Card key={bbq.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getStatusIcon(bbq.status as BBQStatus)}</span>
                    {bbq.name}
                  </CardTitle>
                  <CardDescription>{bbq.model}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[bbq.status as BBQStatus]}>
                    {statusLabels[bbq.status as BBQStatus]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(bbq)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Last Cleaned</p>
                  <p className="text-gray-600">{getDaysAgo(bbq.lastCleaned)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Last Maintenance</p>
                  <p className="text-gray-600">{getDaysAgo(bbq.lastMaintenance)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Current Booking</p>
                  <p className="text-gray-600">
                    {bbq.currentBookingId ? `#${bbq.currentBookingId}` : "None"}
                  </p>
                </div>
              </div>
              {bbq.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{bbq.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Modal */}
      {selectedBBQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update {selectedBBQ.name}</CardTitle>
              <CardDescription>Change status and add notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={(value: BBQStatus) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="cleaning">Being Cleaned</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="transit_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="transit_pickup">Being Picked Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the equipment condition..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={submitUpdate}
                  disabled={updateBBQMutation.isPending}
                  className="flex-1"
                >
                  {updateBBQMutation.isPending ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBBQ(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}