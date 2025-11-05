import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorizacionSectorialService } from './autorizacion_sectorial.service';
import { CreateAutorizacionSectorialDto } from './dto/create-autorizacion_sectorial.dto';
import { UpdateAutorizacionSectorialDto } from './dto/update-autorizacion_sectorial.dto';

@Controller('autorizacion-sectorial')
export class AutorizacionSectorialController {
  constructor(private readonly autorizacionSectorialService: AutorizacionSectorialService) {}

  @Post()
  create(@Body() createAutorizacionSectorialDto: CreateAutorizacionSectorialDto) {
    return this.autorizacionSectorialService.create(createAutorizacionSectorialDto);
  }

  @Get()
  findAll() {
    return this.autorizacionSectorialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionSectorialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionSectorialDto: UpdateAutorizacionSectorialDto) {
    return this.autorizacionSectorialService.update(+id, updateAutorizacionSectorialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionSectorialService.remove(+id);
  }
}
