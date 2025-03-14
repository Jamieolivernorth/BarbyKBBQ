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
import AdminBookings from "@/pages/admin/bookings";

function RequireAuth({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const [, setLocation] = useLocation();

  // Check if user is authenticated and has admin rights if required
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  React.useEffect(() => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    if (requireAdmin && !user.isAdmin) {
      setLocation("/booking"); // Redirect non-admin users to regular booking page
    }
  }, [user, setLocation, requireAdmin]);

  if (!user || (requireAdmin && !user.isAdmin)) {
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
      <Route path="/admin/bookings">
        <RequireAuth requireAdmin={true}>
          <AdminBookings />
        </RequireAuth>
      </Route>
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