import { Entity, ObjectIdColumn, ObjectId, Column, Index } from "typeorm";

@Entity()
@Index(["gameKey", "userId"], { unique: true })
export class GameUser {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    gameKey!: string;

    @Column()
    userId!: string;

    @Column("json", { default: {} })
    attributes!: any;

    @Column({ type: "date", default: () => "new Date()" })
    lastLoginAt!: Date;
}