import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Message } from './message.entity';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'conversations' })
export class Conversation {

    @PrimaryColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    UserId!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    Channel!: string;

    @Column({ type: 'varchar', length: 50, nullable: false, default: 'active' })
    Status!: string;

    @CreateDateColumn()
    CreatedAt!: Date;

    @UpdateDateColumn()
    UpdatedAt!: Date;

    @OneToMany(() => Message, message => message.conversation)
    messages?: Message[];

}
