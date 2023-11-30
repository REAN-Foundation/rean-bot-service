// import { IsUrl } from "class-validator";
import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    // ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Max, Min, IsUrl } from 'class-validator';
import { MessageDirection } from '../../../domain.types/enums';
import { MessageContentType } from '../../../domain.types/enums';
import { UserFeedbackType } from '../../../domain.types/enums';
// import { Session } from './session.entity';
// import { User } from './user.entity';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'chat_messages' })
export class ChatMessage {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    TenantId: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: false })
    SessionId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    Platform: string;

    @Column({ type: 'varchar', nullable: true, default: 'en-US' })
    @Max(8)
    @Min(1)
    LanguageCode: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    Name: string;

    @Column({ type: 'text', nullable: true })
    @Max(256)
    @Min(0)
    MessageContent: string;

    @Column({ type: 'text', nullable: true })
    @Max(256)
    @Min(0)
    ImageContent: string;

    @Column({ type: 'text', nullable: true })
    @IsUrl()
    @Max(256)
    @Min(0)
    ImageUrl: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    PlatformUserId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    PlatformMessageId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    PlatformResponseMessageId: string;

    @Column({ type: 'timestamp', nullable: true })
    SentTimestamp: Date;

    @Column({ type: 'timestamp', nullable: true })
    DeliveredTimestamp: Date;

    @Column({ type: 'timestamp', nullable: true })
    ReadTimestamp: Date;

    @Column({ type: 'enum', enum: MessageDirection, nullable: false, default: MessageDirection.In })
    Direction: MessageDirection;

    @Column({ type: 'enum', enum: MessageContentType, nullable: false, default: MessageContentType.Text })
    ContentType: MessageContentType;

    @Column({ type: 'uuid', nullable: false })
    AssessmentId: string;

    @Column({ type: 'uuid', nullable: false })
    AssessmentNodeId: string;

    @Column({ type: 'enum', enum: UserFeedbackType, nullable: false, default: UserFeedbackType.Positive })
    FeedbackType: UserFeedbackType;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    @Min(1)
    IdentifiedIntent: string;

    @Column({ type: 'boolean', nullable: false, default: false })
    HumanHandoff: boolean;

    // @ManyToOne(() => Session, (session) => session.ChatMessages)
    // Session: Session;

    // @ManyToOne(() => User, (user) => user.ChatMessages)
    // User: User;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
