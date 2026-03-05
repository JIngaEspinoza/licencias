import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePagoTramiteDto } from './dto/create-pago_tramite.dto';
import { UpdatePagoTramiteDto } from './dto/update-pago_tramite.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PagoTramiteService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreatePagoTramiteDto) {
    const pagoTramite = await this.prisma.pagoTramite.create({ data: dto });
    return pagoTramite;
  }

  async generarPago(data: {id_expediente: number, concepto: string, nro_recibo: string, fecha_pago: string, monto: number}) {
    try {

      console.log(data)

      const expedienteActual = await this.prisma.expediente.findUnique({
        where: { id_expediente: data.id_expediente },
        include: {
          expediente_licencia: true
        }
      });

      if (!expedienteActual) {
        throw new Error('Expediente no encontrado');
      }

      const resultado = await this.prisma.$transaction(async (tx) => {
        const nuevoPago = await tx.pagoTramite.create({
          data: {
            id_expediente: data.id_expediente,
            concepto: data.concepto,
            nro_recibo: data.nro_recibo,
            fecha_pago: new Date(data.fecha_pago),
            monto: data.monto,
          }
        });

        await tx.expediente.update({
          where: { id_expediente: data.id_expediente },
          data: { estado: "PAGADO" }
        });

        return nuevoPago;
      });

      return {
        success: true,
        message: 'Pago registrado y expediente actualizado correctamente',
        id_pago: resultado.id_pago
      };

    } catch (error) {
      console.error('Error al guardar la resolución:', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Ocurrió un error al registrar el pago.');
    }
  }

  async findAll() {
    return this.prisma.pagoTramite.findMany({ orderBy: { id_pago: 'desc' } });
  }

  async findByExpediente(id_expediente: number) {
    const pago = await this.prisma.pagoTramite.findMany({
      where: {
        id_expediente: id_expediente,
      },
      // Si quieres incluir datos del expediente para validar
      include: {
        expediente: {
          select: {
            numero_expediente: true,
          },
        },
      },
    });

    

    if (!pago) {
      throw new NotFoundException(`No se encontró un pago para el expediente #${id_expediente}`);
    }

    return pago;
  }

  async findOne(id: number) {
    const pagoTramite = await this.prisma.pagoTramite.findUnique({ where: { id_pago: id } });
    if (!pagoTramite) throw new NotFoundException('No encontrado');
    return pagoTramite;
  }

  async update(id: number, updatePagoTramiteDto: UpdatePagoTramiteDto) {
    return this.prisma.pagoTramite.update({
      where: { id_pago: id },
      data: updatePagoTramiteDto,
    });
  }

  async remove(id: number) {
    await this.prisma.pagoTramite.delete({ where: { id_pago: id } });
    return { ok: true };
  }
}
