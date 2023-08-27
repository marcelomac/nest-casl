import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilityFactory, Action } from './../ability/ability.factory';
import { User } from './entities/user.entity';
import { ForbiddenError } from '@casl/ability';
import {
  CheckAbilities,
  ReadUserAbility,
} from './../ability/abilities.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const user = { id: 1, isAdmin: false, orgId: 1 };
    const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(Action.Create, User);
    // if (!isAllowed) {
    //   throw new ForbiddenException('Only admin!');
    // }
    //     return this.userService.create(createUserDto);

    // IMPLEMENTAR FILTRO DE EXCEÇÃO:
    try {
      ForbiddenError.from(ability)
        .setMessage('mensagem qualquer')
        .throwUnlessCan(Action.Create, User);

      return this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @Get()
  @CheckAbilities(new ReadUserAbility())
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @CheckAbilities(new ReadUserAbility())
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // user admin current loged:
    const user = { id: 1, isAdmin: true, orgId: 10 };

    try {
      return this.userService.update(+id, updateUserDto, user);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @Delete(':id')
  @CheckAbilities({ action: Action.Delete, subject: User })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
