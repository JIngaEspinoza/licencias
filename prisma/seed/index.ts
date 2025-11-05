import { seedUsos } from "./seed_usos";
import { seedPersonas, seedRepresentantesSoloJuridicas } from "./seed_persona";
import { seedExpedientes } from "./seed_expediente";
import { seedCategorias, seedRequisitos, seedTipos, seedTipoRequisitos  } from "./seed_aut_temporal_tablas";
import { seedSeguridad } from "./seed_seguridad";

async function main() {
  await seedUsos();
  await seedPersonas();
  await seedRepresentantesSoloJuridicas();
  await seedExpedientes();
  await seedCategorias();
  await seedRequisitos();
  await seedTipos();
  await seedTipoRequisitos();
  await seedSeguridad();

  //await seedDjs();
}
main();
