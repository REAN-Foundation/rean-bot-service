import "reflect-metadata";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import {
    CompositionOperatorType,
    LogicalOperatorType,
    OperatorType
} from "../../domain.types/operator.types";
import { ConditionOperand } from "../../domain.types/rule.types";

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'conditions' })
export class Condition {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 256, nullable: false })
    Name : string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    Description : string;

    @Column({ type: 'uuid', nullable: true })
    ParentRuleId: string;

    @Column({ type: 'uuid', nullable: true })
    ParentConditionId: string;

    @Column({ type: 'enum', enum: OperatorType, nullable: false, default: OperatorType.Logical })
    OperatorType : OperatorType;

    @Column({ type: 'enum', enum: LogicalOperatorType, nullable: false, default: LogicalOperatorType.None })
    LogicalOperatorType : LogicalOperatorType;

    @Column({ type: 'enum', enum: CompositionOperatorType, nullable: false, default: CompositionOperatorType.None })
    CompositionOperatorType : CompositionOperatorType;

    @Column({ type: 'json', nullable: true })
    FirstOperand : ConditionOperand;

    @Column({ type: 'json', nullable: true })
    SecondOperand : ConditionOperand;

    @Column({ type: 'json', nullable: true })
    ThirdOperand : ConditionOperand;

    @CreateDateColumn()
    CreatedAt : Date;

    @UpdateDateColumn()
    UpdatedAt : Date;

    @DeleteDateColumn()
    DeletedAt : Date;

}
