// import { IsUrl } from "class-validator";
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
    MessageDirection,
    MessageHandlerType,
    MessageContentType,
} from '../../../types/enums';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'chat_messages' })
export class ChatMessage {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    TenantId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    TenantName: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: false })
    SessionId: string;

    @Column({ type: 'enum', enum: ChannelType, default: ChannelType.Mock })
    ChannelType: ChannelType;

    @Column({ type: 'varchar', nullable: false })
    @Max(256)
    @Min(1)
    ChannelUserId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(512)
    @Min(1)
    ChannelMessageId: string;

    @Column({ type: 'varchar', nullable: true, default: 'en-US' })
    @Max(8)
    @Min(1)
    LanguageCode: string;

    @Column({ type: 'enum', enum: MessageDirection, default: MessageDirection.In })
    @Max(256)
    @Min(1)
    Direction: MessageDirection;

    @Column({ type: 'enum', enum: MessageContentType, default: MessageContentType.Text })
    MessageType: MessageContentType;

    @Column({ type: 'text', nullable: true })
    Content: string;

    @Column({ type: 'text', nullable: true })
    TranslatedContent: string;

    @Column({ type: 'string', nullable: true })
    @Max(64)
    SupportTicketId: string;

    @Column({ type: 'uuid', nullable: true })
    SupportMessageId: string;

    @Column({ type: 'enum', enum: ChannelType, default: ChannelType.Mock })
    SupportChannelType: ChannelType;

    @Column({ type: 'enum', enum: MessageHandlerType, default: MessageHandlerType.Unhandled })
    PrimaryMessageHandler: MessageHandlerType;

    @Column({ type: 'timestamp', nullable: true })
    Timestamp: Date;

    @Column({ type: 'uuid', nullable: true })
    PrevMessageId: string;

    @Column({ type: 'json', nullable: true })
    GeoLocation: string;

    @Column({ type: 'json', nullable: true })
    ChannelSpecifics: string;

    @Column({ type: 'json', nullable: true })
    Metadata: string;

    @Column({ type: 'json', nullable: true })
    Intent: string;

    @Column({ type: 'json', nullable: true })
    Assessment: string;

    @Column({ type: 'json', nullable: true })
    Feedback: string;

    @Column({ type: 'json', nullable: true })
    HumanHandoff: string;

    @Column({ type: 'json', nullable: true })
    QnA: string;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
