const fallbackImage =
  "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500";

function createLessons(courseTitle, level, videoUrl) {
  return [
    {
      title: `${courseTitle}: кіріспе`,
      duration: "10 минут",
      videoUrl,
      summary: `${level} деңгейіне арналған алғашқы сабақта негізгі сөздер мен сөйлесу үлгілері беріледі.`,
      task: {
        question: "Ресми амандасуға қай сөз көбірек қолданылады?",
        options: ["Bonjour", "Salut", "Merci", "Au revoir"],
        correctAnswer: "Bonjour",
        explanation: "Bonjour ресми және күнделікті амандасуда жиі қолданылады.",
        challenge: "Өзіңізді французша 2 сөйлеммен таныстырыңыз.",
      },
    },
    {
      title: `${courseTitle}: практика`,
      duration: "12 минут",
      videoUrl,
      summary: "Бұл бөлімде қысқа диалог пен сөз тіркестерін бекітесіз.",
      task: {
        question: "\"Менде бар\" құрылымы қайсысы?",
        options: ["Je suis", "J'ai", "Nous sommes", "Il est"],
        correctAnswer: "J'ai",
        explanation: "J'ai - avoir етістігінің 1-жақ формасы.",
        challenge: "Avoir етістігімен 2 қарапайым сөйлем құрыңыз.",
      },
    },
    {
      title: `${courseTitle}: бекіту`,
      duration: "9 минут",
      videoUrl,
      summary: "Соңғы бөлімде шағын тест арқылы өткен тақырыптар тексеріледі.",
      task: {
        question: "Французша 12 саны қалай айтылады?",
        options: ["Douze", "Deux", "Treize", "Quatorze"],
        correctAnswer: "Douze",
        explanation: "Douze - 12 санының дұрыс нұсқасы.",
        challenge: "1-ден 5-ке дейінгі сандарды французша жазыңыз.",
      },
    },
  ];
}

export const seedCourses = [
  {
    title: "Français pour débutants - A1",
    instructor: "Marie Dubois",
    category: "Бастауыш деңгей",
    level: "A1",
    price: 0,
    description: "Француз тілін нөлден бастайтын студенттерге арналған базалық курс.",
    videoUrl: "https://www.youtube.com/embed/hd0_GZHHWeE",
    thumbnail:
      "https://images.unsplash.com/photo-1776174391355-d845f97d1b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    image:
      "https://images.unsplash.com/photo-1776174391355-d845f97d1b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "blue",
    lessons: createLessons("Français pour débutants", "A1", "https://www.youtube.com/embed/hd0_GZHHWeE"),
  },
  {
    title: "Conversation quotidienne - B1",
    instructor: "Sophie Martin",
    category: "Орта деңгей",
    level: "B1",
    price: 16990,
    description: "Күнделікті өмірде еркінірек сөйлеу үшін арналған аралық деңгей курсы.",
    videoUrl: "https://www.youtube.com/embed/PzXWJvu9enI",
    thumbnail:
      "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    image:
      "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "emerald",
    lessons: createLessons("Conversation quotidienne", "B1", "https://www.youtube.com/embed/PzXWJvu9enI"),
  },
  {
    title: "Préparation DELF/DALF",
    instructor: "Isabelle Petit",
    category: "Емтихан дайындығы",
    level: "B2",
    price: 24990,
    description: "DELF және DALF емтихандарына жүйелі дайындыққа арналған курс.",
    videoUrl: "https://www.youtube.com/embed/84olv0BM4oY",
    thumbnail:
      "https://images.unsplash.com/photo-1624549927317-3ae68bc9b2e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    image:
      "https://images.unsplash.com/photo-1624549927317-3ae68bc9b2e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "cyan",
    lessons: createLessons("Préparation DELF/DALF", "B2", "https://www.youtube.com/embed/84olv0BM4oY"),
  },
];

export function normalizeCoursePayload(payload) {
  return {
    title: String(payload.title ?? "").trim(),
    instructor: String(payload.instructor ?? "").trim(),
    category: String(payload.category ?? "Жалпы курс").trim(),
    level: String(payload.level ?? "A1").trim(),
    price: Number(payload.price ?? 0),
    description: String(payload.description ?? "").trim(),
    videoUrl: String(payload.videoUrl ?? "").trim(),
    thumbnail: String(payload.thumbnail ?? payload.image ?? fallbackImage).trim() || fallbackImage,
    image: String(payload.image ?? payload.thumbnail ?? fallbackImage).trim() || fallbackImage,
    accentColor: String(payload.accentColor ?? "blue").trim(),
    lessons: Array.isArray(payload.lessons) ? payload.lessons : [],
  };
}
