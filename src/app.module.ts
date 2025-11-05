import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
/*import { CiudadanoModule } from './ciudadano/ciudadano.module';
import { LicenciaFuncionamientoModule } from './licencia_funcionamiento/licencia_funcionamiento.module';
import { DeclaracionJuradaLicenciaModule } from './declaracion_jurada_licencia/declaracion_jurada_licencia.module';
import { DeclaracionVigenciaPoderModule } from './declaracion_vigencia_poder/declaracion_vigencia_poder.module';
import { DeclaracionTituloProfesionalModule } from './declaracion_titulo_profesional/declaracion_titulo_profesional.module';
import { AutorizacionSectorialModule } from './autorizacion_sectorial/autorizacion_sectorial.module';
import { EvaluacionTecnicaModule } from './evaluacion_tecnica/evaluacion_tecnica.module';
import { FiscalizacionModule } from './fiscalizacion/fiscalizacion.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RequisitoLicenciaModule } from './requisito_licencia/requisito_licencia.module';
import { AutorizacionTemporalModule } from './autorizacion_temporal/autorizacion_temporal.module';
import { TipoAutorizacionTemporalModule } from './tipo_autorizacion_temporal/tipo_autorizacion_temporal.module';
import { RequisitoAutorizacionTemporalModule } from './requisito_autorizacion_temporal/requisito_autorizacion_temporal.module';
import { FiscalizacionTemporalModule } from './fiscalizacion_temporal/fiscalizacion_temporal.module';
import { AutorizacionViaPublicaModule } from './autorizacion_via_publica/autorizacion_via_publica.module';
import { AutorizacionesTemporalesModule } from './autorizaciones_temporales/autorizaciones_temporales.module';*/
import { PasswordResetTokenModule } from './password_reset_token/password_reset_token.module';
import { RolePermisoModule } from './role_permiso/role_permiso.module';
import { UserRoleModule } from './user_role/user_role.module';
import { PermisoModule } from './permiso/permiso.module';
import { RoleModule } from './role/role.module';
/*import { AutorizacionAnexoModule } from './autorizacion_anexo/autorizacion_anexo.module';
import { AutorizacionEstablecimientoModule } from './autorizacion_establecimiento/autorizacion_establecimiento.module';
import { DeclaracionJuradaViaPublicaModule } from './declaracion_jurada_via_publica/declaracion_jurada_via_publica.module';
import { RequisitoAutorizacionModule } from './requisito_autorizacion/requisito_autorizacion.module';
import { FiscalizacionAutorizacionModule } from './fiscalizacion_autorizacion/fiscalizacion_autorizacion.module';
import { MedioVentaModule } from './medio_venta/medio_venta.module';*/
import { EstadoUsoModule } from './estado_uso/estado_uso.module';
import { ZonificacionModule } from './zonificacion/zonificacion.module';
import { GiroModule } from './giro/giro.module';
import { GiroZonificacionModule } from './giro_zonificacion/giro_zonificacion.module';
import { PersonasModule } from './personas/personas.module';
import { RepresentantesModule } from './representantes/representantes.module';
import { ExpedientesModule } from './expedientes/expedientes.module';
import { ExpedienteLicenciaModule } from './expediente_licencia/expediente_licencia.module';
import { DeclaracionJuradaModule } from './declaracion_jurada/declaracion_jurada.module';
import { ExpedienteOpcionesModule } from './expediente_opciones/expediente_opciones.module';
import { DeclaracionJuradaGiroModule } from './declaracion_jurada_giro/declaracion_jurada_giro.module';
import { SeguridadItseModule } from './seguridad_itse/seguridad_itse.module';
import { AnexosModule } from './anexos/anexos.module';
import { PagoTramiteModule } from './pago_tramite/pago_tramite.module';
import { FiscalizacionVisitaModule } from './fiscalizacion_visita/fiscalizacion_visita.module';
import { ActividadCatalogoModule } from './actividad_catalogo/actividad_catalogo.module';
import { DjActividadesModule } from './dj_actividades/dj_actividades.module';
import { DjCesionarioModule } from './dj_cesionario/dj_cesionario.module';
import { DjConstanciasModule } from './dj_constancias/dj_constancias.module';
import { CatCategoriaModule } from './cat_categoria/cat_categoria.module';
import { CatRequisitoModule } from './cat_requisito/cat_requisito.module';
import { CatTipoModule } from './cat_tipo/cat_tipo.module';
import { CatTipoRequisitoModule } from './cat_tipo_requisito/cat_tipo_requisito.module';
import { EventosModule } from './eventos/eventos.module';
import { EventoHorarioModule } from './evento_horario/evento_horario.module';
import { EventoRequisitoModule } from './evento_requisito/evento_requisito.module';
import { EventoArchivoModule } from './evento_archivo/evento_archivo.module';
import { AutorizacionViaPublicaModule } from './autorizacion_via_publica/autorizacion_via_publica.module';
import { AutorizacionesTemporalesModule } from './autorizaciones_temporales/autorizaciones_temporales.module';
import { AuthModule } from './auth/auth.module';

@Module({
  //imports: [PrismaModule],
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, 
    /*CiudadanoModule, 
    LicenciaFuncionamientoModule, 
    DeclaracionJuradaLicenciaModule, 
    DeclaracionVigenciaPoderModule, 
    DeclaracionTituloProfesionalModule, 
    AutorizacionSectorialModule, 
    EvaluacionTecnicaModule, 
    FiscalizacionModule, 
    AuditoriaModule, 
    RequisitoLicenciaModule, 
    AutorizacionTemporalModule, 
    TipoAutorizacionTemporalModule, 
    RequisitoAutorizacionTemporalModule, 
    FiscalizacionTemporalModule, 
    AutorizacionViaPublicaModule, 
    DeclaracionJuradaViaPublicaModule, 
    RequisitoAutorizacionModule, 
    FiscalizacionAutorizacionModule, 
    MedioVentaModule,*/ 
    EstadoUsoModule, ZonificacionModule, GiroModule, GiroZonificacionModule, PersonasModule, RepresentantesModule, ExpedientesModule, ExpedienteLicenciaModule, DeclaracionJuradaModule, ExpedienteOpcionesModule, DeclaracionJuradaGiroModule, SeguridadItseModule, AnexosModule, PagoTramiteModule, FiscalizacionVisitaModule, ActividadCatalogoModule, DjActividadesModule, DjCesionarioModule, DjConstanciasModule, CatCategoriaModule, CatRequisitoModule, CatTipoModule, CatTipoRequisitoModule, EventosModule, EventoHorarioModule, EventoRequisitoModule, EventoArchivoModule, AutorizacionViaPublicaModule, 
    AutorizacionesTemporalesModule, RoleModule, PermisoModule, UserRoleModule, RolePermisoModule, PasswordResetTokenModule, 
    AuthModule
    /*AutorizacionEstablecimientoModule, AutorizacionAnexoModule*/],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
