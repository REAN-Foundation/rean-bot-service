import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Max, Min } from 'class-validator';
import {
    ChannelType,
    SupportMessageDirection,
} from '../../../domain.types/enums';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'support_messages' })
export class SupportMessage {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    TenantId: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: false })
    SessionId: string;

    @Column({ type: 'enum', enum: ChannelType, default: ChannelType.Clickup })
    SupportChannel: ChannelType;

    @Column({ type: 'string', nullable: true })
    @Max(64)
    SupportTicketId: string;

    @Column({ type: 'varchar', nullable: false })
    @Max(256)
    @Min(1)
    SupportChannelUserId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(512)
    @Min(1)
    SupportChannelMessageId: string;

    @Column({ type: 'uuid', nullable: true })
    ChatMessageId: string;

    @Column({ type: 'varchar', nullable: true, default: 'en-US' })
    @Max(8)
    @Min(1)
    LanguageCode: string;

    @Column({
        type    : 'enum',
        enum    : SupportMessageDirection,
        default : SupportMessageDirection.ToSupport
    })
    Direction: SupportMessageDirection;

    @Column({ type: 'text', nullable: true })
    Content: string;

    @Column({ type: 'text', nullable: true })
    TranslatedContent: string;

    @Column({ type: 'enum', enum: ChannelType, nullable: true })
    SupportChannelType: ChannelType;

    @Column({ type: 'boolean', nullable: false, default: false })
    IsSupportResponse: boolean;

    @Column({ type: 'boolean', nullable: false, default: false })
    IsExitMessage: boolean;

    @Column({ type: 'timestamp', nullable: true })
    Timestamp: Date;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
