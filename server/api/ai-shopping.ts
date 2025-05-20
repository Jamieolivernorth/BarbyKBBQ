import { Router } from 'express';
import { 
  getBBQRecommendations, 
  generateCustomMenu, 
  getShoppingAssistance, 
  analyzeBookingChoices 
} from '../utils/openai';

const router = Router();

// Get AI-powered BBQ recommendations based on user preferences
router.post('/recommendations', async (req, res) => {
  try {
    const preferences = req.body;
    const recommendations = await getBBQRecommendations(preferences);
    res.json(recommendations);
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations', 
      message: error.message 
    });
  }
});

// Generate custom BBQ menu based on preferences
router.post('/custom-menu', async (req, res) => {
  try {
    const preferences = req.body;
    const menu = await generateCustomMenu(preferences);
    res.json(menu);
  } catch (error: any) {
    console.error('Error generating custom menu:', error);
    res.status(500).json({ 
      error: 'Failed to generate custom menu', 
      message: error.message 
    });
  }
});

// Get AI shopping assistance for the booking process
router.post('/assistance', async (req, res) => {
  try {
    const { question, bookingContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const assistance = await getShoppingAssistance(question, bookingContext);
    res.json({ response: assistance });
  } catch (error: any) {
    console.error('Error getting shopping assistance:', error);
    res.status(500).json({ 
      error: 'Failed to get shopping assistance', 
      message: error.message 
    });
  }
});

// Analyze current booking choices and suggest improvements
router.post('/analyze-booking', async (req, res) => {
  try {
    const bookingDetails = req.body;
    const analysis = await analyzeBookingChoices(bookingDetails);
    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing booking choices:', error);
    res.status(500).json({ 
      error: 'Failed to analyze booking choices', 
      message: error.message 
    });
  }
});

export default router;