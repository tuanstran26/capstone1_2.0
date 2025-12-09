# Fitness Studio - Next.js Full-Stack Application

A comprehensive fitness studio management system built with Next.js 15, TypeScript, and modern web technologies.

## Features

- 🏋️ Complete fitness studio website with membership management
- 🛒 E-commerce shopping system with 31+ products
- 💳 Multiple payment methods (Card, Banking, Cash, ZaloPay)
- 📊 Admin dashboard for managing users, trainers, classes
- 👤 User dashboard with progress tracking
- 🎓 Trainer portal for client management
- 💬 AI-powered chatbot assistant
- 📱 Fully responsive design
- ⚡ Optimized image loading with Next.js Image
- 🎨 Modern UI with Framer Motion animations

## Tech Stack

- **Framework:** Next.js 15.4.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion 12.23.3
- **Icons:** React Icons 5.5.0
- **State Management:** React Context API
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Calendar:** React Calendar
- **UI Components:** Custom components + Swiper

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd capstone1_2.0/Capstone1_Fitness_Studio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Capstone1_Fitness_Studio/
├── app/                          # Next.js app directory
│   ├── (main)/                  # Main landing page
│   ├── admindashboard/          # Admin dashboard pages
│   ├── dashboard/               # User dashboard (Standard/Premium)
│   ├── trainer/                 # Trainer portal
│   ├── shopping/                # E-commerce pages
│   ├── checkout/                # Membership checkout
│   ├── login/                   # Authentication
│   └── api/                     # API routes
├── components/                   # React components
│   ├── shopping/                # Shopping-related components
│   ├── checkout/                # Checkout components
│   └── ui/                      # UI components
├── lib/                         # Utility functions and data
│   ├── CartContext.tsx          # Shopping cart state management
│   ├── productsData.ts          # Product catalog (31 items)
│   ├── reviewsData.ts           # Product reviews
│   ├── variants.ts              # Framer Motion animations
│   └── useActiveLink.ts         # Navigation hook
├── public/                      # Static assets
│   └── products/                # Product images (179 files)
└── types/                       # TypeScript type definitions
```

## Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Features Details

### Shopping System
- 31 products across categories (Clothing, Footwear, Equipment)
- Product reviews and ratings
- Shopping cart with localStorage persistence
- Checkout with multiple payment methods

### Membership System
- 4 membership tiers (Standard, Premium, VIP, Platinum)
- Online payment integration (ZaloPay, Card, Banking, Cash)
- Automatic membership activation

### Dashboard Systems
- **User Dashboard:** Progress tracking, schedule, trainer assignment
- **Trainer Portal:** Client management, program creation, scheduling
- **Admin Panel:** User management, analytics, financial reports

### Performance Optimizations
- Image optimization (WebP, AVIF formats)
- Lazy loading with blur placeholders
- Priority loading for above-the-fold content
- Optimized bundle size

## Important Notes

- The project uses TypeScript with strict type checking
- All images are optimized using Next.js Image component
- Shopping cart data persists in localStorage
- Dev server runs on port 3000 by default

## Troubleshooting

### Build Errors
If you encounter build errors related to `useSearchParams()`, this is expected for static generation. The app is configured to handle this in production with `force-dynamic` exports.

### Missing Dependencies
If dependencies are missing after cloning:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
If port 3000 is occupied:
```bash
npm run dev -- -p 3001
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of a capstone project.

---

Built with ❤️ using Next.js 15 and TypeScript
