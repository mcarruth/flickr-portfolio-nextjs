# Quick Setup Guide

Follow these steps to get your Flickr portfolio up and running in 5 minutes.

## Step 1: Copy Environment Variables

```bash
cd flickr-portfolio-nextjs
cp .env.local.example .env.local
```

## Step 2: Add Your Flickr Credentials

Open `.env.local` in your editor and fill in:

```
NEXT_PUBLIC_FLICKR_API_KEY=your_api_key_here
NEXT_PUBLIC_FLICKR_API_SECRET=your_api_secret_here
NEXT_PUBLIC_FLICKR_USER_ID=your_user_id_here
```

### Need API credentials?

If you don't have them yet:
1. Visit: https://www.flickr.com/services/apps/create/
2. Request a non-commercial API key
3. Copy the API Key and Secret

### Find your User ID

1. Visit: https://www.webfx.com/tools/idgettr/
2. Enter your Flickr profile URL
3. Copy your User ID (looks like: 12345678@N01)

## Step 3: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Tag Your Photos

On Flickr:
1. Choose photos you want in your portfolio
2. Add the tag "portfolio" to each one
3. (Optional) Organize them into albums

Refresh your browser - they should appear automatically!

## Next Steps

- Customize the styling in `components/PhotoGallery.tsx`
- Deploy to Vercel for free hosting
- Add your custom domain

## Troubleshooting

### No photos showing up?

1. Make sure photos are **public** on Flickr (not private)
2. Double-check the tag is exactly "portfolio" (lowercase, no spaces)
3. Verify your credentials in `.env.local`
4. Check browser console for errors (F12)

### API errors?

- Make sure you're using `NEXT_PUBLIC_` prefix for all env vars
- Restart dev server after changing `.env.local`
- Test your API key works: https://www.flickr.com/services/api/explore/

### Still stuck?

Check the full README.md for detailed documentation.
