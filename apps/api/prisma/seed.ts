import { PrismaClient, AccessType, VideoKind } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

type SeedTitle = {
  title: string;
  synopsis: string;
  year: number;
  durationSec: number;
  ageRating: string;
  poster: string;
  hero: string;
  accessType: AccessType;
  ppvPriceMnt: number;
  genres: string[];
  collections: string[];
  reel?: boolean;
};

const TITLES: SeedTitle[] = [
  {
    title: "Харанхуй Давалгаа",
    synopsis: "Нууцлаг эрх мэдлийн тулааны дунд өрнөх хар дарсан тэмцэл.",
    year: 2024,
    durationSec: 7380,
    ageRating: "16+",
    poster: img("photo-1534447677768-be436bb09401"),
    hero: img("photo-1534447677768-be436bb09401"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Драма", "Адал явдал"],
    collections: "hero,editor,new,top".split(","),
    reel: true,
  },
  {
    title: "Мартагдсан Дуу",
    synopsis: "Хоёр найзын хоорондох мартагдсан хайр.",
    year: 2024,
    durationSec: 6480,
    ageRating: "12+",
    poster: img("photo-1511671782779-c97d3d27a1d4"),
    hero: img("photo-1511671782779-c97d3d27a1d4"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Романтик", "Хөгжим"],
    collections: "hero,continue,editor,new,mongol".split(","),
    reel: true,
  },
  {
    title: "Мөнгөн Сүүдэр",
    synopsis: "Хотын хамгийн том нууцыг тайлахаар морилсон мөрдөгч.",
    year: 2024,
    durationSec: 6900,
    ageRating: "16+",
    poster: img("photo-1485846234645-a62644f84728"),
    hero: img("photo-1485846234645-a62644f84728"),
    accessType: "PPV",
    ppvPriceMnt: 4990,
    genres: ["Криме", "Драма"],
    collections: "continue,editor".split(","),
  },
  {
    title: "2250 Он",
    synopsis: "Ирээдүйн дэлхийд ухаалаг роботуудтай тулаан.",
    year: 2024,
    durationSec: 7200,
    ageRating: "12+",
    poster: img("photo-1451187580459-43490279c0fa"),
    hero: img("photo-1451187580459-43490279c0fa"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Sci-Fi"],
    collections: "continue,editor,scifi,new".split(","),
    reel: true,
  },
  {
    title: "Далайн Хаан",
    synopsis: "Далайн гүнд нуугдсан хот, дайн эхэлнэ.",
    year: 2024,
    durationSec: 7800,
    ageRating: "12+",
    poster: img("photo-1507525428034-b723cf961d3e"),
    hero: img("photo-1507525428034-b723cf961d3e"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Адал явдал"],
    collections: "continue,new,top".split(","),
    reel: true,
  },
  {
    title: "Улаан Зам",
    synopsis: "Хотын хамгийн том нууцыг тайлахаар морилсон мөрдөгч.",
    year: 2023,
    durationSec: 6600,
    ageRating: "16+",
    poster: img("photo-1469474968028-56623f02e42e"),
    hero: img("photo-1469474968028-56623f02e42e"),
    accessType: "FREE",
    ppvPriceMnt: 0,
    genres: ["Криме"],
    collections: "continue,editor".split(","),
  },
  {
    title: "Сансрын Дайн",
    synopsis: "Галакси хоорондын сүүлчийн тулаан.",
    year: 2024,
    durationSec: 8100,
    ageRating: "12+",
    poster: img("photo-1446776811953-b23d57bd21aa"),
    hero: img("photo-1446776811953-b23d57bd21aa"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Sci-Fi"],
    collections: "scifi,top".split(","),
    reel: true,
  },
  {
    title: "Говийн Нулимс",
    synopsis: "Говийн элс дунд хадгалагдсан нэгэн гэр бүлийн нууц.",
    year: 2023,
    durationSec: 6000,
    ageRating: "12+",
    poster: img("photo-1469854523086-cc02fe5d8800"),
    hero: img("photo-1469854523086-cc02fe5d8800"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Драма"],
    collections: "new,mongol,top".split(","),
    reel: true,
  },
  {
    title: "Нутгийн Дуун",
    synopsis: "Уламжлалт дуу хөгжмийн тухай баримтат.",
    year: 2023,
    durationSec: 5400,
    ageRating: "6+",
    poster: img("photo-1514320291840-2e0a9bf2a9ae"),
    hero: img("photo-1514320291840-2e0a9bf2a9ae"),
    accessType: "FREE",
    ppvPriceMnt: 0,
    genres: ["Хөгжим"],
    collections: "mongol".split(","),
  },
  {
    title: "Хархорум",
    synopsis: "Монголын их эзэнт гүрний нийслэлийн тухай.",
    year: 2024,
    durationSec: 5700,
    ageRating: "6+",
    poster: img("photo-1501785888041-af3ef285b470"),
    hero: img("photo-1501785888041-af3ef285b470"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Баримтат"],
    collections: "mongol".split(","),
    reel: true,
  },
  {
    title: "Нейрон Сүлжээ",
    synopsis: "Хиймэл оюун ухаан хүнийг хянах болно.",
    year: 2024,
    durationSec: 7000,
    ageRating: "16+",
    poster: img("photo-1518770660439-4636190af475"),
    hero: img("photo-1518770660439-4636190af475"),
    accessType: "PPV",
    ppvPriceMnt: 3990,
    genres: ["Sci-Fi"],
    collections: "scifi".split(","),
  },
  {
    title: "Цэнхэр Мөнх",
    synopsis: "Монгол нутагт өрнөсөн хайрын тухай.",
    year: 2022,
    durationSec: 6300,
    ageRating: "12+",
    poster: img("photo-1500530855697-b586d89ba3ee"),
    hero: img("photo-1500530855697-b586d89ba3ee"),
    accessType: "SUBSCRIPTION",
    ppvPriceMnt: 0,
    genres: ["Романтик"],
    collections: "mongol".split(","),
  },
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

async function main() {
  for (const c of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  for (const [index, item] of TITLES.entries()) {
    const existing = await prisma.title.findFirst({ where: { title: item.title } });
    const title =
      existing ??
      (await prisma.title.create({
        data: {
          title: item.title,
          synopsis: item.synopsis,
          year: item.year,
          durationSec: item.durationSec,
          ageRating: item.ageRating,
          posterUrl: item.poster,
          heroUrl: item.hero,
          accessType: item.accessType,
          ppvPriceMnt: item.ppvPriceMnt,
          isPublished: true,
        },
      }));

    for (const name of item.genres) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const genre = await prisma.genre.upsert({
        where: { slug },
        update: { name },
        create: { slug, name },
      });
      await prisma.titleGenre.upsert({
        where: { titleId_genreId: { titleId: title.id, genreId: genre.id } },
        update: {},
        create: { titleId: title.id, genreId: genre.id },
      });
    }

    const feature = await prisma.video.findFirst({
      where: { titleId: title.id, kind: VideoKind.FEATURE },
    });
    if (!feature) {
      await prisma.video.create({
        data: {
          titleId: title.id,
          kind: VideoKind.FEATURE,
          muxStatus: item.accessType === "FREE" ? "READY" : "READY",
          muxPlaybackId: `seed_playback_${index}`,
          muxAssetId: `seed_asset_${index}`,
          durationSec: item.durationSec,
          aspectRatio: "16:9",
        },
      });
    }

    if (item.reel) {
      const reel = await prisma.video.findFirst({
        where: { titleId: title.id, kind: VideoKind.REEL },
      });
      if (!reel) {
        await prisma.video.create({
          data: {
            titleId: title.id,
            kind: VideoKind.REEL,
            muxStatus: "READY",
            muxPlaybackId: `seed_reel_${index}`,
            muxAssetId: `seed_reel_asset_${index}`,
            durationSec: 45,
            aspectRatio: "9:16",
          },
        });
      }
    }

    for (const [order, slug] of item.collections.entries()) {
      const collection = await prisma.collection.findUnique({ where: { slug } });
      if (!collection) continue;
      await prisma.collectionItem.upsert({
        where: {
          collectionId_titleId: { collectionId: collection.id, titleId: title.id },
        },
        update: { sortOrder: order },
        create: { collectionId: collection.id, titleId: title.id, sortOrder: order },
      });
    }
  }

  console.log("Seeded Negun catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
