# Deployment Guide for ShopGenius

## Prerequisites
- Node.js (version 18 or higher)
- pnpm (package manager)
- A hosting platform (Vercel, Netlify, or similar)

## Build Process

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a production build:
   ```bash
   pnpm build
   ```

3. The build output will be in the `.next` directory

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=your_api_url_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=your_domain_here

# Stripe Configuration (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Option 2: Manual Deployment
1. Build the project: `pnpm build`
2. Copy the following files/directories to your server:
   - `.next/`
   - `public/`
   - `package.json`
   - `.env.local`
3. Install dependencies on server: `pnpm install`
4. Start the server: `pnpm start`

## Starting the Production Server

After building, you can start the production server with:
```bash
pnpm start
```

This will start the server on port 3000 by default.

## Custom Domain

To use a custom domain:
1. Point your domain's DNS to your hosting provider
2. Update `NEXTAUTH_URL` in your environment variables
3. Configure SSL certificate (usually handled automatically by platforms like Vercel)

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `pnpm install`
- Check for TypeScript errors: `pnpm build`
- Verify environment variables are set correctly

### Runtime Issues
- Check server logs for errors
- Ensure environment variables are properly configured
- Verify API endpoints are accessible

## Support

For deployment assistance, contact the development team.