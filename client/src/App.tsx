import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import AdminBookings from "@/pages/admin/bookings"; // Assuming this component exists

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  // Check if user is authenticated by making a request
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  React.useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/booking">
        <RequireAuth>
          <Booking />
        </RequireAuth>
      </Route>
      <Route path="/profile">
        <RequireAuth>
          <Profile />
        </RequireAuth>
      </Route>
      <Route path="/admin/bookings"> {/* Added admin route */}
        <RequireAuth>
          <AdminBookings />
        </RequireAuth>
      </Route> {/* Added admin route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;