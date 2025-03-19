# Flight History Visualization

An interactive visualization of personal flight history using Next.js, Leaflet, and Supabase. View your travel routes, frequently visited airports, and flight statistics in a beautiful, animated map interface.

## Features

- 🗺️ Interactive map with curved flight paths
- ✈️ Beautiful airport markers with pulse animations
- 📊 Flight statistics and route information
- 🏠 Home airport detection
- 🎨 Smooth animations and transitions
- 📱 Responsive design
- 🔄 Real-time data from Supabase

## Tech Stack

- Next.js 14
- TypeScript
- Leaflet.js for mapping
- Supabase for data storage
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/flymeback.git
cd flymeback
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

The application requires two tables in your Supabase database:

1. `vidmaflights` - Stores flight information
2. `all_airport_gps` - Stores airport coordinates and details

See the SQL setup scripts in the `scripts` directory for table schemas and initial data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
