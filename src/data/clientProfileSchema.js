export const clientProfileSchema = [
  {
    id: "sectionA",
    title: "SECTION A: Essential Identity",
    subtitle: "(Always up to date — quick reference for trip planning)",
    fields: [
      {
        key: "greetName",
        label: "Name we’ll greet you with:",
        type: "text",
      },
      {
        key: "preferredPronouns",
        label: "Preferred pronouns:",
        type: "text",
      },
      {
        key: "currentLocation",
        label: "Where in the world do you currently live?",
        type: "text",
      },
      {
        key: "bestWayToReach",
        label: "Best way to reach you? (Phone, WhatsApp, Email, carrier pigeon, smoke signals?)",
        type: "text",
      },
      {
        key: "nextEscapeWindow",
        label: "When’s your next escape window? (Exact dates if you know, or just a season/month you have in mind.)",
        type: "textarea",
      },
      {
        key: "tinyHumansOrPets",
        label: "Any tiny humans or pets in your travel party (Names, age & personality)",
        type: "textarea",
      },
    ],
  },
  {
    id: "sectionB",
    title: "SECTION B: Current Lifestyle Snapshot",
    subtitle: "(Updated annually — helps keep trips relevant to their current phase of life)",
    fields: [
      {
        key: "liveNow",
        label: "Where do you live now?",
        type: "text",
      },
      {
        key: "livingSituation",
        label: "Living situation: (Solo, with partner, family, kids, pets, etc.)",
        type: "text",
      },
      {
        key: "careerCurrentFocus",
        label: "Career / Current Focus: (for understanding their time & stress levels)",
        type: "textarea",
      },
      {
        key: "typicalEscapeWindows",
        label: "Typical Escape Window(s):",
        type: "text",
      },
      {
        key: "averageTripLengthPreference",
        label: "Average Trip Length Preference:",
        type: "text",
      },
      {
        key: "recentMajorLifeChanges",
        label: "Recent Major Life Changes: (New job, new baby, retirement, relocation, etc.)",
        type: "textarea",
      },
    ],
  },
  {
    id: "sectionC",
    title: "SECTION C: Travel Personality DNA",
    subtitle: "(The fun discovery part — updated as preferences evolve)",
    fields: [
      {
        key: "travelEnergyDrink",
        label: "Travel Energy: If Travel were drink you'd be:",
        type: "radio",
        options: [
          "Aged wine - Luxurious & slow",
          "Espresso Martini - Chic + energetic",
          "Fresh coconut water - Peaceful, restorative & Relaxing",
          "Champagne - Celebratory + Sparkling",
          "Whiskey on Rocks - Purpose-driven (learning, events)",
        ],
      },
      {
        key: "wouldYouRatherOceanOrMountain",
        label: "Would you rather… Wake up to ocean waves or mountain air?",
        type: "radio",
        options: ["Ocean waves", "Mountain air"],
      },
      {
        key: "wouldYouRatherExploreOrLounge",
        label: "Would you rather… Spend the day exploring or lounging?",
        type: "radio",
        options: ["Exploring", "Lounging"],
      },
      {
        key: "wouldYouRatherStreetFoodOrMichelin",
        label: "Would you rather… Try street food or Michelin star dining?",
        type: "radio",
        options: ["Street food", "Michelin star dining"],
      },
      {
        key: "wouldYouRatherPlanOrFlow",
        label: "Would you rather… Plan everything in advance or go with the flow?",
        type: "radio",
        options: ["Plan everything in advance", "Go with the flow"],
      },
      {
        key: "preferredClimate",
        label: "1. Preferred Climate: (Cool, tropical, mild, don’t care)",
        type: "text",
      },
      {
        key: "idealTravelSoundtrack",
        label: "2. Your ideal travel soundtrack: (Pick genres, artists, or moods — e.g. deep house at sunset, 90s Bollywood nostalgia)",
        type: "textarea",
      },
      {
        key: "holidayMovie",
        label: "3. Choose a holiday movie that’s basically “you” on vacation:",
        type: "radioWithOther",
        options: [
          "Eat Pray Love — soulful discovery",
          "The Beach — barefoot adventure",
          "Crazy Rich Asians — pure glam",
          "Into the Wild — untamed nature",
          "The Grand Budapest Hotel — quirky luxury",
          "Other",
        ],
      },
      {
        key: "travelExcitement",
        label: "4. When you travel, you’re most excited about:",
        type: "checkbox",
        options: [
          "Culinary experiences",
          "Cultural immersion",
          "Adventure sports",
          "Luxury indulgence",
          "Wellness & retreats",
          "Shopping & fashion",
        ],
      },
      {
        key: "tripVibeWords",
        label: "5. The Vibe You Want Each Trip to Have: (Choose words — e.g. romantic, thrilling, indulgent, spiritual)",
        type: "textarea",
      },
      {
        key: "travelSpiritAnimal",
        label: "6. Your Travel Spirit Animal: (a character, celebrity, or fictional figure — purely for fun)",
        type: "text",
      },
    ],
  },
  {
    id: "sectionD",
    title: "SECTION D: Must-Haves & No-Gos",
    subtitle: "(Critical planning checklist — doesn’t change often)",
    fields: [
      {
        key: "accommodationMustHaves",
        label: "Accommodation Must-Haves: (Private pool, sea view, butler service, etc.)",
        type: "textarea",
      },
      {
        key: "absoluteDealBreakers",
        label: "Absolute Deal-Breakers: (Crowds, budget hotels, red-eye flights, etc.)",
        type: "textarea",
      },
      {
        key: "preferredAirlinesLoyaltyPrograms",
        label: "Preferred Airlines / Loyalty Programs:",
        type: "textarea",
      },
      {
        key: "dietaryPreferencesRestrictions",
        label: "Dietary Preferences & Restrictions:",
        type: "textarea",
      },
      {
        key: "healthMobilityConsiderations",
        label: "Health / Mobility Considerations:",
        type: "textarea",
      },
    ],
  },
  {
    id: "sectionE",
    title: "SECTION E: Past Travels",
    subtitle: "(Your database of their history — updated after each trip)",
    fields: [
      {
        key: "favoritePastDestinationsWhy",
        label: "Favourite Past Destinations & Why:",
        type: "textarea",
      },
      {
        key: "wontReturnDestinationsWhy",
        label: "Places They Won’t Return To & Why:",
        type: "textarea",
      },
      {
        key: "mostMemorableExperiencesEver",
        label: "Most Memorable Experiences Ever:",
        type: "textarea",
      },
      {
        key: "repeatDestinationComfortZones",
        label: "Repeat-Destination Comfort Zones: (places they’ll always enjoy revisiting)",
        type: "textarea",
      },
    ],
  },
  {
    id: "sectionF",
    title: "SECTION F: Future Wishlist",
    subtitle: "(Planning gold — updated at least annually)",
    fields: [
      {
        key: "top5BucketListDestinations",
        label: "Top 5 Bucket List Destinations:",
        type: "textarea",
      },
      {
        key: "dreamExperiences",
        label: "Dream Experiences: (e.g. hot air balloon in Cappadocia, Maldives overwater villa, Kyoto cherry blossoms)",
        type: "textarea",
      },
      {
        key: "specialEventsTravelFor",
        label: "Special Events They’d Travel For: (F1 races, fashion weeks, concerts, festivals)",
        type: "textarea",
      },
      {
        key: "surpriseTolerance",
        label: "Surprise Tolerance: (Love surprises / Only if luxury / No surprises)",
        type: "radio",
        options: [
          "Love surprises",
          "Only if luxury",
          "No surprises",
        ],
      },
    ],
  },
  {
    id: "sectionG",
    title: "SECTION G: Signature Extras",
    subtitle: "(For your luxury touches)",
    fields: [
      {
        key: "favoriteCuisinesDishes",
        label: "Favourite Cuisines & Dishes:",
        type: "textarea",
      },
      {
        key: "preferredWineDrinkChoices",
        label: "Preferred Wine/Drink Choices:",
        type: "text",
      },
      {
        key: "favoriteColourPaletteInInteriors",
        label: "Favourite Colour Palette in Interiors: (helps for villa/hotel aesthetics)",
        type: "text",
      },
      {
        key: "fashionStyleReference",
        label: "Fashion Style Reference: (brands or looks they love)",
        type: "textarea",
      },
      {
        key: "hobbiesPassions",
        label: "Hobbies & Passions:",
        type: "textarea",
      },
      {
        key: "musicPlaylistForTravels",
        label: "Music Playlist for Travels:",
        type: "textarea",
      },
    ],
  },
  {
    id: "sectionH",
    title: "SECTION H: LŌQÉ Annual Review Log",
    subtitle: "(A dedicated space where you note life updates & preference shifts every year)",
    fields: [
      {
        key: "annualReviewLog",
        label: "Annual Review Log",
        type: "arrayOfObjects",
        columns: [
          { key: "year", label: "Year" },
          { key: "majorLifeChanges", label: "Major Life Changes" },
          { key: "updatedTravelPreferences", label: "Updated Travel Preferences" },
          { key: "upcomingImportantDates", label: "Upcoming Important Dates" },
        ],
      },
    ],
  },
];