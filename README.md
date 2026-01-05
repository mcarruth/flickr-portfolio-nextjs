# Flickr Portfolio - Next.js

A dramatic, cinematic photography portfolio website that uses Flickr as its backend storage and content management system.

## Features

- **Full-screen photo gallery** with smooth transitions and animations
- **Tag-based curation** - Tag photos with "portfolio" on Flickr to include them
- **Album organization** - Browse photos by Flickr albums
- **EXIF data display** - View camera settings, location, and technical details
- **Keyboard navigation** - Arrow keys to navigate, E to toggle EXIF, ESC to go back
- **Touch/swipe support** - Swipe gestures on mobile devices
- **Dark, moody aesthetic** - Professional portfolio presentation
- **Zero workflow overhead** - All state lives in Flickr

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Flickr API** - Photo storage and management

## Setup Instructions

### 1. Get Flickr API Credentials

1. Go to [Flickr App Garden](https://www.flickr.com/services/apps/create/)
2. Click "Request an API Key"
3. Choose "Apply for a Non-Commercial Key"
4. Fill out the form and submit
5. You'll receive:
   - **API Key**
   - **API Secret**

### 2. Find Your Flickr User ID

1. Go to [idGettr](https://www.webfx.com/tools/idgettr/) or similar service
2. Enter your Flickr profile URL
3. Copy your Flickr User ID (format: `12345678@N01`)

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_FLICKR_API_KEY=your_api_key_here
   NEXT_PUBLIC_FLICKR_API_SECRET=your_api_secret_here
   NEXT_PUBLIC_FLICKR_USER_ID=your_user_id_here
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Curating Your Portfolio

1. **Upload photos to Flickr** as you normally would
2. **Tag photos with "portfolio"** to include them in your portfolio site
3. **Organize into albums** (optional) for album-based browsing
4. Photos appear automatically - no manual uploads needed!

### Navigation

- **Home page** - Shows latest portfolio photo in full-screen
- **Arrow keys / Click arrows / Swipe** - Navigate between photos
- **Click "Albums"** - Browse photos by album
- **Click "View Details"** - See EXIF data and photo information
- **Press E** - Toggle EXIF panel on detail page
- **Press ESC** - Go back to previous page

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FLICKR_API_KEY`
   - `NEXT_PUBLIC_FLICKR_API_SECRET`
   - `NEXT_PUBLIC_FLICKR_USER_ID`
4. Deploy!

### Custom Domain

1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Update DNS settings on GoDaddy (or your domain registrar):
   - Add a CNAME record pointing to your Vercel domain
   - Follow Vercel's instructions for DNS configuration

## Project Structure

```
flickr-portfolio-nextjs/
├── app/
│   ├── page.tsx              # Home page (gallery)
│   ├── photo/[id]/page.tsx   # Photo detail page with EXIF
│   ├── albums/page.tsx       # Albums grid
│   └── albums/[id]/page.tsx  # Individual album view
├── components/
│   └── PhotoGallery.tsx      # Main gallery component
├── lib/
│   └── flickr.ts             # Flickr API service layer
└── .env.local                # Environment variables (not in git)
```

## How It Works

### Architecture

- **Hybrid approach** - Pages are static, photo data fetches from Flickr API client-side
- **No database** - All state lives in Flickr (tags, albums, EXIF, etc.)
- **No rebuild needed** - New photos appear automatically when tagged

### Flickr API Integration

The app uses these Flickr API methods:

- `flickr.photos.search` - Find photos tagged with "portfolio"
- `flickr.photos.getInfo` - Get photo metadata
- `flickr.photos.getExif` - Get camera settings
- `flickr.photosets.getList` - Get user's albums
- `flickr.photosets.getPhotos` - Get photos in an album

### Performance

- Next.js Image optimization for fast loading
- Framer Motion for smooth 60fps animations
- Client-side data fetching keeps the app always up-to-date
- CDN-optimized Flickr image URLs

## Customization

### Styling

Edit Tailwind classes in components to customize the look:
- Dark/light theme
- Colors and gradients
- Animation timings
- Layout and spacing

### API Limits

Flickr's free API tier allows:
- 3,600 queries per hour
- More than enough for a personal portfolio

## Troubleshooting

### Photos not showing up

1. Check that photos are **public** on Flickr
2. Verify photos are tagged with **"portfolio"** (lowercase)
3. Check browser console for API errors
4. Verify environment variables are set correctly

### Images loading slowly

- Flickr serves images from their CDN
- Large original files may take time to load
- The app automatically uses optimized sizes

### Build errors

- Make sure all dependencies are installed: `npm install`
- Check Node.js version (requires 18+)
- Verify TypeScript has no errors: `npm run build`

## License

MIT

## Credits

Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.
Powered by the Flickr API.
