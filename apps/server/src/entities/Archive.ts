import { Entity, ObjectIdColumn, ObjectId, Column, Index } from "typeorm";

@Entity()
@Index(["gameKey", "userId"], { unique: true })
export class Archive {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    gameKey!: string;

    @Column()
    userId!: string;

    @Column("text")
    content!: string; // 2MB limit check done in service

    @Column({ type: "date", default: () => "new Date()" })
    updatedAt!: Date;
}
