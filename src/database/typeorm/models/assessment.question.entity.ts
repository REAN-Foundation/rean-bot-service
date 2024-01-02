import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Max } from 'class-validator';

////////////////////////////////////////////////////////////////////////

// This entity is used to store the assessment questions as well as the answers

@Entity({ name: 'assessment_questions' })
export class AssessmentQuestion {

    @PrimaryColumn('uuid')
    id: string; // This id is the same as AssessmentQuestionId in rean-care-assessment module

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ type: 'uuid', nullable: false })
    SessionId: string;

    @Column({ type: 'uuid', nullable: false })
    AssessmentId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(512)
    Question: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(64)
    QuestionType: string;

    @Column({ type: 'json', nullable: true })
    @Max(1024)
    QuestionOptions: string;

    @Column({ type: 'varchar', nullable: true })
    AnswerGiven: string;

    @Column({ type: 'timestamp', nullable: false })
    AnsweredTimestamp: Date;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
