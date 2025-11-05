-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_role" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permiso" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "role_permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_token" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estado_uso" (
    "codigo" VARCHAR(4) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,

    CONSTRAINT "estado_uso_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."zonificacion" (
    "id_zonificacion" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(200),

    CONSTRAINT "zonificacion_pkey" PRIMARY KEY ("id_zonificacion")
);

-- CreateTable
CREATE TABLE "public"."giro" (
    "id_giro" SERIAL NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(500) NOT NULL,

    CONSTRAINT "giro_pkey" PRIMARY KEY ("id_giro")
);

-- CreateTable
CREATE TABLE "public"."giro_zonificacion" (
    "id_giro_zonificacion" SERIAL NOT NULL,
    "id_giro" INTEGER NOT NULL,
    "id_zonificacion" INTEGER NOT NULL,
    "codigo" VARCHAR(4),

    CONSTRAINT "giro_zonificacion_pkey" PRIMARY KEY ("id_giro_zonificacion")
);

-- CreateTable
CREATE TABLE "public"."persona" (
    "id_persona" SERIAL NOT NULL,
    "tipo_persona" VARCHAR(10) NOT NULL,
    "nombre_razon_social" VARCHAR(255) NOT NULL,
    "tipo_documento" VARCHAR(10),
    "numero_documento" VARCHAR(20),
    "ruc" VARCHAR(20),
    "telefono" VARCHAR(20),
    "correo" VARCHAR(100),
    "via_tipo" VARCHAR(20),
    "via_nombre" VARCHAR(100),
    "numero" VARCHAR(10),
    "interior" VARCHAR(10),
    "mz" VARCHAR(10),
    "lt" VARCHAR(10),
    "otros" VARCHAR(50),
    "urb_aa_hh_otros" VARCHAR(50),
    "distrito" VARCHAR(50),
    "provincia" VARCHAR(50),
    "departamento" VARCHAR(50),

    CONSTRAINT "persona_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "public"."representante" (
    "id_representante" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "nombres" VARCHAR(255),
    "tipo_documento" VARCHAR(10),
    "numero_documento" VARCHAR(20),
    "sunarp_partida_asiento" VARCHAR(100),

    CONSTRAINT "representante_pkey" PRIMARY KEY ("id_representante")
);

-- CreateTable
CREATE TABLE "public"."expediente" (
    "id_expediente" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "numero_expediente" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20),
    "codigo_qr" TEXT,

    CONSTRAINT "expediente_pkey" PRIMARY KEY ("id_expediente")
);

-- CreateTable
CREATE TABLE "public"."expediente_licencia" (
    "id_expediente_licencia" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "id_representante" INTEGER,
    "numero_licencia_origen" VARCHAR(50),
    "fecha_recepcion" DATE NOT NULL,
    "tipo_tramite" VARCHAR(20),
    "modalidad" VARCHAR(20),
    "fecha_inicio_plazo" DATE,
    "fecha_fin_plazo" DATE,
    "numero_resolucion" VARCHAR(50),
    "resolucion_fecha" DATE,
    "nueva_denominacion" VARCHAR(255),
    "numero_certificado" VARCHAR(50),
    "qr_certificado" TEXT,
    "detalle_otros" TEXT,

    CONSTRAINT "expediente_licencia_pkey" PRIMARY KEY ("id_expediente_licencia")
);

-- CreateTable
CREATE TABLE "public"."declaracion_jurada" (
    "id_declaracion" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "fecha" DATE,
    "aceptacion" BOOLEAN NOT NULL DEFAULT false,
    "nombre_comercial" VARCHAR(255),
    "codigo_ciiu" VARCHAR(20),
    "actividad" VARCHAR(255),
    "zonificacion" VARCHAR(50),
    "via_tipo" VARCHAR(20),
    "via_nombre" VARCHAR(100),
    "numero" VARCHAR(10),
    "interior" VARCHAR(10),
    "mz" VARCHAR(10),
    "lt" VARCHAR(10),
    "otros" VARCHAR(50),
    "urb_aa_hh_otros" VARCHAR(50),
    "provincia" VARCHAR(50),
    "tiene_aut_sectorial" BOOLEAN NOT NULL DEFAULT false,
    "aut_entidad" VARCHAR(100),
    "aut_denominacion" VARCHAR(255),
    "aut_fecha" DATE,
    "aut_numero" VARCHAR(50),
    "monumento" BOOLEAN NOT NULL DEFAULT false,
    "aut_ministerio_cultura" BOOLEAN NOT NULL DEFAULT false,
    "num_aut_ministerio_cultura" VARCHAR(50),
    "fecha_aut_ministerio_cultura" DATE,
    "area_total_m2" DECIMAL(10,2),
    "firmante_tipo" VARCHAR(20),
    "firmante_nombre" VARCHAR(255),
    "firmante_doc_tipo" VARCHAR(10),
    "firmante_doc_numero" VARCHAR(20),
    "vigencia_poder" BOOLEAN NOT NULL DEFAULT false,
    "condiciones_seguridad" BOOLEAN NOT NULL DEFAULT false,
    "titulo_profesional" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,

    CONSTRAINT "declaracion_jurada_pkey" PRIMARY KEY ("id_declaracion")
);

-- CreateTable
CREATE TABLE "public"."expediente_opciones" (
    "id_expediente_opcion" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "valor_json" JSONB,

    CONSTRAINT "expediente_opciones_pkey" PRIMARY KEY ("id_expediente_opcion")
);

-- CreateTable
CREATE TABLE "public"."declaracion_jurada_giro" (
    "id_dj_giro" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "id_giro_zonificacion" INTEGER NOT NULL,

    CONSTRAINT "declaracion_jurada_giro_pkey" PRIMARY KEY ("id_dj_giro")
);

-- CreateTable
CREATE TABLE "public"."seguridad_itse" (
    "id_seguridad" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "nivel" VARCHAR(10),
    "condiciones_seguridad" BOOLEAN NOT NULL DEFAULT false,
    "modal_itse" VARCHAR(20),
    "numero_itse" VARCHAR(50),
    "archivo_itse" VARCHAR(255),
    "editable" BOOLEAN NOT NULL DEFAULT false,
    "calificador_nombre" VARCHAR(255),
    "fecha" DATE,

    CONSTRAINT "seguridad_itse_pkey" PRIMARY KEY ("id_seguridad")
);

-- CreateTable
CREATE TABLE "public"."anexos" (
    "id_anexo" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "nombre" VARCHAR(255),
    "ruta" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(10),
    "tamano_bytes" BIGINT,
    "hash_archivo" VARCHAR(128),
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_anexo" VARCHAR(50),

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id_anexo")
);

-- CreateTable
CREATE TABLE "public"."auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "tabla_afectada" VARCHAR(60) NOT NULL,
    "id_registro" VARCHAR(60) NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "usuario" VARCHAR(100),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cambios" JSONB,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "public"."pago_tramite" (
    "id_pago" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "concepto" VARCHAR(150) NOT NULL,
    "nro_recibo" VARCHAR(50) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "pago_tramite_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "public"."fiscalizacion_visita" (
    "id_visita" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "fecha_visita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" VARCHAR(50),
    "observaciones" TEXT,
    "acta_numero" VARCHAR(50),

    CONSTRAINT "fiscalizacion_visita_pkey" PRIMARY KEY ("id_visita")
);

-- CreateTable
CREATE TABLE "public"."actividad_catalogo" (
    "id_actividad" SERIAL NOT NULL,
    "nombre_actividad" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(10),

    CONSTRAINT "actividad_catalogo_pkey" PRIMARY KEY ("id_actividad")
);

-- CreateTable
CREATE TABLE "public"."dj_actividades" (
    "id_dj_actividad" SERIAL NOT NULL,
    "id_declaracion" INTEGER NOT NULL,
    "id_actividad" INTEGER NOT NULL,

    CONSTRAINT "dj_actividades_pkey" PRIMARY KEY ("id_dj_actividad")
);

-- CreateTable
CREATE TABLE "public"."dj_cesionario" (
    "id_cesionario" SERIAL NOT NULL,
    "id_declaracion" INTEGER NOT NULL,
    "nombre_razon" VARCHAR(255),
    "documento" VARCHAR(20),

    CONSTRAINT "dj_cesionario_pkey" PRIMARY KEY ("id_cesionario")
);

-- CreateTable
CREATE TABLE "public"."dj_constancias" (
    "id_constancia" SERIAL NOT NULL,
    "id_declaracion" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "firma_nombre" VARCHAR(255),
    "firma_dni" VARCHAR(20),
    "firma_correo" VARCHAR(100),
    "firma_celular" VARCHAR(20),
    "observaciones" TEXT,
    "archivo" VARCHAR(255),

    CONSTRAINT "dj_constancias_pkey" PRIMARY KEY ("id_constancia")
);

-- CreateTable
CREATE TABLE "public"."cat_categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(80),

    CONSTRAINT "cat_categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "public"."cat_requisito" (
    "id_requisito" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "cat_requisito_pkey" PRIMARY KEY ("id_requisito")
);

-- CreateTable
CREATE TABLE "public"."cat_tipo" (
    "id_tipo" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "key" VARCHAR(40) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "vigencia_text" VARCHAR(120),
    "presentacion_text" VARCHAR(160),
    "tarifa_text" TEXT,
    "nota" TEXT,
    "base_legal" VARCHAR(200),
    "vigencia_dias" INTEGER,
    "presentacion_min_dh" INTEGER,
    "presentacion_es_hab" BOOLEAN,

    CONSTRAINT "cat_tipo_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "public"."cat_tipo_requisito" (
    "id_tipo" INTEGER NOT NULL,
    "id_requisito" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cat_tipo_requisito_pkey" PRIMARY KEY ("id_tipo","id_requisito")
);

-- CreateTable
CREATE TABLE "public"."evento" (
    "id_evento" SERIAL NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "numero_licencia" VARCHAR(50),
    "numero_certificado" VARCHAR(50),
    "actividad" VARCHAR(200) NOT NULL,
    "ubicacion" VARCHAR(200),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',

    CONSTRAINT "evento_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "public"."evento_horario" (
    "id_horario" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,

    CONSTRAINT "evento_horario_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "public"."evento_requisito" (
    "id_evento_req" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_requisito" INTEGER NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "estado" VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    "observacion" TEXT,

    CONSTRAINT "evento_requisito_pkey" PRIMARY KEY ("id_evento_req")
);

-- CreateTable
CREATE TABLE "public"."evento_archivo" (
    "id_archivo" SERIAL NOT NULL,
    "id_evento_req" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(260) NOT NULL,
    "ruta_almacen" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(10),
    "tamano_bytes" BIGINT,
    "hash_archivo" VARCHAR(128),
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_archivo_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateTable
CREATE TABLE "public"."autorizacion_via_publica" (
    "id_auto_viapublica" SERIAL NOT NULL,
    "id_expediente" INTEGER NOT NULL,
    "fecha_solicitud" DATE,
    "modalidad" VARCHAR(20),
    "fecha_inicio_temporal" DATE,
    "fecha_fin_temporal" DATE,
    "otras_referencia" VARCHAR(100),

    CONSTRAINT "autorizacion_via_publica_pkey" PRIMARY KEY ("id_auto_viapublica")
);

-- CreateTable
CREATE TABLE "public"."autorizacion_establecimiento" (
    "id_auto_establecimiento" SERIAL NOT NULL,
    "id_auto_viapublica" INTEGER NOT NULL,
    "modulo_movible" BOOLEAN,
    "modulo_estacionario" BOOLEAN,
    "triciclo" BOOLEAN,
    "vehiculo_motorizado" BOOLEAN,
    "medio_venta" VARCHAR(100),
    "giro_actividad" VARCHAR(100),
    "via_tipo" VARCHAR(20),
    "via_nombre" VARCHAR(100),
    "numero" VARCHAR(10),
    "interior" VARCHAR(10),
    "mz" VARCHAR(10),
    "lt" VARCHAR(10),
    "otros" VARCHAR(50),
    "urb_aa_hh_otros" VARCHAR(50),
    "ubicacion" VARCHAR(200),
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "map_zoom" INTEGER DEFAULT 17,

    CONSTRAINT "autorizacion_establecimiento_pkey" PRIMARY KEY ("id_auto_establecimiento")
);

-- CreateTable
CREATE TABLE "public"."autorizacion_anexo" (
    "id_autorizacion_anexo" SERIAL NOT NULL,
    "id_auto_viapublica" INTEGER NOT NULL,
    "id_requisito" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(260) NOT NULL,
    "ruta_almacen" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(10),
    "tamano_bytes" BIGINT,
    "hash_archivo" VARCHAR(128),
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autorizacion_anexo_pkey" PRIMARY KEY ("id_autorizacion_anexo")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_nombre_key" ON "public"."role"("nombre");

-- CreateIndex
CREATE INDEX "password_reset_token_user_id_idx" ON "public"."password_reset_token"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_token_expires_at_idx" ON "public"."password_reset_token"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "zonificacion_codigo_key" ON "public"."zonificacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "giro_codigo_key" ON "public"."giro"("codigo");

-- CreateIndex
CREATE INDEX "giro_zonificacion_id_giro_idx" ON "public"."giro_zonificacion"("id_giro");

-- CreateIndex
CREATE INDEX "giro_zonificacion_id_zonificacion_idx" ON "public"."giro_zonificacion"("id_zonificacion");

-- CreateIndex
CREATE INDEX "giro_zonificacion_codigo_idx" ON "public"."giro_zonificacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "giro_zonificacion_id_giro_id_zonificacion_key" ON "public"."giro_zonificacion"("id_giro", "id_zonificacion");

-- CreateIndex
CREATE INDEX "representante_id_persona_idx" ON "public"."representante"("id_persona");

-- CreateIndex
CREATE INDEX "expediente_id_persona_idx" ON "public"."expediente"("id_persona");

-- CreateIndex
CREATE INDEX "expediente_licencia_id_expediente_idx" ON "public"."expediente_licencia"("id_expediente");

-- CreateIndex
CREATE INDEX "declaracion_jurada_id_expediente_idx" ON "public"."declaracion_jurada"("id_expediente");

-- CreateIndex
CREATE INDEX "expediente_opciones_id_expediente_idx" ON "public"."expediente_opciones"("id_expediente");

-- CreateIndex
CREATE INDEX "declaracion_jurada_giro_id_expediente_idx" ON "public"."declaracion_jurada_giro"("id_expediente");

-- CreateIndex
CREATE INDEX "declaracion_jurada_giro_id_giro_zonificacion_idx" ON "public"."declaracion_jurada_giro"("id_giro_zonificacion");

-- CreateIndex
CREATE INDEX "seguridad_itse_id_expediente_idx" ON "public"."seguridad_itse"("id_expediente");

-- CreateIndex
CREATE INDEX "anexos_id_expediente_idx" ON "public"."anexos"("id_expediente");

-- CreateIndex
CREATE INDEX "pago_tramite_id_expediente_idx" ON "public"."pago_tramite"("id_expediente");

-- CreateIndex
CREATE INDEX "fiscalizacion_visita_id_expediente_idx" ON "public"."fiscalizacion_visita"("id_expediente");

-- CreateIndex
CREATE INDEX "dj_actividades_id_declaracion_idx" ON "public"."dj_actividades"("id_declaracion");

-- CreateIndex
CREATE INDEX "dj_actividades_id_actividad_idx" ON "public"."dj_actividades"("id_actividad");

-- CreateIndex
CREATE INDEX "dj_cesionario_id_declaracion_idx" ON "public"."dj_cesionario"("id_declaracion");

-- CreateIndex
CREATE INDEX "dj_constancias_id_declaracion_idx" ON "public"."dj_constancias"("id_declaracion");

-- CreateIndex
CREATE INDEX "cat_tipo_id_categoria_idx" ON "public"."cat_tipo"("id_categoria");

-- CreateIndex
CREATE INDEX "evento_id_tipo_idx" ON "public"."evento"("id_tipo");

-- CreateIndex
CREATE INDEX "evento_id_expediente_idx" ON "public"."evento"("id_expediente");

-- CreateIndex
CREATE INDEX "evento_horario_id_evento_idx" ON "public"."evento_horario"("id_evento");

-- CreateIndex
CREATE INDEX "evento_requisito_id_evento_idx" ON "public"."evento_requisito"("id_evento");

-- CreateIndex
CREATE INDEX "evento_requisito_id_requisito_idx" ON "public"."evento_requisito"("id_requisito");

-- CreateIndex
CREATE UNIQUE INDEX "uq_evento_requisito_evento_requisito" ON "public"."evento_requisito"("id_evento", "id_requisito");

-- CreateIndex
CREATE INDEX "evento_archivo_id_evento_req_idx" ON "public"."evento_archivo"("id_evento_req");

-- CreateIndex
CREATE INDEX "autorizacion_via_publica_id_expediente_idx" ON "public"."autorizacion_via_publica"("id_expediente");

-- CreateIndex
CREATE INDEX "autorizacion_establecimiento_id_auto_viapublica_idx" ON "public"."autorizacion_establecimiento"("id_auto_viapublica");

-- CreateIndex
CREATE INDEX "autorizacion_anexo_id_auto_viapublica_idx" ON "public"."autorizacion_anexo"("id_auto_viapublica");

-- CreateIndex
CREATE INDEX "autorizacion_anexo_id_requisito_idx" ON "public"."autorizacion_anexo"("id_requisito");

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permiso" ADD CONSTRAINT "role_permiso_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permiso" ADD CONSTRAINT "role_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "public"."permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."giro_zonificacion" ADD CONSTRAINT "fk_gz_giro" FOREIGN KEY ("id_giro") REFERENCES "public"."giro"("id_giro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."giro_zonificacion" ADD CONSTRAINT "fk_gz_zonificacion" FOREIGN KEY ("id_zonificacion") REFERENCES "public"."zonificacion"("id_zonificacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."giro_zonificacion" ADD CONSTRAINT "fk_gz_estado_uso" FOREIGN KEY ("codigo") REFERENCES "public"."estado_uso"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."representante" ADD CONSTRAINT "fk_representante_persona" FOREIGN KEY ("id_persona") REFERENCES "public"."persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expediente" ADD CONSTRAINT "fk_expediente_persona" FOREIGN KEY ("id_persona") REFERENCES "public"."persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expediente_licencia" ADD CONSTRAINT "fk_explicencia_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expediente_licencia" ADD CONSTRAINT "fk_expediente_representante" FOREIGN KEY ("id_representante") REFERENCES "public"."representante"("id_representante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declaracion_jurada" ADD CONSTRAINT "fk_dj_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expediente_opciones" ADD CONSTRAINT "fk_exp_opciones_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declaracion_jurada_giro" ADD CONSTRAINT "fk_djg_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declaracion_jurada_giro" ADD CONSTRAINT "fk_djg_gz" FOREIGN KEY ("id_giro_zonificacion") REFERENCES "public"."giro_zonificacion"("id_giro_zonificacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seguridad_itse" ADD CONSTRAINT "fk_itse_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anexos" ADD CONSTRAINT "fk_anexos_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pago_tramite" ADD CONSTRAINT "fk_pago_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscalizacion_visita" ADD CONSTRAINT "fk_visita_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dj_actividades" ADD CONSTRAINT "fk_djact_declaracion" FOREIGN KEY ("id_declaracion") REFERENCES "public"."declaracion_jurada"("id_declaracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dj_actividades" ADD CONSTRAINT "fk_djact_actividad" FOREIGN KEY ("id_actividad") REFERENCES "public"."actividad_catalogo"("id_actividad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dj_cesionario" ADD CONSTRAINT "fk_djces_declaracion" FOREIGN KEY ("id_declaracion") REFERENCES "public"."declaracion_jurada"("id_declaracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dj_constancias" ADD CONSTRAINT "fk_djconst_declaracion" FOREIGN KEY ("id_declaracion") REFERENCES "public"."declaracion_jurada"("id_declaracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cat_tipo" ADD CONSTRAINT "fk_tipo_categoria" FOREIGN KEY ("id_categoria") REFERENCES "public"."cat_categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cat_tipo_requisito" ADD CONSTRAINT "fk_ctr_tipo" FOREIGN KEY ("id_tipo") REFERENCES "public"."cat_tipo"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cat_tipo_requisito" ADD CONSTRAINT "fk_ctr_requisito" FOREIGN KEY ("id_requisito") REFERENCES "public"."cat_requisito"("id_requisito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento" ADD CONSTRAINT "fk_evento_tipo" FOREIGN KEY ("id_tipo") REFERENCES "public"."cat_tipo"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento" ADD CONSTRAINT "fk_evento_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento_horario" ADD CONSTRAINT "fk_evento_horario_evento" FOREIGN KEY ("id_evento") REFERENCES "public"."evento"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento_requisito" ADD CONSTRAINT "fk_evento_req_evento" FOREIGN KEY ("id_evento") REFERENCES "public"."evento"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento_requisito" ADD CONSTRAINT "fk_evento_req_requisito" FOREIGN KEY ("id_requisito") REFERENCES "public"."cat_requisito"("id_requisito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evento_archivo" ADD CONSTRAINT "fk_evento_archivo_evento_req" FOREIGN KEY ("id_evento_req") REFERENCES "public"."evento_requisito"("id_evento_req") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."autorizacion_via_publica" ADD CONSTRAINT "fk_auto_viapublica_expediente" FOREIGN KEY ("id_expediente") REFERENCES "public"."expediente"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."autorizacion_establecimiento" ADD CONSTRAINT "fk_auto_establecimiento_viapublica" FOREIGN KEY ("id_auto_viapublica") REFERENCES "public"."autorizacion_via_publica"("id_auto_viapublica") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."autorizacion_anexo" ADD CONSTRAINT "fk_autanexo_viapublica" FOREIGN KEY ("id_auto_viapublica") REFERENCES "public"."autorizacion_via_publica"("id_auto_viapublica") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."autorizacion_anexo" ADD CONSTRAINT "fk_autanexo_requisito" FOREIGN KEY ("id_requisito") REFERENCES "public"."cat_requisito"("id_requisito") ON DELETE RESTRICT ON UPDATE CASCADE;
