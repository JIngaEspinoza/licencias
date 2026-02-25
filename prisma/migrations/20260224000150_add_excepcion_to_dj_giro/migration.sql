/*
  Warnings:

  - You are about to drop the column `chk_tolerancia` on the `declaracion_jurada` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."declaracion_jurada" DROP COLUMN "chk_tolerancia";

-- AlterTable
ALTER TABLE "public"."declaracion_jurada_giro" ADD COLUMN     "es_excepcion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zonificacion_al_momento" TEXT;
