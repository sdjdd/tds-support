import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Ticket } from '@/ticket';
import { User } from '@/user';

type Subjects = InferSubjects<typeof Ticket> | 'all';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(Ability);

    if (user.isAgent()) {
      can('manage', 'all');
    } else {
      can('create', Ticket, ['categoryId', 'title', 'content']);
      can('read', Ticket, { requesterId: user.id });
      can('update', Ticket, ['title', 'content'], { requesterId: user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
