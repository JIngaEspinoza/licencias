import { Injectable } from '@nestjs/common';
import { CreateAutorizacionesTemporaleDto } from './dto/create-autorizaciones_temporale.dto';
import { UpdateAutorizacionesTemporaleDto } from './dto/update-autorizaciones_temporale.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutorizacionesTemporalesService {
  constructor(private prisma: PrismaService) {}

  create(createAutorizacionesTemporaleDto: CreateAutorizacionesTemporaleDto) {
    return 'This action adds a new autorizacionesTemporale';
  }

  async findAll() {
    // 1) Traer categorías
    const categorias = await this.prisma.catCategoria.findMany({
      orderBy: { id_categoria: 'asc' },
      select: {
        id_categoria: true,
        nombre: true,
      },
    });

    if (categorias.length === 0) return [];

    // 2) Traer tipos de todas las categorías en un solo query
    const tipos = await this.prisma.catTipo.findMany({
      where: { id_categoria: { in: categorias.map(c => c.id_categoria) } },
      orderBy: [{ id_categoria: 'asc' }, { id_tipo: 'asc' }],
      select: {
        id_tipo: true,
        id_categoria: true,
        key: true,
        titulo: true,
        vigencia_text: true,
        presentacion_text: true,
        tarifa_text: true,
        nota: true,
        base_legal: true,
        cat_tipo_requisito: {
          orderBy: { orden: 'asc' }, // IMPORTANTE: respeta tu ROW_NUMBER()
          select: {
            orden: true,
            cat_requisito: { select: { nombre: true } },
          },
        },
      },
    });

    // 3) Indexar tipos por categoría
    const tiposPorCat = new Map<number, typeof tipos>();
    for (const t of tipos) {
      const arr = tiposPorCat.get(t.id_categoria) ?? [];
      arr.push(t);
      tiposPorCat.set(t.id_categoria, arr);
    }

    // 4) Mapear al DTO que necesita el front
    const vista = categorias.map((cat) => {
      const items = (tiposPorCat.get(cat.id_categoria) ?? []).map((t) => ({
        key: t.key,
        titulo: t.titulo,
        vigencia: t.vigencia_text ?? null,
        presentacion: t.presentacion_text ?? null,
        tarifa: t.tarifa_text ?? null,
        nota: t.nota ?? null,
        base: t.base_legal ?? null,
        requisitos: t.cat_tipo_requisito.map(r => r.cat_requisito.nombre),
      }));

      return { nombre: cat.nombre, items };
    });

    return vista;
  }

  findOne(id: number) {
    return `This action returns a #${id} autorizacionesTemporale`;
  }

  update(id: number, updateAutorizacionesTemporaleDto: UpdateAutorizacionesTemporaleDto) {
    return `This action updates a #${id} autorizacionesTemporale`;
  }

  remove(id: number) {
    return `This action removes a #${id} autorizacionesTemporale`;
  }

  /*async listarVista() {
    // 1) Traer categorías
    const categorias = await this.prisma.catCategoria.findMany({
      orderBy: { id_categoria: 'asc' },
      select: {
        id_categoria: true,
        nombre: true,
      },
    });

    if (categorias.length === 0) return [];

    // 2) Traer tipos de todas las categorías en un solo query
    const tipos = await this.prisma.catTipo.findMany({
      where: { id_categoria: { in: categorias.map(c => c.id_categoria) } },
      orderBy: [{ id_categoria: 'asc' }, { id_tipo: 'asc' }],
      select: {
        id_tipo: true,
        id_categoria: true,
        key: true,
        titulo: true,
        vigencia_text: true,
        presentacion_text: true,
        tarifa_text: true,
        nota: true,
        base_legal: true,
        cat_tipo_requisito: {
          orderBy: { orden: 'asc' }, // IMPORTANTE: respeta tu ROW_NUMBER()
          select: {
            orden: true,
            cat_requisito: { select: { nombre: true } },
          },
        },
      },
    });

    // 3) Indexar tipos por categoría
    const tiposPorCat = new Map<number, typeof tipos>();
    for (const t of tipos) {
      const arr = tiposPorCat.get(t.id_categoria) ?? [];
      arr.push(t);
      tiposPorCat.set(t.id_categoria, arr);
    }

    // 4) Mapear al DTO que necesita el front
    const vista = categorias.map((cat) => {
      const items = (tiposPorCat.get(cat.id_categoria) ?? []).map((t) => ({
        key: t.key,
        titulo: t.titulo,
        vigencia: t.vigencia_text ?? null,
        presentacion: t.presentacion_text ?? null,
        tarifa: t.tarifa_text ?? null,
        nota: t.nota ?? null,
        base: t.base_legal ?? null,
        requisitos: t.cat_tipo_requisito.map(r => r.cat_requisito.nombre),
      }));

      return { nombre: cat.nombre, items };
    });

    return vista;
  }*/

}
