import { getEventViewCount } from '../utils/viewCounter';

export const baseEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2024",
    image:
      "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    date: "July 15, 2024",
    time: "6:00 PM - 11:00 PM",
    location: "Central Park, New York, NY",
    attendees: 2500,
    maxParticipants: 3000,
    categories: ["Music", "Concert", "Outdoors"],
    price: 45,
    duration: "5 hours",
    viewCount: 0,
    organizer: "NYC Music Events",
    organizerBio: "Bringing the best live music experiences to New York",
    description: `Join us for an unforgettable evening of live music under the stars! This year's Summer Music Festival features an incredible lineup of local and international artists across multiple stages.

Experience a diverse range of genres from indie rock to electronic, with food trucks, craft beer gardens, and art installations throughout the park. Bring your blankets and lawn chairs for a perfect summer night!

What to expect:
- 15+ live performances
- Food & beverage vendors
- Art installations
- Family-friendly activities
- VIP lounge access (upgrade available)

Gates open at 5:00 PM. Rain or shine event.`,
  },
  {
    id: 2,
    title: "AI & Machine Learning Workshop",
    image:
      "https://images.unsplash.com/photo-1747674148491-51f8a5c723db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1166",
    date: "June 20, 2024",
    time: "2:00 PM - 5:00 PM",
    location: "Tech Hub, 123 Silicon Valley, CA",
    attendees: 150,
    maxParticipants: 200,
    categories: ["Tech", "Workshop", "AI & Data"],
    price: 0,
    duration: "3 hours",
    viewCount: 0,
    organizer: "Tech Innovators",
    organizerBio: "Empowering developers with cutting-edge technology",
    description: `Learn the fundamentals of AI and Machine Learning in this hands-on workshop designed for beginners and intermediate developers.

Workshop Highlights:
- Introduction to AI/ML concepts
- Hands-on coding exercises
- Real-world use cases
- Q&A with industry experts
- Networking opportunities
- Free refreshments

Bring your laptop! Prerequisites: Basic Python knowledge recommended but not required.`,
  },
  {
    id: 3,
    title: "First Friday Art Walk",
    image:
      "https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    date: "July 5, 2024",
    time: "6:00 PM - 10:00 PM",
    location: "Arts District, Downtown LA",
    attendees: 320,
    maxParticipants: 500,
    categories: ["Art & Design", "Culture", "Social"],
    price: 0,
    duration: "4 hours",
    viewCount: 0,
    organizer: "Downtown Arts Collective",
    organizerBio: "Celebrating local artists and creative community",
    description: `Explore the vibrant Arts District during our monthly First Friday Art Walk! Gallery openings, live music, street performances, and more.

Featured This Month:
- 12+ gallery openings
- Live painting demonstrations
- Street food vendors
- Live music at multiple locations
- Artist meet & greets
- Pop-up art markets

Free and open to all ages. Self-guided walking tour through the district.`,
  },
  {
    id: 4,
    title: "Sunrise Hike & Coffee Meetup",
    image:
      "https://plus.unsplash.com/premium_photo-1661814278311-d59ab0b4a676?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    date: "June 25, 2024",
    time: "5:30 AM - 8:30 AM",
    location: "Ridge Park Trail, Boulder, CO",
    attendees: 85,
    maxParticipants: 100,
    categories: ["Outdoors", "Hiking & Outdoors", "Wellness"],
    price: 10,
    duration: "3 hours",
    viewCount: 0,
    organizer: "Mountain Wellness Group",
    organizerBio: "Connecting nature lovers in the Boulder community",
    description: `Start your day with breathtaking views! Join fellow outdoor enthusiasts for a sunrise hike followed by coffee and conversation.

What's Included:
- Guided 4-mile moderate hike
- Sunrise viewing at summit
- Coffee & pastries at the top
- Trail snacks and water
- Professional photography (optional)
- Small group atmosphere

Difficulty: Moderate. Elevation gain: 800ft. Please wear appropriate hiking shoes and bring layers.`,
  },
  {
    id: 5,
    title: "AI & Machine Learning Summit 2024",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop",
    date: "August 10, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Tech Hub Convention Center, San Francisco, CA",
    attendees: 450,
    maxParticipants: 500,
    categories: ["Tech", "Workshop", "AI & Data", "Networking"],
    price: 299,
    duration: "9 hours",
    viewCount: 0,
    organizer: "TechForward Events",
    organizerBio:
      "Leading tech conferences and workshops for professionals worldwide",
    description: `Dive deep into the future of artificial intelligence and machine learning at this comprehensive full-day summit. Connect with industry leaders, data scientists, and AI researchers.

This summit brings together the brightest minds in AI to share insights, breakthroughs, and practical applications. Whether you're a seasoned ML engineer or just starting your journey, you'll find valuable content tailored to your level.

What to expect:
- 20+ expert speakers and panelists
- Hands-on ML workshops
- Live coding demonstrations
- Networking lunch and coffee breaks
- Access to exclusive AI tools and resources
- Certificate of completion

Breakfast and lunch included. Laptop required for workshops.`,
  },

  {
    id: 6,
    title: "Downtown Food & Wine Festival",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop",
    date: "September 22, 2024",
    time: "12:00 PM - 8:00 PM",
    location: "Harbor District, Seattle, WA",
    attendees: 1850,
    maxParticipants: 2000,
    categories: ["Food & Drink", "Culture", "Festival"],
    price: 65,
    duration: "8 hours",
    viewCount: 0,
    organizer: "Seattle Culinary Collective",
    organizerBio:
      "Celebrating local flavors and culinary excellence since 2015",
    description: `Indulge in a spectacular celebration of food, wine, and local culture! The Downtown Food & Wine Festival showcases the Pacific Northwest's finest culinary talents and award-winning wineries.

Explore over 50 food vendors, wine tastings from 30+ regional wineries, live cooking demonstrations by celebrity chefs, and live entertainment throughout the day. This is a feast for all your senses!

What to expect:
- 50+ local restaurants and food trucks
- 30+ wine and craft beer tastings
- Celebrity chef cooking demos
- Live music on two stages
- Kids' zone with activities
- Artisan marketplace

General admission includes tasting glass and 10 sample tickets. Additional tickets available for purchase. Must be 21+ for wine tastings.`,
  },

  {
    id: 7,
    title: "Sunrise Yoga & Wellness Retreat",
    image:
      "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    date: "July 28, 2024",
    time: "6:00 AM - 12:00 PM",
    location: "Malibu Beach Resort, Malibu, CA",
    attendees: 85,
    maxParticipants: 100,
    categories: ["Wellness", "Fitness & Yoga", "Outdoors", "Meditation"],
    price: 120,
    duration: "6 hours",
    viewCount: 0,
    organizer: "Zen Wellness Co.",
    organizerBio:
      "Creating transformative wellness experiences for mind, body, and soul",
    description: `Start your day with intention at our oceanfront Sunrise Yoga & Wellness Retreat. Experience the healing power of yoga, meditation, and community in one of California's most beautiful settings.

Wake up to the sound of waves and join us for a transformative morning of movement, mindfulness, and nourishment. All levels welcome - from complete beginners to advanced practitioners.

What to expect:
- 90-minute beachfront yoga session
- Guided meditation and breathwork
- Sound healing ceremony
- Organic farm-to-table brunch
- Wellness workshops and talks
- Complimentary wellness gift bag

Yoga mat and props provided. Please bring water bottle, sunscreen, and comfortable clothing. Vegetarian and vegan options available.`,
  },

  {
    id: 8,
    title: "Urban Art Walk & Gallery Night",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=300&fit=crop",
    date: "August 5, 2024",
    time: "5:00 PM - 10:00 PM",
    location: "Arts District, Los Angeles, CA",
    attendees: 620,
    maxParticipants: 750,
    categories: ["Art & Design", "Culture", "Networking", "Photography"],
    price: 35,
    duration: "5 hours",
    viewCount: 0,
    organizer: "LA Arts Collective",
    organizerBio:
      "Promoting emerging artists and creative community since 2010",
    description: `Explore the vibrant Los Angeles Arts District during our monthly Urban Art Walk! Discover incredible street art, visit 25+ galleries, meet local artists, and immerse yourself in LA's thriving creative scene.

This self-guided walking tour takes you through the heart of Downtown LA's artistic revolution. Each participating gallery features special exhibitions, artist talks, and exclusive preview showings.

What to expect:
- Access to 25+ galleries and studios
- Live art demonstrations
- Artist meet-and-greets
- Street performances and installations
- Complimentary wine and refreshments at select venues
- Exclusive discounts on artwork
- Official event map and guidebook

Comfortable walking shoes recommended. Free parking guide included with ticket. Photography encouraged!`,
  },

  {
    id: 9,
    title: "Startup Founders Networking Summit",
    image:
      "https://plus.unsplash.com/premium_photo-1661382160562-73bb0adf417d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169",
    date: "September 14, 2024",
    time: "2:00 PM - 9:00 PM",
    location: "Innovation Hub, Austin, TX",
    attendees: 280,
    maxParticipants: 300,
    categories: ["Tech", "Networking", "Startups", "Business"],
    price: 175,
    duration: "7 hours",
    viewCount: 0,
    organizer: "Austin Startup Alliance",
    organizerBio:
      "Connecting entrepreneurs and fostering innovation in the startup ecosystem",
    description: `Connect with fellow entrepreneurs, investors, and industry leaders at Austin's premier startup networking event! Whether you're launching your first venture or scaling your third company, this summit offers invaluable connections and insights.

Join 300 startup founders, VCs, angel investors, and ecosystem builders for an evening of meaningful conversations, pitch sessions, and collaboration opportunities. This isn't just another networking event - it's where real partnerships are formed.

What to expect:
- Structured networking sessions
- Lightning pitch competition ($10K prize)
- Fireside chats with successful founders
- VC panel and investor speed dating
- Startup resource fair
- Premium dinner and open bar
- Access to exclusive Slack community

Business casual attire. Bring plenty of business cards. Pitch deck submission optional but encouraged for competition entry.`,
  },
  {
    id: 10,
    title: "Urban Art Walk & Gallery Night",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=300&fit=crop",
    date: "August 5, 2024",
    time: "5:00 PM - 10:00 PM",
    location: "Arts District, Los Angeles, CA",
    attendees: 749,
    maxParticipants: 750,
    categories: ["Art & Design", "Culture", "Networking", "Photography"],
    price: 35,
    duration: "5 hours",
    viewCount: 0,
    organizer: "LA Arts Collective",
    organizerBio:
      "Promoting emerging artists and creative community since 2010",
    description: `Explore the vibrant Los Angeles Arts District during our monthly Urban Art Walk! Discover incredible street art, visit 25+ galleries, meet local artists, and immerse yourself in LA's thriving creative scene.

This self-guided walking tour takes you through the heart of Downtown LA's artistic revolution. Each participating gallery features special exhibitions, artist talks, and exclusive preview showings.

What to expect:
- Access to 25+ galleries and studios
- Live art demonstrations
- Artist meet-and-greets
- Street performances and installations
- Complimentary wine and refreshments at select venues
- Exclusive discounts on artwork
- Official event map and guidebook

Comfortable walking shoes recommended. Free parking guide included with ticket. Photography encouraged!`,
  },
];

// Export events with live view counts
export const getEventsWithViewCounts = () => {
  console.log('getEventsWithViewCounts called');
  const events = baseEvents.map(event => {
    const viewCount = getEventViewCount(event.id);
    console.log(`Event ${event.id} view count:`, viewCount);
    return {
      ...event,
      viewCount: viewCount
    };
  });
  return events;
};

// Also export as mockEvents for backward compatibility
export const mockEvents = getEventsWithViewCounts();
