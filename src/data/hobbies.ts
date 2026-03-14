import hobbyWatercolor from "@/assets/hobby-watercolor.jpg";
import hobbyElectronics from "@/assets/hobby-electronics.jpg";
import hobbyHiking from "@/assets/hobby-hiking.jpg";
import hobbyOrigami from "@/assets/hobby-origami.jpg";
import hobbyChess from "@/assets/hobby-chess.jpg";
import hobbyPhotography from "@/assets/hobby-photography.jpg";
import hobbyLinocut from "@/assets/hobby-linocut.jpg";
import hobbyEsports from "@/assets/hobby-esports.jpg";

export interface Hobby {
  id: string;
  name: string;
  category: "Art" | "Tech" | "Outdoors" | "Mindfulness";
  image: string;
  quickTip: string;
  tagline: string;
  difficulty: string;
  cost: string;
  timeCommitment: string;
  guide: {
    intro: string;
    steps: string[];
    firstProject: string;
  };
}

export const HOBBIES: Hobby[] = [
  {
    id: "watercolor",
    name: "Watercolor Painting",
    category: "Art",
    image: hobbyWatercolor,
    quickTip: "Start with only 3 colors — red, yellow, blue. You can mix everything else.",
    tagline: "Fluid expression on paper",
    difficulty: "Beginner",
    cost: "$15 starter kit",
    timeCommitment: "30 min sessions",
    guide: {
      intro: "Watercolor is one of the most forgiving and portable art forms. All you need is a brush, paper, and a few pans of paint to begin creating beautiful washes and textures.",
      steps: [
        "Get a basic watercolor set (12-pan travel kit works great)",
        "Practice wet-on-wet technique: wet the paper first, then drop color in",
        "Learn to control water-to-pigment ratio for light vs. intense color",
        "Start with simple subjects: a single leaf, a sunset gradient, an apple",
        "Embrace 'happy accidents' — watercolor's unpredictability is its charm",
      ],
      firstProject: "Paint a simple gradient sunset using just 2 colors. Wet your paper, apply warm yellow at the top, and blend into a dusty rose at the bottom.",
    },
  },
  {
    id: "electronics",
    name: "Arduino & Electronics",
    category: "Tech",
    image: hobbyElectronics,
    quickTip: "An LED + resistor + battery is your 'Hello World' of electronics.",
    tagline: "Build circuits, build confidence",
    difficulty: "Intermediate",
    cost: "$30 starter kit",
    timeCommitment: "1-2 hour sessions",
    guide: {
      intro: "Electronics tinkering lets you bring ideas to life with circuits, sensors, and code. Arduino makes it approachable — no engineering degree required.",
      steps: [
        "Get an Arduino Uno starter kit with breadboard and components",
        "Install the Arduino IDE and upload the built-in 'Blink' sketch",
        "Learn the basics: voltage, current, resistance (Ohm's Law)",
        "Build simple circuits: LED blinkers, button inputs, buzzer alarms",
        "Graduate to sensors: temperature, light, motion detection",
      ],
      firstProject: "Make an LED blink using Arduino's built-in example. Then modify the timing to create your own pattern — like a heartbeat pulse.",
    },
  },
  {
    id: "hiking",
    name: "Trail Hiking",
    category: "Outdoors",
    image: hobbyHiking,
    quickTip: "Your first hike should be under 3 miles. Comfort builds confidence.",
    tagline: "Step outside, find yourself",
    difficulty: "Beginner",
    cost: "Free to start",
    timeCommitment: "Half-day weekends",
    guide: {
      intro: "Hiking is the simplest way to reconnect with nature. No gym membership, no equipment list — just a trail and a pair of decent shoes.",
      steps: [
        "Find a local trail on AllTrails or your park service website",
        "Start with short, flat trails (under 3 miles, minimal elevation)",
        "Wear layers and bring more water than you think you need",
        "Learn basic trail etiquette: yield to uphill hikers, pack out trash",
        "Gradually increase distance and elevation as your fitness grows",
      ],
      firstProject: "Pick a local nature trail under 2 miles. Hike it at a comfortable pace, stop to notice 5 things you've never seen before, and take one photo that captures the mood.",
    },
  },
  {
    id: "origami",
    name: "Origami",
    category: "Art",
    image: hobbyOrigami,
    quickTip: "Use printer paper to practice — save the fancy paper for when you're confident.",
    tagline: "Fold paper, unfold patience",
    difficulty: "Beginner",
    cost: "Free",
    timeCommitment: "15 min sessions",
    guide: {
      intro: "Origami transforms a flat sheet of paper into sculpture through nothing but folding. It's meditative, portable, and endlessly satisfying.",
      steps: [
        "Start with standard 6x6 inch origami paper (or cut printer paper into squares)",
        "Learn the two base folds: mountain fold and valley fold",
        "Master 3 classic models: crane, boat, jumping frog",
        "Focus on crisp, precise creases — use a bone folder or ruler edge",
        "Try modular origami: multiple units that connect into geometric shapes",
      ],
      firstProject: "Fold a classic paper crane. It takes about 15 minutes for a beginner and teaches you most of the fundamental folds you'll use in every future project.",
    },
  },
  {
    id: "chess",
    name: "Chess",
    category: "Tech",
    image: hobbyChess,
    quickTip: "Learn just 3 openings well rather than memorizing dozens poorly.",
    tagline: "Ancient game, endless depth",
    difficulty: "Beginner to Advanced",
    cost: "Free online",
    timeCommitment: "15-60 min games",
    guide: {
      intro: "Chess is a 1,500-year-old game of strategy that sharpens pattern recognition, planning, and patience. Online platforms make it easy to start today.",
      steps: [
        "Learn how each piece moves (takes about 10 minutes)",
        "Understand the basic principles: control the center, develop pieces, castle early",
        "Play on Lichess.org (free) or Chess.com — start with 10-minute games",
        "After each game, review your mistakes with the built-in analysis tool",
        "Study 1-2 basic openings and practice tactical puzzles daily",
      ],
      firstProject: "Play 5 games online against the computer at an easy setting. Focus on one rule: 'Before moving, ask — is my piece safe here?'",
    },
  },
  {
    id: "photography",
    name: "Nature Photography",
    category: "Outdoors",
    image: hobbyPhotography,
    quickTip: "The best camera is the one you have. Start with your phone's manual mode.",
    tagline: "See the world in frames",
    difficulty: "Beginner",
    cost: "Free (phone) to $$$",
    timeCommitment: "Weekend walks",
    guide: {
      intro: "Nature photography trains your eye to notice beauty in the everyday. You don't need an expensive camera — a smartphone and curiosity are enough to begin.",
      steps: [
        "Enable your phone's grid lines (rule of thirds) and shoot in natural light",
        "Learn the golden hour: shoot within 1 hour of sunrise or sunset",
        "Practice with constraints: photograph only textures, or only green things",
        "Study composition: leading lines, framing, negative space",
        "Edit lightly — adjust exposure and contrast, but keep it natural",
      ],
      firstProject: "Take a 20-minute 'photo walk' near your home. Capture 10 images of small details: cracks in pavement, light through leaves, a rusty hinge. Pick your favorite and share it.",
    },
  },
  {
    id: "linocut",
    name: "Linocut Printing",
    category: "Art",
    image: hobbyLinocut,
    quickTip: "Always cut away from your body. A sharp tool is safer than a dull one.",
    tagline: "Carve, ink, press, repeat",
    difficulty: "Intermediate",
    cost: "$20 starter kit",
    timeCommitment: "1-2 hour sessions",
    guide: {
      intro: "Linocut is a printmaking technique where you carve a design into linoleum, ink it, and press it onto paper. Each print is unique — beautifully imperfect.",
      steps: [
        "Get a beginner linocut kit (block, carving tools, ink, brayer, paper)",
        "Sketch your design on paper first, then transfer it to the block",
        "Start with simple bold shapes — fine detail comes with practice",
        "Apply ink evenly with a brayer, then press paper firmly onto the block",
        "Pull your first print and admire the beautiful imperfections",
      ],
      firstProject: "Carve a simple leaf shape into a small linoleum block. Print it 5 times on different papers to see how the texture varies with pressure and ink amount.",
    },
  },
  {
    id: "esports",
    name: "Esports & Competitive Gaming",
    category: "Tech",
    image: hobbyEsports,
    quickTip: "Pick one game and master it — spreading across titles slows your growth.",
    tagline: "Compete, strategize, dominate",
    difficulty: "Beginner to Advanced",
    cost: "Free to $$$",
    timeCommitment: "1-2 hour sessions",
    guide: {
      intro: "Esports turns gaming into a structured pursuit of mastery. Whether it's tactical shooters, MOBAs, or fighting games, competitive gaming builds reflexes, teamwork, and strategic thinking.",
      steps: [
        "Choose one competitive game that excites you (Valorant, League of Legends, Rocket League, etc.)",
        "Learn the fundamentals: map awareness, economy management, or character matchups",
        "Watch pro players and study their decision-making, not just their aim",
        "Use aim trainers or practice modes to build mechanical skill daily",
        "Join a community or Discord server to find teammates and scrimmage",
      ],
      firstProject: "Play 10 ranked matches in your chosen game. After each one, write down one mistake you made and one thing you did well. Review the list after all 10 games to spot patterns.",
    },
  },
];

export const CATEGORIES = ["All", "Art", "Tech", "Outdoors", "Mindfulness"] as const;
