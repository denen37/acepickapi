import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { VoiceRecording } from './VoiceRecording';
import { Professional } from './Professional';
import { Cooperation } from './Cooperation';
// import { Review } from './Review';
// import { ProfessionalSector } from './ProfessionalSector';
// import { MarketPlace } from './Market';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum ProfileType {
    CLIENT = 'CLIENT',
    PROFESSIONAL = 'PROFESSIONAL',
    CORPERATE = "CORPERATE"
}

@Table({ timestamps: true, tableName: 'profile' })
export class Profile extends Model {

    // @AllowNull(true)
    // @Column(DataType.STRING)
    // firstName!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    fullName!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    fcmToken!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    avatar!: string;



    @Default(true)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    verified!: boolean;


    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    notified!: boolean;


    @AllowNull(false)
    @Column(DataType.STRING)
    lga!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    state!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    address!: string;



    @Default(0)
    @Column(DataType.INTEGER)
    totalJobs!: number;



    @Default(0)
    @Column(DataType.INTEGER)
    totalExpense!: number;




    @Default(0)
    @AllowNull(true)
    @Column(DataType.DECIMAL)
    rate!: number;


    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsDeclined!: number;



    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsPending!: number;




    @Default(0)
    @Column(DataType.INTEGER)
    count!: number;




    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsOngoing!: number;




    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsCompleted!: number;



    @Default(0)
    @Column(DataType.INTEGER)
    totalReview!: number;




    // @Default(0)
    // @Column(DataType.INTEGER)
    // totalJobsRejected!: number;



    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsApproved!: number;



    @Default(0)
    @Column(DataType.INTEGER)
    totalJobsCanceled!: number;





    @Default(0)
    @Column(DataType.INTEGER)
    totalDisputes!: number;




    @AllowNull(true)
    @Column(DataType.STRING)
    bvn!: string;



    @Default(ProfileType.CLIENT)
    @Column(DataType.ENUM(ProfileType.CLIENT, ProfileType.PROFESSIONAL, ProfileType.CORPERATE))
    type!: ProfileType;




    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    corperate!: boolean;



    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    switch!: boolean;



    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    store!: boolean;


    // @ForeignKey(() => LanLog)
    // @AllowNull(true)
    // @Column(DataType.INTEGER)
    // lanlogId!: number;



    // @BelongsTo(() => LanLog, { onDelete: 'CASCADE' })
    // lanlog!: LanLog;




    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;



    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;


    @HasOne(() => Professional)
    professional!: Professional;


    @HasOne(() => Cooperation)
    cooperation!: Cooperation;


    // @HasOne(() => MarketPlace)
    // market!: MarketPlace;



    @HasMany(() => VoiceRecording, { onDelete: 'CASCADE' })
    recording!: VoiceRecording[];


    // @HasMany(() => ProfessionalSector, { onDelete: 'CASCADE' })
    // professional_sector!: ProfessionalSector[];

}
