import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Link href="/admin/bookings">
              <Button variant="default" className="w-full text-left">
                Manage Bookings
              </Button>
            </Link>
            {/* Add more admin features here as needed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
