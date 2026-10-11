import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CineBook seed with authentic movie catalogue and Hyderabad multiplexes...');

  // Clean existing data in correct relation order
  await prisma.cancellation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seatReservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.show.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theatre.deleteMany();
  await prisma.user.deleteMany();

  // --- USERS ---
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@cinebook.com',
      phone: '9000000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Arjun Sharma',
      email: 'arjun@example.com',
      phone: '9876543210',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Priya Reddy',
      email: 'priya@example.com',
      phone: '9876543211',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created (Admin & Customers)');

  // --- MOVIES ---
  const movies = await Promise.all([
    // 1. Kalki 2898 AD (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Kalki 2898 AD',
        description: 'In the dystopian post-apocalyptic future of Kasi, a mercenary bounty hunter named Bhairava finds himself thrust into a divine prophecy to protect a pregnant lab subject carrying the avatar Kalki.',
        genre: 'Action, Sci-Fi, Mythology',
        language: 'Telugu, Hindi, Tamil',
        durationMinutes: 181,
        certification: 'UA',
        releaseDate: new Date('2024-06-27'),
        posterUrl: '/posters/kalki-2898-ad.jpg',
        bannerUrl: '/posters/kalki-2898-ad.jpg',
        rating: 8.4,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Prabhas', role: 'Bhairava / Karna' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
          { name: 'Deepika Padukone', role: 'Sumati' },
          { name: 'Kamal Haasan', role: 'Supreme Yaskin' }
        ]),
        crew: JSON.stringify([
          { name: 'Nag Ashwin', role: 'Director' },
          { name: 'Santhosh Narayanan', role: 'Music Director' }
        ]),
      },
    }),

    // 2. Pushpa 2: The Rule (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Pushpa 2: The Rule',
        description: 'Pushpa Raj consolidates his supreme dominion over the red sandalwood smuggling empire of Seshachalam forest, facing off against SP Bhanwar Singh Shekhawat in an explosive clash of pride and firepower.',
        genre: 'Action, Crime, Drama',
        language: 'Telugu, Hindi',
        durationMinutes: 200,
        certification: 'A',
        releaseDate: new Date('2024-12-05'),
        posterUrl: '/posters/pushpa-2-the-rule.jpg',
        bannerUrl: '/posters/pushpa-2-the-rule.jpg',
        rating: 8.6,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Allu Arjun', role: 'Pushpa Raj' },
          { name: 'Rashmika Mandanna', role: 'Srivalli' },
          { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat' }
        ]),
        crew: JSON.stringify([
          { name: 'Sukumar', role: 'Director' },
          { name: 'Devi Sri Prasad', role: 'Music Director' }
        ]),
      },
    }),

    // 3. Devara: Part 1 (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Devara: Part 1',
        description: 'A valiant coastal village chief takes a solemn oath to keep deadly contraband off his native waters, igniting a ferocious war of survival, valor, and generational legacy.',
        genre: 'Action, Thriller, Drama',
        language: 'Telugu, Hindi, Tamil',
        durationMinutes: 178,
        certification: 'UA',
        releaseDate: new Date('2024-09-27'),
        posterUrl: '/posters/devara-part-1.jpg',
        bannerUrl: '/posters/devara-part-1.jpg',
        rating: 7.9,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'N. T. Rama Rao Jr.', role: 'Devara / Vara' },
          { name: 'Janhvi Kapoor', role: 'Thangam' },
          { name: 'Saif Ali Khan', role: 'Bhaira' }
        ]),
        crew: JSON.stringify([
          { name: 'Koratala Siva', role: 'Director' },
          { name: 'Anirudh Ravichander', role: 'Music Director' }
        ]),
      },
    }),

    // 4. Game Changer (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Game Changer',
        description: 'An upright Indian Administrative Service (IAS) officer wages an uncompromising battle against institutional graft and ruthless political kingpins to transform the election machinery.',
        genre: 'Action, Political Drama',
        language: 'Telugu, Tamil, Hindi',
        durationMinutes: 170,
        certification: 'UA',
        releaseDate: new Date('2025-01-10'),
        posterUrl: '/posters/game-changer.jpg',
        bannerUrl: '/posters/game-changer.jpg',
        rating: 7.5,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Ram Charan', role: 'Ram Nandan IAS' },
          { name: 'Kiara Advani', role: 'Deepika' },
          { name: 'S. J. Suryah', role: 'Srikanth' }
        ]),
        crew: JSON.stringify([
          { name: 'S. Shankar', role: 'Director' },
          { name: 'Thaman S', role: 'Music Director' }
        ]),
      },
    }),

    // 5. Mathu Vadalara 2 (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Mathu Vadalara 2',
        description: 'Special delivery agents Babu and Yesu enter the High Action Team to crack high-profile cases, only to stumble into a convoluted murder-extortion racket with hilariously chaotic consequences.',
        genre: 'Comedy, Crime, Mystery',
        language: 'Telugu',
        durationMinutes: 138,
        certification: 'UA',
        releaseDate: new Date('2024-09-13'),
        posterUrl: '/posters/mathu-vadalara-2.jpg',
        bannerUrl: '/posters/mathu-vadalara-2.jpg',
        rating: 8.0,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Sri Simha Koduri', role: 'Babu' },
          { name: 'Satya', role: 'Yesu' },
          { name: 'Faria Abdullah', role: 'Nidhi' },
          { name: 'Vennela Kishore', role: 'Michael' }
        ]),
        crew: JSON.stringify([
          { name: 'Ritesh Rana', role: 'Director' },
          { name: 'Kaala Bhairava', role: 'Music Director' }
        ]),
      },
    }),

    // 6. Lucky Baskhar (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Lucky Baskhar',
        description: 'A modest, underpaid middle-class bank cashier in 1990s Bombay spots loopholes in interbank financing, sparking a daring high-stakes journey through the Indian financial markets.',
        genre: 'Drama, Thriller, Crime',
        language: 'Telugu, Malayalam, Tamil',
        durationMinutes: 151,
        certification: 'UA',
        releaseDate: new Date('2024-10-31'),
        posterUrl: '/posters/lucky-baskhar.jpg',
        bannerUrl: '/posters/lucky-baskhar.jpg',
        rating: 8.2,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Dulquer Salmaan', role: 'Baskhar Kumar' },
          { name: 'Meenakshi Chaudhary', role: 'Sumathi' },
          { name: 'Ramki', role: 'Anthony' }
        ]),
        crew: JSON.stringify([
          { name: 'Venky Atluri', role: 'Director' },
          { name: 'G. V. Prakash Kumar', role: 'Music Director' }
        ]),
      },
    }),

    // 7. Sankranthiki Vasthunam (NOW_SHOWING)
    prisma.movie.create({
      data: {
        title: 'Sankranthiki Vasthunam',
        description: 'An ex-police officer is recruited by his former fiancé to crack a high-stakes kidnap case, unleashing a laughter riot filled with quirky family dynamics and high-octane entertainment.',
        genre: 'Action, Comedy, Drama',
        language: 'Telugu',
        durationMinutes: 146,
        certification: 'UA',
        releaseDate: new Date('2025-01-14'),
        posterUrl: '/posters/sankranthiki-vasthunam.jpg',
        bannerUrl: '/posters/sankranthiki-vasthunam.jpg',
        rating: 7.4,
        status: 'NOW_SHOWING',
        cast: JSON.stringify([
          { name: 'Venkatesh Daggubati', role: 'Y. D. Raju' },
          { name: 'Meenakshi Chaudhary', role: 'Ramya' },
          { name: 'Aishwarya Rajesh', role: 'Bhagyam' }
        ]),
        crew: JSON.stringify([
          { name: 'Anil Ravipudi', role: 'Director' },
          { name: 'Bheems Ceciroleo', role: 'Music Director' }
        ]),
      },
    }),

    // 8. Ranabaali (COMING_SOON - Specifically Requested Telugu Film)
    prisma.movie.create({
      data: {
        title: 'Ranabaali',
        description: 'Set in 19th-century British India (1854–1878) against the backdrop of the Madras Famine in Rayalaseema, legendary folk hero Singanamala Bobbili Ranabaali leads a historic rebellion against colonial oppression to protect his homeland.',
        genre: 'Period Action, Drama, History',
        language: 'Telugu, Hindi, Tamil, Kannada, Malayalam',
        durationMinutes: 165,
        certification: 'UA',
        releaseDate: new Date('2026-10-16'),
        posterUrl: '/posters/ranabaali.jpg',
        bannerUrl: '/posters/ranabaali-banner.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Vijay Deverakonda', role: 'Singanamala Bobbili Ranabaali' },
          { name: 'Rashmika Mandanna', role: 'Jayamma' },
          { name: 'Arnold Vosloo', role: 'General Campbell' },
          { name: 'Easwari Rao', role: 'Mother' },
          { name: 'Jason Shah', role: 'British Commander' }
        ]),
        crew: JSON.stringify([
          { name: 'Rahul Sankrityan', role: 'Director' },
          { name: 'Ajay–Atul', role: 'Music Directors' },
          { name: 'Mythri Movie Makers', role: 'Production' }
        ]),
      },
    }),

    // 9. Aadarsha Kutumbam House No: 47 (#AK47) (COMING_SOON - Specifically Requested Telugu Film)
    prisma.movie.create({
      data: {
        title: 'Aadarsha Kutumbam House No: 47',
        description: 'The outwardly harmonious life of a seemingly perfect middle-class family residing at House No. 47 unravels with humorous revelations and dramatic twists when an unexpected incident forces mild-mannered Chittibabu into an intense protective role.',
        genre: 'Action, Comedy, Family Drama',
        language: 'Telugu',
        durationMinutes: 155,
        certification: 'UA',
        releaseDate: new Date('2026-11-20'),
        posterUrl: '/posters/adarsha-kutumbam.jpg',
        bannerUrl: '/posters/adarsha-kutumbam.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Venkatesh Daggubati', role: 'Chittibabu' },
          { name: 'Srinidhi Shetty', role: 'Swarna' },
          { name: 'Nara Rohith', role: 'Surya' },
          { name: 'Nivetha Pethuraj', role: 'Kavya' },
          { name: 'Rao Ramesh', role: 'Narayana' },
          { name: 'Vennela Kishore', role: 'Anand' },
          { name: 'Brahmaji', role: 'Police Officer' }
        ]),
        crew: JSON.stringify([
          { name: 'Trivikram Srinivas', role: 'Director & Screenplay' },
          { name: 'Thaman S', role: 'Music Director' },
          { name: 'Haarika & Hassine Creations', role: 'Production' }
        ]),
      },
    }),

    // 10. Crazy Kalyanam (COMING_SOON - Requested Regional Release)
    prisma.movie.create({
      data: {
        title: 'Crazy Kalyanam',
        description: 'Set in rural Telangana, an affectionate father dreams of organizing a grand traditional wedding for his daughter, sparking side-splitting clashes when her modern independent mindset challenges longstanding local rituals.',
        genre: 'Comedy, Family, Romance',
        language: 'Telugu',
        durationMinutes: 140,
        certification: 'UA',
        releaseDate: new Date('2026-10-16'),
        posterUrl: '/posters/crazy-kalyanam.jpg',
        bannerUrl: '/posters/crazy-kalyanam.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Anupama Parameswaran', role: 'Madhu' },
          { name: 'Tharun Bhascker', role: 'Ramesh' },
          { name: 'Naresh Vijay Krishna', role: 'Father' },
          { name: 'Akhil Raj Uddemari', role: 'Gopi' }
        ]),
        crew: JSON.stringify([
          { name: 'Badrappa Gajula', role: 'Director' }
        ]),
      },
    }),

    // 11. Garividi Lakshmi (COMING_SOON - Requested Regional Release)
    prisma.movie.create({
      data: {
        title: 'Garividi Lakshmi',
        description: 'An authentic biographical musical drama following the life story of Uttarandhra folk legend Garividi Lakshmi, tracking her artistic journey from rural Burra Katha performances to becoming a revered cultural sensation.',
        genre: 'Biography, Drama, Musical',
        language: 'Telugu',
        durationMinutes: 145,
        certification: 'U',
        releaseDate: new Date('2026-10-16'),
        posterUrl: '/posters/garividi-lakshmi.jpg',
        bannerUrl: '/posters/garividi-lakshmi.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Kayal Anandhi', role: 'Garividi Lakshmi' },
          { name: 'Rag Mayur', role: 'Subbarao' },
          { name: 'Ankith Koyya', role: 'Suri' },
          { name: 'Naresh', role: 'Guru' }
        ]),
        crew: JSON.stringify([
          { name: 'Gowri Naidu Jammu', role: 'Director' }
        ]),
      },
    }),

    // 12. Itllu Arjuna (COMING_SOON - Requested Regional Release)
    prisma.movie.create({
      data: {
        title: 'Itllu Arjuna',
        description: 'Produced by Venky Kudumula, the poignant romance of a speech-impaired protagonist named Arjuna who finds deep love, only to be forced into a high-stakes battle where his raw instincts and physical grit become his ultimate shield.',
        genre: 'Action, Romance, Drama',
        language: 'Telugu',
        durationMinutes: 142,
        certification: 'UA',
        releaseDate: new Date('2026-10-30'),
        posterUrl: '/posters/itllu-arjuna.jpg',
        bannerUrl: '/posters/itllu-arjuna.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Sai Aniesh', role: 'Arjuna' },
          { name: 'Anaswara Rajan', role: 'Keerthi' },
          { name: 'Vennela Kishore', role: 'Vamsi' },
          { name: 'Mukesh Rishi', role: 'Bhadra' }
        ]),
        crew: JSON.stringify([
          { name: 'Mahesh Uppala', role: 'Director' },
          { name: 'Venky Kudumula', role: 'Producer' }
        ]),
      },
    }),

    // 13. They Call Him OG (COMING_SOON)
    prisma.movie.create({
      data: {
        title: 'They Call Him OG',
        description: 'Ruthless underworld don Ojas Gambheera emerges from a decade-long sabbatical in Japan and returns to Bombay, launching a devastating campaign to dismantle rival crime syndicates.',
        genre: 'Action, Crime, Thriller',
        language: 'Telugu, Hindi',
        durationMinutes: 160,
        certification: 'A',
        releaseDate: new Date('2026-09-25'),
        posterUrl: '/posters/they-call-him-og.jpg',
        bannerUrl: '/posters/they-call-him-og.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Pawan Kalyan', role: 'Ojas Gambheera (OG)' },
          { name: 'Emraan Hashmi', role: 'Omi Bhau' },
          { name: 'Priyanka Mohan', role: 'Ananya' }
        ]),
        crew: JSON.stringify([
          { name: 'Sujeeth', role: 'Director' },
          { name: 'Thaman S', role: 'Music Director' }
        ]),
      },
    }),

    // 14. Vishwambhara (COMING_SOON)
    prisma.movie.create({
      data: {
        title: 'Vishwambhara',
        description: 'A grand socio-fantasy adventure where a noble warrior journeys through mystical celestial worlds to combat primeval darkness and preserve the balance of the multiverse.',
        genre: 'Fantasy, Action, Mythology',
        language: 'Telugu, Hindi',
        durationMinutes: 168,
        certification: 'UA',
        releaseDate: new Date('2026-11-20'),
        posterUrl: '/posters/vishwambhara.jpg',
        bannerUrl: '/posters/vishwambhara.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Chiranjeevi', role: 'Dorababu' },
          { name: 'Trisha Krishnan', role: 'Veda' },
          { name: 'Kunal Kapoor', role: 'Antagonist' },
          { name: 'Ashika Ranganath', role: 'Devi' }
        ]),
        crew: JSON.stringify([
          { name: 'Vassishta', role: 'Director' },
          { name: 'M. M. Keeravaani', role: 'Music Director' }
        ]),
      },
    }),

    // 15. Jailer 2 (COMING_SOON)
    prisma.movie.create({
      data: {
        title: 'Jailer 2',
        description: 'Superstar Rajinikanth returns as Tiger Muthuvel Pandian. When an international syndicate endangers his peaceful life, the retired prison warden deploys his tactical lethality to defend what matters most.',
        genre: 'Action, Thriller, Crime',
        language: 'Tamil, Telugu, Hindi',
        durationMinutes: 172,
        certification: 'UA',
        releaseDate: new Date('2026-10-15'),
        posterUrl: '/posters/jailer-2.jpg',
        bannerUrl: '/posters/jailer-2.jpg',
        rating: null,
        status: 'COMING_SOON',
        cast: JSON.stringify([
          { name: 'Rajinikanth', role: 'Tiger Muthuvel Pandian' },
          { name: 'S. J. Suryah', role: 'Antagonist' },
          { name: 'Vidya Balan', role: 'Special Role' },
          { name: 'Ramya Krishnan', role: 'Vijaya' }
        ]),
        crew: JSON.stringify([
          { name: 'Nelson Dilipkumar', role: 'Director' },
          { name: 'Anirudh Ravichander', role: 'Music Director' }
        ]),
      },
    }),
  ]);

  console.log(`✅ ${movies.length} authentic movies seeded (7 Now Showing, 8 Coming Soon)`);

  // --- THEATRES (Realistic Hyderabad Multiplexes) ---
  const theatres = await Promise.all([
    // 1. AMB Cinemas (Gachibowli)
    prisma.theatre.create({
      data: {
        name: 'AMB Cinemas',
        address: 'Botanical Garden Road, Gachibowli, Kondapur, Hyderabad - 500084',
        city: 'Hyderabad',
        area: 'Gachibowli',
        phone: '040-23356789',
        amenities: '4K Laser Projection, Dolby Atmos, VIP Recliner Lounge, Valet Parking, Gourmet Concessions, M-Ticket Pass',
        status: 'ACTIVE',
      },
    }),

    // 2. PVR ICON (Hitech City / Inorbit Mall)
    prisma.theatre.create({
      data: {
        name: 'PVR ICON',
        address: '4th Floor, Inorbit Mall, Mindspace, Hitech City, Madhapur, Hyderabad - 500081',
        city: 'Hyderabad',
        area: 'Hitech City',
        phone: '040-44833333',
        amenities: '4DX Motion, P[XL] Dolby Atmos, Gold Class Lounge, Wheelchair Accessible, Food Court Access, Contactless Entry',
        status: 'ACTIVE',
      },
    }),

    // 3. Prasads Multiplex (Necklace Road)
    prisma.theatre.create({
      data: {
        name: 'Prasads Multiplex',
        address: 'NTR Marg, Central Secretariat, Necklace Road, Hyderabad - 500063',
        city: 'Hyderabad',
        area: 'Necklace Road',
        phone: '040-23448888',
        amenities: 'PCX Giant Screen, Dolby Atmos 64-Channel, IMAX Legacy Hub, Lakeside View, Ample Parking, Food Court',
        status: 'ACTIVE',
      },
    }),

    // 4. INOX GVK One (Banjara Hills)
    prisma.theatre.create({
      data: {
        name: 'INOX GVK One',
        address: '5th Floor, GVK One Mall, Road No. 1, Banjara Hills, Hyderabad - 500034',
        city: 'Hyderabad',
        area: 'Banjara Hills',
        phone: '040-23555555',
        amenities: 'INOX Insignia 7-Star Luxe, Laser Projection, Dolby Atmos, Chef Curated Menu, Paging Service, Covered Parking',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ ${theatres.length} realistic Hyderabad multiplexes seeded`);

  // --- SCREENS ---
  const screens = [];

  // AMB Cinemas Screens
  const ambScreen1 = await prisma.screen.create({
    data: {
      theatreId: theatres[0].id,
      name: 'Screen 1 (Laser 4K Atmos)',
      totalSeats: 140,
      layoutConfig: JSON.stringify({ rows: 9, columns: 16, aisleAfter: 8 }),
    },
  });
  screens.push(ambScreen1);

  const ambScreen2 = await prisma.screen.create({
    data: {
      theatreId: theatres[0].id,
      name: 'Screen 2 (VIP Recliner Lounge)',
      totalSeats: 60,
      layoutConfig: JSON.stringify({ rows: 5, columns: 12, aisleAfter: 6 }),
    },
  });
  screens.push(ambScreen2);

  const ambScreen3 = await prisma.screen.create({
    data: {
      theatreId: theatres[0].id,
      name: 'Screen 3 (Barco 4K Atmos)',
      totalSeats: 120,
      layoutConfig: JSON.stringify({ rows: 8, columns: 15, aisleAfter: 7 }),
    },
  });
  screens.push(ambScreen3);

  // PVR ICON Screens
  const pvrScreen1 = await prisma.screen.create({
    data: {
      theatreId: theatres[1].id,
      name: 'Audi 1 (4DX Experience)',
      totalSeats: 90,
      layoutConfig: JSON.stringify({ rows: 6, columns: 15, aisleAfter: 7 }),
    },
  });
  screens.push(pvrScreen1);

  const pvrScreen2 = await prisma.screen.create({
    data: {
      theatreId: theatres[1].id,
      name: 'Audi 2 (P[XL] Dolby Atmos)',
      totalSeats: 150,
      layoutConfig: JSON.stringify({ rows: 10, columns: 15, aisleAfter: 8 }),
    },
  });
  screens.push(pvrScreen2);

  const pvrScreen3 = await prisma.screen.create({
    data: {
      theatreId: theatres[1].id,
      name: 'Audi 3 (Gold Class Luxe)',
      totalSeats: 50,
      layoutConfig: JSON.stringify({ rows: 5, columns: 10, aisleAfter: 5 }),
    },
  });
  screens.push(pvrScreen3);

  // Prasads Multiplex Screens
  const prasadsScreen1 = await prisma.screen.create({
    data: {
      theatreId: theatres[2].id,
      name: 'Screen 6 (Prasads PCX Giant Screen)',
      totalSeats: 180,
      layoutConfig: JSON.stringify({ rows: 12, columns: 15, aisleAfter: 8 }),
    },
  });
  screens.push(prasadsScreen1);

  const prasadsScreen2 = await prisma.screen.create({
    data: {
      theatreId: theatres[2].id,
      name: 'Screen 1 (Dolby Atmos)',
      totalSeats: 120,
      layoutConfig: JSON.stringify({ rows: 8, columns: 15, aisleAfter: 7 }),
    },
  });
  screens.push(prasadsScreen2);

  // INOX GVK One Screens
  const inoxScreen1 = await prisma.screen.create({
    data: {
      theatreId: theatres[3].id,
      name: 'Screen 1 (Insignia 7-Star Luxe)',
      totalSeats: 70,
      layoutConfig: JSON.stringify({ rows: 5, columns: 14, aisleAfter: 7 }),
    },
  });
  screens.push(inoxScreen1);

  const inoxScreen2 = await prisma.screen.create({
    data: {
      theatreId: theatres[3].id,
      name: 'Screen 2 (Laser Dolby Atmos)',
      totalSeats: 130,
      layoutConfig: JSON.stringify({ rows: 9, columns: 15, aisleAfter: 7 }),
    },
  });
  screens.push(inoxScreen2);

  console.log(`✅ ${screens.length} screens created across 4 multiplexes`);

  // --- SEATS ---
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

  for (const scr of screens) {
    const layout = JSON.parse(scr.layoutConfig || '{"rows":6,"columns":12}');
    const seatData = [];

    const isAllReclinerScreen = 
      scr.id === ambScreen2.id || 
      scr.id === pvrScreen3.id || 
      scr.id === inoxScreen1.id;

    for (let r = 0; r < layout.rows; r++) {
      const rowLabel = rowLetters[r];
      for (let s = 1; s <= layout.columns; s++) {
        let category = 'REGULAR';
        if (isAllReclinerScreen) {
          category = 'RECLINER';
        } else if (r === 0) {
          category = 'ACCESSIBLE';
        } else if (r >= layout.rows - 2) {
          category = 'PREMIUM';
        }

        seatData.push({
          screenId: scr.id,
          rowLabel,
          seatNumber: s,
          category,
          isActive: true,
        });
      }
    }
    await prisma.seat.createMany({ data: seatData });
  }

  const seatTotal = await prisma.seat.count();
  console.log(`✅ ${seatTotal} physical cinema seats generated`);

  // --- SHOWS (Scheduled only for NOW_SHOWING blockbusters across 3 days) ---
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function getShowTime(dayOffset: number, hour: number, minute: number = 0) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  // Active Now Showing movies:
  // movies[0] = Kalki 2898 AD
  // movies[1] = Pushpa 2: The Rule
  // movies[2] = Devara: Part 1
  // movies[3] = Game Changer
  // movies[4] = Mathu Vadalara 2
  // movies[5] = Lucky Baskhar
  // movies[6] = Sankranthiki Vasthunam

  const showSchedule = [
    // --- Day 0 (Today) ---
    // AMB Cinemas
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 0, hour: 10, min: 30, reg: 295, prem: 450, recl: 750 },
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 0, hour: 14, min: 45, reg: 295, prem: 450, recl: 750 },
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 0, hour: 19, min: 0, reg: 350, prem: 500, recl: 800 },
    { movieId: movies[1].id, screenId: ambScreen2.id, day: 0, hour: 11, min: 15, reg: 450, prem: 600, recl: 850 },
    { movieId: movies[1].id, screenId: ambScreen2.id, day: 0, hour: 16, min: 30, reg: 450, prem: 600, recl: 850 },
    { movieId: movies[1].id, screenId: ambScreen2.id, day: 0, hour: 21, min: 30, reg: 500, prem: 650, recl: 900 },
    { movieId: movies[4].id, screenId: ambScreen3.id, day: 0, hour: 12, min: 0, reg: 250, prem: 380, recl: 600 },
    { movieId: movies[4].id, screenId: ambScreen3.id, day: 0, hour: 17, min: 15, reg: 280, prem: 420, recl: 650 },

    // PVR ICON
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 0, hour: 10, min: 15, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 0, hour: 15, min: 0, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 0, hour: 19, min: 45, reg: 350, prem: 520, recl: 800 },
    { movieId: movies[2].id, screenId: pvrScreen1.id, day: 0, hour: 11, min: 30, reg: 350, prem: 500, recl: 700 },
    { movieId: movies[2].id, screenId: pvrScreen1.id, day: 0, hour: 16, min: 45, reg: 350, prem: 500, recl: 700 },
    { movieId: movies[3].id, screenId: pvrScreen3.id, day: 0, hour: 13, min: 30, reg: 500, prem: 650, recl: 900 },
    { movieId: movies[3].id, screenId: pvrScreen3.id, day: 0, hour: 18, min: 30, reg: 550, prem: 700, recl: 950 },

    // Prasads Multiplex
    { movieId: movies[0].id, screenId: prasadsScreen1.id, day: 0, hour: 9, min: 30, reg: 250, prem: 380, recl: 600 },
    { movieId: movies[0].id, screenId: prasadsScreen1.id, day: 0, hour: 14, min: 0, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[0].id, screenId: prasadsScreen1.id, day: 0, hour: 18, min: 30, reg: 320, prem: 480, recl: 700 },
    { movieId: movies[5].id, screenId: prasadsScreen2.id, day: 0, hour: 11, min: 0, reg: 220, prem: 350, recl: 550 },
    { movieId: movies[5].id, screenId: prasadsScreen2.id, day: 0, hour: 15, min: 30, reg: 250, prem: 380, recl: 600 },
    { movieId: movies[6].id, screenId: prasadsScreen2.id, day: 0, hour: 20, min: 0, reg: 250, prem: 380, recl: 600 },

    // INOX GVK One
    { movieId: movies[2].id, screenId: inoxScreen2.id, day: 0, hour: 10, min: 45, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[2].id, screenId: inoxScreen2.id, day: 0, hour: 15, min: 15, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[2].id, screenId: inoxScreen2.id, day: 0, hour: 19, min: 45, reg: 320, prem: 460, recl: 700 },
    { movieId: movies[3].id, screenId: inoxScreen1.id, day: 0, hour: 12, min: 30, reg: 500, prem: 650, recl: 850 },
    { movieId: movies[3].id, screenId: inoxScreen1.id, day: 0, hour: 17, min: 30, reg: 550, prem: 700, recl: 900 },

    // --- Day 1 (Tomorrow) ---
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 1, hour: 10, min: 30, reg: 295, prem: 450, recl: 750 },
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 1, hour: 14, min: 45, reg: 295, prem: 450, recl: 750 },
    { movieId: movies[0].id, screenId: ambScreen1.id, day: 1, hour: 19, min: 0, reg: 350, prem: 500, recl: 800 },
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 1, hour: 11, min: 0, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 1, hour: 15, min: 30, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[1].id, screenId: pvrScreen2.id, day: 1, hour: 20, min: 0, reg: 350, prem: 520, recl: 800 },
    { movieId: movies[2].id, screenId: prasadsScreen1.id, day: 1, hour: 10, min: 0, reg: 250, prem: 380, recl: 600 },
    { movieId: movies[2].id, screenId: prasadsScreen1.id, day: 1, hour: 14, min: 30, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[3].id, screenId: inoxScreen2.id, day: 1, hour: 12, min: 15, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[5].id, screenId: ambScreen3.id, day: 1, hour: 13, min: 30, reg: 250, prem: 380, recl: 600 },
    { movieId: movies[6].id, screenId: pvrScreen1.id, day: 1, hour: 16, min: 0, reg: 300, prem: 450, recl: 650 },

    // --- Day 2 (Day After Tomorrow) ---
    { movieId: movies[0].id, screenId: prasadsScreen1.id, day: 2, hour: 10, min: 30, reg: 280, prem: 420, recl: 650 },
    { movieId: movies[0].id, screenId: prasadsScreen1.id, day: 2, hour: 15, min: 0, reg: 300, prem: 450, recl: 700 },
    { movieId: movies[1].id, screenId: ambScreen1.id, day: 2, hour: 11, min: 30, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[1].id, screenId: ambScreen1.id, day: 2, hour: 16, min: 0, reg: 320, prem: 480, recl: 750 },
    { movieId: movies[2].id, screenId: pvrScreen2.id, day: 2, hour: 13, min: 0, reg: 300, prem: 450, recl: 700 },
    { movieId: movies[4].id, screenId: inoxScreen2.id, day: 2, hour: 14, min: 30, reg: 260, prem: 400, recl: 620 },
  ];

  let showsCreated = 0;
  for (const s of showSchedule) {
    const startTime = getShowTime(s.day, s.hour, s.min);
    const movie = movies.find(m => m.id === s.movieId)!;
    const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60 * 1000);

    await prisma.show.create({
      data: {
        movieId: s.movieId,
        screenId: s.screenId,
        startTime,
        endTime,
        status: 'ACTIVE',
        regularPrice: s.reg,
        premiumPrice: s.prem,
        reclinerPrice: s.recl,
        convenienceFee: 30,
        taxRate: 0.18,
      },
    });
    showsCreated++;
  }

  console.log(`✅ ${showsCreated} active shows scheduled across Hyderabad multiplexes`);
  console.log('');
  console.log('🎬 CineBook database seeded successfully with authentic posters and metadata!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@cinebook.com / Admin@123456');
  console.log('  Customer: arjun@example.com / Customer@123');
  console.log('  Customer: priya@example.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
