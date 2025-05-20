import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  type: string;
  title: string;
  description: string;
  additional_cost: string;
}

interface AnalysisResponse {
  suggestions: Suggestion[];
  overall_assessment: string;
}

export function BookingAnalyzer({ 
  bookingDetails, 
  onApplySuggestion 
}: { 
  bookingDetails: any;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();

  const analyzeBooking = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai-shopping/analyze-booking", bookingDetails);
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing booking:", error);
      toast({
        title: "Error",
        description: "Failed to analyze booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get badge color based on suggestion type
  const getSuggestionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "upgrade":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "essential":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "experience":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "budget":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div>
      <Card className="border-[#C8913B] border-2">
        <CardHeader className="bg-[#C8913B] text-white">
          <CardTitle>AI Booking Analysis</CardTitle>
          <CardDescription className="text-white/90">
            Get AI suggestions to enhance your BBQ experience
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!analysis ? (
            <div className="text-center py-6">
              <p className="mb-4">Our AI can analyze your current choices and suggest improvements to make your BBQ experience even better.</p>
              <Button 
                onClick={analyzeBooking} 
                className="bg-[#C8913B] hover:bg-[#b17d33]"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze My Booking"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
                <p className="text-gray-700">{analysis.overall_assessment}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Suggested Improvements</h3>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className={getSuggestionColor(suggestion.type)}>
                              {suggestion.type}
                            </Badge>
                            <CardTitle className="mt-2 text-md">{suggestion.title}</CardTitle>
                          </div>
                          {suggestion.additional_cost && (
                            <Badge variant="outline" className="text-gray-600">
                              {suggestion.additional_cost}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </CardContent>
                      {onApplySuggestion && (
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#C8913B] text-[#C8913B] hover:bg-[#C8913B] hover:text-white"
                            onClick={() => onApplySuggestion(suggestion)}
                          >
                            Apply This Suggestion
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}