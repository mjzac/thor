import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// tslint:disable:member-access
// tslint:disable:variable-name
@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
    type: "varchar",
    unique: true,
  })
  email: string;

  @Column({
    length: 80,
    type: "varchar",
  })
  password: string;

  @Column({
    length: 48,
    type: "varchar",
  })
  access_token: string;

  @Column({
    default: "https://www.gravatar.com/avatar/000?d=retro",
    type: "varchar",
  })
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
