const questions = [
  {
    id: 1,
    category: "Umumiy bilim",
    question: "Dunyo bo'yicha eng katta okean qaysi?",
    options: ["Atlantik", "Hind", "Tinch", "Arktika"],
    correct: 2,
    timeLimit: 20
  },
  {
    id: 2,
    category: "Tarix",
    question: "Temur imperiyasining poytaxti qaysi shahar edi?",
    options: ["Buxoro", "Samarqand", "Toshkent", "Xiva"],
    correct: 1,
    timeLimit: 20
  },
  {
    id: 3,
    category: "Geografiya",
    question: "O'zbekistonning poytaxti qaysi?",
    options: ["Samarqand", "Namangan", "Toshkent", "Andijon"],
    correct: 2,
    timeLimit: 15
  },
  {
    id: 4,
    category: "Matematika",
    question: "2^10 qancha?",
    options: ["512", "1024", "2048", "256"],
    correct: 1,
    timeLimit: 25
  },
  {
    id: 5,
    category: "Fan",
    question: "Suv qaysi haroratda qaynaydi? (dengiz sathida)",
    options: ["90°C", "95°C", "100°C", "105°C"],
    correct: 2,
    timeLimit: 15
  },
  {
    id: 6,
    category: "Adabiyot",
    question: "Alisher Navoiy qaysi asrda yashagan?",
    options: ["XIII asr", "XIV asr", "XV asr", "XVI asr"],
    correct: 2,
    timeLimit: 20
  },
  {
    id: 7,
    category: "Texnologiya",
    question: "HTML nima degan ma'noni anglatadi?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Logic",
      "Home Tool Markup Language"
    ],
    correct: 0,
    timeLimit: 20
  },
  {
    id: 8,
    category: "Sport",
    question: "Futbol jamoasida nechta o'yinchi bo'ladi?",
    options: ["9", "10", "11", "12"],
    correct: 2,
    timeLimit: 15
  },
  {
    id: 9,
    category: "Biologiya",
    question: "Inson tanasida nechta suyak bor?",
    options: ["196", "206", "216", "226"],
    correct: 1,
    timeLimit: 25
  },
  {
    id: 10,
    category: "Kimyo",
    question: "Kislorodning kimyoviy belgisi qaysi?",
    options: ["Co", "Ca", "O", "Or"],
    correct: 2,
    timeLimit: 15
  },
  {
    id: 11,
    category: "Geografiya",
    question: "Eng uzun daryo qaysi?",
    options: ["Amazon", "Nil", "Yangtze", "Mississippi"],
    correct: 1,
    timeLimit: 20
  },
  {
    id: 12,
    category: "Tarix",
    question: "Birinchi jahon urushi qachon boshlangan?",
    options: ["1912", "1914", "1916", "1918"],
    correct: 1,
    timeLimit: 20
  },
  {
    id: 13,
    category: "Matematika",
    question: "Pi soni taxminan qancha?",
    options: ["3.14", "3.41", "3.12", "3.16"],
    correct: 0,
    timeLimit: 20
  },
  {
    id: 14,
    category: "Texnologiya",
    question: "JavaScript qaysi yilda yaratilgan?",
    options: ["1993", "1994", "1995", "1996"],
    correct: 2,
    timeLimit: 25
  },
  {
    id: 15,
    category: "Umumiy bilim",
    question: "Quyosh sistemasida nechta sayyora bor?",
    options: ["7", "8", "9", "10"],
    correct: 1,
    timeLimit: 20
  }
];

function getRandomQuestions(count = 10) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

module.exports = { questions, getRandomQuestions };
