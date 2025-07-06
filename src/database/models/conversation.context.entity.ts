import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

////////////////////////////////////////////////////////////////////////

export interface ContextData {
    [key: string]: any;
}

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'conversation_context' })
export class ConversationContext {

    @PrimaryColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    ConversationId!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    CurrentMode?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    CurrentHandler?: string;

    @Column({ type: 'json', nullable: true })
    ModeData?: ContextData;

    @Column({ type: 'json', nullable: true })
    Context?: ContextData;

    @CreateDateColumn()
    CreatedAt!: Date;

    @UpdateDateColumn()
    UpdatedAt!: Date;

}
