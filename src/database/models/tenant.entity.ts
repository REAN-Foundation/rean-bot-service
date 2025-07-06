import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';

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

  @CreateDateColumn()
  CreatedAt!: Date;

  @UpdateDateColumn()
  UpdatedAt!: Date;

}
