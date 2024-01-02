// import { IsUrl } from "class-validator";
import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Max, Min } from 'class-validator';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'assessments' })
export class Assessment {

    @PrimaryColumn('uuid')
    id: string; // This id is the same as AssessmentId in rean-care-assessment module

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: true })
    TenantId: string;

    @Column({ type: 'varchar', nullable: true, default: 'WhatsApp' })
    @Max(128)
    @Min(2)
    Channel: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    ChannelUserId: string;

    @Column({ type: 'uuid', nullable: false })
    SessionId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(256)
    AssessmentName: string;

    @Column({ type: 'uuid', nullable: true })
    CurrentQuestionId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(512)
    CurrentQuestion: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(64)
    CurrentQuestionType: string;

    @Column({ type: 'json', nullable: true })
    CurrentQuestionOptions: string;

    @Column({ type: 'boolean', nullable: false, default: false })
    IsCompleted: boolean;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
