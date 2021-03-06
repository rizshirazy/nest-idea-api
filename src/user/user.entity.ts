import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { IUserResponseObject } from './user.dto';
import { IdeaEnity } from 'src/idea/idea.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;
  @Column('text')
  password: string;

  @CreateDateColumn()
  createdDate: Date;

  @OneToMany(
    type => IdeaEnity,
    idea => idea.author,
  )
  ideas: IdeaEnity;

  @ManyToMany(type => IdeaEnity, { cascade: true })
  @JoinTable()
  bookmarks: IdeaEnity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  toResponseObject(showToken = true): IUserResponseObject {
    const { id, username, createdDate, token } = this;
    const responseObject: any = { id, username, createdDate };
    if (showToken) {
      responseObject.token = token;
    }

    if (this.ideas) {
      responseObject.ideas = this.ideas;
    }

    if (this.bookmarks) {
      responseObject.bookmarks = this.bookmarks;
    }

    return responseObject;
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token() {
    const { id, username } = this;
    return jwt.sign(
      {
        id,
        username,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES },
    );
  }
}
