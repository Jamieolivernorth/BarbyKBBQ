import express, { Request, Response } from "express";
import { z } from "zod";
import { getBBQRecommendations, generateCustomMenu, getShoppingAssistance, analyzeBookingChoices } from "../utils/openai";

const router = express.Router();

// AI BBQ planner/recommendations
router.post("/recommendations", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      location: z.string().optional(),
      groupSize: z.string().optional(),
      occasion: z.string().optional(),
      dietary: z.array(z.string()).optional(),
      budget: z.string().optional()
    });

    const validatedData = schema.parse(req.body);
    const recommendations = await getBBQRecommendations(validatedData);
    
    res.json(recommendations);
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendations" });
  }
});

// AI shopping assistant
router.post("/assistance", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      question: z.string(),
      bookingContext: z.any().optional()
    });

    const validatedData = schema.parse(req.body);
    const response = await getShoppingAssistance(validatedData.question, validatedData.bookingContext);
    
    res.json({ response });
  } catch (error: any) {
    console.error("Error getting AI assistance:", error);
    res.status(500).json({ error: error.message || "Failed to get AI assistance" });
  }
});

// Custom BBQ menu generator
router.post("/custom-menu", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      guests: z.string().optional(),
      dietary_restrictions: z.string().optional(),
      cuisine_style: z.string().optional(),
      favorite_foods: z.string().optional(),
      bbq_type: z.string().optional(),
      special_requests: z.string().optional()
    });

    const validatedData = schema.parse(req.body);
    const menuData = await generateCustomMenu(validatedData);
    
    res.json(menuData);
  } catch (error: any) {
    console.error("Error generating custom menu:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom menu" });
  }
});

// Booking analyzer
router.post("/analyze-booking", async (req: Request, res: Response) => {
  try {
    const bookingDetails = req.body;
    const analysis = await analyzeBookingChoices(bookingDetails);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing booking:", error);
    res.status(500).json({ error: error.message || "Failed to analyze booking" });
  }
});

export default router;