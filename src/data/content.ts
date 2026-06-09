export const navItems = [
  { label: "Home", href: "/" },
  { label: "Daily Check-ins", href: "/check-ins" },
  { label: "Memories", href: "/memories" },
  { label: "Love Notes", href: "/notes" },
  { label: "Special Dates", href: "/anniversaries" },
  { label: "Favorites", href: "/links" },
  { label: "Our Story", href: "/story" },
  { label: "Chat", href: "/chat" },


];

export const memories = [
  {
    title: "Favorite Picture",
    date: "Pinned forever",
    type: "Photo",
    body: "Save the photo that feels like a full chapter of us.",
    comments: 4,
  },
  {
    title: "Special Moment",
    date: "Our little archive",
    type: "Memory",
    body: "Keep the date, place, feeling, and story behind this moment.",
    comments: 7,
  },
  {
    title: "Shared Link",
    date: "For later",
    type: "Link",
    body: "Save songs, videos, places, and ideas we want to come back to.",
    comments: 2,
  },
];

export const notes = [
  "Good morning, my love. I hope today feels soft, kind, and beautiful to you.",
  "Reminder: you are loved in every little way, every single day.",
  "Tonight, let’s save one tiny beautiful thing from today.",
];

export const chatPreview = [
  {
    author: "Jak",
    text: "I added a memory from today.",
    tone: "bg-white",
  },
  {
    author: "Vee",
    text: "Commenting on it now. That photo feels so us.",
    tone: "bg-[#FFD6E8]",
  },
  {
    author: "Jak",
    text: "I left you a morning note too.",
    tone: "bg-white",
  },
];

export const commentThreads = [
  {
    target: "Photo",
    title: "Beach sunset picture",
    comments: [
      "This one belongs on the first page.",
      "The sky looks like our kind of love.",
    ],
  },
  {
    target: "Note",
    title: "Morning note draft",
    comments: [
      "Save this for Monday.",
      "Add one more sweet line.",
    ],
  },
  {
    target: "Chat",
    title: "Dinner plan message",
    comments: [
      "Pin this so we do not forget.",
      "Add the restaurant link.",
    ],
  },
];

export const relationshipPrompts = [
  { label: "Good morning, baby", href: "/check-ins" },
  { label: "What are your plans today?", href: "/check-ins" },
  { label: "What do you want to achieve today?", href: "/check-ins" },
  { label: "How are you feeling right now?", href: "/check-ins" },
  { label: "Where are you right now?", href: "/check-ins" },
  { label: "When can I see you today?", href: "/check-ins" },
  { label: "Write a love note", href: "/notes" },
  { label: "Add a memory", href: "/memories" },
  { label: "Save a special date", href: "/anniversaries" },
  { label: "Share a song or video", href: "/links" },
  { label: "Add to our story", href: "/story" },
];

export const dailyCheckIns = [
  {
    type: "morning",
    title: "Good Morning",
    detail: "Start the day with a sweet message that stays saved.",
  },
  {
    type: "plans",
    title: "Today’s Plans",
    detail: "Share work, classes, errands, schedules, and small plans for the day.",
  },
  {
    type: "goals",
    title: "Today’s Goal",
    detail: "Write what each of you hopes to achieve before the day ends.",
  },
  {
    type: "mood",
    title: "Mood Check",
    detail: "Share how you are feeling so the other person can love you better today.",
  },
  {
    type: "location",
    title: "Where Are You?",
    detail: "A gentle check-in to feel close, safe, and cared for.",
  },
  {
    type: "meet_time",
    title: "When Can I See You?",
    detail: "Keep possible meet-up times in one easy place.",
  },
  {
    type: "evening",
    title: "End-of-Day Check-in",
    detail: "Close the day with your mood, gratitude, and one honest feeling.",
  },
  {
    type: "miss_you",
    title: "I Miss You",
    detail: "Send a tiny message when you are craving closeness.",
  },
  {
    type: "date_idea",
    title: "Date Idea",
    detail: "Save something sweet you want to do together.",
  },
  {
    type: "food_craving",
    title: "Food Craving",
    detail: "Share cravings, dinner ideas, snacks, or places to try.",
  },
  {
    type: "song_mood",
    title: "Song Mood",
    detail: "Drop the song that feels like today or feels like us.",
  },
  {
    type: "compliment",
    title: "One Thing I Love About You",
    detail: "Leave a compliment, appreciation, or soft reminder.",
  },
  {
    type: "prayer_wish",
    title: "Prayer or Wish",
    detail: "Share what you are hoping, praying, or wishing for.",
  },
  {
    type: "memory_spark",
    title: "Remember When...",
    detail: "Capture a random memory before it fades.",
  },
  {
    type: "need_comfort",
    title: "I Need Comfort",
    detail: "Say when you need softness, reassurance, or attention.",
  },
  {
    type: "grateful",
    title: "I’m Grateful For...",
    detail: "Share one thing you appreciate about each other or the day.",
  },
];

export const anniversaries = [
  {
    title: "First Hello",
    date: "Add date",
    detail: "The beginning of our story.",
  },
  {
    title: "Monthly Anniversary",
    date: "Every month",
    detail: "A soft reminder to celebrate the little milestones.",
  },
  {
    title: "Special Day",
    date: "Add date",
    detail: "Birthdays, surprises, trips, promises, and days worth remembering.",
  },
];

export const sharedLinks = [
  {
    title: "Song for Today",
    type: "Music",
    detail: "Save songs that say what words cannot.",
  },
  {
    title: "Watch Together",
    type: "Video",
    detail: "Keep funny, sweet, or meaningful videos for later.",
  },
  {
    title: "Favorite Place",
    type: "Place",
    detail: "Restaurants, date ideas, travel dreams, and cozy spots to visit.",
  },
];

export const storyChapters = [
  {
    title: "How We Started",
    detail: "The first chapter of Jak and Vee.",
  },
  {
    title: "Things We Survived",
    detail: "Proof that love keeps choosing each other.",
  },
  {
    title: "Dreams Ahead",
    detail: "Plans, hopes, future dates, and the life we are building together.",
  },
];
