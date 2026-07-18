import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class User {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column({ unique: true })
    userId!: string;

    @Column()
    username!: string;

    @Column()
    nickname!: string;

    @Column()
    avatar!: string;

    @Column()
    source!: string;

    @Column()
    isAdmin!: boolean;
}
