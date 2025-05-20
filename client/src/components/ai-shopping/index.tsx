import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIRecommendations } from "./ai-recommendations";
import { AIAssistant } from "./ai-assistant";
import { BookingAnalyzer } from "./booking-analyzer";
import { CustomMenuGenerator } from "./custom-menu-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AIShoppingProps {
  bookingData?: any;
  onSelectPackage?: (packageName: string) => void;
  onApplySuggestion?: (suggestion: any) => void;
}

export function AIShopping({ bookingData, onSelectPackage, onApplySuggestion }: AIShoppingProps) {
  const [activeTab, setActiveTab] = useState("assistant");

  return (
    <Card className="border-[#C8913B]/30">
      <CardHeader className="bg-gradient-to-r from-[#C8913B]/90 to-[#b17d33]/90 text-white">
        <CardTitle className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
          AI Shopping Assistant
        </CardTitle>
        <CardDescription className="text-white/90">
          Let our AI help you create the perfect BBQ experience
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="assistant" className="flex-1 data-[state=active]:bg-[#C8913B]/10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
              Assistant
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex-1 data-[state=active]:bg-[#C8913B]/10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              BBQ Planner
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex-1 data-[state=active]:bg-[#C8913B]/10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              Menu Creator
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex-1 data-[state=active]:bg-[#C8913B]/10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              Analyzer
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="assistant" className="mt-0">
              <AIAssistant bookingContext={bookingData} />
            </TabsContent>
            
            <TabsContent value="planner" className="mt-0">
              <AIRecommendations onSelectPackage={onSelectPackage} />
            </TabsContent>
            
            <TabsContent value="menu" className="mt-0">
              <CustomMenuGenerator />
            </TabsContent>
            
            <TabsContent value="analyzer" className="mt-0">
              {bookingData ? (
                <BookingAnalyzer 
                  bookingDetails={bookingData} 
                  onApplySuggestion={onApplySuggestion} 
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Complete more of your booking to get AI analysis</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}