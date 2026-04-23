export interface LessonTask {
  type: "quiz";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  challenge: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  task: LessonTask;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  image?: string;
  videoUrl: string;
  description: string;
  category: string;
  level: string;
  price: number;
  accentColor?: string;
  lessons: Lesson[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

const frenchVideoLibrary = {
  greetings: {
    videoUrl: "https://www.youtube.com/embed/hd0_GZHHWeE",
    sourceUrl: "https://www.youtube.com/watch?v=hd0_GZHHWeE",
  },
  numbers: {
    videoUrl: "https://www.youtube.com/embed/H2-REbL2OU0",
    sourceUrl: "https://www.youtube.com/watch?v=H2-REbL2OU0",
  },
  etreAvoir: {
    videoUrl: "https://www.youtube.com/embed/84olv0BM4oY",
    sourceUrl: "https://www.youtube.com/watch?v=84olv0BM4oY",
  },
  dialogue: {
    videoUrl: "https://www.youtube.com/embed/PzXWJvu9enI",
    sourceUrl: "https://www.youtube.com/watch?v=PzXWJvu9enI",
  },
};

function createBeginnerLessons(courseTitle: string): Lesson[] {
  return [
    {
      id: "lesson-1",
      title: "Сабақ 1. Сәлемдесу және танысу",
      duration: "10 минут",
      videoUrl: frenchVideoLibrary.greetings.videoUrl,
      summary: `${courseTitle} курсының алғашқы сабағында амандасу, қоштасу және өзіңізді қысқа таныстыру үлгілерін үйренесіз.`,
      task: {
        type: "quiz",
        question: "Ресми жағдайда ең дұрыс амандасу нұсқасы қайсысы?",
        options: ["Salut", "Bonjour", "Ciao", "Bonsoir matin"],
        correctAnswer: "Bonjour",
        explanation: "Bonjour - ресми және бейресми жағдайда да ең жиі қолданылатын дұрыс амандасу сөзі.",
        challenge: "Өзіңізді французша екі сөйлеммен таныстырып жазыңыз: атыңыз және қай елден екеніңіз.",
      },
    },
    {
      id: "lesson-2",
      title: "Сабақ 2. Французша сандар 1-20",
      duration: "8 минут",
      videoUrl: frenchVideoLibrary.numbers.videoUrl,
      summary: "Бұл бөлімде 1-ден 20-ға дейін санауды, жасты және қарапайым сандарды айту формасын бекітесіз.",
      task: {
        type: "quiz",
        question: "Французша 12 саны қалай айтылады?",
        options: ["Douze", "Deux", "Dix-huit", "Treize"],
        correctAnswer: "Douze",
        explanation: "Douze - 12 санының дұрыс французша нұсқасы.",
        challenge: "Өз жасыңызды және сүйікті 3 саныңызды французша жазыңыз.",
      },
    },
    {
      id: "lesson-3",
      title: "Сабақ 3. Қысқа диалог құру",
      duration: "7 минут",
      videoUrl: frenchVideoLibrary.dialogue.videoUrl,
      summary: "Шынайы қысқа диалог арқылы сұрақ қою, жауап беру және қарапайым сөйлесуді бастау үлгілерін қолданасыз.",
      task: {
        type: "quiz",
        question: "Диалогта өз атыңызды айту үшін қай құрылым жиі қолданылады?",
        options: ["Je suis", "J'ai", "Il est", "Nous avons"],
        correctAnswer: "Je suis",
        explanation: "Je suis ... құрылымы өзіңізді таныстырғанда өте жиі қолданылады.",
        challenge: "3 жолдан тұратын шағын диалог жазыңыз: амандасу, атын айту, қоштасу.",
      },
    },
  ];
}

function createIntermediateLessons(courseTitle: string): Lesson[] {
  return [
    {
      id: "lesson-1",
      title: "Сабақ 1. Күнделікті сөйлеу үлгілері",
      duration: "7 минут",
      videoUrl: frenchVideoLibrary.dialogue.videoUrl,
      summary: `${courseTitle} аясында қысқа сөйлесу, сұрақ-жауап және тыңдап түсіну машықтарын дамытасыз.`,
      task: {
        type: "quiz",
        question: "Французша \"менде бар\" құрылымы қайсысы?",
        options: ["Je suis", "J'ai", "Tu es", "Nous sommes"],
        correctAnswer: "J'ai",
        explanation: "J'ai - avoir етістігінің 1-жақ жекеше түрі, \"менде бар\" дегенді білдіреді.",
        challenge: "Күнделікті өмірге қатысты 3 француз сөз тіркесін жазыңыз.",
      },
    },
    {
      id: "lesson-2",
      title: "Сабақ 2. Etre және avoir",
      duration: "15 минут",
      videoUrl: frenchVideoLibrary.etreAvoir.videoUrl,
      summary: "Француз тіліндегі ең маңызды екі етістіктің жіктелуін қарап, қарапайым сөйлемдер құрасыз.",
      task: {
        type: "quiz",
        question: "\"Nous sommes\" құрылымы қай етістікке жатады?",
        options: ["Avoir", "Etre", "Aller", "Faire"],
        correctAnswer: "Etre",
        explanation: "Nous sommes - etre етістігінің көпше 1-жақ формасы.",
        challenge: "Etre және avoir етістіктерімен екі бөлек сөйлем құраңыз.",
      },
    },
    {
      id: "lesson-3",
      title: "Сабақ 3. Сәлемдесу стилін жетілдіру",
      duration: "10 минут",
      videoUrl: frenchVideoLibrary.greetings.videoUrl,
      summary: "Ресми және бейресми сөйлеу айырмасын түсініп, қарым-қатынас стилін дұрыс таңдауды үйренесіз.",
      task: {
        type: "quiz",
        question: "Досыңызбен бейресми амандасуда қай сөз табиғи естіледі?",
        options: ["Salut", "Bonjour monsieur", "Enchanté madame", "Au revoir"],
        correctAnswer: "Salut",
        explanation: "Salut - достар арасында жиі қолданылатын бейресми амандасу формасы.",
        challenge: "Ресми және бейресми амандасуға бір-бірден мысал жазыңыз.",
      },
    },
  ];
}

function createAdvancedLessons(courseTitle: string): Lesson[] {
  return [
    {
      id: "lesson-1",
      title: "Сабақ 1. Күрделі диалогты тыңдау",
      duration: "7 минут",
      videoUrl: frenchVideoLibrary.dialogue.videoUrl,
      summary: `${courseTitle} курсы үшін бұл сабақта дайын диалогты бөліп тыңдап, тірек сөздерді анықтайсыз.`,
      task: {
        type: "quiz",
        question: "Диалогты жақсарту үшін ең маңызды дағды қайсысы?",
        options: ["Тек жаттау", "Тыңдап түсіну", "Тек аудару", "Тек жазу"],
        correctAnswer: "Тыңдап түсіну",
        explanation: "Тыңдап түсіну - сөйлеу мен жауап беру жылдамдығын арттыратын негізгі дағды.",
        challenge: "Видеодан естіген 5 тірек сөзді жазып шығыңыз.",
      },
    },
    {
      id: "lesson-2",
      title: "Сабақ 2. Етістіктерді дұрыс қолдану",
      duration: "15 минут",
      videoUrl: frenchVideoLibrary.etreAvoir.videoUrl,
      summary: "Күрделірек сөйлемдердегі etre және avoir қолданысын қайталап, қате жібермеуге жаттығасыз.",
      task: {
        type: "quiz",
        question: "\"Ils ont\" қай мағынаны береді?",
        options: ["Олар бар", "Оларда бар", "Олар болды", "Олар барады"],
        correctAnswer: "Оларда бар",
        explanation: "Ils ont - avoir етістігінің көпше 3-жақ формасы, \"оларда бар\" деп аударылады.",
        challenge: "Кемі 2 көпше тұлғалы сөйлем құраңыз.",
      },
    },
    {
      id: "lesson-3",
      title: "Сабақ 3. Сан мен деректі дұрыс айту",
      duration: "8 минут",
      videoUrl: frenchVideoLibrary.numbers.videoUrl,
      summary: "Күн, уақыт, баға және жас туралы сөйлескенде сандарды қате жібермей айтуға жаттығасыз.",
      task: {
        type: "quiz",
        question: "Французша 18 саны қалай айтылады?",
        options: ["Dix-huit", "Huit-dix", "Dix-deux", "Vingt"],
        correctAnswer: "Dix-huit",
        explanation: "Dix-huit - французша 18 санының дұрыс нұсқасы.",
        challenge: "Бір баға, бір күн және бір уақытты французша жазыңыз.",
      },
    },
  ];
}

export function createDefaultLessons(courseTitle: string, level: string): Lesson[] {
  if (level.startsWith("A")) return createBeginnerLessons(courseTitle);
  if (level.startsWith("B")) return createIntermediateLessons(courseTitle);
  return createAdvancedLessons(courseTitle);
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Français pour débutants - A1",
    instructor: "Marie Dubois",
    thumbnail: "https://images.unsplash.com/photo-1776174391355-d845f97d1b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc3NjI2NTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.greetings.videoUrl,
    description: "Француз тілін нөлден бастайтындар үшін амандасу, танысу және күнделікті сөздерге арналған негізгі курс.",
    category: "Бастауыш деңгей",
    level: "A1",
    price: 0,
    accentColor: "blue",
    lessons: createBeginnerLessons("Français pour débutants - A1"),
  },
  {
    id: "2",
    title: "Grammaire française - A2",
    instructor: "Pierre Laurent",
    thumbnail: "https://images.unsplash.com/photo-1624549927317-3ae68bc9b2e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjdWx0dXJlJTIwYm9va3xlbnwxfHx8fDE3NzYzNTc5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.etreAvoir.videoUrl,
    description: "A2 деңгейінде жиі қолданылатын грамматикалық құрылымдар мен қарапайым етістік формаларын түсіндіреді.",
    category: "Бастауыш деңгей",
    level: "A2",
    price: 12990,
    accentColor: "indigo",
    lessons: createBeginnerLessons("Grammaire française - A2"),
  },
  {
    id: "3",
    title: "Conversation quotidienne - B1",
    instructor: "Sophie Martin",
    thumbnail: "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMHN0dWRlbnQlMjBsZWFybmluZ3xlbnwxfHx8fDE3NzYzNTc5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.dialogue.videoUrl,
    description: "Күнделікті өмірде жиі кездесетін диалогтар арқылы B1 деңгейіндегі сөйлеу дағдысын дамытады.",
    category: "Орта деңгей",
    level: "B1",
    price: 16990,
    accentColor: "emerald",
    lessons: createIntermediateLessons("Conversation quotidienne - B1"),
  },
  {
    id: "4",
    title: "Littérature française - B2",
    instructor: "Jean-Luc Moreau",
    thumbnail: "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc3NjM1MzEyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.dialogue.videoUrl,
    description: "B2 деңгейінде мәтін талдау, әдеби стиль және мағынамен жұмыс істеуге арналған кеңейтілген курс.",
    category: "Орта деңгей",
    level: "B2",
    price: 18990,
    accentColor: "violet",
    lessons: createIntermediateLessons("Littérature française - B2"),
  },
  {
    id: "5",
    title: "Français professionnel - C1",
    instructor: "Caroline Rousseau",
    thumbnail: "https://images.unsplash.com/photo-1776174391355-d845f97d1b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc3NjI2NTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.etreAvoir.videoUrl,
    description: "Кәсіби ортада еркін сөйлеу, іскерлік лексика және ресми байланыс үшін арналған C1 курс.",
    category: "Жоғары деңгей",
    level: "C1",
    price: 21990,
    accentColor: "rose",
    lessons: createAdvancedLessons("Français professionnel - C1"),
  },
  {
    id: "6",
    title: "Culture et civilisation - B1",
    instructor: "Antoine Bernard",
    thumbnail: "https://images.unsplash.com/photo-1624549927317-3ae68bc9b2e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjdWx0dXJlJTIwYm9va3xlbnwxfHx8fDE3NzYzNTc5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.dialogue.videoUrl,
    description: "Француз мәдениеті, тұрмыс үлгілері және тілдік нормаларды қатар меңгеруге көмектесетін курс.",
    category: "Орта деңгей",
    level: "B1",
    price: 15990,
    accentColor: "amber",
    lessons: createIntermediateLessons("Culture et civilisation - B1"),
  },
  {
    id: "7",
    title: "Préparation DELF/DALF",
    instructor: "Isabelle Petit",
    thumbnail: "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMHN0dWRlbnQlMjBsZWFybmluZ3xlbnwxfHx8fDE3NzYzNTc5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.etreAvoir.videoUrl,
    description: "DELF және DALF емтихандарына дайындық үшін тыңдалым, грамматика және жауап құрылымын бекітетін курс.",
    category: "Емтихан дайындығы",
    level: "B2",
    price: 24990,
    accentColor: "cyan",
    lessons: createIntermediateLessons("Préparation DELF/DALF"),
  },
  {
    id: "8",
    title: "Phonétique et prononciation",
    instructor: "Thomas Blanc",
    thumbnail: "https://images.unsplash.com/photo-1776174391355-d845f97d1b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc3NjI2NTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    videoUrl: frenchVideoLibrary.greetings.videoUrl,
    description: "Дыбыстау, екпін және сөйлеу ырғағын жақсартуға арналған практикалық курс.",
    category: "Бастауыш деңгей",
    level: "A2",
    price: 9990,
    accentColor: "orange",
    lessons: createBeginnerLessons("Phonétique et prononciation"),
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Айдар Бекболатов",
    email: "aidar.bekbolatov@gmail.com",
    phone: "+7 777 123 4567",
    password: "hashedPassword123",
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "Аяна Нурбекова",
    email: "ayana.nurbekova@mail.ru",
    phone: "+7 777 234 5678",
    password: "hashedPassword456",
    createdAt: "2026-02-10",
  },
  {
    id: "3",
    name: "Арман Сүлейменов",
    email: "arman.suleimenov@inbox.kz",
    phone: "+7 777 345 6789",
    password: "hashedPassword789",
    createdAt: "2026-03-05",
  },
  {
    id: "4",
    name: "Дана Махметова",
    email: "dana.makhmetova@yahoo.com",
    phone: "+7 777 456 7890",
    password: "hashedPassword012",
    createdAt: "2026-03-20",
  },
  {
    id: "5",
    name: "Ерлан Қайратов",
    email: "yerlan.kairatov@gmail.com",
    phone: "+7 777 567 8901",
    password: "hashedPassword345",
    createdAt: "2026-04-01",
  },
];

export const categories = [
  "Барлығы",
  "Бастауыш деңгей",
  "Орта деңгей",
  "Жоғары деңгей",
  "Емтихан дайындығы",
];

