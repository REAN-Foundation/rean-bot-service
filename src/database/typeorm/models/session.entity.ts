import { Max, Min } from 'class-validator';
import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'sessions' })
export class Session {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: true })
    TenantId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(2)
    TenantName: string;

    @Column({ type: 'varchar', nullable: true, default: 'WhatsApp' })
    @Max(128)
    @Min(2)
    Channel: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    ChannelUserId: string;

    @Column({ type: 'timestamp', nullable: false })
    LastMessageDate: Date;

    @Column({ type: 'varchar', nullable: false, default: 'en' })
    @Max(8)
    Language: string;

    // @ManyToOne(() => User, (user) => user.Sessions, )
    // User: User;

    // @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.Session)
    // ChatMessages: Promise<ChatMessage[]>; //Lazy loaed

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
