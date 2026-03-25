import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}
