// import { IsUrl } from "class-validator";
import 'reflect-metadata';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    // OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IsEmail, Max, Min } from 'class-validator';
import { Gender } from '../../../domain.types/enums';

////////////////////////////////////////////////////////////////////////

@Entity({ name: 'users' })
export class User {

    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    TenantId: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(12)
    @Min(1)
    Prefix: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(128)
    @Min(1)
    FirstName: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(128)
    @Min(1)
    LastName: string;

    @Column({ type: 'varchar', nullable: true })
    @Max(32)
    @Min(7)
    Phone: string;

    @Column({ type: 'varchar', nullable: true })
    @IsEmail()
    @Max(255)
    @Min(4)
    Email: string;

    @Column({ type: 'enum', enum: Gender, nullable: false, default: Gender.Male })
    Gender: Gender;

    @Column({ type: 'timestamp', nullable: true })
    BirthDate: Date;

    @Column({ type: 'varchar', nullable: true, default: 'English' })
    @IsEmail()
    @Max(64)
    @Min(2)
    PreferredLanguage: string;

    // @OneToMany(() => Session, (session) => session.User, { cascade: true  })
    // Sessions: Session[]; //To lazy load --- use Promise<Session[]> instead

    // @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.User)
    // ChatMessages: Promise<ChatMessage[]>; //Lazy loaded

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @DeleteDateColumn()
    DeletedAt: Date;

}
