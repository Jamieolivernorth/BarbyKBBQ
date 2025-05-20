import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  name: string;
  description: string;
  dietaryInfo: string[];
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface MenuResponse {
  menu: MenuCategory[];
  estimated_cost_per_person: string;
  preparation_tips: string;
}

export function CustomMenuGenerator() {
  const [preferences, setPreferences] = useState({
    guests: "",
    dietary_restrictions: "",
    cuisine_style: "",
    favorite_foods: "",
    bbq_type: "",
    special_requests: ""
  });
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const generateMenu = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai-shopping/custom-menu", preferences);
      const data = await response.json();
      setMenuData(data);
    } catch (error) {
      console.error("Error generating custom menu:", error);
      toast({
        title: "Error",
        description: "Failed to generate custom menu. Please try again.",
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
          <CardTitle>Custom BBQ Menu Creator</CardTitle>
          <CardDescription className="text-white/90">
            Let our AI design a personalized BBQ menu just for you
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input 
                id="guests" 
                placeholder="How many people?"
                value={preferences.guests}
                onChange={(e) => handleInputChange("guests", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bbq_type">BBQ Type</Label>
              <Input 
                id="bbq_type" 
                placeholder="e.g., Traditional, Modern, Smokehouse"
                value={preferences.bbq_type}
                onChange={(e) => handleInputChange("bbq_type", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cuisine_style">Cuisine Style</Label>
            <Input 
              id="cuisine_style" 
              placeholder="e.g., American, Mediterranean, Asian Fusion"
              value={preferences.cuisine_style}
              onChange={(e) => handleInputChange("cuisine_style", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
            <Textarea 
              id="dietary_restrictions" 
              placeholder="Any allergies or dietary restrictions to consider?"
              value={preferences.dietary_restrictions}
              onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="favorite_foods">Favorite Foods</Label>
            <Textarea 
              id="favorite_foods" 
              placeholder="Any favorite foods you'd like to include?"
              value={preferences.favorite_foods}
              onChange={(e) => handleInputChange("favorite_foods", e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea 
              id="special_requests" 
              placeholder="Any other special requests or preferences?"
              value={preferences.special_requests}
              onChange={(e) => handleInputChange("special_requests", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateMenu} 
            className="w-full bg-[#C8913B] hover:bg-[#b17d33]"
            disabled={loading}
          >
            {loading ? "Generating Your Menu..." : "Create Custom Menu"}
          </Button>
        </CardFooter>
      </Card>

      {menuData && (
        <Card className="border-green-600 border">
          <CardHeader className="bg-green-600 text-white">
            <CardTitle>Your Custom BBQ Menu</CardTitle>
            <CardDescription className="text-white/90">
              AI-generated menu based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="menu">
              <TabsList className="mb-4">
                <TabsTrigger value="menu">Menu Items</TabsTrigger>
                <TabsTrigger value="details">Details & Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="menu" className="space-y-6">
                {menuData.menu.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-lg font-semibold text-[#C8913B] mb-3">
                      {category.category}
                    </h3>
                    <div className="grid gap-3">
                      {category.items.map((item, itemIndex) => (
                        <Card key={itemIndex} className="border-gray-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-0">
                            <p className="text-sm text-gray-600">{item.description}</p>
                            {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.dietaryInfo.map((info, i) => (
                                  <span 
                                    key={i} 
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full"
                                  >
                                    {info}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {categoryIndex < menuData.menu.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estimated Cost</h3>
                  <p className="text-xl font-bold text-[#C8913B]">
                    {menuData.estimated_cost_per_person} per person
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preparation Tips</h3>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {menuData.preparation_tips}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={() => {
                      // You can implement PDF download functionality here
                      toast({
                        title: "Menu Downloaded",
                        description: "Your custom BBQ menu has been downloaded.",
                      });
                    }}
                    variant="outline"
                    className="w-full border-[#C8913B] text-[#C8913B] hover:bg-[#C8913B] hover:text-white"
                  >
                    Download Menu as PDF
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}