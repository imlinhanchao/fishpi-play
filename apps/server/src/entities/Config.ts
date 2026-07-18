import { Entity, ObjectIdColumn, ObjectId, Column, Index } from "typeorm";

@Entity()
@Index(["gameKey", "userId"], { unique: true })
export class Config {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    gameKey!: string;

    @Column()
    userId!: string;

    @Column("json")
    content!: any; // 10KB limit check done in service

    @Column({ type: "date", default: () => "new Date()" })
    updatedAt!: Date;
}
