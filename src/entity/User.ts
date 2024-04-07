import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToMany,
  JoinColumn
} from "typeorm";
import { IsEmail } from "class-validator";

@Entity({
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === "true"
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: true })
  phoneNumber: string | null;

  @Column({
    nullable: true
  })
  @IsEmail()
  email: string | null;

  // the ID of another Contact linked to this one (if any) make it foreign key
  @ManyToMany(() => User)
  @JoinColumn({ name: "linkedId", referencedColumnName: "linkedId" })
  @Column({ type: "varchar", nullable: true })
  linkedId: string | null;

  @Column({
    nullable: false,
    type: "enum",
    enum: ["PRIMARY", "SECONDARY"]
  })
  linkPrecedence: "PRIMARY" | "SECONDARY";

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;
}
