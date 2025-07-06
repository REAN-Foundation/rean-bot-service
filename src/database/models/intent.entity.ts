import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm';

////////////////////////////////////////////////////////////////////////

export interface RequiredEntities {
    [key: string]: any;
}

export interface HandlerConfig {
    [key: string]: any;
}

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'intents' })
export class Intent {

    @PrimaryColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    IntentName!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    DisplayName?: string;

    @Column({ type: 'text', nullable: true })
    Description?: string;

    @Column({ type: 'json', nullable: true })
    RequiredEntities?: RequiredEntities;

    @Column({ type: 'varchar', length: 100, nullable: true })
    HandlerType?: string;

    @Column({ type: 'json', nullable: true })
    HandlerConfig?: HandlerConfig;

    @Column({ type: 'float', nullable: false, default: 0.8 })
    ThresholdScore!: number;

    @Column({ type: 'int', nullable: false, default: 0 })
    Priority!: number;

    @Column({ type: 'boolean', nullable: false, default: true })
    IsActive!: boolean;

    @CreateDateColumn()
    CreatedAt!: Date;

}
