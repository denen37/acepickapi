import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from './Profile';
// import { Profile } from './Profile';
import { Wallet } from './Wallet';
import { LanLog } from './LanLog';
// import { Profession } from './Profession';
// import { Jobs } from './Jobs';
import { Review } from './Review';
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

    @Index({ name: 'email-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string | null;


    @AllowNull(true)
    @Column(DataType.STRING)
    fcmToken!: string;


    @Index({ name: 'phone-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;


    @Default(UserStatus.ACTIVE)
    @Column(DataType.ENUM(...Object.values(UserStatus)))
    status!: UserStatus;


    @Default(UserRole.CLIENT)
    @Column(DataType.ENUM(...Object.values(UserRole)))
    role!: UserRole;



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


    @HasMany(() => Review)
    review!: Review[];



    // @HasOne(() => Profile)
    // profile!: Profile;


    // @HasOne(() => Professional)
    // professional!: Professional;


    // @HasOne(() => MarketPlace)
    // marketPlace!: MarketPlace;



    // // relationships
    // @HasMany(() => Jobs, { onDelete: 'CASCADE' })
    // job!: Jobs[];


   

    // @HasMany(() => Dispute, { onDelete: 'CASCADE' })
    // dispute!: Dispute[];


    // @HasMany(() => ProfessionalSector, { onDelete: 'CASCADE' })
    // professionalSector!: ProfessionalSector[];


}
