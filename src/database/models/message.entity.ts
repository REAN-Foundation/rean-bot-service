import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

////////////////////////////////////////////////////////////////////////

export enum MessageDirection {
    Inbound = 'inbound',
    Outbound = 'outbound'
}

export interface MessageContent {
    text?: string;
    attachments?: any[];
    [key: string]: any;
}

export interface MessageMetadata {
    [key: string]: any;
}

export interface ProcessedMessageContent {
    intent?: string;
    entities?: any[];
    confidence?: number;
    [key: string]: any;
}

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'messages' })
export class Message {

    @PrimaryColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    ConversationId!: string;

    @Column({ type: 'uuid', nullable: false })
    UserId!: string;

    @Column({ type: 'varchar', length: 64, nullable: false })
    Channel!: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    ChannelMessageId?: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    ReferenceChannelMessageId?: string;

    @Column({ type: 'varchar', length: 64, nullable: false })
    MessageType!: string;

    @Column({ type: 'enum', enum: MessageDirection, nullable: false })
    Direction!: MessageDirection;

    @Column({ type: 'json', nullable: false })
    Content!: MessageContent;

    @Column({ type: 'json', nullable: true })
    Metadata?: MessageMetadata;

    @Column({ type: 'json', nullable: true })
    ProcessedContent?: ProcessedMessageContent;

    @Column({ type: 'varchar', length: 64, nullable: false })
    Status!: string;

    @CreateDateColumn()
    CreatedAt!: Date;

    @ManyToOne(() => Conversation, conversation => conversation.messages)
    @JoinColumn({ name: 'ConversationId' })
    conversation?: Conversation;

}
