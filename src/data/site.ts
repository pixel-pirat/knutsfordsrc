export type NavLink = { label: string; href: string; badge?: string };

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Market", href: "/market" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Games", href: "/games", badge: "Soon" },
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
  category: string;
  price: string;
  rating: string;
  reviews: string;
  image: string;
};

export const marketProducts: Product[] = [
  {
    name: "HP Elite Book",
    category: "Laptops",
    price: "GHS 3,500.00",
    rating: "4.2",
    reviews: "25",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "HP Elite Book",
    category: "Laptops",
    price: "GHS 3,500.00",
    rating: "4.2",
    reviews: "25",
    image:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "MacBook Air",
    category: "Laptops",
    price: "GHS 5,200.00",
    rating: "4.6",
    reviews: "18",
    image:
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "Sony Wireless Headphones",
    category: "Electronics",
    price: "GHS 450.00",
    rating: "4.5",
    reviews: "32",
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "Campus Backpack",
    category: "Accessories",
    price: "GHS 180.00",
    rating: "4.3",
    reviews: "41",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "Stationery Bundle",
    category: "Academics",
    price: "GHS 65.00",
    rating: "4.1",
    reviews: "19",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&h=500&fit=crop&q=80",
  },
  {
    name: "Second-Hand Textbook Set",
    category: "Academics",
    price: "GHS 220.00",
    rating: "4.0",
    reviews: "14",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=500&h=500&fit=crop&q=80",
  },
];

export const marketCategories = [
  "All",
  "Laptops",
  "Electronics",
  "Accessories",
  "Academics",
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
  author?: string;
  avatar?: string;
  featured?: boolean;
};

export const campusNews: NewsItem[] = [
  {
    title: "Knutsford University Wins National Innovation Challenge",
    excerpt:
      "Our students showcasing outstanding innovation and creativity took home the top prize at this year's national innovation summit, beating twelve other universities.",
    time: "2h ago",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop&q=80",
    author: "Communications Office",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&q=80",
    featured: true,
  },
  {
    title: "Vice-Chancellor's Christmas Message",
    excerpt:
      "A reflection on the year gone by and a look ahead to what 2027 holds for the Knutsford community.",
    time: "2d ago",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80",
    author: "Office of the Vice-Chancellor",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
  },
  {
    title: "SRC Announces New Digital ID Rollout",
    excerpt:
      "Every registered student will receive a verified Digital ID through the Student Hub ahead of the new semester.",
    time: "3d ago",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&q=80",
    author: "SRC Secretariat",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&q=80",
  },
  {
    title: "Second Semester Dues Payment Window Now Open",
    excerpt:
      "Students can now settle SRC dues directly from the Digital Hub, with instant receipts and balance tracking.",
    time: "5d ago",
    image:
      "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&h=300&fit=crop&q=80",
    author: "Finance Office",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80",
  },
  {
    title: "Tech Summit Africa Returns to Campus This September",
    excerpt:
      "The continent's leading student tech conference is back at the Main Auditorium with a new lineup of speakers.",
    time: "1w ago",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&fit=crop&q=80",
    author: "Events Committee",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&q=80",
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
  tall?: boolean;
};

export const galleryImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    alt: "Graduates celebrating at commencement",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    alt: "Students studying together in the library",
  },
  {
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    alt: "Guest lecture in the main auditorium",
  },
  {
    src: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800&q=80",
    alt: "Packed lecture hall during orientation week",
  },
  {
    src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80",
    alt: "Students in a classroom session",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80",
    alt: "A student working on a laptop",
  },
  {
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
    alt: "Friends catching up between classes",
  },
  {
    src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80",
    alt: "The main academic block on campus",
  },
];

export const footerColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Market", href: "/market" },
      { label: "News", href: "/news" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    heading: "Digital Hub",
    links: [
      { label: "Student Dashboard", href: "/#hub" },
      { label: "Events", href: "/#hub" },
      { label: "Digital ID", href: "/#hub" },
      { label: "Online Voting", href: "/#hub" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
    ],
  },
];

export const aboutStats = [
  { value: "2007", label: "Founded" },
  { value: "12,000+", label: "Students" },
  { value: "48", label: "Degree Programmes" },
  { value: "6", label: "Faculties" },
];

export const aboutValues = [
  {
    title: "Academic Excellence",
    description:
      "Rigorous, industry-relevant programmes taught by experienced faculty across six faculties.",
    icon: "book",
  },
  {
    title: "Community",
    description:
      "A tight-knit campus culture built on faith, integrity and student leadership through the SRC.",
    icon: "users",
  },
  {
    title: "Innovation",
    description:
      "From hackathons to the annual Tech Summit, we back student-led ideas with real resources.",
    icon: "briefcase",
  },
  {
    title: "Opportunity",
    description:
      "A growing network of employer partners feeding directly into our Jobs & Internships hub.",
    icon: "vote",
  },
];

export const gameModes = [
  {
    title: "Trivia Nights",
    description: "Weekly live trivia battles between halls and faculties.",
    icon: "trophy",
  },
  {
    title: "Esports Tournaments",
    description: "Campus-wide brackets in FIFA, Call of Duty and more.",
    icon: "gamepad",
  },
  {
    title: "Campus Leaderboard",
    description: "Track your wins and climb the all-student rankings.",
    icon: "dashboard",
  },
  {
    title: "SRC Quiz Battles",
    description: "Faculty-versus-faculty knockouts with real prizes.",
    icon: "vote",
  },
];
