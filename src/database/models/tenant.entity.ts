import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { TenantConfiguration } from '../../domain.types/common.types';

@Entity('tenants')
export class Tenant {

  @PrimaryColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  Name!: string;

  @Column({ nullable: false })
  Code!: string;

  @Column({ nullable: false })
  Description!: string;

  @Column({ nullable: false, default: true })
  IsActive!: boolean;

  @Column({ type: 'json', nullable: true })
  configuration?: TenantConfiguration;

  @CreateDateColumn()
  CreatedAt!: Date;

  @UpdateDateColumn()
  UpdatedAt!: Date;

}
