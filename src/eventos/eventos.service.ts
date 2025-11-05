import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { EventoCreateDTO } from "./dto/registro-evento.dto";
import { asDate, asTime } from "../lib/datetime";

@Injectable()
export class EventosService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateEventoDto) {
    const evento = await this.prisma.evento.create({ data: dto });
    return evento;
  }

  async findAll() {
    return this.prisma.evento.findMany({ orderBy: { id_evento: 'desc' } });
  }

  async findOne(id: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id_evento: id } });
    if (!evento) throw new NotFoundException('No encontrado');
    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    return this.prisma.evento.update({
      where: { id_evento: id },
      data: updateEventoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.evento.delete({ where: { id_evento: id } });
    return { ok: true };
  }

  async crearEvento(dto: EventoCreateDTO) {
    return this.prisma.$transaction(async (tx) => {
      // 1) Crear el Evento (padre)
      const evento = await tx.evento.create({
        data: {
          id_tipo: dto.id_tipo,
          id_expediente: dto.id_expediente,
          actividad: dto.actividad,
          ubicacion: dto.ubicacion ?? null,
          numero_licencia: dto.numero_licencia ?? null,
          numero_certificado: dto.numero_certificado ?? null,
          // fecha_registro y estado usan defaults del schema
        },
        select: { id_evento: true },
      });

      // 2) Horarios (opcional) - createMany
      if (dto.horarios?.length) {
        await tx.eventoHorario.createMany({
          data: dto.horarios.map((h) => ({
            id_evento: evento.id_evento,
            fecha_inicio: asDate(h.fecha_inicio),
            fecha_fin: asDate(h.fecha_fin),
            hora_inicio: asTime(h.hora_inicio),
            hora_fin: asTime(h.hora_fin),
          })),
          skipDuplicates: true,
        });
      }

      // 3) Requisitos (opcional) - upsert por compuesto (id_evento, id_requisito)
      if (dto.requisitos?.length) {
        for (const r of dto.requisitos) {
          const req = await tx.eventoRequisito.upsert({
            where: {
              // usa tu unique compuesto: @@unique([id_evento, id_requisito], map: "uq_evento_requisito_evento_requisito")
              id_evento_id_requisito: {
                id_evento: evento.id_evento,
                id_requisito: r.id_requisito,
              },
            },
            create: {
              id_evento: evento.id_evento,
              id_requisito: r.id_requisito,
              obligatorio: r.obligatorio ?? true,
              estado: r.estado ?? "PENDIENTE",
              observacion: r.observacion ?? null,
            },
            update: {
              obligatorio: r.obligatorio ?? true,
              estado: r.estado ?? "PENDIENTE",
              observacion: r.observacion ?? null,
            },
            select: { id_evento_req: true },
          });

          // 3.1) Archivos del requisito (opcional) - createMany
          if (r.archivos?.length) {
            await tx.eventoArchivo.createMany({
              data: r.archivos.map((a) => ({
                id_evento_req: req.id_evento_req,
                nombre_archivo: a.nombre_archivo,
                ruta_almacen: a.ruta_almacen,
                extension: a.extension ?? null,
                tamano_bytes:
                  typeof a.tamano_bytes === "number"
                    ? BigInt(a.tamano_bytes)
                    : a.tamano_bytes ?? null,
                hash_archivo: a.hash_archivo ?? null,
                // fecha_subida usa default(now())
              })),
            });
          }
        }
      }

      // 4) Devuelve el evento con relaciones si quieres
      const result = await tx.evento.findUniqueOrThrow({
        where: { id_evento: evento.id_evento },
        include: {
          evento_horario: true,
          evento_requisito: {
            include: { evento_archivo: true, cat_requisito: true },
          },
          cat_tipo: true,
          expediente: true,
        },
      });

    });
  }

}
