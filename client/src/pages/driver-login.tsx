import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function DriverLogin() {
  const [driverCode, setDriverCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/driver/login", { driverCode: code });
      return response.json();
    },
    onSuccess: () => {
      // Store driver access in localStorage
      localStorage.setItem('driverAccess', 'true');
      toast({
        title: "Access Granted",
        description: "Welcome to the driver dashboard",
      });
      setLocation("/driver");
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid driver code. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverCode.trim()) {
      loginMutation.mutate(driverCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="/assets/1.png" 
              alt="Barby & Ken Logo" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <CardTitle className="text-2xl">Driver Access</CardTitle>
          <CardDescription>
            Enter your driver code to access the delivery dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverCode">Driver Code</Label>
              <Input
                id="driverCode"
                type="password"
                placeholder="Enter your driver code"
                value={driverCode}
                onChange={(e) => setDriverCode(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#C8913B] hover:bg-[#b17d33]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Driver Access Only:</strong> This portal is restricted to authorized delivery drivers. 
              Contact your supervisor if you need a driver code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}