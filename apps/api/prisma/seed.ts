import { PrismaClient, AccessType, VideoKind } from "@prisma/client";

const prisma = new PrismaClient();

const poster = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=900&q=80`;
const hero = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&h=1080&q=80`;

/** Real Mux assets ingested for demo playback (signed policy). */
const MUX = {
  cinematic: {
    muxAssetId: "q01huCxERSJzoM026armDDXsiJRH02flA4tYl02BjecWtws",
    muxPlaybackId: "sYPW4fmLdQjCDqEjnPomdi8goqdz601T3O004A34qY200U",
    durationSec: 52,
    aspectRatio: "16:9",
  },
  pulse: {
    muxAssetId: "htIwtuKwP7cv5N4xxkBtKlrxfSCIFqy1kXq9Dfrf7Sg",
    muxPlaybackId: "itxsgp3YysnILtL5TizUOUjPX01TqiqKsydrsM02VZGqM",
    durationSec: 25,
    aspectRatio: "16:9",
  },
  nightlife: {
    muxAssetId: "KRI00qNaZ7eYH1BAFMNgVDQO9RGNVH68Er6nKpuN02CAc",
    muxPlaybackId: "79nK4eZa00011Q01joXwLD4lbdxE9gY7v2mJvtqYTfhonY",
    durationSec: 17,
    aspectRatio: "16:9",
  },
  reel: {
    muxAssetId: "KSrAHIB1c2h2eSfUZbn45UswW1WKNThz7D4C41aIQQg",
    muxPlaybackId: "r3L8mRymcBqQcSCU9gvi1KKHwOXWjYjkL7NadEKH3NY",
    durationSec: 24,
    aspectRatio: "16:9",
  },
} as const;

type MuxKey = keyof typeof MUX;

type SeedTitle = {
  title: string;
  synopsis: string;
  year: number;
  durationSec: number;
  ageRating: string;
  poster: string;
  hero: string;
  matchPercent: number;
  accessType: AccessType;
  ppvPriceMnt: number;
  genres: string[];
  collections: string[];
  mux: MuxKey;
  reel?: boolean;
};

const TITLES: SeedTitle[] = [
  {
    title: "Цагаан Шувуу",
    synopsis:
      "Баян-Өлгийн бүргэдчин охин Улаанбаатарт дипломат ажилтнаар томилогдоно. Гэр бүлийнхээ тангараг болон улсын нууцын хооронд сонголт хийхэд нэг л цагаан шувуу зам заана.",
    year: 2024,
    durationSec: 7680,
    ageRating: "16+",
    poster: poster("photo-1506905925346-21bda4d32df4"),
    hero: hero("photo-1464822759023-fed622ff2c3b"),
    matchPercent: 98,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Драма", "Адал явдал"],
    collections: ["hero", "editor", "new", "top"],
    mux: "cinematic",
    reel: true,
  },
  {
    title: "Алтан Хээр",
    synopsis:
      "Хөдөөний дуучин, хотын хөгжмийн продюсер хамт нэг цомог бичихээр хээрээр аялна. Мартагдсан аялгуу хоёуланг нь өнгөрсөн хайр руу нь буцаана.",
    year: 2024,
    durationSec: 6540,
    ageRating: "12+",
    poster: poster("photo-1501785888041-af3ef285b470"),
    hero: hero("photo-1469474968028-56623f02e42e"),
    matchPercent: 96,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Романтик", "Хөгжим"],
    collections: ["hero", "continue", "editor", "new", "mongol"],
    mux: "cinematic",
    reel: true,
  },
  {
    title: "Хар Салхи",
    synopsis:
      "Улаанбаатарын шөнийн цагдаа нэгэн алга болсон бизнесмены мөрийг дагаж хотын хамгийн том мөнгө угаах сүлжээ рүү орно. Гэвч гэрч нь түүний дүү байв.",
    year: 2023,
    durationSec: 6960,
    ageRating: "18+",
    poster: poster("photo-1514565131-fce0801d3f73"),
    hero: hero("photo-1477959858617-67f85cf4f1df"),
    matchPercent: 94,
    accessType: "PPV",
    ppvPriceMnt: 5990,
    genres: ["Криме", "Триллер"],
    collections: ["continue", "editor", "top"],
    mux: "nightlife",
  },
  {
    title: "2147: Хөх Тэнгэр",
    synopsis:
      "Уур амьсгал нурж, Говь далай болсон 2147 он. Сүүлийн цэвэр усны эх үүсвэрийг хамгаалахын тулд инженер эмэгтэй хиймэл оюун ухаантай тохиролцоо хийнэ.",
    year: 2025,
    durationSec: 7920,
    ageRating: "12+",
    poster: poster("photo-1451187580459-43490279c0fa"),
    hero: hero("photo-1446776877081-d282a0f896e2"),
    matchPercent: 97,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Sci-Fi", "Адал явдал"],
    collections: ["hero", "continue", "editor", "scifi", "new"],
    mux: "pulse",
    reel: true,
  },
  {
    title: "Мөнх Цас",
    synopsis:
      "Алтайн нуруунд сураггүй болсон эрдэмтдийн багийг олохоор гарсан гурван уулчин цасан шуурганд хаагдана. Амьд үлдэхийн тулд бие биеэ орхих уу, үгүй юу.",
    year: 2023,
    durationSec: 7260,
    ageRating: "12+",
    poster: poster("photo-1483921020237-59c85a12ff54"),
    hero: hero("photo-1483921020237-59c85a12ff54"),
    matchPercent: 93,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Адал явдал", "Драма"],
    collections: ["continue", "new", "top"],
    mux: "cinematic",
    reel: true,
  },
  {
    title: "Шөнийн Гэрэл",
    synopsis:
      "Таксоны жолооч шөнө бүр нэгэн эмэгтэйг нэг л хаяг руу хүргэдэг. Тэр хаяг дээр хэн ч амьдардаггүй. Хотын чөлөөт кино — бүртгэлтэй хэрэглэгч үзэх боломжтой.",
    year: 2022,
    durationSec: 6120,
    ageRating: "16+",
    poster: poster("photo-1480714378408-67cf0d13bc1b"),
    hero: hero("photo-1514565131-fce0801d3f73"),
    matchPercent: 91,
    accessType: "FREE",
    ppvPriceMnt: 0,
    genres: ["Криме", "Драма"],
    collections: ["continue", "editor", "new"],
    mux: "nightlife",
  },
  {
    title: "Сансрын Морьтон",
    synopsis:
      "Монголын анхны сансрын нисгэгч дэлхийг тойрох 72 цагийн үүрэг гүйцэтгэнэ. Холбоо тасарч, тэр зөвхөн аавынхаа морины дууг санасаар буцах замыг олно.",
    year: 2024,
    durationSec: 8280,
    ageRating: "12+",
    poster: poster("photo-1446776811953-b23d57bd21aa"),
    hero: hero("photo-1462331940025-496dfbfc7564"),
    matchPercent: 95,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Sci-Fi", "Адал явдал"],
    collections: ["scifi", "top", "hero"],
    mux: "pulse",
    reel: true,
  },
  {
    title: "Говийн Нулимс",
    synopsis:
      "Говийн суманд эмчийн ажилтай ирсэн залуу гуч гаруй жилийн өмнө алга болсон ээжийнхээ захидлыг олж авна. Элс доор нэгэн бүхэл үеийн нууц бусив.",
    year: 2023,
    durationSec: 6240,
    ageRating: "12+",
    poster: poster("photo-1509316785289-025f5b846b35"),
    hero: hero("photo-1469854523086-cc02fe5d8800"),
    matchPercent: 92,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Драма"],
    collections: ["new", "mongol", "top"],
    mux: "cinematic",
    reel: true,
  },
  {
    title: "Аялгуу",
    synopsis:
      "Хөвсгөл, Алтай, Говь гурван нутгийн уртын дуучид нэг студид цуглаж, мартагдаж буй аялгуугаа бичүүлнэ. Хөгжмийн баримтат кино. Үнэгүй.",
    year: 2021,
    durationSec: 5280,
    ageRating: "6+",
    poster: poster("photo-1511671782779-c97d3d27a1d4"),
    hero: hero("photo-1514320291840-2e0a9bf2a9ae"),
    matchPercent: 89,
    accessType: "FREE",
    ppvPriceMnt: 0,
    genres: ["Хөгжим", "Баримтат"],
    collections: ["mongol", "editor"],
    mux: "nightlife",
  },
  {
    title: "Хархорум: Сэргэлт",
    synopsis:
      "Археологичид Хархорумын суурин дээр XIII зууны хотын дуу хоолойг сэргээх 3D төсөл эхлүүлнэ. Баримтат кино эртний нийслэлийг өнөөгийн нүдээр харна.",
    year: 2024,
    durationSec: 5760,
    ageRating: "6+",
    poster: poster("photo-1539650116574-75c0c6d73f6e"),
    hero: hero("photo-1500530855697-b586d89ba3ee"),
    matchPercent: 90,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Баримтат", "Түүхэн"],
    collections: ["mongol", "new"],
    mux: "cinematic",
    reel: true,
  },
  {
    title: "Нууц Код",
    synopsis:
      "Улаанбаатарын стартапын инженер өөрийн бүтээсэн хиймэл оюун ухаан хүмүүсийн дурсамжийг худалдаж байгааг илрүүлнэ. Тэр системийг унтраавал өөрийнх нь дурсамж ч устана.",
    year: 2025,
    durationSec: 6840,
    ageRating: "16+",
    poster: poster("photo-1518770660439-4636190af475"),
    hero: hero("photo-1550751827-4bd374c3f58b"),
    matchPercent: 94,
    accessType: "PPV",
    ppvPriceMnt: 3990,
    genres: ["Sci-Fi", "Триллер"],
    collections: ["scifi", "editor"],
    mux: "pulse",
  },
  {
    title: "Намрын Бороо",
    synopsis:
      "Сөүлээс ирсэн монгол оюутан, Улаанбаатарын номын санч хоёр зөвхөн бороотой өдрүүдэд уулздаг болно. Намар дуусаж, тэр дүрэм эвдэгдэнэ.",
    year: 2022,
    durationSec: 6420,
    ageRating: "12+",
    poster: poster("photo-1522673607200-164d1b6ce486"),
    hero: hero("photo-1518199266791-5375a83190b7"),
    matchPercent: 96,
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Романтик", "Драма"],
    collections: ["mongol", "continue"],
    mux: "cinematic",
  },
];

const LEGACY_DEMO_TITLES = [
  "Харанхуй Давалгаа",
  "Мартагдсан Дуу",
  "Мөнгөн Сүүдэр",
  "2250 Он",
  "Далайн Хаан",
  "Улаан Зам",
  "Сансрын Дайн",
  "Нутгийн Дуун",
  "Хархорум",
  "Нейрон Сүлжээ",
  "Цэнхэр Мөнх",
];

const COLLECTIONS = [
  { slug: "hero", name: "Онцлох", sortOrder: 0 },
  { slug: "continue", name: "Үргэлжлүүлэх", sortOrder: 1 },
  { slug: "editor", name: "Эдитор сонголт", sortOrder: 2 },
  { slug: "top", name: "Монгол дахь хамгийн их үзсэн", sortOrder: 3 },
  { slug: "new", name: "Шинэ нэмэгдсэн", sortOrder: 4 },
  { slug: "scifi", name: "Sci-Fi ба Ирээдүй", sortOrder: 5 },
  { slug: "mongol", name: "Монгол бүтээл", sortOrder: 6 },
];

async function upsertVideo(
  titleId: string,
  kind: VideoKind,
  mux: (typeof MUX)[MuxKey],
  durationSec = mux.durationSec,
  aspectRatio = mux.aspectRatio,
) {
  const existing = await prisma.video.findFirst({ where: { titleId, kind } });
  const data = {
    muxStatus: "READY" as const,
    muxPlaybackId: mux.muxPlaybackId,
    muxAssetId: mux.muxAssetId,
    durationSec,
    aspectRatio,
  };
  if (existing) {
    await prisma.video.update({ where: { id: existing.id }, data });
    return;
  }
  await prisma.video.create({ data: { titleId, kind, ...data } });
}

async function main() {
  for (const c of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  const keepTitles = TITLES.map((t) => t.title);

  for (const item of TITLES) {
    const payload = {
      title: item.title,
      synopsis: item.synopsis,
      year: item.year,
      durationSec: item.durationSec,
      ageRating: item.ageRating,
      posterUrl: item.poster,
      heroUrl: item.hero,
      matchPercent: item.matchPercent,
      accessType: item.accessType,
      ppvPriceMnt: item.ppvPriceMnt,
      isPublished: true,
    };

    const existing = await prisma.title.findFirst({ where: { title: item.title } });
    const title = existing
      ? await prisma.title.update({ where: { id: existing.id }, data: payload })
      : await prisma.title.create({ data: payload });

    await prisma.titleGenre.deleteMany({ where: { titleId: title.id } });
    for (const name of item.genres) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const genre = await prisma.genre.upsert({
        where: { slug },
        update: { name },
        create: { slug, name },
      });
      await prisma.titleGenre.create({
        data: { titleId: title.id, genreId: genre.id },
      });
    }

    await upsertVideo(title.id, VideoKind.FEATURE, MUX[item.mux]);
    if (item.reel) {
      await upsertVideo(title.id, VideoKind.REEL, MUX.reel, 45, "9:16");
    }

    await prisma.collectionItem.deleteMany({ where: { titleId: title.id } });
    for (const slug of item.collections) {
      const collection = await prisma.collection.findUnique({ where: { slug } });
      if (!collection) continue;
      await prisma.collectionItem.create({
        data: {
          collectionId: collection.id,
          titleId: title.id,
          sortOrder: TITLES.indexOf(item),
        },
      });
    }
  }

  const stale = [...LEGACY_DEMO_TITLES].filter((name) => !keepTitles.includes(name));
  const removed = await prisma.title.deleteMany({ where: { title: { in: stale } } });

  console.log(`Seeded Negun catalog (${TITLES.length} titles, removed ${removed.count} legacy)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
