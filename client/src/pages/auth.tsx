import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

type AuthMode = "login" | "register";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(
      mode === "register"
        ? insertUserSchema
        : insertUserSchema.pick({ username: true, password: true })
    ),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await apiRequest("POST", `/api/${mode}`, data);
      const user = await response.json();

      // Update auth state in query client
      queryClient.setQueryData(["/api/user"], user);

      toast({
        title: mode === "register" ? "Registration successful" : "Login successful",
        description: "Welcome to Barby and Ken!",
      });

      // Redirect to booking page
      setLocation("/booking");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>
            {mode === "register" ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {mode === "register"
              ? "Sign up to book your BBQ experience"
              : "Log in to continue your BBQ journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === "register" && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {mode === "register" ? "Sign Up" : "Log In"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    setMode(mode === "register" ? "login" : "register")
                  }
                >
                  {mode === "register"
                    ? "Already have an account? Log in"
                    : "Need an account? Sign up"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}