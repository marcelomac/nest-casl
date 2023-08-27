import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.isAdmin) {
      can(Action.Manage, 'all');
      // VER https://casl.js.org/v6/en/guide/conditions-in-depth
      cannot(Action.Manage, User, { orgId: { $ne: user.orgId } }).because(
        'You can only manage users in your organization.',
      );
    } else {
      can(Action.Read, 'all');
      cannot(Action.Create, User).because('special message: only admin!');
      cannot(Action.Delete, User).because('you just cant: only admin!');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
