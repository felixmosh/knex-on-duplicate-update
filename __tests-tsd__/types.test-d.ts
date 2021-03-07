import { knex } from "knex";
import "../types";

const db = knex({});

(async () => {
  await db("table").select("*").onDuplicateUpdate("name", "column2");

  await db("table").select("*").onDuplicateUpdate({name: 'new name'}, 'xx');
})();
