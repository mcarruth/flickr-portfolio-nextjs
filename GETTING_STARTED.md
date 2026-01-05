# Getting Started with Your Flickr Portfolio

## Quick Start (5 minutes)

### Step 1: Add Your Flickr Credentials

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and add your Flickr API credentials:
```
NEXT_PUBLIC_FLICKR_API_KEY=your_api_key_here
NEXT_PUBLIC_FLICKR_API_SECRET=your_secret_here
NEXT_PUBLIC_FLICKR_USER_ID=your_user_id_here
```

### Step 2: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio!

### Step 3: Tag Some Photos

1. Go to Flickr
2. Choose photos for your portfolio
3. Add the tag "portfolio" to each one
4. Refresh your browser - they'll appear automatically!

## What You've Built

### Features

- Full-screen cinematic photo gallery
- Keyboard navigation (arrow keys to browse, E for EXIF, ESC to go back)
- Touch/swipe support on mobile
- Dark, professional aesthetic
- EXIF data display with detailed camera settings
- Album organization
- Zero workflow overhead - everything managed in Flickr

### Pages

- **Home** (`/`) - Latest portfolio photo in dramatic full-screen
- **Photo Detail** (`/photo/[id]`) - Individual photo with EXIF overlay
- **Albums** (`/albums`) - Grid of albums containing portfolio photos
- **Album View** (`/albums/[id]`) - Browse photos within an album

### Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Flickr API

## Customization Ideas

### Change the Aesthetic

Edit the Tailwind classes in components to switch from dark/moody to light/airy:

In `components/PhotoGallery.tsx` and other files, change:
- `bg-black` → `bg-white`
- `text-white` → `text-black`
- `text-zinc-400` → `text-zinc-600`

### Adjust Animation Speed

In components using Framer Motion, modify the `transition` props:
```tsx
transition={{ delay: 0.5, duration: 0.3 }}
```

### Change the Portfolio Tag

In `lib/flickr.ts`, line 113, change the tag from "portfolio" to whatever you want:
```typescript
tags: 'portfolio',  // Change this!
```

### Add More EXIF Fields

In `app/photo/[id]/page.tsx`, you can display additional EXIF data. Available fields include:
- WhiteBalance
- Flash
- ColorSpace
- ExposureProgram
- MeteringMode
- And many more!

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: Flickr portfolio"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_FLICKR_API_KEY`
   - `NEXT_PUBLIC_FLICKR_API_SECRET`
   - `NEXT_PUBLIC_FLICKR_USER_ID`
5. Click "Deploy"

Your portfolio will be live at `https://your-project.vercel.app` in ~2 minutes!

### 3. Add Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `photos.yourdomain.com`)
3. Follow the DNS instructions (usually add a CNAME record)

On GoDaddy:
1. Go to DNS Management
2. Add CNAME record:
   - Name: `photos` (or `@` for root domain)
   - Value: `cname.vercel-dns.com`
3. Wait 5-30 minutes for propagation

## Troubleshooting

### "No portfolio photos found"

- Check photos are **public** on Flickr
- Verify tag is exactly "portfolio" (lowercase, no typo)
- Check browser console for API errors (F12)

### Images not loading

- Verify your Flickr API credentials are correct
- Check you're using `NEXT_PUBLIC_` prefix
- Restart dev server after changing `.env.local`

### Build errors

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## Next Steps

- Browse the example photographer sites you liked for inspiration
- Experiment with different color schemes in Tailwind
- Add more photos to Flickr with the "portfolio" tag
- Create themed albums for different types of photography
- Share your custom domain with potential clients!

## Project Structure

```
flickr-portfolio-nextjs/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page (gallery)
│   ├── photo/[id]/        # Photo detail with EXIF
│   ├── albums/            # Albums grid
│   └── albums/[id]/       # Individual album
├── components/
│   └── PhotoGallery.tsx   # Main gallery component
├── lib/
│   └── flickr.ts          # Flickr API service
├── public/                # Static assets
├── .env.local            # Your API credentials (not in git)
├── .env.local.example    # Template for credentials
├── README.md             # Full documentation
└── SETUP.md              # Quick setup guide
```

## Resources

- [Flickr API Documentation](https://www.flickr.com/services/api/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com)

Enjoy your new portfolio! 📸
