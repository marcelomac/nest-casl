import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AbilityFactory, Action } from './../ability/ability.factory';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class UserService {
  constructor(private abilityFactory: AbilityFactory) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  //findOne(id: number) {
  findOne(id: number) {
    const user = new User();
    user.id = id;
    user.orgId = 20;
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    const ability = this.abilityFactory.defineAbility(currentUser);

    // findOne() retorna um usuário que está na mesma organização (20) que o admin:
    const userToUpdate = this.findOne(+id);

    ForbiddenError.from(ability)
      .setMessage('mensagem qualquer na alteração')
      .throwUnlessCan(Action.Update, userToUpdate);

    // update call DB
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
