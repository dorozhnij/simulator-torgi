import { pool } from "../db";
import { migrate } from "./migrate";

export async function seed() {
  await migrate();

  // Оставляем на карте только три демо-точки (удаляются и пользовательские записи).
  await pool.query(`DELETE FROM user_ideas`);

  const testIdeas = [
    {
      title: "Посадить яблони",
      description:
        "В парке не хватает цветущих деревьев весной. Посадить яблони, которые красиво цветут, видели подобные в Ульяновске в прошлом году",
      lng: 49.614782,
      lat: 54.223127,
      status: "approved" as const
    },
    {
      title: "Неблагоустроенная тропа",
      description:
        "Гуляем здесь с детьми, весной и осенью дорога превращается в грязь, сделайте что-нибудь",
      lng: 49.612536,
      lat: 54.234338,
      status: "approved" as const
    },
    {
      title: "Площадку для выгула собак",
      description:
        "У меня бигль, очень активный, как увидит школьников — бежит здороваться. Сделайте спецплощадку, чтобы можно было безопасно спускать собаку с поводка",
      lng: 49.593596,
      lat: 54.211869,
      status: "approved" as const
    }
  ];

  for (const idea of testIdeas) {
    await pool.query(
      `
      INSERT INTO user_ideas (title, description, location, status, is_seed_demo)
      VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326), $5, true)
      `,
      [idea.title, idea.description, idea.lng, idea.lat, idea.status]
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${testIdeas.length} demo ideas (is_seed_demo=true, not exposed in API).`);
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Seed error:", err);
      process.exit(1);
    });
}
