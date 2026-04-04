-- DropForeignKey
ALTER TABLE "public"."declaracion_jurada_giro" DROP CONSTRAINT "fk_djg_gz";

-- AlterTable
ALTER TABLE "public"."declaracion_jurada_giro" ADD COLUMN     "id_giro" INTEGER,
ALTER COLUMN "id_giro_zonificacion" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "declaracion_jurada_giro_id_giro_idx" ON "public"."declaracion_jurada_giro"("id_giro");

-- AddForeignKey
ALTER TABLE "public"."declaracion_jurada_giro" ADD CONSTRAINT "fk_djg_gz" FOREIGN KEY ("id_giro_zonificacion") REFERENCES "public"."giro_zonificacion"("id_giro_zonificacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declaracion_jurada_giro" ADD CONSTRAINT "fk_djg_giro_ref" FOREIGN KEY ("id_giro") REFERENCES "public"."giro"("id_giro") ON DELETE SET NULL ON UPDATE CASCADE;
