# Vercel Deployment Guide for Barby & Ken BBQ Platform

## Prerequisites
1. GitHub account with your code repository
2. Vercel account (free tier available)
3. Environment variables ready

## Step 1: Prepare Repository
Ensure these files are in your repository root:
- `vercel.json` (already created)
- `package.json` with build scripts
- All source code in `client/` and `server/` directories

## Step 2: Environment Variables
In Vercel dashboard, add these environment variables:

### Required Variables:
- `OPENAI_API_KEY` - Your OpenAI API key for AI features
- `OPENWEATHERMAP_API_KEY` - Weather widget functionality
- `NODE_ENV` - Set to "production"

### Optional Variables (if using Stripe):
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY` - Your Stripe publishable key
- `STRIPE_PRICE_ID` - Your subscription price ID

### Database Variables (if using PostgreSQL):
- `DATABASE_URL` - Your database connection string

## Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)
1. Go to vercel.com and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Vite project
5. Add environment variables in project settings
6. Deploy

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 4: Configure Build Settings
Vercel should automatically detect:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Step 5: Domain & SSL
- Vercel provides automatic HTTPS
- Custom domain can be added in project settings
- DNS configuration will be provided by Vercel

## Features That Will Work:
✅ Complete BBQ booking system
✅ Real-time availability tracking
✅ Admin dashboard with inventory management
✅ Driver portal with authentication
✅ Weather integration
✅ Responsive design for all devices
✅ All UI components and animations

## Build Optimization
The Vercel build process handles:
- Automatic code splitting
- CSS optimization
- Image optimization
- Fast global CDN delivery
- Serverless function deployment

## Troubleshooting
If build fails:
1. Check environment variables are set
2. Verify all dependencies in package.json
3. Check Vercel build logs for specific errors
4. Ensure API routes are properly configured

## Performance Benefits
- Global CDN for fast loading worldwide
- Automatic scaling based on traffic
- Built-in analytics and monitoring
- Zero-config SSL certificates