-- AlterTable
ALTER TABLE "public"."expediente_licencia" ADD COLUMN     "fecha_visto_bueno" TIMESTAMP(3),
ADD COLUMN     "id_user_creador" INTEGER,
ADD COLUMN     "id_user_riesgo" INTEGER,
ADD COLUMN     "nombre_inspector" VARCHAR(100);

-- AddForeignKey
ALTER TABLE "public"."expediente_licencia" ADD CONSTRAINT "fk_expediente_user_creador" FOREIGN KEY ("id_user_creador") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expediente_licencia" ADD CONSTRAINT "fk_expediente_user_riesgo" FOREIGN KEY ("id_user_riesgo") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
