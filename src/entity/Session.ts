import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { SessionEntity } from "typeorm-store";

@Entity({
  database: process.env.DB_NAME,
  synchronize: false
})
export class Session extends BaseEntity implements SessionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  expiresAt: number;

  @Column({
    length: 2000
  })
  data: string;
}
