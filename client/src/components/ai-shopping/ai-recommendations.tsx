import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BBQRecommendation {
  package: string;
  description: string;
  price: string;
  ideal_for: string;
  highlights: string[];
}

interface RecommendationResponse {
  recommendations: BBQRecommendation[];
  suggested_location: string;
  time_suggestion: string;
  additional_tips: string;
}

export function AIRecommendations({ onSelectPackage }: { onSelectPackage?: (packageName: string) => void }) {
  const [preferences, setPreferences] = useState({
    location: "",
    groupSize: "",
    occasion: "",
    dietary: [] as string[],
    budget: ""
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const { toast } = useToast();

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "gluten-free", label: "Gluten Free" },
    { id: "halal", label: "Halal" },
    { id: "kosher", label: "Kosher" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleDietaryChange = (id: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      dietary: checked 
        ? [...prev.dietary, id] 
        : prev.dietary.filter(item => item !== id)
    }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai-shopping/recommendations", preferences);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-[#C8913B] border-2">
        <CardHeader className="bg-[#C8913B] text-white">
          <CardTitle>AI BBQ Planner</CardTitle>
          <CardDescription className="text-white/90">
            Let our AI help you plan the perfect BBQ experience
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Preferred Beach</Label>
              <Input 
                id="location" 
                placeholder="e.g., Golden Bay, Mellieha"
                value={preferences.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupSize">Group Size</Label>
              <Input 
                id="groupSize" 
                type="number" 
                placeholder="Number of people"
                value={preferences.groupSize}
                onChange={(e) => handleInputChange("groupSize", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Select onValueChange={(value) => handleInputChange("occasion", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family-gathering">Family Gathering</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="anniversary">Anniversary</SelectItem>
                <SelectItem value="friends-meetup">Friends Meetup</SelectItem>
                <SelectItem value="corporate">Corporate Event</SelectItem>
                <SelectItem value="casual">Casual BBQ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Dietary Requirements</Label>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id}
                    checked={preferences.dietary.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleDietaryChange(option.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Select onValueChange={(value) => handleInputChange("budget", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget-Friendly (€50-100)</SelectItem>
                <SelectItem value="mid-range">Mid-Range (€100-200)</SelectItem>
                <SelectItem value="premium">Premium (€200-350)</SelectItem>
                <SelectItem value="luxury">Luxury (€350+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={getRecommendations} 
            className="w-full bg-[#C8913B] hover:bg-[#b17d33]"
            disabled={loading}
          >
            {loading ? "Getting Recommendations..." : "Get AI Recommendations"}
          </Button>
        </CardFooter>
      </Card>

      {recommendations && (
        <Card className="border-green-600 border">
          <CardHeader className="bg-green-600 text-white">
            <CardTitle>Your Personalized BBQ Plan</CardTitle>
            <CardDescription className="text-white/90">
              AI-generated recommendations based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommended Packages</h3>
              <div className="grid gap-4">
                {recommendations.recommendations.map((rec, index) => (
                  <Card key={index} className="border-[#C8913B]/50 hover:border-[#C8913B] transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-[#C8913B]">{rec.package}</CardTitle>
                        <span className="text-lg font-bold">{rec.price}</span>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm font-medium mb-2">Ideal for: {rec.ideal_for}</p>
                      <div className="space-y-1">
                        {rec.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center text-sm">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {onSelectPackage && (
                        <Button 
                          variant="outline" 
                          className="w-full border-[#C8913B] text-[#C8913B] hover:bg-[#C8913B] hover:text-white"
                          onClick={() => onSelectPackage(rec.package)}
                        >
                          Select Package
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-1">Suggested Location</h3>
                <p>{recommendations.suggested_location}</p>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-1">Recommended Time</h3>
                <p>{recommendations.time_suggestion}</p>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-1">Additional Tips</h3>
                <p className="text-sm">{recommendations.additional_tips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}