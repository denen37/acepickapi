import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from './Profile';
// import { Profile } from './Profile';
import { Wallet } from './Wallet';
import { LanLog } from './LanLog';
// import { Profession } from './Profession';
// import { Jobs } from './Jobs';
// import { Review } from './Review';
import { Education } from './Education';
import { Experience } from './Experience';
// import { Certificate } from 'crypto';
import { Portfolio } from './Portfolio';
import { Certification } from './Certification';
// import { Dispute } from './Dispute';
// import Sequelize from 'sequelize/types/sequelize';

// import { Professional } from './Professional';
// import { MarketPlace } from './Market';
// import { ProfessionalSector } from './ProffesionalSector';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}



export enum UserState {
    STEP_ONE = 'STEP_ONE',
    STEP_TWO = 'STEP_TWO',
    STEP_THREE = 'STEP_THREE',
    VERIFIED = 'VERIFIED',
}

export enum UserRole {
    PROFESSIONAL = 'professional',
    CLIENT = 'client',
    CORPERATE = 'corperate'
}



@Table({ timestamps: true, tableName: 'users' })
export class User extends Model {


    @PrimaryKey
    @Default(uuidv4())
    @Column(DataType.UUID)
    id!: string;

    // @Index({ name: 'email-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string;


    @AllowNull(true)
    @Default(false)
    @Column(DataType.BOOLEAN)
    setPin!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    fcmToken!: string;


    // @Index({ name: 'phone-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;


    @Default(UserStatus.ACTIVE)
    @Column(DataType.ENUM(UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED))
    status!: UserStatus;


    @Default(UserRole.CLIENT)
    @Column(DataType.ENUM(UserRole.PROFESSIONAL, UserRole.CLIENT))
    role!: UserRole;



    // @Default(UserState.STEP_TWO)
    // @Column(DataType.ENUM(UserState.STEP_ONE, UserState.STEP_TWO, UserState.STEP_THREE, UserState.VERIFIED))
    // state!: UserState;


    // @ForeignKey(() => Wallet)
    // @AllowNull(true)
    // @Column(DataType.INTEGER)
    // walletId!: number;


    @HasOne(() => Wallet)
    wallet!: Wallet;

    @HasOne(() => Profile)
    profile!: Profile;


    @ForeignKey(() => LanLog)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    locationId!: number;



    @HasOne(() => LanLog)
    location!: LanLog;



    // @HasOne(() => Profile)
    // profile!: Profile;


    // @HasOne(() => Professional)
    // professional!: Professional;


    // @HasOne(() => MarketPlace)
    // marketPlace!: MarketPlace;



    // // relationships
    // @HasMany(() => Jobs, { onDelete: 'CASCADE' })
    // job!: Jobs[];


    // @HasMany(() => Review, { onDelete: 'CASCADE' })
    // review!: Review[];



    @HasMany(() => Education, { onDelete: 'CASCADE' })
    education!: Education[];


    @HasMany(() => Experience, { onDelete: 'CASCADE' })
    experience!: Experience[];



    @HasMany(() => Certification, { onDelete: 'CASCADE' })
    certification!: Certification[];



    @HasMany(() => Portfolio, { onDelete: 'CASCADE' })
    portfolio!: Portfolio[];

    // @HasMany(() => Dispute, { onDelete: 'CASCADE' })
    // dispute!: Dispute[];


    // @HasMany(() => ProfessionalSector, { onDelete: 'CASCADE' })
    // professionalSector!: ProfessionalSector[];


}
