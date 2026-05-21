export type Appointment = {
  id: string;
  customerName: string;
  service: string;
  services?: string[];
  duration: number; // minutes
  startTime: string; // "HH:MM"
  employee: "Aynur" | "Monika" | "Lisa";
  channel: "whatsapp" | "instagram" | "phone" | "email";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  depositPaid?: boolean;
  depositAmount?: number;
  totalAmount: number;
  customerPhone?: string;
  isVIP?: boolean;
  language?: string;
  langFlag?: string;
  avatar?: string;
};

export type Message = {
  id: string;
  role: "customer" | "paul" | "human";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
};

export type Conversation = {
  id: string;
  customerName: string;
  channel: "whatsapp" | "instagram" | "email" | "voice";
  lastMessage: string;
  time: string;
  unread: number;
  status: "neu" | "buchung" | "abgeschlossen" | "wartend";
  language: string;
  langFlag: string;
  isVIP?: boolean;
  isRegular?: boolean;
  paulTyping?: boolean;
  paulPaused?: boolean;
  avatar: string;
  messages: Message[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastVisit: string;
  nextAppointment?: string;
  totalVisits: number;
  totalRevenue: number;
  preferredService: string;
  isVIP: boolean;
  isRegular: boolean;
  birthday?: string;
  language: string;
  langFlag: string;
  followUpSuggestion?: string;
  waitlisted?: boolean;
  avatar: string;
  tags: string[];
};

export const todayAppointments: Appointment[] = [
  {
    id: "a1",
    customerName: "Fatma Yilmaz",
    service: "Färben + Schneiden",
    services: ["Haarfärbung", "Haarschnitt"],
    duration: 120,
    startTime: "09:00",
    employee: "Aynur",
    channel: "whatsapp",
    status: "confirmed",
    depositPaid: true,
    depositAmount: 14,
    totalAmount: 70,
    customerPhone: "+49 176 1234 5678",
    isVIP: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    avatar: "FY",
  },
  {
    id: "a2",
    customerName: "Sarah Müller",
    service: "Strähnen + Pflege",
    services: ["Strähnen", "Haarpflege-Behandlung"],
    duration: 150,
    startTime: "09:30",
    employee: "Monika",
    channel: "instagram",
    status: "confirmed",
    depositPaid: true,
    depositAmount: 18,
    totalAmount: 90,
    customerPhone: "+49 151 9876 5432",
    isVIP: false,
    language: "Deutsch",
    langFlag: "🇩🇪",
    avatar: "SM",
  },
  {
    id: "a3",
    customerName: "Kemal Arslan",
    service: "Herrenschnitt",
    duration: 45,
    startTime: "11:00",
    employee: "Aynur",
    channel: "phone",
    status: "confirmed",
    depositPaid: false,
    totalAmount: 25,
    language: "Türkisch",
    langFlag: "🇹🇷",
    avatar: "KA",
  },
  {
    id: "a4",
    customerName: "Emma Johnson",
    service: "Keratin-Behandlung",
    services: ["Keratin", "Styling"],
    duration: 180,
    startTime: "12:00",
    employee: "Lisa",
    channel: "email",
    status: "pending",
    depositPaid: false,
    totalAmount: 120,
    language: "Englisch",
    langFlag: "🇬🇧",
    avatar: "EJ",
  },
  {
    id: "a5",
    customerName: "Zeynep Kaya",
    service: "Balayage",
    duration: 180,
    startTime: "13:00",
    employee: "Monika",
    channel: "whatsapp",
    status: "confirmed",
    depositPaid: true,
    depositAmount: 20,
    totalAmount: 100,
    isVIP: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    avatar: "ZK",
  },
  {
    id: "a6",
    customerName: "Lena Fischer",
    service: "Haarschnitt + Styling",
    duration: 60,
    startTime: "14:30",
    employee: "Lisa",
    channel: "whatsapp",
    status: "confirmed",
    depositPaid: false,
    totalAmount: 45,
    language: "Deutsch",
    langFlag: "🇩🇪",
    avatar: "LF",
  },
  {
    id: "a7",
    customerName: "Mehmet Demir",
    service: "Bart + Schnitt",
    duration: 60,
    startTime: "15:00",
    employee: "Aynur",
    channel: "whatsapp",
    status: "confirmed",
    depositPaid: false,
    totalAmount: 35,
    language: "Türkisch",
    langFlag: "🇹🇷",
    avatar: "MD",
  },
  {
    id: "a8",
    customerName: "Anna Schneider",
    service: "Dauerwelle",
    duration: 120,
    startTime: "16:00",
    employee: "Monika",
    channel: "email",
    status: "confirmed",
    depositPaid: true,
    depositAmount: 16,
    totalAmount: 80,
    language: "Deutsch",
    langFlag: "🇩🇪",
    avatar: "AS",
  },
];

export const weekMetrics = {
  revenueByPaul: 1840,
  revenueTrend: 23.4,
  savedAppointments: 14,
  savedAppointmentsTrend: 8,
  timeSaved: 18.5,
  timeSavedUnit: "Std.",
  noShowRate: 1.2,
  noShowRateDelta: -3.8,
  totalConversations: 47,
  bookingRate: 78,
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    customerName: "Zeynep Kaya",
    channel: "whatsapp",
    lastMessage: "Super, dann bis Dienstag! 🙏",
    time: "Jetzt",
    unread: 0,
    status: "buchung",
    language: "Türkisch",
    langFlag: "🇹🇷",
    isVIP: true,
    paulPaused: false,
    avatar: "ZK",
    messages: [
      { id: "m1", role: "customer", text: "Hallo, ich möchte gerne einen Termin für Balayage", time: "10:12" },
      { id: "m2", role: "paul", text: "Hallo Zeynep! 👋 Gerne helfe ich dir mit einem Termin für Balayage. Wann passt es dir am besten?", time: "10:12" },
      { id: "m3", role: "customer", text: "Am Dienstag so gegen 13 Uhr wäre perfekt", time: "10:14" },
      { id: "m4", role: "paul", text: "Perfekt! Dienstag um 13:00 Uhr ist noch verfügbar. Monika wäre deine Stylistin (3h). Da der Gesamtpreis 100€ beträgt, benötigen wir eine Anzahlung von 20€ (20%). Soll ich den Termin für dich reservieren?", time: "10:14" },
      { id: "m5", role: "customer", text: "Ja bitte! Wie zahle ich die Anzahlung?", time: "10:16" },
      { id: "m6", role: "paul", text: "Super! Ich schicke dir gleich einen sicheren Zahlungslink via Stripe. Sobald die 20€ eingegangen sind, ist dein Termin fest gebucht. ✨", time: "10:16" },
      { id: "m7", role: "customer", text: "Super, dann bis Dienstag! 🙏", time: "10:18" },
    ],
  },
  {
    id: "c2",
    customerName: "Emma Johnson",
    channel: "instagram",
    lastMessage: "Is it possible to get an appointment this week?",
    time: "vor 12 Min",
    unread: 2,
    status: "neu",
    language: "Englisch",
    langFlag: "🇬🇧",
    paulTyping: true,
    avatar: "EJ",
    messages: [
      { id: "m1", role: "customer", text: "Hi! I found you on Instagram. Is it possible to get an appointment this week?", time: "10:31" },
      { id: "m2", role: "customer", text: "Is it possible to get an appointment this week?", time: "10:43" },
    ],
  },
  {
    id: "c3",
    customerName: "Fatma Yilmaz",
    channel: "whatsapp",
    lastMessage: "Teşekkürler, yarın görüşürüz!",
    time: "vor 1 Std",
    unread: 0,
    status: "abgeschlossen",
    language: "Türkisch",
    langFlag: "🇹🇷",
    isVIP: true,
    isRegular: true,
    avatar: "FY",
    messages: [
      { id: "m1", role: "paul", text: "Merhaba Fatma Hanım! 👋 Yarın saat 09:00'da randevunuzu hatırlatmak istedim. Renk + Kesim için Aynur sizi bekleyecek.", time: "09:00" },
      { id: "m2", role: "customer", text: "Teşekkürler, yarın görüşürüz!", time: "09:05" },
    ],
  },
  {
    id: "c4",
    customerName: "Kemal Arslan",
    channel: "voice",
    lastMessage: "Transkript: Herrenschnitt Termin um 11 Uhr bestätigt",
    time: "vor 2 Std",
    unread: 0,
    status: "buchung",
    language: "Türkisch",
    langFlag: "🇹🇷",
    avatar: "KA",
    messages: [
      { id: "m1", role: "paul", text: "🎙️ Voice-Transkript: Paul hat den Anruf entgegengenommen. Herr Arslan wünschte einen Herrenschnitt. Termin um 11:00 Uhr bei Aynur bestätigt.", time: "08:45" },
    ],
  },
  {
    id: "c5",
    customerName: "Sarah Müller",
    channel: "email",
    lastMessage: "Vielen Dank für die schnelle Antwort!",
    time: "gestern",
    unread: 0,
    status: "abgeschlossen",
    language: "Deutsch",
    langFlag: "🇩🇪",
    isRegular: true,
    avatar: "SM",
    messages: [
      { id: "m1", role: "customer", text: "Guten Tag, ich würde gerne einen Termin für Strähnen + Pflege buchen. Haben Sie nächste Woche noch etwas frei?", time: "gestern 14:22" },
      { id: "m2", role: "paul", text: "Liebe Frau Müller, vielen Dank für Ihre Anfrage! Für Strähnen + Pflege empfehle ich unsere Spezialistin Monika. Morgen um 09:30 Uhr hätte sie noch Zeit (ca. 2,5 Std.). Gesamtpreis: 90€. Soll ich den Termin für Sie reservieren?", time: "gestern 14:22" },
      { id: "m3", role: "customer", text: "Ja, das passt perfekt. Vielen Dank für die schnelle Antwort!", time: "gestern 14:35" },
    ],
  },
  {
    id: "c6",
    customerName: "Lena Fischer",
    channel: "whatsapp",
    lastMessage: "Kann ich den Termin auf 15 Uhr verschieben?",
    time: "vor 3 Std",
    unread: 1,
    status: "wartend",
    language: "Deutsch",
    langFlag: "🇩🇪",
    paulPaused: true,
    avatar: "LF",
    messages: [
      { id: "m1", role: "customer", text: "Hallo! Ich habe heute einen Termin um 14:30 Uhr. Kann ich den Termin auf 15 Uhr verschieben?", time: "08:10" },
    ],
  },
];

export const customers: Customer[] = [
  {
    id: "cu1",
    name: "Zeynep Kaya",
    phone: "+49 176 9876 5432",
    email: "zeynep.kaya@gmail.com",
    lastVisit: "vor 3 Wochen",
    nextAppointment: "Dienstag, 13:00",
    totalVisits: 24,
    totalRevenue: 2180,
    preferredService: "Balayage",
    isVIP: true,
    isRegular: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    birthday: "1990-03-15",
    avatar: "ZK",
    tags: ["VIP", "Stammkundin", "Balayage-Expertin"],
  },
  {
    id: "cu2",
    name: "Sarah Müller",
    phone: "+49 151 9876 5432",
    email: "sarah.mueller@web.de",
    lastVisit: "vor 7 Wochen",
    nextAppointment: "Morgen, 09:30",
    totalVisits: 12,
    totalRevenue: 890,
    preferredService: "Strähnen",
    isVIP: false,
    isRegular: true,
    language: "Deutsch",
    langFlag: "🇩🇪",
    followUpSuggestion: "Sarahs letzte Strähnen-Behandlung war vor 7 Wochen. Roots wachsen nach — guter Zeitpunkt für eine Erinnerung!",
    avatar: "SM",
    tags: ["Stammkundin"],
  },
  {
    id: "cu3",
    name: "Fatma Yilmaz",
    phone: "+49 176 1234 5678",
    lastVisit: "Morgen (Termin)",
    totalVisits: 31,
    totalRevenue: 2860,
    preferredService: "Färben + Schneiden",
    isVIP: true,
    isRegular: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    birthday: "1985-08-22",
    avatar: "FY",
    tags: ["VIP", "Stammkundin", "Farb-Spezialist"],
  },
  {
    id: "cu4",
    name: "Emma Johnson",
    phone: "+49 157 4567 8901",
    email: "emma.j@hotmail.com",
    lastVisit: "Erstbesuch",
    totalVisits: 0,
    totalRevenue: 0,
    preferredService: "Keratin-Behandlung",
    isVIP: false,
    isRegular: false,
    language: "Englisch",
    langFlag: "🇬🇧",
    waitlisted: true,
    avatar: "EJ",
    tags: ["Neukunde"],
  },
  {
    id: "cu5",
    name: "Büşra Şahin",
    phone: "+49 176 2345 6789",
    lastVisit: "vor 2 Wochen",
    totalVisits: 8,
    totalRevenue: 540,
    preferredService: "Haarpflege",
    isVIP: false,
    isRegular: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    waitlisted: true,
    avatar: "BŞ",
    tags: ["Warteliste"],
  },
  {
    id: "cu6",
    name: "Lena Fischer",
    phone: "+49 151 3456 7890",
    lastVisit: "vor 5 Wochen",
    nextAppointment: "Heute, 14:30",
    totalVisits: 6,
    totalRevenue: 320,
    preferredService: "Haarschnitt + Styling",
    isVIP: false,
    isRegular: false,
    language: "Deutsch",
    langFlag: "🇩🇪",
    birthday: "1995-05-21",
    followUpSuggestion: "Lenas Geburtstag ist heute! 🎂 Soll Paul ihr einen Geburtstagsrabatt-Gutschein schicken?",
    avatar: "LF",
    tags: ["Geburtstag heute 🎂"],
  },
  {
    id: "cu7",
    name: "Ayşe Doğan",
    phone: "+49 177 8765 4321",
    lastVisit: "vor 4 Wochen",
    totalVisits: 15,
    totalRevenue: 1240,
    preferredService: "Dauerwelle",
    isVIP: false,
    isRegular: true,
    language: "Türkisch",
    langFlag: "🇹🇷",
    waitlisted: true,
    avatar: "AD",
    tags: ["Warteliste", "Stammkundin"],
  },
];

export const aiSettings = {
  reminders24h: true,
  stripeDeposit: true,
  multiLanguage: true,
  instagramAutoReply: true,
  noShowFollowUp: true,
  birthdayMessages: true,
  depositThreshold: 50,
  depositPercent: 20,
  note: "",
};
