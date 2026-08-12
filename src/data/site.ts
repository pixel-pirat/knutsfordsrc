export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Market", href: "#market" },
  { label: "News", href: "#news" },
  { label: "Gallery", href: "#gallery" },
];

export const breakingNews = [
  "Knutsford University Wins National Innovation Challenge",
  "Matriculation ceremony holds this Saturday at the Main Auditorium",
  "Second semester dues payment window closes September 30th",
  "SRC opens nominations for the 2026 Online Voting cycle",
  "Tech Summit Africa returns to campus this September",
];

export type HubFeature = {
  title: string;
  description: string;
  icon: string;
};

export const hubFeatures: HubFeature[] = [
  {
    title: "Student Dashboard",
    description: "One home for your results, timetable and notices.",
    icon: "dashboard",
  },
  {
    title: "Events",
    description: "Discover and RSVP to everything happening on campus.",
    icon: "calendar",
  },
  {
    title: "Marketplace",
    description: "Buy, sell and trade with verified students nearby.",
    icon: "storefront",
  },
  {
    title: "Digital ID",
    description: "Your student identity, always in your pocket.",
    icon: "id",
  },
  {
    title: "Jobs & Internships",
    description: "Find opportunities matched to your field of study.",
    icon: "briefcase",
  },
  {
    title: "Past Questions",
    description: "Revise smarter with a growing exam question bank.",
    icon: "book",
  },
  {
    title: "Dues",
    description: "Check balances and pay SRC dues in a few taps.",
    icon: "wallet",
  },
  {
    title: "Online Voting",
    description: "Vote securely in every SRC and hall election.",
    icon: "vote",
  },
];

export type EventItem = {
  title: string;
  location: string;
  time: string;
  day: string;
  month: string;
  image: string;
};

export const upcomingEvents: EventItem[] = [
  {
    title: "Tech Summit Africa",
    location: "Main Auditorium",
    time: "10:00am - 4:00pm",
    day: "24",
    month: "SEPT",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop&q=80",
  },
  {
    title: "Freshers' Welcome Night",
    location: "Knutsford Quad",
    time: "6:00pm - 10:00pm",
    day: "29",
    month: "SEPT",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop&q=80",
  },
  {
    title: "SRC Town Hall Meeting",
    location: "Senate Hall",
    time: "2:00pm - 4:00pm",
    day: "03",
    month: "OCT",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop&q=80",
  },
];

export type Product = {
  name: string;
  price: string;
  rating: string;
  reviews: string;
  image: string;
};

export const trendingProducts: Product[] = [
  {
    name: "HP Elite Book",
    price: "GHS 3,500.00",
    rating: "4.2",
    reviews: "25",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "HP Elite Book",
    price: "GHS 3,500.00",
    rating: "4.2",
    reviews: "25",
    image:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "HP Elite Book",
    price: "GHS 3,500.00",
    rating: "4.2",
    reviews: "25",
    image:
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&h=500&fit=crop&q=80",
  },
];

export const quickLinks = [
  "Create Account",
  "Pay Dues",
  "Visit the Market",
  "Tournament of Power",
];

export type NewsItem = {
  title: string;
  excerpt?: string;
  time: string;
  image: string;
  featured?: boolean;
};

export const campusNews: NewsItem[] = [
  {
    title: "Knutsford University Wins National Innovation Challenge",
    excerpt:
      "Our students showcasing outstanding innovation and creativity...",
    time: "2h ago",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop&q=80",
    featured: true,
  },
  {
    title: "Vice-Chancellor's Christmas Message",
    time: "2d ago",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80",
  },
  {
    title: "SRC Announces New Digital ID Rollout",
    time: "3d ago",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&q=80",
  },
];

export const footerColumns = [
  {
    heading: "Explore",
    links: ["Home", "About", "Market", "News", "Gallery"],
  },
  {
    heading: "Digital Hub",
    links: ["Student Dashboard", "Events", "Digital ID", "Online Voting"],
  },
  {
    heading: "Support",
    links: ["Help Centre", "Contact Us", "Privacy Policy", "Terms of Use"],
  },
];
