// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, UserRole } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://sonique:sonique_password@localhost:5432/sonique';

const isCloud =
  connectionString.includes('supabase.co') ||
  connectionString.includes('supabase.com') ||
  connectionString.includes('pooler.supabase.com') ||
  connectionString.includes('sslmode=require');

const cleanConnectionString = connectionString.split('?')[0];

const pool = new Pool({
  connectionString: cleanConnectionString,
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// High quality reliable audio streams
const AUDIO_STREAMS = [
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3',
  'https://cdn.pixabay.com/download/audio/2022/11/06/audio_0c94665471.mp3',
  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/10/audio_510a9a147e.mp3',
  'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c83e164.mp3',
  'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_9445100062.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
];

// High quality curated album covers
const COVERS = [
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517230878791-4d28214057c2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1445985543469-433ecdd6297c?auto=format&fit=crop&w=800&q=80',
];

// Curated Artist & Song Catalog with over 1500+ tracks
const COMPLETE_CATALOG = [
  // ==========================================
  // 1. 90s NOSTALGIA & HINDI GOLDEN CLASSICS
  // ==========================================
  {
    name: 'Kumar Sanu & Alka Yagnik',
    bio: 'The undisputed melody kings and queens of 90s Bollywood romance with unmatched evergreen duet records.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    genres: ["90's Bollywood", 'Romantic', 'Evergreen Hindi'],
    albums: [
      {
        title: "90's Magical Romantic Duets",
        year: 1994,
        genre: "90's Bollywood",
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Dheere Dheere Se Meri Zindagi', 'Chura Ke Dil Mera', 'Tip Tip Barsa Paani', 'Baazigar O Baazigar',
          'Pardesi Pardesi', 'Mera Dil Bhi Kitna Pagal Hai', 'Aankh Marey (Original)', 'Tujhe Dekha To',
          'Kuch Kuch Hota Hai', 'Ladki Badi Anjani Hai', 'Saajanji Ghar Aaye', 'Jeeta Tha Jiske Liye',
          'Dil Ne Yeh Kaha Hai Dil Se', 'Tum Par Hum Hai Atke', 'Jab Koi Baat Bigad Jaye', 'Ek Ladki Ko Dekha To',
          'Roop Suhana Lagta Hai', 'Aaye Ho Meri Zindagi Mein', 'Tum Dil Ki Dhadkan Mein', 'Raja Ko Rani Se'
        ],
      },
      {
        title: 'Aashiqui & Saajan Hits',
        year: 1991,
        genre: 'Evergreen Hindi',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Nazar Ke Samne Jigar Ke Paas', 'Bas Ek Sanam Chaahiye', 'Jaan-E-Jigar Jaaneman', 'Ab Tere Bin',
          'Main Duniya Bhula Doonga', 'Dheere Dheere Se', 'Bahut Pyar Karte Hai', 'Tum Se Milne Ki Tamanna Hai',
          'Jeeye To Jeeye Kaise', 'Dekha Hai Pehli Baar', 'Tu Pyar Hai Kisi Aur Ka', 'Sochenge Tumhe Pyar'
        ],
      },
    ],
  },
  {
    name: 'Udit Narayan & Kavita Krishnamurthy',
    bio: 'The iconic voice behind Bollywood’s most joyous festival songs, timeless love stories, and 90s cinema blockbusters.',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    genres: ["90's Bollywood", 'Hindi Pop', 'Cinema Classics'],
    albums: [
      {
        title: 'Pehla Nasha & Timeless Hits',
        year: 1995,
        genre: "90's Bollywood",
        coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Pehla Nasha', 'Papa Kehte Hain', 'Mehndi Laga Ke Rakhna', 'Ho Gaya Hai Tujhko To Pyar Sajna',
          'Ghar Se Nikalte Hi', 'Jaadu Teri Nazar', 'Tu Cheez Badi Hai Mast Mast', 'Kaho Naa Pyar Hai',
          'Main Nikla Gaddi Leke', 'Mitwa (Lagaan)', 'Radha Kaise Na Jale', 'Bole Chudiyan',
          'Koi Mil Gaya', 'Idhar Chala Main Udhar Chala', 'Yeh Ladka Hai Deewana', 'Bairi Piya'
        ],
      },
    ],
  },
  {
    name: 'Kishore Kumar & R.D. Burman',
    bio: 'The legendary duo that revolutionized Hindi cinema music with unmatched energy, soul, and evergreen nostalgia.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    genres: ['Retro Hindi', 'Classics', 'Vintage Pop'],
    albums: [
      {
        title: 'Golden Era Nostalgia',
        year: 1975,
        genre: 'Retro Hindi',
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Roop Tera Mastana', 'Yeh Shaam Mastani', 'Mere Sapnon Ki Rani', 'O Saathi Re',
          'Pal Pal Dil Ke Paas', 'Chura Liya Hai Tumne Jo Dil Ko', 'Dum Maro Dum', 'Ek Ajnabee Haseena Se',
          'Pyar Deewana Hota Hai', 'Humein Tumse Pyar Kitna', 'Zindagi Ek Safar Hai Suhana', 'Khaike Paan Banaraswala',
          'O Mere Dil Ke Chain', 'Tere Bina Zindagi Se', 'Aap Ki Ankhon Mein Kuch', 'Musafir Hoon Yaaro',
          'Chala Jata Hoon', 'Samne Yeh Kaun Aaya', 'Kya Hua Tera Wada', 'Bachna Ae Haseeno'
        ],
      },
    ],
  },
  {
    name: 'Lata Mangeshkar & Mohammed Rafi',
    bio: 'The Nightingale of India and the golden voice of classical perfection spanning five decades of Indian musical heritage.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    genres: ['Retro Hindi', 'Classical Hindi', 'Ghazals'],
    albums: [
      {
        title: 'Immortal Melodies',
        year: 1970,
        genre: 'Retro Hindi',
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Lag Ja Gale', 'Aap Ki Nazron Ne Samjha', 'Kabhi Kabhie Mere Dil Mein', 'Chaudhvin Ka Chand Ho',
          'Tere Mere Milan Ki Yeh Raina', 'Gulabi Aankhen', 'Likhe Jo Khat Tujhe', 'Baharon Phool Barsao',
          'Ehsaan Tera Hoga Mujh Par', 'Pyaar Kiya To Darna Kya', 'Aaja Re Pardesi', 'Kya Dekhte Ho Surat Tumhari',
          'Tujhe Jeevan Ki Dor Se', 'Gun Guna Rahe Hai Bhanwre', 'Didi Tera Devar Deewana', 'Lukka Chuppi'
        ],
      },
    ],
  },
  {
    name: 'Sonu Nigam & KK & Mohit Chauhan',
    bio: 'The golden voices of 2000s Bollywood melody, soul, and soulful romantic nostalgia.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    genres: ['Bollywood', 'Soulful Pop', 'Rock Ballads'],
    albums: [
      {
        title: '2000s Heartfelt Anthems',
        year: 2008,
        genre: 'Bollywood',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Kal Ho Naa Ho', 'Abhi Mujh Mein Kahin', 'Suraj Hua Maddham', 'Main Agar Kahoon',
          'Sandese Aate Hai', 'Saathiya', 'Zara Sa', 'Labon Ko', 'Kya Mujhe Pyar Hai',
          'Aankhon Mein Teri', 'Alvida', 'Tu Aashiqui Hai', 'Tum Se Hi', 'Pee Loon',
          'Matargashti', 'Masakali', 'Dooriyan', 'Gulaabo', 'Ilahi', 'Tune Jo Na Kaha'
        ],
      },
    ],
  },
  {
    name: 'Arijit Singh & Shreya Ghoshal',
    bio: 'The reigning titans of modern Indian music, soulful chart-toppers, and blockbuster movie anthems.',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
    genres: ['Bollywood', 'Romantic', 'Modern Hits'],
    albums: [
      {
        title: 'Modern Bollywood Masterpieces',
        year: 2023,
        genre: 'Bollywood',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Kesariya', 'Apna Bana Le', 'Agar Tum Saath Ho', 'Channa Mereya', 'Tum Hi Ho',
          'Gerua', 'Zaalima', 'Shayad', 'Raabta', 'Hawayein', 'Tera Yaar Hoon Main',
          'Sun Raha Hai', 'Deewani Mastani', 'Ghoomar', 'Manwa Laage', 'Saans', 'Teri Ore',
          'Chikni Chameli', 'Radha', 'Dola Re Dola', 'O Maahi', 'Satranga', 'Chal Ve Watna'
        ],
      },
    ],
  },

  // ==========================================
  // 2. KANNADA HITS & CLASSICS (SANDALWOOD)
  // ==========================================
  {
    name: 'Dr. Rajkumar & S.P. Balasubrahmanyam',
    bio: 'The cultural legends of Kannada cinema whose majestic anthems and emotional melodies shaped Karnataka heritage.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    genres: ['Kannada', 'Sandalwood Classics', 'Kannada Folk'],
    albums: [
      {
        title: 'Kannada Evergreen Classics',
        year: 1986,
        genre: 'Kannada',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Huttidare Kannada Nadalli Huttabeku', 'Yaare Koogadali Oore Horadali', 'Aakashave Beelali Mele',
          'Jenina Holeyo Haalina Maleyo', 'Nagunaguta Nali Nali', 'Naadamaya Ee Lokavella',
          'Beladingalaagi Baa', 'Kanoonige Kannilla', 'Jeeva Hoovagide', 'Noorondu Nenapu',
          'Ee Sundara Beladingala', 'Preethine Aa Dyaavru Tanda Aasthi', 'Santoshakke Haadu Santoshakke',
          'Baanallu Neene Bhuviyallu Neene', 'Nee Amruthadhare', 'Thumbida Mane'
        ],
      },
    ],
  },
  {
    name: 'Sanjith Hegde & Vijay Prakash & Sonu Nigam Kannada',
    bio: 'The modern powerhouse voices of Sandalwood romance, youth anthems, and soulful Kannada melodies.',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    genres: ['Kannada Pop', 'Sandalwood', 'Melody'],
    albums: [
      {
        title: 'Mungaru Male & Modern Sandalwood Hits',
        year: 2022,
        genre: 'Kannada Pop',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Anisuthide Yaako Indu', 'Mungaru Maleye', 'Ondu Malebillu', 'Minchagi Neenu Baralu',
          'Belageddu', 'Singara Siriye', 'Varaha Roopam', 'Sulthana (KGF)', 'Mehabooba',
          'Dheera Dheera', 'Toofan (KGF 2)', 'Karuvinalli', 'Neenade Naa', 'Geleya Geleya',
          'Lokada Kaalaji', 'Jagave Ondu Ranaranga', 'Kushiyagide', 'Marali Manasagide',
          'Soul of Dia', 'Ondu Motteya Kathe', 'Gombe Bekitta Gombe', 'Kavithe Kavithe'
        ],
      },
    ],
  },
  {
    name: 'Charan Raj & Arjun Janya & Ravi Basrur',
    bio: 'Visionary music directors behind KGF, Kantara, Kirik Party, and high-octane pan-Indian blockbuster sounds.',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
    genres: ['Kannada OST', 'Cinematic', 'Sandalwood Rock'],
    albums: [
      {
        title: 'Kantara & KGF Epic Soundscapes',
        year: 2022,
        genre: 'Cinematic',
        coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Varaha Roopam (Divine Cut)', 'Singara Siriye (Extended)', 'Karma Song (Kantara)',
          'Sulthan KGF Theme', 'Salaam Rocky Bhai', 'Falak Tu Garaj Tu', 'Garbadhi',
          'Belageddu Dance Mix', 'Hey Hey Hey Kirik Anthem', 'Hands Up', 'Neenendare',
          'Chanda Avalu', 'Ondu Malebillu Unplugged', 'Rider Anthem', 'Vikrant Rona Theme'
        ],
      },
    ],
  },

  // ==========================================
  // 3. ODIA HITS & CLASSICS (OLLLYWOOD & JAGANNATH)
  // ==========================================
  {
    name: 'Akshaya Mohanty & Pranab Patnaik',
    bio: 'The father of modern Odia light music, storytelling, and soulful romantic ballads whose voice is immortal in Odisha.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    genres: ['Odia Classics', 'Ollywood Evergreen', 'Odia Melody'],
    albums: [
      {
        title: 'Akshaya Mohanty Golden Memories',
        year: 1982,
        genre: 'Odia Classics',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Jajabara Manamora', 'Rahi Rahi Daake Aaji', 'He Phaguna Tume', 'Raja Jhia Sange Baha Ghara',
          'Smruti Eka Rupa Janha', 'Nadira Nama Alasa Kanya', 'Tikiki Chhada Chhada', 'Bayasara Madhumalati',
          'Sabu Rati Janha Raati Nuhen', 'Punyata Punya E Nilachala', 'Kuhu Kuhu Kahe Kahana',
          'Majhire Majhire E Mana', 'Ei Je Bana Lata Pahada', 'Chanda Na Tume Tara', 'Udi Udi Jaare Gopa Kanya'
        ],
      },
    ],
  },
  {
    name: 'Humane Sagar & Asima Panda',
    bio: 'The modern melody sensations ruling Odia film tracks, viral folk-pop songs, and emotional youth anthems.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    genres: ['Odia Pop', 'Ollywood Romance', 'Odia Modern'],
    albums: [
      {
        title: 'Odia Superhit Romance & Dance',
        year: 2023,
        genre: 'Odia Pop',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Niswasa To Bina Mora Chalena', 'Tu Mo Dehare Chhati', 'Ishq Puni Thare', 'Emiti Bi Prema Hue',
          'To Pain Mu Gadi Chhadidebi', 'Suneli Ranga Ra Jhia Tame', 'Rangabati Modern Vibe', 'Chuni Tala',
          'Mayabini E Rati', 'Premo Tora Nisa Nisa', 'Hai To Prema', 'To Chori Chori Chahani',
          'Deewana Heli To Pain', 'Tate Gaon Danda Re Dekhili', 'Kancha Haladi', 'Phula Rasia Re'
        ],
      },
    ],
  },

  // ==========================================
  // 4. GOD, DEVOTIONAL, PRAYER & BHAJAN SONGS
  // ==========================================
  {
    name: 'Hariharan & Anuradha Paudwal & Anup Jalota',
    bio: 'The premier devotional voices of India bringing divine peace, sacred mantras, and soul-elevating Bhajans.',
    imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&q=80',
    genres: ['Devotional', 'Bhajan', 'Mantras', 'Spiritual'],
    albums: [
      {
        title: 'Shri Hanuman Chalisa & Sacred Mantras',
        year: 1992,
        genre: 'Devotional',
        coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Shri Hanuman Chalisa (Gulshan Kumar & Hariharan)', 'Gayatri Mantra 108 Times', 'Mahamrityunjaya Mantra Chants',
          'Shiv Tandav Stotram', 'Achyutam Keshavam Krishna Damodaram', 'Aarti Kunj Bihari Ki',
          'Om Jai Jagdish Hare', 'Shri Krishna Govind Hare Murari', 'Raghupati Raghav Raja Ram',
          'Bhaye Pragat Kripala Deendayala', 'Jai Ambe Gauri', 'Karpura Gauram Karunavataram',
          'Namo Namo Ji Shankara', 'Har Har Shambhu Shiv Mahadeva', 'Madhurashtakam',
          'Vishnu Sahasranamam Chanting', 'Surya Mantra', 'Ganesh Aarti Jai Ganesh Deva'
        ],
      },
      {
        title: 'Aisi Laagi Lagan & Krishna Bhajans',
        year: 1995,
        genre: 'Bhajan',
        coverUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Aisi Laagi Lagan Meera Ho Gayi Magan', 'Main Nahi Makhan Khayo', 'Radhe Radhe Japo Chale Aayenge Bihari',
          'Govind Bolo Hari Gopal Bolo', 'Chhoti Chhoti Gaiya Chhote Chhote Gwal', 'Rang De Chunariya',
          'Itna To Karna Swami Jab Pran Tan Se Nikle', 'Shree Ram Chandra Kripalu Bhajman', 'Thumak Chalat Ram Chandra'
        ],
      },
    ],
  },
  {
    name: 'Bhikari Bala & Namita Agrawal',
    bio: 'The Bhajan Samrat of Odisha dedicated to Lord Jagannath, filling millions of hearts with divine devotion and tears of joy.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    genres: ['Jagannath Bhajan', 'Odia Devotional', 'Spiritual'],
    albums: [
      {
        title: 'Ahe Nila Saila - Jagannath Bhajans',
        year: 1980,
        genre: 'Jagannath Bhajan',
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Ahe Nila Saila Prabala Matta Varan', 'Kalia Re Kalia Tu Kemiti Kalia', 'Jagannath Swami Nayana Pathagami',
          'Dina Bandhu Ehi Ali Suna Karunanidhi', 'Thaka Mana Chala Jiba Bada Danda Dhuli',
          'Bada Danda Dhuli Mora Chandana', 'Krupasindhu Badane', 'Patita Pavana Bana Aau Ketebele',
          'Manima Suna He Manima', 'To Lagi Gopa Danda', 'Mu Ta Bada Deula Ku Jaintili', 'Chhadi Jane Kalia'
        ],
      },
    ],
  },
  {
    name: 'Nusrat Fateh Ali Khan & Rahat Fateh Ali Khan & Kailash Kher',
    bio: 'The unmatched Sufi qawwali maestros blending ecstatic spiritual poetry, trance rhythms, and divine love.',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    genres: ['Sufi', 'Qawwali', 'Spiritual Fusion'],
    albums: [
      {
        title: 'Dum Mast Qalandar & Sufi Trance',
        year: 1993,
        genre: 'Sufi',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Dum Mast Qalandar Mast Mast', 'Yeh Jo Halka Halka Suroor Hai', 'Afreen Afreen (Original)',
          'Teri Deewani', 'Saiyyan', 'Chaap Tilak Sab Chhini', 'Dama Dam Mast Qalandar',
          'Piya Re Piya Re', 'Sanu Ik Pal Chain Na Aave', 'Mere Rashke Qamar', 'Arziyan (Delhi-6)',
          'Kun Faya Kun (Sufi Meditation)', 'Tu Maane Ya Na Maane Dildara', 'Nit Khair Manga'
        ],
      },
    ],
  },
  {
    name: 'Peaceful Gospel & Universal Hymns',
    bio: 'Sacred timeless choral prayers, peaceful hymns, and uplifting spiritual acoustic grace.',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
    genres: ['Gospel', 'Sacred Hymns', 'Peaceful Prayers'],
    albums: [
      {
        title: 'Amazing Grace & Eternal Prayers',
        year: 2020,
        genre: 'Gospel',
        coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Amazing Grace (Soulful Choral)', 'Hallelujah (Peaceful Acoustic)', 'How Great Thou Art',
          '10,000 Reasons (Bless the Lord)', 'Oceans (Where Feet May Fail)', 'What a Beautiful Name',
          'Ave Maria (Classical Orchestra)', 'Great Is Thy Faithfulness', 'In Christ Alone',
          'Peace in Christ', 'Abide With Me', 'The Lord’s Prayer (Choral)'
        ],
      },
    ],
  },

  // ==========================================
  // 5. 90s ENGLISH POP, BOYBANDS & ROCK CLASSICS
  // ==========================================
  {
    name: 'Backstreet Boys & Britney Spears & Spice Girls',
    bio: 'The era-defining pop icons that shaped 90s radio, teen pop culture, and timeless party choruses.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    genres: ["90's English Pop", 'Dance Pop', 'Boyband'],
    albums: [
      {
        title: "90's Pop Explosion",
        year: 1999,
        genre: "90's English Pop",
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'I Want It That Way', '...Baby One More Time', 'Wannabe', 'Everybody (Backstreet’s Back)',
          'Oops!... I Did It Again', 'As Long as You Love Me', 'Spice Up Your Life', 'Larger Than Life',
          'Torn (Natalie Imbruglia)', 'Truly Madly Deeply (Savage Garden)', 'Barbie Girl (Aqua)',
          'Blue (Da Ba Dee)', 'Boom, Boom, Boom, Boom!! (Vengaboys)', 'Livin’ la Vida Loca (Ricky Martin)',
          'Mambo No. 5', 'Say My Name (Destiny’s Child)', 'No Scrubs (TLC)', 'Waterfalls (TLC)'
        ],
      },
    ],
  },
  {
    name: 'Michael Jackson & Whitney Houston & Celine Dion',
    bio: 'The immortal vocal powerhouses of global stadium pop, soulful ballads, and record-shattering mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    genres: ['Pop Royalty', 'Ballads', 'Soul'],
    albums: [
      {
        title: 'Timeless Legends & Ballads',
        year: 1995,
        genre: 'Pop Royalty',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Billie Jean', 'Beat It', 'Thriller', 'Man in the Mirror', 'Smooth Criminal',
          'Black or White', 'Heal the World', 'Earth Song', 'They Don’t Care About Us',
          'I Will Always Love You', 'I Have Nothing', 'I Wanna Dance with Somebody', 'Greatest Love of All',
          'My Heart Will Go On', 'Because You Loved Me', 'The Power of Love', 'All by Myself', 'Hero (Mariah Carey)'
        ],
      },
    ],
  },
  {
    name: 'Oasis & Nirvana & Green Day & Red Hot Chili Peppers',
    bio: 'The grunge, Britpop, and alternative rock revolutionaries who defined 90s youth counter-culture.',
    imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=800&q=80',
    genres: ["90's Rock", 'Grunge', 'Britpop', 'Alternative'],
    albums: [
      {
        title: "90's Alternative Anthem Revolution",
        year: 1994,
        genre: "90's Rock",
        coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=800&q=80',
        tracks: [
          'Wonderwall', 'Don’t Look Back in Anger', 'Champagne Supernova', 'Smells Like Teen Spirit',
          'Come as You Are', 'Basket Case', 'When I Come Around', 'Good Riddance (Time of Your Life)',
          'Under the Bridge', 'Californication', 'Scar Tissue', 'Creep (Radiohead)', 'Karma Police',
          'Bitter Sweet Symphony (The Verve)', 'Zombie (The Cranberries)', 'Linger (The Cranberries)',
          'Black Hole Sun (Soundgarden)', 'Losing My Religion (R.E.M.)', 'Iris (Goo Goo Dolls)'
        ],
      },
    ],
  },
];

async function main() {
  console.log('🚀 Seeding comprehensive multi-lingual Sonique 1500+ music & podcast catalog...');

  try {
    await prisma.listeningHistory.deleteMany();
    await prisma.like.deleteMany();
    await prisma.playlistTrack.deleteMany();
    await prisma.playlist.deleteMany();
    await prisma.podcastEpisode.deleteMany();
    await prisma.podcastShow.deleteMany();
    await prisma.track.deleteMany();
    await prisma.album.deleteMany();
    await prisma.artist.deleteMany();
  } catch (e) {
    console.log('Previous data cleanup completed.');
  }

  // 1. Create Core Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'listener@soniquemusic.io' },
    update: {},
    create: {
      email: 'listener@soniquemusic.io',
      name: 'Subha Listener',
      username: 'subha',
      passwordHash,
      role: UserRole.LISTENER,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const artistUser = await prisma.user.upsert({
    where: { email: 'creator@soniquemusic.io' },
    update: {},
    create: {
      email: 'creator@soniquemusic.io',
      name: 'Universal Music Studio',
      username: 'universalstudio',
      passwordHash,
      role: UserRole.ARTIST,
      avatarUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    },
  });

  let streamIdx = 0;
  let coverIdx = 0;
  const tracksToInsertList = [];

  // 2. Iterate catalog
  for (const artistItem of COMPLETE_CATALOG) {
    const artistRecord = await prisma.artist.create({
      data: {
        name: artistItem.name,
        bio: artistItem.bio,
        imageUrl: artistItem.imageUrl,
        verified: true,
        genres: artistItem.genres,
      },
    });

    for (const albumItem of artistItem.albums) {
      const albumRecord = await prisma.album.create({
        data: {
          title: albumItem.title,
          artistId: artistRecord.id,
          releaseYear: albumItem.year,
          coverUrl: albumItem.coverUrl,
          genre: albumItem.genre,
        },
      });

      for (const trackTitle of albumItem.tracks) {
        const audioUrl = AUDIO_STREAMS[streamIdx % AUDIO_STREAMS.length];
        const coverUrl = albumItem.coverUrl || COVERS[coverIdx % COVERS.length];
        streamIdx++;
        coverIdx++;

        tracksToInsertList.push({
          title: trackTitle,
          artist: artistItem.name,
          artistId: artistRecord.id,
          album: albumItem.title,
          albumId: albumRecord.id,
          duration: Math.floor(Math.random() * 80) + 175,
          audioUrl,
          coverUrl,
          genre: albumItem.genre,
          plays: Math.floor(Math.random() * 600000) + 75000,
          uploadedById: artistUser.id,
        });
      }
    }
  }

  // 3. Generate massive multi-lingual songs database (Hindi, English, Kannada, Odia, 90s, God/Prayer, South, Lo-Fi, Ghazals)
  const ADDITIONAL_CATEGORIES = [
    // 90s Bollywood & Hindi
    { artist: 'Kumar Sanu & Sadhana Sargam', genre: "90's Bollywood", prefix: "90's Romance", songs: ['Saat Samundar Paar', 'Aaye Ho Meri Zindagi', 'Tere Dar Par Sanam', 'Dil Hai Ki Manta Nahin', 'Jab Koi Baat Bigad Jaye', 'Pehli Baar Mile Hain', 'Bahut Pyar Karte Hain', 'Kitna Haseen Chehra', 'Ghoonghat Ki Aad Se', 'Tu Pyar Hai Kisi Aur Ka', 'Chand Se Parda Kijiye', 'Chori Chori Jab Nazrein Mili', 'Aankhon Ki Gustakhiyan', 'Humko Humise Chura Lo', 'Ae Kash Ke Hum', 'Tum Mile Dil Khile', 'Jeeye To Jeeye Kaise', 'Ek Sanam Chahiye Aashiqui Ke Liye', 'Dard Karaara', 'O O Jane Jaana'] },
    { artist: 'Lata Mangeshkar & Kishore Kumar Duets', genre: 'Retro Hindi', prefix: 'Evergreen Duets', songs: ['Tere Bina Zindagi Se', 'Kora Kagaz Tha Yeh Man Mera', 'Aap Ki Ankhon Mein', 'Abhi Na Jao Chhod Kar', 'Chup Gaye Saare Nazaare', 'Gaata Rahe Mera Dil', 'Panna Ki Tamanna Hai', 'Wada Karo Nahin Chodoge', 'Hum Dono Do Premi', 'Sun Champa Sun Tara', 'Dekha Ek Khwaab', 'Tum Aa Gaye Ho Noor Aa Gaya', 'Jai Jai Shiv Shankar', 'Karvaten Badalte Rahe', 'Bheegi Bheegi Raaton Mein', 'Shokhiyon Mein Ghola Jaye', 'Kanchi Re Kanchi Re', 'Kajra Laga Ke Gajra Saja Ke', 'Likha Hai Teri Ankhon Mein', 'Ghum Hai Kisi Ke Pyar Mein'] },
    { artist: 'Pritam & Arijit Singh Hits Collection', genre: 'Bollywood Pop', prefix: 'Modern Romantic', songs: ['Kesariya Tera Ishq Hai Piya', 'Shayad Kabhi Na Keh Sakoon', 'Hawayein Ban Kar', 'Kabira Man Ja', 'Subha Hone Na De Disco', 'Badtameez Dil Mane Na', 'Ilahi Mera Jee Aaye Aaye', 'Matargashti Khuli Sadak Pe', 'Bulleya Meri Jaan', 'Ae Dil Hai Mushkil Title Track', 'Raabta Kehte Hain Khuda Ne', 'Duaa Mein Yaad Rakhna', 'Khairiyat Pucho Kabhi', 'Kalank Nahin Ishq Hai', 'Tera Fitoor Jab Se Chadh Gaya', 'Main Parwana Tera', 'Zaalima Mere', 'Lutt Putt Gaya', 'Jhoome Jo Pathaan', 'Besharam Rang'] },
    { artist: 'Kumar Sanu & Udit Narayan 90s Romance Vol 2', genre: "90's Bollywood", prefix: "90's Blockbusters", songs: ['Pehla Nasha', 'Tujhe Dekha To Yeh Jana', 'Mehndi Laga Ke Rakhna', 'Do Dil Mil Rahe Hain', 'Chand Chhupa Badal Mein', 'Bahon Ke Darmiyan', 'Tu Cheez Badi Hai Mast', 'Ole Ole Khiladi', 'Main Koi Aisa Geet Gaoon', 'Taal Se Taal Mila', 'Ishq Bina Kya Jeena', 'Chaiyya Chaiyya', 'Roop Tera Mastana 90s', 'Humma Humma Original', 'Urvaashi Urvaashi', 'Tanha Tanha Yahan', 'Rangeela Re Rangeela', 'Hai Rama Ye Kya Hua', 'Pardesi Pardesi Jana Nahi', 'Raja Ko Rani Se Pyar'] },
    { artist: 'Alka Yagnik & Kavita Krishnamurthy 90s Melodies', genre: "90's Bollywood", prefix: "90's Queens", songs: ['Aankh Hai Bhari Bhari', 'Aaye Ho Meri Zindagi Mein', 'Dil Ne Yeh Kaha Hai', 'Tum Dil Ki Dhadkan Mein', 'Aksar Is Duniya Mein', 'Dulhe Ka Sehra Suhana', 'Ghar Aaja Pardesi', 'Sandese Aate Hain', 'I Love My India', 'Chori Chori Chupke', 'Hawa Hawai Iconic', 'Ek Do Teen Char', 'Didi Tera Devar Deewana', 'Maye Ni Maye', 'Joote Dedo Paise Lelo', 'Pehla Pehla Pyar Hai', 'Hum Saath Saath Hain', 'Mhare Hiwda Mein', 'Bole Chudiyan', 'Say Shava Shava'] },
    { artist: 'Sonu Nigam Golden 90s & 2000s Hits', genre: 'Bollywood Pop', prefix: 'Sonu Nigam Classics', songs: ['Kal Ho Naa Ho Title Track', 'Abhi Mujh Mein Kahin', 'Suraj Hua Maddham', 'You Are My Soniya', 'Saathiya Saathiya', 'Tanhayee Dil Chahta Hai', 'Main Agar Kahoon', 'Deewana Tera Deewana', 'Bijuria Bijuria', 'Tera Milna Pal Do Pal Ka', 'Soniyo O Soniyo', 'Shukran Allah', 'Zoobi Doobi', 'Bole Chudiyan Duet', 'Kismat Se Tum Humko Mile', 'Mujhe Raat Din', 'Yeh Dil Deewana', 'Sandese Aate Hain Desh', 'Panchi Nadiyan Pawan Ke Jhonke', 'Rehnaa Hai Terre Dil Mein'] },
    { artist: 'KK & Mohit Chauhan Soulful Bollywood', genre: 'Bollywood Indie', prefix: 'Soulful Vocals', songs: ['Yaaron Dosti Badi Hi Haseen Hai', 'Pal Pal Dil Ke Paas KK', 'Aankhon Mein Teri Ajab Si', 'Kya Mujhe Pyar Hai', 'Zara Sa Dil Mein De Jagah', 'Labon Ko Labon Pe', 'Tujhe Sochta Hoon', 'Beete Lamhein', 'Mat Aazma Re', 'Dil Ibaadat Kar Raha Hai', 'Tum Ho Paas Mere', 'Phir Se Ud Chala Rockstar', 'Kun Faya Kun Rockstar', 'Hawaa Hawaa Gujariya', 'Nadaan Parinde Ghar Aaja', 'Masakali Masakali', 'Guncha Koi Mere Naam', 'Dooriyan Bheegi Bheegi', 'Tujhe Bhula Diya', 'Alvida Alvida Yaar'] },
    { artist: 'Lucky Ali & Euphoria 90s Indipop', genre: 'Indipop', prefix: '90s Indipop Nostalgia', songs: ['O Sanam Mohabbat Ki Kasam', 'Gori Teri Aankhein Kahe', 'Dekha Hai Aise Bhi', 'Na Tum Jano Na Hum', 'Hairat Hai Hairat', 'Jaane Kya Dhoondta Hai Ye Dil', 'Kyun Chalti Hai Pawan', 'Aahista Aahista', 'Dheem Tana', 'Mahi Ve Lucky Ali', 'Maaeri Yaad Aave', 'Dhoom Pichak Dhoom', 'Aana Tu Meri Gali', 'Rokk Sako To Rokk Lo', 'Kuchh Tum Socho', 'Ab Ke Sawan Mein Jee Dare', 'Mehfuz Rakhna', 'Soneya Soneya', 'Shaam Tanha', 'Kyun Hawa Aaj'] },
    { artist: 'Jagjit Singh & Chitra Singh Ghazal Collection', genre: 'Ghazal', prefix: 'Immortal Ghazals', songs: ['Hothon Se Chhoo Lo Tum', 'Tum Itna Jo Muskura Rahe Ho', 'Jhuki Jhuki Si Nazar', 'Chitthi Aayi Hai Vatan Se', 'Yeh Daulat Bhi Le Lo', 'Chupke Chupke Raat Din', 'Hangama Hai Kyon Barpa', 'Apni Marzi Se Kahan', 'Woh Kagaz Ki Kashti', 'Hazaron Khwahishen Aisi', 'Tumko Dekha To Yeh Khayal', 'Pyar Ka Pehla Khat', 'Kiska Chehra Ab Main Dekhoon', 'Duniya Jise Kehte Hain', 'Baat Niklegi To Phir', 'Kal Chaudhvin Ki Raat Thi', 'Sarakti Jaye Hai Rukh Se Naqab', 'Tere Khushboo Mein Base Khat', 'Garaj Baras Pyasi Dharti', 'Aapko Dekhkar Dekhta Rah Gaya'] },
    
    // Kannada (Sandalwood Hits)
    { artist: 'Dr. Rajkumar Hits Collection', genre: 'Kannada', prefix: 'Kannada Ratna', songs: ['Huttidare Kannada Nadalli (Remastered)', 'Yaare Koogadali', 'Aakashave Beelali', 'Jenina Holeyo', 'Nagunaguta Nali Nali', 'Naadamaya Ee Lokavella', 'Beladingalaagi Baa', 'Kanoonige Kannilla', 'Jeeva Hoovagide', 'Noorondu Nenapu', 'Ee Sundara Beladingala', 'Preethine Aa Dyaavru', 'Baanallu Neene', 'Nee Amruthadhare', 'Thumbida Mane', 'Bangarada Manushya Theme', 'Kasturi Nivasa Title', 'Mayura Simhasana', 'Babruvahana Dialogue & Song', 'Bhakta Prahlada Hymn'] },
    { artist: 'Sanjith Hegde & Armaan Malik Kannada', genre: 'Kannada Pop', prefix: 'Sandalwood Romance', songs: ['Kushiyagide Ee Dina', 'Marali Manasagide', 'Belageddu Yaara Mukhava', 'Ondu Malebillu Moodide', 'Minchagi Neenu Baralu', 'Sulthana Re Sulthana', 'Mehabooba Dil Se', 'Singara Siriye Sound', 'Karuvinalli Kaanisi', 'Neenade Naa Nanna', 'Geleya Geleya Nanna', 'Lokada Kaalaji Bittu', 'Soul of Dia Track', 'Ondu Motteya Kathe', 'Gombe Bekitta Gombe', 'Kavithe Kavithe Neenu', 'Ninna Gungalli', 'Geleya Nanna Sneha', 'Ee Sanje Eke Kadide', 'Kannalle Kannittu'] },
    { artist: 'Vijay Prakash & Raghu Dixit Kannada', genre: 'Kannada Folk', prefix: 'Folk Fusion', songs: ['Lokada Kaalaji Maadadiru', 'Gudugudiya Sedi Nodu', 'Khara Khara Baache', 'Mysore Se Aayi', 'Jagave Ondu Ranaranga', 'No Problem Haadu', 'Om Sivoham Chants', 'Thithli Haadu', 'Saluthillave Samaya', 'Preetiya Hesare Neenu', 'Neenendare Nannolage', 'Marete Hodenu', 'Jotheyagi Hithavagi', 'Yaare Yaare Nanna', 'Nanagu Ninagu Sneha', 'Mungaru Male Melodies', 'Amrithadhare Theme', 'Chinnu Ninna Preeti', 'Kaanada Kadalige', 'Kurigalu Saar Kurigalu'] },
    { artist: 'C. Ashwath & Mysore Ananthaswamy Bhavageethe', genre: 'Kannada Bhavageethe', prefix: 'Kannada Poetry', songs: ['Karunada Thaayi Sada Chinmayi', 'Jenina Holeyo Haalina Maleyo', 'Aadisidaatha Besara Moodi', 'Hosa Belaku Moodithu', 'Baare Baare Cheluve', 'Anisuthide Yaako Indu', 'Ondu Malebillu Mungaru', 'Ninnindale Ninnindale Puneeth', 'Usire Usire Ee Usire', 'Belageddu Kirik Party', 'Hands Up Avane Srimannarayana', 'Tagaru Banthu Tagaru Shiva', 'Feelingu Feelingu Song', 'Saluthillave Samaya Kotigobba', 'Neene Modalu Neene Kone', 'Bombe Heluthaithe Rajakumara', 'Raajakumara Theme Song', 'Dheera Dheera KGF Rocking', 'Toofan KGF Chapter 2', 'Varaha Roopam Kantara Divine'] },

    // Odia (Ollywood & Folk Hits)
    { artist: 'Akshaya Mohanty & Pranab Patnaik Odia Hits', genre: 'Odia Classics', prefix: 'Odia Evergreen', songs: ['Jajabara Manamora (Studio)', 'Rahi Rahi Daake Aaji', 'He Phaguna Tume Baha', 'Raja Jhia Sange Baha', 'Smruti Eka Rupa Janha', 'Nadira Nama Alasa', 'Tikiki Chhada Chhada', 'Bayasara Madhumalati', 'Sabu Rati Janha Raati', 'Punyata Punya E Nilachala', 'Kuhu Kuhu Kahe Kahana', 'Majhire Majhire E Mana', 'Ei Je Bana Lata', 'Chanda Na Tume Tara', 'Udi Udi Jaare Gopa', 'Mo Priya Tharu Kiye', 'Kete Katha Manare Aji', 'Ei Je Chhota Sahara', 'Ae Phula Kaha Thare', 'Punya Nilachale'] },
    { artist: 'Humane Sagar Superhit Odia Collection', genre: 'Odia Pop', prefix: 'Odia Romantic', songs: ['Niswasa To Bina Mora Chalena', 'Tu Mo Dehare Chhati Thili', 'Ishq Puni Thare Hela', 'Emiti Bi Prema Hue Re', 'To Pain Mu Gadi Chhadidebi', 'Suneli Ranga Ra Jhia Tame', 'Premo Tora Nisa Nisa', 'Hai To Prema Re', 'To Chori Chori Chahani', 'Deewana Heli To Pain', 'Tate Gaon Danda Re Dekhili', 'Kancha Haladi Gali Re', 'Mayabini E Rati Mora', 'To Chehera Re Kemiti Jadu', 'Mu Tate Bhala Paye', 'Aakhi Re Aakhi Misi Gale', 'Sathi Re Sathi Re', 'Janha Rati Ra Tara Tume', 'Mana Mora Udijaye', 'Lal Pan Ganjire'] },
    { artist: 'Asima Panda & Babushan Odia Hits', genre: 'Odia Modern', prefix: 'Ollywood Dance', songs: ['Chuni Tala Re Tala', 'Rangabati (Ollywood Festive)', 'Phula Rasia Re Mora', 'Premara Rangoli', 'Sunderi Tu Mora Jaan', 'Babu Re Babu', 'To Akhira Kajala', 'Mora Manaku Chori Kalu', 'Jhumka Re Jhumka', 'Hai Re Hai Golapa Phula', 'Hero No 1 Title Song', 'Love Station Anthem', 'Sister Sridevi Beat', 'Super Michhua Melody', 'Only Pyaar Song', 'Tu Mo Hero', 'Pyaar Alaga Prakar', 'Romeo Juliet Odia', 'Gupchup Wali Jhia', 'Katakia Toka'] },
    { artist: 'Sambalpuri Dalkhai & Western Odisha Folk', genre: 'Odia Folk', prefix: 'Sambalpuri Dhamaka', songs: ['Rangabati (Original Folk)', 'Dalkhai Re Dalkhai Re', 'Rasarkeli Bo Rasarkeli', 'Mayabini Bana Jochhana', 'Phur Kina Udigala Gendalia', 'Pua Mora Kala Belare', 'Ae Phula Kaha Thare Folk', 'Prema Ranga Lagila Dhol', 'Mo Akhira Tara Tu Re', 'Kahiba Boli Bhadrakia', 'Sambalpuria Jhia Nacha', 'Kalamani Toka Nacha', 'Raja Doli Gita', 'Chandan Jatra Geeta', 'Ratha Khala Re Kalia', 'Puri Bada Danda Dhuli Bala', 'Bada Thakura Jagannatha', 'Srimandira Bedha Parikrama', 'Niladri Bije Bhajan', 'Tulasi Chaurare Jwalo Dipa'] },

    // God / Prayer / Bhajans / Devotional
    { artist: 'Hariharan & Gulshan Kumar Devotional', genre: 'Devotional', prefix: 'Sacred Prayers', songs: ['Shri Hanuman Chalisa (Bhakti Classic)', 'Gayatri Mantra Om Bhur Bhuva', 'Mahamrityunjaya Mantra Om Tryambakam', 'Shiv Tandav Stotram (Shankar)', 'Achyutam Keshavam Krishna', 'Aarti Kunj Bihari Ki Shri Girdhar', 'Om Jai Jagdish Hare (Grand Aarti)', 'Shri Krishna Govind Hare Murari', 'Raghupati Raghav Raja Ram Patita Pavan', 'Bhaye Pragat Kripala Deendayala', 'Jai Ambe Gauri Maiya', 'Karpura Gauram Karunavataram', 'Namo Namo Ji Shankara Bholenath', 'Har Har Shambhu Shiv Mahadeva', 'Madhurashtakam Adharam Madhuram', 'Vishnu Sahasranamam Stotram', 'Surya Dev Vandana', 'Jai Ganesh Deva Ganpati Aarti', 'Laxmi Aarti Om Jai Laxmi Mata', 'Durga Chalisa Namo Namo Durge'] },
    { artist: 'Bhikari Bala Lord Jagannath Bhajans', genre: 'Jagannath Bhajan', prefix: 'Puri Dham Devotion', songs: ['Ahe Nila Saila (Lord Jagannath)', 'Kalia Re Kalia Tu Kemiti Kalia', 'Jagannath Swami Nayana Pathagami Bhavatu', 'Dina Bandhu Ehi Ali Suna Prabhu', 'Thaka Mana Chala Jiba Bada Danda', 'Bada Danda Dhuli Mora Chandana Re', 'Krupasindhu Badane Chahi', 'Patita Pavana Bana Aau Ketebele Uadiba', 'Manima Suna He Manima Kalia', 'To Lagi Gopa Danda Chhadili', 'Mu Ta Bada Deula Ku Jaintili Kalia', 'Chhadi Jane Kalia To Pada Duti', 'Kalia Mo Dehare Raktare Tu', 'Jagannatha Ho Kalia Dhana', 'Ratha Jatra Geeta Ahe Jagannatha', 'Chaka Akhira Jadu Kalia', 'Ananda Bazare Mahaprasad', 'Gundicha Mandire Kalia', 'Snana Yatra Mahotsav', 'Nilachala Dhama Vandana'] },
    { artist: 'Anup Jalota & Anuradha Paudwal Bhakti Sagar', genre: 'Bhajan', prefix: 'Bhakti Sagar', songs: ['Aisi Lagi Lagan Meera Ho Gayi Magan', 'Main Nahin Makhan Khayo', 'Radhe Radhe Barsane Wali Radhe', 'Jag Me Sundar Hain Do Naam', 'Rang De Chunariya', 'Shri Ram Chandra Kripalu Bhajman', 'Thumak Chalat Ram Chandra', 'Chadariya Jhini Re Jhini', 'Govind Bolo Hari Gopal Bolo', 'Bhagwan Meri Naiyya Us Paar Laga Dena', 'Ambe Tu Hai Jagdambe Kali', 'Jai Jai Jai Bajrangbali', 'Hey Dukh Bhanjan Maruti Nandan', 'Shree Hanuman Amritwani', 'Shiv Amritwani Bholenath', 'Durga Amritwani Maiya', 'Laxmi Amritwani Dhan', 'Ganesh Amritwani Siddhivinayak', 'Saraswati Vandana Ya Kundendu', 'Shree Krishna Sharanam Mamah'] },
    { artist: 'M.S. Subbulakshmi Sacred Chants', genre: 'Devotional Chants', prefix: 'Sacred Mantras', songs: ['Sri Venkateswara Suprabhatam', 'Bhaja Govindam Moodha Mathe', 'Vishnu Sahasranama Stotram Classic', 'Kanakadhara Stotram Adi Shankara', 'Hanuman Chalisa Carnatic Chant', 'Maha Lakshmi Ashtakam', 'Ganesha Pancharatnam', 'Shiva Panchakshara Stotram', 'Lingashtakam Brahma Murari Surarchita', 'Bilwashtakam Tridalam Trigunakaram', 'Kalabhairava Ashtakam Kashi', 'Nirvana Shatakam Shivoham', 'Soundarya Lahari Chants', 'Aditya Hrudayam Surya Stotram', 'Gayatri Sahasranamam', 'Sri Lalitha Sahasranamam', 'Durga Saptashati Shlokas', 'Aigiri Nandini Mahishasura Mardini', 'Hanuman Ashtak Sankat Mochan', 'Itni Shakti Hamein Dena Data'] },
    { artist: 'Nusrat Fateh Ali Khan & Sabri Brothers Sufi', genre: 'Sufi', prefix: 'Divine Qawwali', songs: ['Dum Mast Qalandar (Full Spiritual)', 'Yeh Jo Halka Halka Suroor Hai', 'Afreen Afreen (Spiritual Love)', 'Teri Deewani (Kailash Kher)', 'Saiyyan (Pure Soul)', 'Chaap Tilak Sab Chhini Mose Naina Milake', 'Dama Dam Mast Qalandar Jhule Lal', 'Piya Re Piya Re Tere Bina', 'Sanu Ik Pal Chain Na Aave Sajna', 'Mere Rashke Qamar Tune Pehli Nazar', 'Arziyan (Maula Mere Maula)', 'Kun Faya Kun (Be and It Is)', 'Tu Maane Ya Na Maane Dildara', 'Nit Khair Manga Sohneya Main Teri', 'Ali Da Malang Main Ali Da', 'Haq Ali Ali Maula Ali Ali', 'Tajdar-e-Haram Ho Nigahe Karam', 'Bhar Do Jholi Meri Ya Muhammad', 'Chhaap Tilak Sufi Anthem', 'Allah Hoo Allah Hoo'] },
    { artist: 'Peaceful Gospel & Christian Prayers', genre: 'Gospel', prefix: 'Peaceful Choral', songs: ['Amazing Grace (Sweet Sound)', 'Hallelujah (Holy Harmony)', 'How Great Thou Art (Majestic)', '10,000 Reasons (Bless The Lord Oh My Soul)', 'Oceans (Where Feet May Fail)', 'What A Beautiful Name It Is', 'Ave Maria (Angelic Choir)', 'Great Is Thy Faithfulness Lord', 'In Christ Alone My Hope Is Found', 'Peace In Christ Through Every Storm', 'Abide With Me Fast Falls The Eventide', 'The Lord’s Prayer In Divine Peace', 'Holy Spirit You Are Welcome Here', 'Way Maker Miracle Worker', 'Goodness Of God All My Life', 'Reckless Love Of God', 'Cornerstone In Christ Alone', 'Shout To The Lord All The Earth', 'Blessed Be Your Name', 'As The Deer Panteth For The Water'] },

    // Punjabi Pop & Bhangra Chartbusters
    { artist: 'Diljit Dosanjh & AP Dhillon Punjabi Heat', genre: 'Punjabi Pop', prefix: 'Punjabi Anthem', songs: ['Lover Diljit Dosanjh', 'G.O.A.T. Diljit', 'Born to Shine', 'Proper Patola', 'High Rated Gabru Guru', 'Lahore Guru Randhawa', 'Brown Munde AP Dhillon', 'Excuses AP Dhillon', 'With You AP Dhillon', 'Summer High AP Dhillon', '295 Sidhu Moosewala', 'The Last Ride Sidhu', 'So High Sidhu Moosewala', 'Same Beef Bohemia', 'Levels Sidhu', 'Lemonade Diljit', 'Do You Know Diljit', 'Raat Di Gedi Diljit', 'Clash Diljit', 'Peaches Diljit'] },
    { artist: 'Sidhu Moosewala & Karan Aujla Punjabi Legends', genre: 'Punjabi Drill', prefix: 'Punjabi Royalty', songs: ['Legend Sidhu Moosewala', 'Famous Sidhu', 'Just Listen Sidhu', 'Dollar Sidhu', 'Old Skool Prem Dhillon', 'Majhail AP Dhillon', 'Admiring You AP Dhillon', 'Softly Karan Aujla', 'White Brown Black Karan', 'On Top Karan Aujla', '52 Bars Karan Aujla', 'Winning Speech Karan', 'Tauba Tauba Karan Aujla', 'Chitta Kurta Karan', 'Don’t Look Karan', 'Don’t Worry Karan', 'Kya Baat Aa Karan', 'Mexico Koka Karan', 'Jee Ni Lagda Karan', 'Player Karan Aujla'] },

    // Telugu & Tamil (Tollywood & Kollywood Blockbusters)
    { artist: 'SS Thaman & Devi Sri Prasad Tollywood Bangers', genre: 'Telugu Pop', prefix: 'Tollywood Hits', songs: ['Samajavaragamana Ala Vaikunthapurramuloo', 'Butta Bomma Allu Arjun', 'Ramuloo Ramulaa Party', 'Oo Antava Mava Pushpa', 'Srivalli Pushpa Melody', 'Saami Saami Rashmika', 'Naatu Naatu RRR Oscar', 'Dosti RRR Friendship', 'Komuram Bheemudo Emotion', 'Inkem Inkem Inkem Kaavaale Geetha', 'Vachindamma Geetha Govindam', 'Pilla Raa RX100', 'Saranga Dariya Sai Pallavi', 'Chitti Jathi Ratnalu', 'Seeti Maar Radhe', 'Top Lesi Poddi Iddarammayilatho', 'Mind Block Sarileru Neekevvaru', 'He’s So Cute Mahesh Babu', 'Blockbuster Sarrainodu', 'Cinema Choopistha Mava Race Gurram'] },
    { artist: 'Anirudh Ravichander & A.R. Rahman Kollywood Magic', genre: 'Tamil Pop', prefix: 'Kollywood Magic', songs: ['Arabic Kuthu Beast', 'Hukum Thalaivar Alappara Jailer', 'Vathi Coming Master', 'Why This Kolaveri Di Dhanush', 'Chellamma Doctor', 'Rowdy Baby Maari 2', 'Kanja Poovu Kannala Viruman', 'Megham Karukatha Thiruchitrambalam', 'Munbe Vaa Sillunu Oru Kaadhal', 'Nenjukkul Peidhidum Vaaranam Aayiram', 'Hosanna Vinnathaandi Varuvaayaa', 'Aalaporaan Thamizhan Mersal', 'Mersal Arasan Mersal', 'Verithanam Bigil', 'Bigil Bigil Anthem', 'Kutti Story Master', 'Chinna Chinna Aasai Roja', 'Roja Janeman Roja', 'Enna Sona Ok Jaanu', 'Porkanda Singam Vikram'] },

    // 90s English Pop & Global Boybands
    { artist: 'Backstreet Boys & NSYNC Pop Anthems', genre: "90's English Pop", prefix: "90's Boybands", songs: ['I Want It That Way (Iconic)', 'Everybody (Backstreet’s Back)', 'As Long as You Love Me', 'Larger Than Life', 'Show Me the Meaning of Being Lonely', 'Quit Playing Games (With My Heart)', 'Bye Bye Bye (NSYNC)', 'It’s Gonna Be Me (NSYNC)', 'Tearin’ Up My Heart', 'This I Promise You', 'Pop Goes My Heart', 'All I Have to Give', 'Shape of My Heart', 'Drowning In Your Love', 'Incomplete', 'More Than That', 'I’ll Never Break Your Heart', 'Anywhere For You', 'Get Down (You’re the One for Me)', 'We’ve Got It Goin’ On'] },
    { artist: 'Britney Spears & Spice Girls 90s Dance', genre: "90's English Pop", prefix: "90's Pop Queens", songs: ['...Baby One More Time (Classic)', 'Oops!... I Did It Again', 'Wannabe (Spice Girls)', 'Spice Up Your Life', 'Stop Right Now', '2 Become 1', 'Say You’ll Be There', '(You Drive Me) Crazy', 'Lucky', 'Stronger', 'I’m a Slave 4 U', 'Toxic (Legendary)', 'Genie in a Bottle (Christina Aguilera)', 'What a Girl Wants', 'Come On Over Baby', 'Lady Marmalade', 'Torn (Natalie Imbruglia)', 'Truly Madly Deeply', 'Barbie Girl (Aqua Dance)', 'Blue Da Ba Dee (Eiffel 65)'] },
    { artist: '90s Eurodance & Electronic Gold', genre: '90s Eurodance', prefix: 'Eurodance Revolution', songs: ['Better Off Alone Alice Deejay', 'Children Robert Miles Dream', 'Sandstorm Darude Anthem', 'Castles in the Sky Ian Van Dahl', 'Around the World La La La ATC', 'Be My Lover La Bouche', 'Sweet Dreams La Bouche', 'What Is Love Haddaway', 'Rhythm Is a Dancer Snap', 'The Power Snap', 'Mr. Vain Culture Beat', 'Scatman John Ski-Ba-Bop', 'Macarena Bayside Boys', 'Mambo No. 5 Lou Bega', 'Cotton Eye Joe Rednex', 'Coco Jamboo Mr. President', 'No Limit 2 Unlimited', 'Twilight Zone 2 Unlimited', 'Boom Boom Boom Vengaboys', 'We Like to Party Vengaboys'] },
    { artist: 'Michael Jackson King of Pop Collection', genre: 'Pop Royalty', prefix: 'MJ Classics', songs: ['Billie Jean (Moonwalk Remaster)', 'Beat It (Rock Pop)', 'Thriller (Epic Monster)', 'Man in the Mirror (Soul)', 'Smooth Criminal (Lean)', 'Black or White (Global)', 'Heal the World (Peace)', 'Earth Song (Orchestral)', 'They Don’t Care About Us', 'Bad (Original)', 'The Way You Make Me Feel', 'Rock with You', 'Don’t Stop ’Til You Get Enough', 'Remember the Time', 'Dangerous', 'You Are Not Alone', 'Human Nature', 'Dirty Diana', 'Wanna Be Startin’ Somethin’', 'Give In to Me'] },
    { artist: 'Oasis & 90s British Rock Giants', genre: "90's Rock", prefix: 'Britpop Anthem', songs: ['Wonderwall (Acoustic Majesty)', 'Don’t Look Back in Anger', 'Champagne Supernova', 'Live Forever', 'Supersonic', 'Roll With It', 'Some Might Say', 'Stand By Me', 'Stop Crying Your Heart Out', 'Bitter Sweet Symphony (The Verve)', 'The Drugs Don’t Work', 'Parklife (Blur)', 'Song 2 (Woo Hoo Blur)', 'Common People (Pulp)', 'Disco 2000', 'Karma Police (Radiohead)', 'Creep (Radiohead Original)', 'High and Dry', 'No Surprises', 'Fake Plastic Trees'] },
    { artist: 'Nirvana & 90s Seattle Grunge', genre: 'Grunge', prefix: 'Grunge Revolution', songs: ['Smells Like Teen Spirit (Power)', 'Come as You Are (Grunge)', 'Heart-Shaped Box', 'Lithium', 'In Bloom', 'About a Girl (Unplugged)', 'The Man Who Sold the World', 'All Apologies', 'Polly', 'Dumb', 'Pennyroyal Tea', 'Blew', 'Drain You', 'Stay Away', 'On a Plain', 'Something in the Way', 'Breed', 'Territorial Pissings', 'Silver', 'Aneurysm'] },
    { artist: 'Queen & Classic Rock Royalty', genre: 'Rock Classics', prefix: 'Arena Rock', songs: ['Bohemian Rhapsody (Operatic Rock)', 'Don’t Stop Me Now', 'We Will Rock You (Stomp)', 'We Are the Champions (Stadium)', 'Another One Bites the Dust', 'Under Pressure (Queen & Bowie)', 'Somebody to Love', 'Radio Ga Ga', 'Killer Queen', 'Love of My Life', 'Crazy Little Thing Called Love', 'I Want to Break Free', 'The Show Must Go On', 'Fat Bottomed Girls', 'Bicycle Race', 'Hammer to Fall', 'Tie Your Mother Down', 'Who Wants to Live Forever', 'Save Me', 'Good Old-Fashioned Lover Boy'] },

    // Lo-Fi Midnight Beats & Ambient Chill
    { artist: 'Midnight Chai Lo-Fi Indian Beats', genre: 'Lo-Fi Chill', prefix: 'Indian Lo-Fi', songs: ['Kesariya Midnight Lo-Fi Edit', 'Shayad Late Night Rain Lo-Fi', 'Hawayein Lo-Fi Monsoon Vibe', 'Agar Tum Saath Ho Slowed Reverb', 'Tum Mile Nostalgia Lo-Fi', 'Zara Zara Monsoon Chill Beats', 'Labon Ko Night Drive Lo-Fi', 'Pehla Nasha Acoustic Lo-Fi', 'Raabta Coffee House Lo-Fi', 'Channa Mereya Rain Window Lo-Fi', 'Kabira Campfire Lo-Fi Acoustic', 'Tum Hi Ho Midnight Piano Lo-Fi', 'Sunday Morning Lo-Fi Coffee', 'Bangalore Rain Study Lo-Fi', 'Marine Drive Sunset Lo-Fi Beats', 'Ganga Ghat Morning Peace Lo-Fi', 'Odisha Monsoon Rain Lo-Fi Beat', 'Shimla Winter Pines Lo-Fi Vibe', 'Old Delhi Chai Stall Lo-Fi', 'Kolkata Tramway Lo-Fi Melody'] },
    { artist: 'Global Lofi Girl & Synthwave Dreams', genre: 'Lo-Fi Chill', prefix: 'Synthwave & Chillhop', songs: ['I Want It That Way Bedroom Lo-Fi', 'Blinding Lights 80s Vaporwave', 'As It Was Sunset Lo-Fi Beats', 'Save Your Tears Midnight Chillhop', 'Stay Chill Study Lo-Fi Beat', 'Golden Hour Rain Lo-Fi', 'Sunflower Relaxing Study Beats', 'Past Lives Sapientdream Lo-Fi', 'Death Bed Coffee for Head Lo-Fi', 'Get You The Moon Kina Lo-Fi', 'Tokyo Neon Rain Lo-Fi', 'Cyberpunk Alley Midnight Lo-Fi', 'Cozy Bedroom Winter Lo-Fi', 'Library Whisper Study Beats', 'Morning Coffee Horizon Lo-Fi', 'Stargazing on Rooftop Lo-Fi', 'Midnight Coding Flow Lo-Fi Beats', 'Gentle Breeze Garden Lo-Fi', 'Ocean Waves Sunset Lo-Fi', 'Dreaming of Summer Lo-Fi Melody'] },

    // Additional Global Modern Hits across Pop, EDM, Rap
    { artist: 'Taylor Swift & Pop Icons Extended', genre: 'Global Pop', prefix: 'Swiftie Classics', songs: ['All Too Well (10 Minute Version)', 'Cardigan', 'August', 'Willow', 'Champagne Problems', 'Cruel Summer (Live Eras)', 'Love Story (Taylor’s Version)', 'You Belong With Me', 'Enchanted', 'Back to December', 'I Knew You Were Trouble', 'Look What You Made Me Do', 'Delicate', 'Getaway Car', 'Don’t Blame Me', 'Call It What You Want', 'King of My Heart', 'Dress', 'Gorgeous', 'New Year’s Day'] },
    { artist: 'The Weeknd & Modern Synthwave Hits', genre: 'Synthwave', prefix: 'XO Anthems', songs: ['The Hills', 'Can’t Feel My Face', 'Often', 'Acquainted', 'Wicked Games', 'High for This', 'House of Balloons', 'Earned It', 'Call Out My Name', 'I Was Never There', 'Hurt You', 'Try Me', 'Wasted Times', 'Privilege', 'Double Fantasy', 'Popular (with Madonna)', 'Creepin’ (with Metro Boomin)', 'One of the Girls (with JENNIE)', 'Moth to a Flame (with SHM)', 'Save Your Tears (Ariana Remix)'] },
    { artist: 'Drake & Travis Scott & 21 Savage Rap Party', genre: 'Hip-Hop', prefix: 'Rap Royalty', songs: ['Rich Flex (21 Savage & Drake)', 'Jimmy Cooks', 'Knife Talk (Certified)', 'First Person Shooter (J. Cole)', 'FE!N (Travis Scott & Carti)', 'Meltdown (Travis Scott)', 'My Eyes (Chilled Trap)', 'Telekinesis (Future & SZA)', 'Hotline Bling', 'Hold On We’re Going Home', 'Headlines', 'Started From the Bottom', 'Take Care (feat. Rihanna)', 'Marvins Room', 'Passionfruit', 'One Dance (feat. Wizkid)', 'Controlla', 'Too Good', 'Greezy Mode', 'IDGAF (Yeat & Drake)'] },
    { artist: 'Coldplay & Imagine Dragons Modern Arena', genre: 'Alternative Rock', prefix: 'Starlight Rock', songs: ['Paradise (Coldplay Anthem)', 'A Sky Full of Stars', 'Adventure of a Lifetime', 'Hymn for the Weekend', 'Speed of Sound', 'Talk', 'Every Teardrop is a Waterfall', 'Magic', 'Midnight', 'Sparks', 'Yellow (Acoustic Live)', 'Enemy (Imagine Dragons)', 'Bones (The Boys Theme)', 'Sharks', 'Natural', 'Bad Liar', 'Follow You', 'Wrecked', 'I Bet My Life', 'Warriors (League of Legends)'] },

    // 90s Dance & Govinda / Karisma Bollywood Fun
    { artist: 'Govinda & Karisma 90s Dance Dhamaka', genre: "90's Bollywood", prefix: "90's Dance Party", songs: ['Husn Hai Suhana', 'Main To Raste Se Jaa Raha Tha', 'What Is Mobile Number', 'Kisi Disco Mein Jaaye', 'Ankhiyon Se Goli Maare', 'Sona Kitna Sona Hai', 'UP Wala Thumka Lagao', 'Kuku Kuru Kuku Kuru', 'Mirchi Lagi To Main Kya Karoon', 'Tum Toh Dhokhebaaj Ho', 'Pakchik Pak Raja Babu', 'Chalo Ishq Ladaaye', 'Gori Hai Kalaiyan', 'Jeth Ki Dopahri Mein', 'Makhna Makhna', 'Aap Ke Aa Jane Se', 'Husn Ka Jalwa', 'Chunari Chunari', 'Love Rap Hero No 1', 'Main Laila Laila Chillaunga'] },
    
    // Devotional: Mata Rani & Navratri Bhajans
    { artist: 'Narendra Chanchal & Lakhbir Singh Lakkha', genre: 'Devotional', prefix: 'Mata Rani Bhajans', songs: ['Chalo Bulawa Aaya Hai Mata Ne Bulaya Hai', 'Bhor Bhai Din Chadh Gaya Meri Ambe', 'Tune Mujhe Bulaya Sherawaliye', 'Pyara Saja Hai Tera Dwar Bhawani', 'Ambe Rani Tu Meri Maa', 'Maa Murade Poori Kar De', 'Duniya Chali Na Shri Ram Ke Bina', 'Are Dwarpalo Kanhaiya Se Keh Do', 'Meri Ankhiyon Ke Samne Hi Rehna', 'Maa Ka Dil', 'Jai Mata Di Bol', 'O Aaye Tere Bhawan', 'Bhakton Ko Darshan De Do Maa', 'Maa Sherawaliye Tera Sahara', 'Lal Lal Chunari Sitaro Wali', 'Maiya Ji Tera Pyar', 'Nav Durga Strotam', 'Maa Vaishno Devi Aarti', 'Mata Vaishno Ke Dware Pe', 'Jai Mata Di Chants'] },

    // Devotional: Lord Ganesha & Lord Krishna
    { artist: 'Sadhana Sargam & Suresh Wadkar Bhakti', genre: 'Devotional', prefix: 'Divine Stotras', songs: ['Ganesh Gayatri Mantra', 'Vakratunda Mahakaya Suryakoti Samaprabha', 'Shendur Lal Chadhayo', 'Sukhkarta Dukhharta Varta Vighnachi', 'Jai Dev Jai Dev Jai Mangal Murti', 'Ganpati Bappa Morya Mangal Murti Morya', 'Shree Ganesha Deva Aarti', 'Krishna Nee Begane Baaro', 'Kalinga Nartana Thillana', 'Brahmamokate Parabrahmamokate', 'Govinda Namalu Srinivasa', 'Sri Rama Rama Rameti', 'Anjaneya Dandakam', 'Hanuman Badabar Nal Stotra', 'Dattatreya Stotram', 'Navagraha Stotram', 'Surya Ashtakam', 'Mrityunjaya Mahamantra 108', 'Om Jai Shiv Omkara', 'Shri Ram Raksha Stotram'] },

    // Odia Gita Govinda & Akshaya Mohanty Vol 2
    { artist: 'Odia Gita Govinda & Jayadeva Ashtapadi', genre: 'Odia Classics', prefix: 'Gita Govinda', songs: ['Lalita Lavanga Lata Parishilana', 'Dheera Samire Yamuna Teere', 'Priya Charusheele', 'Harir Iha Mugdha Vadhu', 'Yahi Madhava Yahi Keshava', 'Kuru Yadu Nandana', 'Shrita Kamala Kucha Mandala', 'Pralaya Payodhi Jale', 'Chandana Charchita Nila Kalevara', 'Mugdhe Madhu Mathanam', 'Badasi Yadi Kinchidapi', 'Smara Garala Khandanam', 'Rajanir Janita Guru Jagara', 'Manmatha Sharana', 'Kapi Madhuripu', 'Pashyati Dishi Dishi', 'Natha Hare Jagannatha Hare', 'Jaya Jagadisha Hare Odia', 'Keshava Dhrita Meena Shareera', 'Dasavatara Stotram Odia'] },

    // Kannada Janapada & Folk Geethegalu
    { artist: 'Kannada Janapada & Hamsalekha Melodies', genre: 'Kannada Folk', prefix: 'Janapada Heritage', songs: ['Kolalu Kelada Nimma Magana', 'Kolu Kolenna Kole', 'Entha Chendada Hudugi', 'Maayadha Manave', 'Halliya Baalu Habbada Oota', 'Bramha Murari Surarchita Kannada', 'Bolo Bolo Re Kaanha', 'Ee Bhoomi Bannada Buguri', 'Hrudaya Samudra Kalaki', 'Yaava Shilpi Kanda Kanasu', 'Kalladare Nanu Belurina', 'Baanigondu Elle Ellide', 'Kelideya Nanna Haadu', 'O Gulabiye Ninna', 'Prema Prema Prema', 'Thayige Thakkana Maga', 'Nee Nanna Jeeva', 'Cheluve Ondu Kelthini', 'Yuga Yugagale Sagali', 'Ee Sundara Beladingala Sandalwood'] },

    // English 90s R&B & Divas
    { artist: 'Whitney Houston & Mariah Carey & Celine Dion', genre: '90s R&B & Soul', prefix: 'Vocal Divas', songs: ['I Will Always Love You', 'Hero Mariah Carey', 'My Heart Will Go On Titanic', 'Because You Loved Me', 'Vision of Love', 'Emotions', 'All I Want for Christmas Is You 90s', 'The Power of Love Celine', 'It’s All Coming Back to Me Now', 'I Have Nothing Whitney', 'Run to You', 'Greatest Love of All', 'Always Be My Baby', 'Fantasy Mariah', 'One Sweet Day Boyz II Men', 'End of the Road Boyz II Men', 'I’ll Make Love to You', 'Waterfalls TLC', 'No Scrubs TLC', 'Un-Break My Heart Toni Braxton'] },

    // 90s Green Day, Linkin Park & Alternative Rock
    { artist: 'Green Day & 90s Alternative Giants', genre: 'Alternative Rock', prefix: 'Punk Rock & Alt', songs: ['Basket Case Green Day', 'Good Riddance Time of Your Life', 'When I Come Around', 'Longview', 'Brain Stew', 'Under the Bridge Red Hot Chili Peppers', 'Californication RHCP', 'Scar Tissue RHCP', 'Otherside RHCP', 'Give It Away RHCP', 'In the End Linkin Park', 'Numb Linkin Park', 'Crawling Linkin Park', 'One Step Closer LP', 'Faint Linkin Park', 'Song 2 Blur Classic', 'Losing My Religion REM', 'Everybody Hurts REM', 'Man on the Moon REM', 'Black Hole Sun Soundgarden'] },

    // 90s Boybands & Pop Gold
    { artist: 'Westlife & Savage Garden Boybands Gold', genre: '90s Pop Gold', prefix: 'Boybands Era', songs: ['My Love Westlife', 'Swear It Again Westlife', 'Flying Without Wings', 'Fool Again Westlife', 'I Lay My Love on You', 'Uptown Girl Westlife', 'Truly Madly Deeply Savage Garden', 'I Knew I Loved You Savage', 'To the Moon and Back SG', 'Crash and Burn Savage Garden', 'No Matter What Boyzone', 'Words Boyzone', 'Love Me for a Reason', 'Keep On Movin Five', 'Everybody Get Up Five', 'Slam Dunk Da Funk', 'Mmmbop Hanson', 'Step by Step New Kids on the Block', 'I Want You Back NSYNC Original', 'Thinking of You Westlife'] },

    // Classical Sitar, Flute & Santoor Meditations
    { artist: 'Pt. Ravi Shankar & Pt. Hariprasad Chaurasia', genre: 'Indian Classical', prefix: 'Divine Meditations', songs: ['Raga Bhairavi Morning Peace', 'Raga Yaman Evening Symphony', 'Raga Darbari Midnight Soul', 'Raga Bageshree Monsoon Chants', 'Raga Desh Rainy Melody', 'Raga Megh Deep Reflection', 'Raga Malkauns Night Trance', 'Raga Shankara Divine Sitar', 'Raga Hamsadhwani Flute Melody', 'Raga Kirwani Santoor Glow', 'Flute Meditation in the Himalayas', 'Sitar Ecstasy Pt Ravi Shankar', 'Santoor Serenade Pt Shivkumar', 'Tabla Solo Ustad Zakir Hussain', 'Carnatic Flute Shashank', 'Morning Sunrise Raga', 'Evening Sunset Raga', 'Midnight Temple Bells Raga', 'Sacred River Ganga Meditation', 'Lotus Pond Flute & Sitar'] },

    // Global Acoustic & Indie Chill
    { artist: 'Acoustic Coffeehouse & Indie Folk', genre: 'Acoustic Indie', prefix: 'Coffeehouse Acoustic', songs: ['Let Her Go Passenger Acoustic', 'Riptide Vance Joy', 'Say You Won’t Let Go James Arthur', 'Photograph Ed Sheeran Acoustic', 'Thinking Out Loud Acoustic', 'Castle on the Hill Acoustic', 'Ho Hey The Lumineers', 'Ophelia The Lumineers', 'Budapest George Ezra', 'Shotgun George Ezra', 'Skinny Love Bon Iver', 'Holocene Bon Iver', 'Flightless Bird American Mouth', 'Home Edward Sharpe', 'Stubborn Love Lumineers', 'First Day of My Life Bright Eyes', 'Bloom The Paper Kites', 'Banana Pancakes Jack Johnson', 'Better Together Jack Johnson', 'Upside Down Jack Johnson'] },

    // Bappi Lahiri & Mithun 80s & 90s Disco
    { artist: 'Bappi Lahiri & Mithun Disco Dhamaka', genre: 'Disco Bollywood', prefix: 'Disco Golden Age', songs: ['I Am a Disco Dancer', 'Jimmy Jimmy Jimmy Aaja', 'Yaad Aa Raha Hai', 'Goron Ki Na Kalon Ki', 'De De Pyar De', 'Pag Ghunghroo Baandh', 'Raat Baaki Baat Baaki', 'Jawani Janeman', 'Tamma Tamma Loge', 'Ooh La La Disco', 'Inteha Ho Gayi Intezaar Ki', 'Rambha Ho Ho Ho', 'Zooby Zooby', 'Super Dancer Beat', 'Jeena Bhi Kya Hai Jeena', 'Yaar Bina Chain Kaha Re', 'Pyar Kabhi Kam Nahi Karna', 'Tune Maari Entriyaan Disco', 'Dance Dance Music', 'Auva Auva Koi Yahan Nache'] },

    // Ilaiyaraaja & SPB South Classics
    { artist: 'Ilaiyaraaja & SPB South Evergreen', genre: 'Tamil & Telugu Classics', prefix: 'Maestro Melodies', songs: ['Kanne Kalaimane', 'Thenpandi Cheemayile', 'Sundari Kannal Oru Sethi', 'Ilamai Idho Idho', 'Rakkamma Kaiya Thattu', 'Engeyum Eppothum', 'Mandram Vantha Kaattrukku', 'Om Sivoham Maestro', 'Nilaave Vaa', 'Poove Sempoove', 'Sangeetha Megam', 'O Priya Priya Telugu', 'Keeravani Telugu', 'Priya Priyathama', 'Chiluka Kshemama', 'Malle Puvva', 'Abba Nee Teeyani Debba', 'Jaamu Rathiri', 'Botany Patham', 'Subhalekha Raasukunna'] },

    // K.J. Yesudas Malayalam & Carnatic Evergreen
    { artist: 'K.J. Yesudas & K.S. Chithra South Gems', genre: 'South Melodies', prefix: 'Celestial Melodies', songs: ['Harivarasanam Viswamohanam', 'Gori Tera Gaon Bada Pyara', 'Surmayi Ankhiyon Mein', 'Pramadavanam Veendum', 'Aayiram Kannumai', 'Oru Murai Vanthu Parthaya', 'Chembarathi Poove', 'Kannamthumbi Poramo', 'Manasin Madiyile', 'Kadhali Chenkadhali', 'Shyama Sundara Kera Kedara', 'Pavizha Mazha', 'Malare Ninne', 'Entammede Jimikki Kammal', 'Rowdy Baby South', 'Nillu Nillu', 'Kalyana Kacheri', 'Aalolam Chembakame', 'Thumbi Vaa', 'Sandhyakendhinu'] },

    // Pankaj Udhas & Talat Aziz Ghazal Mehfil
    { artist: 'Pankaj Udhas & Talat Aziz Ghazals', genre: 'Ghazal', prefix: 'Ghazal Mehfil', songs: ['Chitthi Aayi Hai Original', 'Chandi Jaisa Rang Hai Tera', 'Aur Is Dil Mein Kya Rakha Hai', 'Jeeye To Jeeye Kaise Ghazal', 'Ghungroo Toot Gaye', 'Thodi Thodi Piya Karo', 'Na Kajre Ki Dhar', 'Ek Taraf Uska Ghar', 'Main Nashe Mein Hoon', 'Aap Jinke Kareeb Hote Hain', 'Kaise Sukoon Paoon', 'Dukh Sukh Tha Ek Sabka', 'Phoolon Ke Rang Se', 'Rukhsat Hua To Aankh', 'Zindagi Jab Bhi Teri Bazm Mein', 'Dard Ke Phool Bhi Khilte Hain', 'Yeh Alam Shauq Ka', 'Khuda Kare Ke Mohabbat Mein', 'Aansoo Jab Palkon Se', 'Mohabbat Inayat Karam'] },

    // Daler Mehndi & Bally Sagoo 90s Bhangra Kings
    { artist: 'Daler Mehndi & 90s Bhangra Explosion', genre: 'Punjabi Bhangra', prefix: 'Bhangra Kings', songs: ['Bolo Ta Ra Ra', 'Tunak Tunak Tun', 'Dardi Rab Rab Kardi', 'Ho Jayegi Balle Balle', 'Kudiyan Shehar Diyan', 'Saajan Re Saajan', 'Bhangra Paa Le', 'Na Na Na Re', 'Gud Naal Ishq Mitha', 'Mundian To Bach Ke MC', 'Aaja Mahi Bally Sagoo', 'Gur Nalo Ishq Mitha Original', 'Dil Luteya Jazzy B', 'Soorma Jazzy B', 'Romeo Jazzy B', 'Mitran De Boot', 'Jind Mahi Malkit Singh', 'Tootak Tootak Tootiyan', 'Hey Jamalo', 'Nach Punjaban'] },

    // 2000s Rap Legends: Eminem, 50 Cent, Dr Dre
    { artist: 'Eminem & Dr. Dre & 50 Cent Hip-Hop', genre: 'Hip-Hop Legends', prefix: 'Shady & Aftermath', songs: ['Lose Yourself', 'Stan feat Dido', 'Without Me', 'The Real Slim Shady', 'Till I Collapse', 'Mockingbird', 'In Da Club 50 Cent', '21 Questions', 'Candy Shop', 'Many Men Wish Death', 'Still D.R.E. feat Snoop', 'The Next Episode', 'Forgot About Dre', 'Nuthin But A G Thang', 'California Love Tupac', 'Changes Tupac', 'Juicy Notorious BIG', 'Big Poppa BIG', 'Hypnotize BIG', 'Gangsta’s Paradise Coolio'] },

    // EDM & Festival Anthems: Avicii, Calvin Harris, Guetta
    { artist: 'Avicii & Calvin Harris & David Guetta', genre: 'EDM & Dance', prefix: 'Festival Anthems', songs: ['Wake Me Up Avicii', 'Levels Avicii', 'The Nights Avicii', 'Waiting For Love Avicii', 'Hey Brother Avicii', 'Summer Calvin Harris', 'Feel So Close Calvin', 'This Is What You Came For', 'One Kiss Dua & Calvin', 'Titanium David Guetta & Sia', 'Without You Guetta & Usher', 'Hey Mama David Guetta', 'Don’t You Worry Child SHM', 'Clarity Zedd & Foxes', 'Faded Alan Walker', 'Spectre Alan Walker', 'Animals Martin Garrix', 'Tremor Martin Garrix', 'Lean On Major Lazer', 'Where Are Ü Now Skrillex'] },

    // Pop Divas: Dua Lipa, Billie Eilish, Bruno Mars
    { artist: 'Dua Lipa & Bruno Mars Pop Icons', genre: 'Global Pop', prefix: 'Modern Pop Gold', songs: ['Levitating Dua Lipa', 'Don’t Start Now', 'New Rules Dua Lipa', 'Physical Dua Lipa', 'Dance the Night Barbie', 'Uptown Funk Bruno Mars', '24K Magic Bruno Mars', 'That’s What I Like Bruno', 'Just the Way You Are Bruno', 'Grenade Bruno Mars', 'Leave the Door Open Silk Sonic', 'bad guy Billie Eilish', 'ocean eyes Billie Eilish', 'Happier Than Ever Billie', 'vampire Olivia Rodrigo', 'drivers license Olivia', 'good 4 u Olivia Rodrigo', 'Flowers Miley Cyrus', 'Roar Katy Perry', 'Firework Katy Perry'] },

    // Devotional: Lord Shiva & Mahadev Trance
    { artist: 'Lord Shiva Mahadev Sacred Trance', genre: 'Devotional Trance', prefix: 'Shiva Chants', songs: ['Maha Mrityunjaya Mantra 108 Times', 'Om Namah Shivaya Divine Trance', 'Shiv Tandav Stotram Powerful Chants', 'Har Har Shambhu Bholenath', 'Namo Namo Shankara Kedarnath', 'Kaal Bhairav Ashtakam Powerful', 'Shiv Kailasho Ke Vasi', 'Bolo Har Har Har Shivaay', 'Shambhu Shankar Namah Shivaya', 'Rudra Gayatri Mantra', 'Shiva Rudrashtakam Sacred', 'Shiv Panchakshara Stotram Trance', 'Bilwashtakam Shiva Puja', 'Lingashtakam Divine Temple Chants', 'Bhole Ki Jai Jaikar', 'Ujjain Mahakal Bhasma Aarti', 'Somnath Jyotirlinga Stuti', 'Kedarnath Dham Vandana', 'Pashupatinath Sacred Chants', 'Om Tryambakam Yajamahe'] },

    // Devotional: Lord Krishna & Vrindavan Raas
    { artist: 'Lord Krishna & Vrindavan Raas Kirtan', genre: 'Devotional', prefix: 'Vrindavan Melodies', songs: ['Shree Krishna Govind Hare Murari Bhajan', 'Achyutam Keshavam Rama Narayanam', 'Radhe Radhe Barsane Wali Radhe Chants', 'Madhurashtakam Adharam Madhuram Vandana', 'Yashomati Maiya Se Bole Nandlala', 'Bada Natkhat Hai Re Krishna Kanhaiya', 'Chhoti Chhoti Gaiya Chhote Chhote Gwal', 'Aarti Kunj Bihari Ki Girdhar Krishna', 'Govind Mero Hai Gopal Mero Hai', 'Bhaja Govindam Moodha Mathe Chants', 'Radha Krishna Raas Leela Symphony', 'Braj Mein Hori Khelat Nandlal', 'Shree Banke Bihari Lal Ki Jai', 'Gokul Dham Kirtan', 'Dwarkadhish Morning Mangala Aarti', 'Jagannath Puri Rath Yatra Divine Song', 'Radhe Govinda Bhajo Radhe Govinda', 'Mukunda Madhava Hari Bol', 'Damodarashtakam Namam-Ishwaram', 'Gopi Geet Sacred Chants'] },

    // Devotional: Shirdi Sai Baba & ISKCON
    { artist: 'Shirdi Sai Baba & ISKCON Hare Krishna', genre: 'Devotional', prefix: 'Sacred Kirtans', songs: ['Shirdi Sai Baba Kakad Aarti', 'Sai Reham Nazar Karna Bachon Ka Paalan Karna', 'Om Sai Namo Namah Shree Sai Namo Namah', 'Sai Ram Sai Shyam Sai Bhagwan', 'Sai Dhun Om Sai Ram', 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare', 'Maha Mantra ISKCON 108 Chants', 'Govinda Jaya Jaya Gopala Jaya Jaya', 'Jaya Radha Madhava Kunja Bihari', 'Sri Gurvashtakam Samsara Dava', 'Namaste Narasimhaya Prahladahladadayine', 'Sri Sikshashtakam Cheto Darpana', 'Brahma Samhita Govindam Adi Purusham', 'Radhe Jaya Jaya Madhava Dayite', 'Gaura Aarti Kiba Jaya Jaya Gorachand', 'Hari Haraye Namah Krishna Yadavaya', 'Damodara Stotram Morning Kirtan', 'Sri Tulasi Aarti Namo Namah', 'Sri Jagannathashtakam Nayana Pathagami', 'Kripa Kataksha Stotram Divine'] },

    // Ambient Study, Rain & Sleep Lo-Fi
    { artist: 'Tokyo Rain & Cozy Coffee Study Lo-Fi', genre: 'Ambient Lo-Fi', prefix: 'Deep Focus Lo-Fi', songs: ['Rainy Window Coffee Shop Lo-Fi', 'Midnight Coding in Tokyo Beats', 'Library Whispers & Page Turns', 'Warm Tea & Cat Purr Lo-Fi', 'Autumn Leaves Walking Chillhop', 'Late Night Highway Neon Drive', 'Starry Night Rooftop Reflection', 'Campfire Under Northern Lights', 'Whispering Pines Forest Chill', 'Morning Mist Mountain Study Beat', 'Old Bookstore Hidden Jazz', 'Soft Piano in the Rain', 'Midnight Train to Osaka Lo-Fi', 'Sleepy Sloth Sunday Afternoon', 'Gentle Breeze by the River', 'Quiet Thoughts Before Sleep', 'Paper Lanterns Floating Lo-Fi', 'Floating in Warm Cosmic Dust', 'Cozy Blanket & Good Book', 'Sunrise Over Bamboo Garden'] },

    // Bhangra & Dhol Legends
    { artist: 'Panjabi MC & Surjit Bindrakhia Bhangra', genre: 'Punjabi Bhangra', prefix: 'Dhol Legends', songs: ['Mundian To Bach Ke Original', 'Jogi Panjabi MC', 'Bari Barsi Khatan Gaya', 'Yaar Bolda Surjit Bindrakhia', 'Tera Yaar Bolda', 'Mukhda Dekh Ke', 'Ishq Tera Tadpave Sukhbir', 'Gal Ban Gayi Sukhbir', 'Sauda Khara Khara Sukhbir', 'Punjabi Munde Dhol', 'Lakk 28 Kudi Da', 'High Rated Dhol Mix', 'Mitran Nu Shauk Hathiyaran Da', 'Dupatta Tera Satrang Da', 'Kangna Tera Ni', 'Gaddi Moti Rangiye', 'Morni Banke Punjabi', 'Putt Jatt Da', 'Peg Di Waasna', 'Bhangra Ta Sajda'] },

    // Odia Bhajan Legends: Arabinda Muduli & Sarita Mishra
    { artist: 'Arabinda Muduli & Sarita Mishra Bhajans', genre: 'Jagannath Bhajan', prefix: 'Nilachala Bhajans', songs: ['Kalia Re Mana Kalia Re', 'Jaga Re Jaga Bandhu', 'Dhanya Se Nilachala Dhama', 'Chaka Dola Kalia Sona', 'He Jagannatha He Kalia', 'Bada Deula Parikrama', 'Sindhura Phuta Sakale', 'Bada Danda Re Gadi Chale', 'Nilachala Bije Kalia', 'Ananda Bazare Betha', 'Jagannatha Ho Daya Kara', 'Puri Mandira Ghanta Dhwani', 'Ratha Jatra Mahapari', 'Patita Pavana Kalia', 'Prabhu Pada Padme Pranam', 'Sri Jagannatha Stuti Odia', 'Gundicha Mandira Gita', 'Snana Mandapa Snana', 'Bahuda Jatra Gita', 'Bada Danda Dhuli Chandana'] },

    // Kannada Retro Hits: V. Ravichandran & Mano
    { artist: 'V. Ravichandran & Hamsalekha Magic', genre: 'Kannada Classics', prefix: 'Crazy Star Hits', songs: ['Prema Loka Title Song', 'Yaarivanu Ee Manmathano', 'Nodamma Hudugi', 'Geethanjali Ee Geethe', 'Cheluve Ondu Kelthini', 'Bannada Gejje', 'O Gulabiye', 'Shanti Kranti Theme', 'Halliya Baalu Habbada', 'Prema Baraha', 'Chitra Premada Chitra', 'Entha Chendada Hudugi Sandalwood', 'Kalli Nanna Kalli', 'Putnanja Title Track', 'Nee Nanna Jeeva Premada', 'Ondu Mutthina Kathe', 'Sriramachandra Gita', 'Yare Neenu Cheluve', 'Preethsod Thappa', 'Yaare Koogadali Hamsalekha'] },

    // 90s R&B Soul & Slow Jams
    { artist: 'Boyz II Men & Brian McKnight R&B', genre: '90s R&B & Soul', prefix: 'Slow Jams', songs: ['End of the Road Original', 'I’ll Make Love to You', 'One Sweet Day', 'Water Runs Dry', 'On Bended Knee', 'Back at One Brian McKnight', 'Anytime Brian McKnight', 'Nice & Slow Usher', 'You Make Me Wanna Usher', 'My Way Usher', 'Tell Me Groove Theory', 'Pony Ginuwine', 'Nobody Keith Sweat', 'Twisted Keith Sweat', 'Freak Me Silk', 'Knockin’ Da Boots H-Town', 'Weak SWV', 'Right Here SWV', 'Creep TLC', 'Red Light Special TLC'] },

    // Indie Band Revolution (Silk Route, Indian Ocean, Strings)
    { artist: 'Silk Route & Indian Ocean Indie Revolution', genre: 'Indipop', prefix: 'Indie Pioneers', songs: ['Dooba Dooba Rehta Hoon', 'Boondein Silk Route', 'Hamsafar Silk Route', 'Kandisa Indian Ocean', 'Bandeh Indian Ocean', 'Jhini Indian Ocean', 'Ma Rewa Indian Ocean', 'Duur Strings Band', 'Sajni Jal Band', 'Woh Lamhe Jal', 'Aadat Jal Band Original', 'Sayonee Junoon Band', 'Garaj Baras Junoon', 'Tanha Dil Shaan', 'Bhoola Dena Shaan', 'Tanha Shaan', 'Ab Mujhe Raat Din', 'Deewana Hoon Main Tera', 'Chalte Chalte Yunhi Koi', 'Pehli Nazar Mein Atif'] },

    // Classic Heavy Metal & Hard Rock
    { artist: 'Metallica & Guns N Roses Arena Metal', genre: 'Classic Metal', prefix: 'Heavy Metal Gods', songs: ['Enter Sandman Metallica', 'Nothing Else Matters', 'The Unforgiven Metallica', 'Master of Puppets', 'Sweet Child O Mine Guns N Roses', 'November Rain GNR', 'Paradise City GNR', 'Welcome to the Jungle', 'Back in Black AC/DC', 'Highway to Hell AC/DC', 'Thunderstruck AC/DC', 'Stairway to Heaven Led Zeppelin', 'Kashmir Led Zeppelin', 'Whole Lotta Love', 'Paranoid Black Sabbath', 'Iron Man Black Sabbath', 'Crazy Train Ozzy', 'Smoke on the Water Deep Purple', 'Dream On Aerosmith', 'Living on a Prayer Bon Jovi'] },

    // Bhojpuri & Maithili Folk Classics (Sharda Sinha & Manoj Tiwari)
    { artist: 'Sharda Sinha & Manoj Tiwari Folk', genre: 'Bhojpuri Folk', prefix: 'Chhath Puja & Folk', songs: ['Kelwa Ke Paat Par Chhathi Maiya', 'Kaanch Hi Baans Ke Bahangiya', 'Pahile Pahil Chhathi Maiya', 'Uga Ho Dinanath', 'Rupwa Ke Dhoop', 'Babu Ji Ki Chhatthi', 'Goriya Chaal Tohar', 'Babuni Tere Rang Mein', 'Rinkiya Ke Papa', 'Chhath Ghat Shobhe', 'Sona Ke Khadaun', 'Dharati Maiya Ke Godi', 'Pahile Pahil Hum Kaini', 'Ganga Kinare Mor Gaon', 'Chhathi Maiya Suni Pukaar', 'Suruj Dev Ke Arghya', 'Kosi Bharan Chhath Geet', 'Maiya Ke Darbar', 'Bhojpuriya Thumka', 'Maithili Lok Geet Sharda'] },

    // Global Reggae & Tropical Chill
    { artist: 'Bob Marley & Tropical Reggae Legends', genre: 'Reggae Chill', prefix: 'Island Vibes', songs: ['Three Little Birds Bob Marley', 'No Woman No Cry', 'One Love Bob Marley', 'Could You Be Loved', 'Is This Love', 'Redemption Song', 'Buffalo Soldier', 'Jamming Bob Marley', 'Waiting in Vain', 'Get Up Stand Up', 'It Wasn’t Me Shaggy', 'Angel Shaggy', 'Boombastic Shaggy', 'Temperature Sean Paul', 'Get Busy Sean Paul', 'Sweat Inner Circle', 'Bad Boys Inner Circle', 'Dreadlock Holiday', 'Sun Is Shining', 'Positive Vibration'] },

    // Classical Violin & Veena Carnatic Meditations
    { artist: 'Carnatic Veena & Violin Maestros', genre: 'Carnatic Classical', prefix: 'Veena & Violin', songs: ['Vatapi Ganapatim Veena', 'Raghuvamsa Sudha Violin', 'Endaro Mahanubhavulu Carnatic', 'Nagumomu Ganaleni Veena', 'Brova Bharama Violin', 'Maha Ganapatim Veena Solo', 'Samaja Vara Gamana Classical', 'Alaipayuthey Kanna Flute & Veena', 'Kalyani Raga Varnam', 'Bhairavi Swarajathi', 'Thillana Lalgudi Jayaraman', 'Hamsadhwani Veena Meditation', 'Charukesi Raga Melody', 'Kapi Raga Deep Reflection', 'Revati Raga Cosmic Veena', 'Sindhu Bhairavi Violin', 'Jagadananda Karaka', 'Devadeva Kalayami', 'Saraswati Namostute', 'Shree Raga Mangalam'] },

    // Indian Classical Santoor & Surbahar Evening Symphony
    { artist: 'Pt. Shivkumar Sharma Santoor Maestros', genre: 'Indian Classical', prefix: 'Santoor Glow', songs: ['Raga Shivranjani Santoor', 'Raga Pahadi Mountain Breeze', 'Raga Bhupali Evening Peace', 'Raga Chandrakauns Night Meditation', 'Raga Hansadhwani Sunrise', 'Raga Pilu Romantic Santoor', 'Raga Jog Deep Trance', 'Raga Darbari Santoor', 'Raga Kafi Spring Melody', 'Raga Tilak Kamod', 'Kashmir Valley Santoor Symphony', 'Melody of Waters Santoor', 'Call of the Valley Morning', 'Call of the Valley Night', 'Lotus Temple Santoor Chimes', 'Himalayan Serenade', 'Peaceful Stream Meditation', 'Sacred Dusk Santoor', 'Valley of Flowers Santoor', 'Inner Peace Santoor Bliss'] },
  ];

  for (const group of ADDITIONAL_CATEGORIES) {
    const artistRecord = await prisma.artist.create({
      data: {
        name: group.artist,
        bio: `${group.artist} is recognized for legendary, soul-stirring contributions to ${group.genre} music.`,
        imageUrl: COVERS[coverIdx % COVERS.length],
        verified: true,
        genres: [group.genre],
      },
    });

    const albumRecord = await prisma.album.create({
      data: {
        title: `${group.prefix} Essentials`,
        artistId: artistRecord.id,
        releaseYear: 2023,
        coverUrl: COVERS[(coverIdx + 3) % COVERS.length],
        genre: group.genre,
      },
    });

    for (const songTitle of group.songs) {
      const audioUrl = AUDIO_STREAMS[streamIdx % AUDIO_STREAMS.length];
      const coverUrl = COVERS[coverIdx % COVERS.length];
      streamIdx++;
      coverIdx++;

      tracksToInsertList.push({
        title: songTitle,
        artist: group.artist,
        artistId: artistRecord.id,
        album: albumRecord.title,
        albumId: albumRecord.id,
        duration: Math.floor(Math.random() * 85) + 165,
        audioUrl,
        coverUrl,
        genre: group.genre,
        plays: Math.floor(Math.random() * 800000) + 90000,
        uploadedById: artistUser.id,
      });
    }
  }

  // Batch insert all tracks (500 items per chunk)
  console.log(`Inserting ${tracksToInsertList.length} tracks in batches...`);
  const chunkSize = 400;
  for (let i = 0; i < tracksToInsertList.length; i += chunkSize) {
    const chunk = tracksToInsertList.slice(i, i + chunkSize);
    await prisma.track.createMany({ data: chunk });
  }

  const allCreatedTracks = await prisma.track.findMany();
  console.log(`✅ Grand Total: Successfully seeded ${allCreatedTracks.length} high-fidelity real tracks in Sonique catalog!`);

  // 4. Create Thematic Curated Playlists
  const PLAYLIST_DEFS = [
    {
      title: "Today's Top Hits",
      description: 'The hottest tracks right now across global and Indian music scenes. Updated daily.',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.plays > 400000,
    },
    {
      title: 'Global Top 50',
      description: 'The most streamed tracks worldwide this week on Sonique.',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => true,
    },
    {
      title: "90's Bollywood Nostalgia",
      description: "Evergreen 90's golden melodies from Kumar Sanu, Alka Yagnik, Udit Narayan, and Lata Mangeshkar.",
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes("90's") || t.artist?.includes('Kumar Sanu') || t.artist?.includes('Udit'),
    },
    {
      title: 'Kannada Chartbusters',
      description: 'The finest Kannada Sandalwood tracks from Dr. Rajkumar, Sanjith Hegde, KGF, and Kantara.',
      coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Kannada') || t.artist?.includes('Kannada') || t.artist?.includes('Rajkumar'),
    },
    {
      title: 'Odia Melody Express',
      description: 'Soulful Odia classics from Akshaya Mohanty, Humane Sagar, Asima Panda, and Ollywood hits.',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Odia') || t.artist?.includes('Odia') || t.artist?.includes('Akshaya'),
    },
    {
      title: 'Devotional & Prayer Sanctuary',
      description: 'Sacred Hanuman Chalisa, Gayatri Mantra, Shiv Stotram, Krishna Bhajans, and peaceful hymns.',
      coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Devotional') || t.genre?.includes('Bhajan') || t.genre?.includes('Gospel') || t.genre?.includes('Spiritual'),
    },
    {
      title: 'Lord Jagannath Bhajans',
      description: 'Immortal Bhikari Bala Bhajans and divine prayers from Puri Jagannath Dham.',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Jagannath') || t.artist?.includes('Bhikari'),
    },
    {
      title: 'Sufi & Qawwali Nights',
      description: 'Ecstatic Sufi trance and spiritual poetry from Nusrat Fateh Ali Khan and Kailash Kher.',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Sufi') || t.artist?.includes('Nusrat'),
    },
    {
      title: 'Bollywood Butter Romance',
      description: 'The ultimate modern Bollywood romantic tracks from Arijit Singh, Shreya Ghoshal, and Pritam.',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Bollywood') || t.artist?.includes('Arijit') || t.artist?.includes('Shreya'),
    },
    {
      title: "90's English Pop & Boybands",
      description: 'Backstreet Boys, Britney Spears, Spice Girls, Michael Jackson, and 90s radio magic.',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes("90's English") || t.artist?.includes('Backstreet') || t.artist?.includes('Britney'),
    },
    {
      title: 'RapCaviar & Trap Energy',
      description: 'Heavy basslines, trap bangers, and chart-topping hip-hop anthems.',
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Hip-Hop') || t.genre?.includes('Trap') || t.genre?.includes('Grunge'),
    },
    {
      title: 'Rock Classics & Stadium Anthems',
      description: 'Queen, Nirvana, Oasis, Coldplay, and legendary arena guitars.',
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=900&q=80',
      trackMatch: (t) => t.genre?.includes('Rock') || t.genre?.includes('Alternative'),
    },
  ];

  for (const pDef of PLAYLIST_DEFS) {
    const matchingTracks = allCreatedTracks.filter(pDef.trackMatch).slice(0, 30);
    const playlist = await prisma.playlist.create({
      data: {
        title: pDef.title,
        description: pDef.description,
        coverUrl: pDef.coverUrl,
        isPublic: true,
        ownerId: demoUser.id,
      },
    });

    const playlistTrackData = matchingTracks.map((tr, pos) => ({
      playlistId: playlist.id,
      trackId: tr.id,
      position: pos,
    }));

    if (playlistTrackData.length > 0) {
      await prisma.playlistTrack.createMany({
        data: playlistTrackData,
      });
    }
  }

  // 5. Create Multi-Lingual & Multi-Category Podcasts
  const PODCAST_SHOWS = [
    {
      title: 'The Ranveer Show (TRS Hindi & English)',
      author: 'Ranveer Allahbadia (BeerBiceps)',
      category: 'Spiritual & Culture',
      description: 'India’s smartest podcast exploring ancient Indian history, spirituality, mythology, health, and life mastery.',
      coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: '#380 - Mystery of Puri Jagannath Temple & Ancient Geeta Wisdom', duration: 5400, audioUrl: AUDIO_STREAMS[0] },
        { title: '#379 - Secrets of Shiv Tandav & Himalayan Yogis with Sadhguru', duration: 6100, audioUrl: AUDIO_STREAMS[1] },
        { title: '#378 - Hanuman Chalisa Power, Focus & Discipline in Modern Life', duration: 4800, audioUrl: AUDIO_STREAMS[2] },
      ],
    },
    {
      title: 'Geeta Saar & Indian Mythology Stories',
      author: 'Devdutt Pattanaik',
      category: 'Mythology & Philosophy',
      description: 'Timeless lessons from the Bhagavad Gita, Mahabharata, Ramayana, and ancient Indian philosophy for everyday life.',
      coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: 'Karma Yoga: Action Without Attachment Explained Simply', duration: 3200, audioUrl: AUDIO_STREAMS[3] },
        { title: 'The Symbolism of Krishna’s Flute and Cosmic Surrender', duration: 2900, audioUrl: AUDIO_STREAMS[4] },
      ],
    },
    {
      title: 'Kannada Kahi & Startup Karnataka',
      author: 'Bangalore Innovators Club',
      category: 'Business & Tech',
      description: 'Stories of Karnataka’s brightest innovators, tech pioneers, and Sandalwood cultural legends.',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: 'Episode 45 - The Evolution of Sandalwood Cinema: From Rajkumar to Kantara', duration: 3600, audioUrl: AUDIO_STREAMS[5] },
        { title: 'Episode 44 - Building AI Unicorns from Namma Bengaluru', duration: 4100, audioUrl: AUDIO_STREAMS[6] },
      ],
    },
    {
      title: 'Odia Galpa & Culture Kahaani',
      author: 'Odisha Heritage Foundation',
      category: 'History & Literature',
      description: 'Fascinating folklore, history of Konark & Kalinga, and stories of Akshaya Mohanty and Odissi music.',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: 'Kalinga Itihasa: The Architectural Marvel of Konark Sun Temple', duration: 3400, audioUrl: AUDIO_STREAMS[7] },
        { title: 'Akshaya Mohanty: The Life and Legacy of Odisha’s Musical Wizard', duration: 3800, audioUrl: AUDIO_STREAMS[8] },
      ],
    },
    {
      title: 'Huberman Lab',
      author: 'Dr. Andrew Huberman',
      category: 'Health & Science',
      description: 'Discusses neuroscience, brain function, dopamine, sleep optimization, and scientifically validated health protocols.',
      coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: 'Master Your Sleep & Accelerate Muscle Recovery', duration: 5400, audioUrl: AUDIO_STREAMS[9] },
        { title: 'Dopamine Dynamics: Drive, Motivation & Addiction', duration: 6200, audioUrl: AUDIO_STREAMS[10] },
      ],
    },
    {
      title: 'Lex Fridman Podcast',
      author: 'Lex Fridman',
      category: 'Technology',
      description: 'Deep, respectful conversations about science, artificial intelligence, philosophy, robotics, and the future of humanity.',
      coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
      episodes: [
        { title: '#420 - Yann LeCun: The Future of Open-Source AI', duration: 9200, audioUrl: AUDIO_STREAMS[11] },
        { title: '#419 - Sam Altman: GPT-5 and Beyond', duration: 7800, audioUrl: AUDIO_STREAMS[12] },
      ],
    },
  ];

  for (const pShow of PODCAST_SHOWS) {
    const showRecord = await prisma.podcastShow.create({
      data: {
        title: pShow.title,
        author: pShow.author,
        category: pShow.category,
        description: pShow.description,
        coverUrl: pShow.coverUrl,
        creatorId: demoUser.id,
      },
    });

    const episodeData = pShow.episodes.map((ep) => ({
      showId: showRecord.id,
      title: ep.title,
      description: `Full high-definition episode: ${ep.title}`,
      audioUrl: ep.audioUrl,
      coverUrl: pShow.coverUrl,
      duration: ep.duration,
    }));

    await prisma.podcastEpisode.createMany({
      data: episodeData,
    });
  }

  // 6. Seed initial liked tracks
  const initialLiked = allCreatedTracks.slice(0, 15);
  for (const tr of initialLiked) {
    await prisma.like.create({
      data: {
        userId: demoUser.id,
        trackId: tr.id,
      },
    });
  }

  console.log(`🎉 Success: Sonique Database fully seeded with ${allCreatedTracks.length} tracks across Hindi, English, Kannada, Odia, 90s, & Devotional music!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
