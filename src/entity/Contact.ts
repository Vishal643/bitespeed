import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn
} from "typeorm";

@Entity({
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === "true"
})
export class Contact extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: true })
  phoneNumber: string | null;

  @Column({ type: "varchar", length: 255, nullable: true }) // Use "varchar" data type for strings
  email: string;

  // the ID of another Contact linked to this one (if any) make it foreign key
  @Column({ nullable: true })
  linkedId: number;

  @Column({
    nullable: false,
    type: "enum",
    enum: ["PRIMARY", "SECONDARY"],
    default: "PRIMARY"
  })
  linkPrecedence: "PRIMARY" | "SECONDARY";

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;
}
