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
  // `default: ""` lets TypeORM's auto-synchronize add this column to a
  // pre-existing SQLite database (with rows that predate the password column)
  // without hitting a NOT NULL violation during the table rebuild. The app
  // itself always sets a hashed password, enforced by the Zod schema.
  @Column({ type: "varchar", length: 120, select: false, default: "" })
  password!: string;

  // No explicit type so TypeORM picks the right one per driver
  // (timestamp on Postgres, datetime on SQLite used by tests).
  @CreateDateColumn()
  createdAt!: Date;
}
