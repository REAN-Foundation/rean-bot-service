import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  externalId!: string;

  @Column()
  channel!: string;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column()
  type!: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'button_reply';

  @Column({ type: 'jsonb' })
  content!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: 'received' })
  status!: 'received' | 'processing' | 'processed' | 'failed';

  @Column({ nullable: true })
  conversationId?: string;

  @CreateDateColumn()
  timestamp!: Date;
}
