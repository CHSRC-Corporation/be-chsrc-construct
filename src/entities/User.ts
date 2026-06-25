import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  email!: string;

  // `select: false` keeps the password hash out of regular queries so it is
  // never returned by the API. Login explicitly re-selects it with addSelect.
  @Column({ type: "varchar", length: 120, select: false })
  password!: string;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}
