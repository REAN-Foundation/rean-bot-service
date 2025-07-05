import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  channel!: string;

  @Column({ type: 'jsonb' })
  context!: {
    entities: Record<string, any>;
    intent: string | null;
    history: Array<{
      message: string;
      response: string;
      timestamp: Date;
    }>;
  };

  @Column({ default: 'active' })
  status!: 'active' | 'closed' | 'transferred';

  @CreateDateColumn()
  startedAt!: Date;

  @UpdateDateColumn()
  lastActivity!: Date;
}
