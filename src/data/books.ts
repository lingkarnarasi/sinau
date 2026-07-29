export interface BookPassage {
  en: string;
  id: string;
}

export interface BookChapter {
  number: number;
  title: string;
  titleId: string;
  passages: BookPassage[];
}

export type BookLevel = "Pemula" | "Menengah" | "Mahir";

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  level: BookLevel;
  coverEmoji: string;
  description: string;
  descriptionId: string;
  totalPages: number;
  // gradient class for cover
  cover: string;
  fullyAvailable: boolean;
  chapters: BookChapter[];
}

// The Secret Garden — fully readable v1 book.
const secretGarden: BookChapter[] = [
  {
    number: 1,
    title: "There Is No One Left",
    titleId: "Tidak Ada Seorang pun yang Tersisa",
    passages: [
      {
        en: `When Mary Lennox was sent to Misselthwaite Manor to live with her uncle everybody said she was the most disagreeable-looking child ever seen. It was true, too. She had a little thin face and a little thin body, thin light hair and a sour expression. Her hair was yellow, and her face was yellow because she had been born in India and had always been ill in one way or another.`,
        id: `Ketika Mary Lennox dikirim ke Misselthwaite Manor untuk tinggal bersama pamannya, semua orang mengatakan ia adalah anak yang paling tidak menyenangkan kelihatannya yang pernah mereka lihat. Dan itu memang benar. Ia memiliki wajah kecil yang kurus dan tubuh kecil yang kurus, rambut tipis yang terang dan ekspresi masam. Rambutnya berwarna kuning, dan wajahnya juga berwarna kuning karena ia lahir di India dan selalu sakit dalam satu cara atau lainnya.`,
      },
      {
        en: `Her father had held a position under the English Government and had always been busy and ill himself, and her mother had been a great beauty who cared only to go to parties and amuse herself with gay people. She had not wanted a little girl at all, and when Mary was born she handed her over to the care of an Ayah, who was made to understand that if she wished to please the Mem Sahib she must keep the child out of sight as much as possible.`,
        id: `Ayahnya memegang sebuah jabatan di bawah Pemerintah Inggris dan selalu sibuk serta sering sakit, dan ibunya adalah seorang wanita yang sangat cantik yang hanya peduli untuk pergi ke pesta-pesta dan menghibur diri dengan orang-orang ceria. Ia sama sekali tidak menginginkan seorang anak perempuan, dan ketika Mary lahir ia menyerahkannya kepada perawatan seorang Ayah, yang diberi pengertian bahwa jika ia ingin menyenangkan Mem Sahib, ia harus menjauhkan anak itu dari pandangan sebanyak mungkin.`,
      },
      {
        en: `Nobody cared about her. Everybody was ill and frightened, the servants ran away, the cholera was everywhere. Mary was left quite alone, and she walked about the house and grounds, looking at rooms and paths and gardens, and trying to understand how such things could happen.`,
        id: `Tidak ada yang peduli padanya. Semua orang sakit dan ketakutan, para pelayan melarikan diri, kolera ada di mana-mana. Mary ditinggal sendirian sepenuhnya, dan ia berjalan-jalan di dalam rumah dan halaman, melihat kamar-kamar dan jalan setapak dan taman-taman, dan mencoba memahami bagaimana hal-hal seperti itu bisa terjadi.`,
      },
      {
        en: `So long as the cholera lasted she only thought of herself, as she had always done. She knew that she had not died, and at last someone would come and take her away. But no one came, and as she lay waiting the house seemed to grow more and more silent. She heard a rustling on the matting and when she looked down she saw a little snake gliding along and watching her with eyes like jewels. She was not frightened, because he was a harmless little thing who would not hurt her and he seemed in a hurry to get out of the room.`,
        id: `Selama wabah kolera berlangsung ia hanya memikirkan dirinya sendiri, seperti yang selalu ia lakukan. Ia tahu bahwa ia tidak mati, dan akhirnya seseorang akan datang dan membawanya pergi. Namun tidak ada yang datang, dan ketika ia berbaring menunggu, rumah itu seolah-olah menjadi semakin sunyi. Ia mendengar gemerisik di atas tikar dan ketika ia menunduk ia melihat seekor ular kecil meluncur dan memandanginya dengan mata seperti permata. Ia tidak takut, karena ia adalah makhluk kecil yang tidak berbahaya yang tidak akan menyakitinya dan ia tampak terburu-buru untuk keluar dari kamar.`,
      },
    ],
  },
  {
    number: 2,
    title: "Mistress Mary Quite Contrary",
    titleId: "Nyonya Mary yang Pembangkang",
    passages: [
      {
        en: `Mary had liked to look at her mother from a distance and she had thought her very pretty, but as she knew very little of her she could scarcely have been expected to love her or to miss her very much when she was gone. She did not miss her at all, in fact, and as she was a self-absorbed child she gave her entire thought to herself, as she had always done.`,
        id: `Mary suka memandangi ibunya dari kejauhan dan ia menganggapnya sangat cantik, tetapi karena ia hanya mengenal sedikit tentangnya, ia hampir tidak bisa diharapkan untuk mencintainya atau merindukannya saat ia telah tiada. Faktanya, ia tidak merindukannya sama sekali, dan karena ia adalah anak yang hanya peduli pada dirinya sendiri, ia memberikan seluruh pikirannya pada dirinya sendiri, seperti yang selalu ia lakukan.`,
      },
      {
        en: `If she had been older she would no doubt have been very anxious at being left alone in the world, but she was very young, and as she had always been taken care of, she supposed she always would be. What she thought was that she would like to know if she was going to nice people, who would be polite to her and give her her own way as her Ayah and the other native servants had done.`,
        id: `Jika ia lebih tua, tentu saja ia akan sangat cemas karena ditinggal sendirian di dunia, tetapi ia masih sangat muda, dan karena ia selalu dirawat, ia menduga ia akan selalu begitu. Yang ia pikirkan adalah ia ingin tahu apakah ia akan pergi ke orang-orang yang baik, yang akan sopan kepadanya dan menuruti kemauannya seperti yang dilakukan Ayah-nya dan para pelayan pribumi lainnya.`,
      },
      {
        en: `It was the wind sweeping in gusts about a far-away corner of the great rambling old house. She lay and listened to it for a few minutes and then suddenly she sat up in bed. "It is the wind," she said. "It sounds almost like a person lost on the moor and wandering on and on crying."`,
        id: `Itu adalah angin yang bertiup berembus-embus di sudut yang jauh dari rumah tua besar yang berliku-liku itu. Ia berbaring dan mendengarkannya selama beberapa menit dan kemudian tiba-tiba ia duduk di tempat tidurnya. "Ini suara angin," katanya. "Bunyinya hampir seperti orang yang tersesat di padang lengang dan berkeliaran sambil menangis terus dan terus."`,
      },
    ],
  },
  {
    number: 3,
    title: "Across the Moor",
    titleId: "Melintasi Padang Lengang",
    passages: [
      {
        en: `She slept a long time, and when she awakened Mrs. Medlock had bought a lunch-basket at one of the stations and they had some chicken and cold beef and bread and butter and some hot tea. The rain seemed to be streaming down more heavily than ever and everybody in the station wore wet and glistening waterproofs.`,
        id: `Ia tidur cukup lama, dan ketika ia terbangun Mrs. Medlock telah membeli sebuah keranjang makan siang di salah satu stasiun dan mereka makan ayam serta daging sapi dingin dan roti serta mentega dan secangkir teh panas. Hujan sepertinya turun lebih deras dari sebelumnya dan setiap orang di stasiun mengenakan jas hujan yang basah dan berkilauan.`,
      },
      {
        en: `"We're on the moor now sure enough," said Mrs. Medlock. The carriage lamps shed a yellow light on a rough-looking road which seemed to be cut through bushes and low-growing things which ended in the great expanse of dark apparently spread out before and around them. A wind was rising and making a singular, wild, low, rushing sound.`,
        id: `"Kita sudah benar-benar berada di padang lengang sekarang," kata Mrs. Medlock. Lampu-lampu kereta menyinari jalan yang tampak kasar yang seakan-akan dipotong melalui semak-semak dan tumbuhan rendah yang berujung pada hamparan kegelapan luas yang tampaknya membentang di depan dan di sekitar mereka. Angin mulai bertiup dan menghasilkan suara yang aneh, liar, rendah, dan menderu.`,
      },
    ],
  },
];

export const BOOKS: Book[] = [
  {
    id: "secret-garden",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    year: 1911,
    level: "Pemula",
    coverEmoji: "🌹",
    description: "A spoiled orphan discovers a magical locked garden that transforms her.",
    descriptionId: "Seorang yatim piatu yang manja menemukan taman terkunci yang ajaib, yang mengubah hidupnya.",
    totalPages: 331,
    cover: "from-rose-300 via-rose-400 to-emerald-700",
    fullyAvailable: true,
    chapters: secretGarden,
  },
  {
    id: "wizard-of-oz",
    title: "The Wonderful Wizard of Oz",
    author: "L. Frank Baum",
    year: 1900,
    level: "Pemula",
    coverEmoji: "🌪️",
    description: "A young girl from Kansas is swept away to the magical land of Oz.",
    descriptionId: "Seorang gadis muda dari Kansas terbawa angin ke negeri ajaib Oz.",
    totalPages: 261,
    cover: "from-emerald-300 via-emerald-500 to-teal-800",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "black-beauty",
    title: "Black Beauty",
    author: "Anna Sewell",
    year: 1877,
    level: "Pemula",
    coverEmoji: "🐴",
    description: "The autobiography of a horse — a tale of compassion and dignity.",
    descriptionId: "Otobiografi seekor kuda — kisah tentang welas asih dan martabat.",
    totalPages: 248,
    cover: "from-stone-400 via-stone-600 to-stone-900",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "treasure-island",
    title: "Treasure Island",
    author: "Robert Louis Stevenson",
    year: 1883,
    level: "Menengah",
    coverEmoji: "🏴‍☠️",
    description: "A young boy embarks on a thrilling pirate adventure.",
    descriptionId: "Seorang anak laki-laki muda memulai petualangan bajak laut yang mendebarkan.",
    totalPages: 292,
    cover: "from-amber-300 via-orange-500 to-rose-800",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "robinson-crusoe",
    title: "Robinson Crusoe",
    author: "Daniel Defoe",
    year: 1719,
    level: "Menengah",
    coverEmoji: "🏝️",
    description: "A castaway's tale of survival, faith, and ingenuity on a remote island.",
    descriptionId: "Kisah seorang terdampar tentang kelangsungan hidup, iman, dan kecerdikan di pulau terpencil.",
    totalPages: 320,
    cover: "from-yellow-200 via-amber-500 to-emerald-800",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "tale-of-two-cities",
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    year: 1859,
    level: "Menengah",
    coverEmoji: "🏛️",
    description: "Love and sacrifice during the French Revolution.",
    descriptionId: "Cinta dan pengorbanan selama Revolusi Prancis.",
    totalPages: 489,
    cover: "from-slate-300 via-slate-500 to-rose-900",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    level: "Mahir",
    coverEmoji: "💌",
    description: "A witty exploration of love and class in Regency England.",
    descriptionId: "Eksplorasi cerdas tentang cinta dan kelas sosial di Inggris era Regency.",
    totalPages: 432,
    cover: "from-pink-200 via-rose-400 to-violet-700",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    level: "Mahir",
    coverEmoji: "🕯️",
    description: "An orphan grows into an independent woman seeking love and integrity.",
    descriptionId: "Seorang yatim piatu tumbuh menjadi wanita mandiri yang mencari cinta dan integritas.",
    totalPages: 532,
    cover: "from-amber-200 via-stone-600 to-stone-900",
    fullyAvailable: false,
    chapters: [],
  },
  {
    id: "moby-dick",
    title: "Moby Dick",
    author: "Herman Melville",
    year: 1851,
    level: "Mahir",
    coverEmoji: "🐋",
    description: "A captain's obsessive pursuit of a white whale across the seas.",
    descriptionId: "Pengejaran obsesif seorang kapten terhadap seekor paus putih di lautan.",
    totalPages: 635,
    cover: "from-sky-200 via-blue-700 to-slate-900",
    fullyAvailable: false,
    chapters: [],
  },
];

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}

export const LEVEL_LABEL: Record<BookLevel, string> = {
  Pemula: "Pemula",
  Menengah: "Menengah",
  Mahir: "Mahir",
};
