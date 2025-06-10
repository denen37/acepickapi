import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
// import { Profile } from './Profile';
// import { Wallet } from './Wallet';
// import { LanLog } from './LanLog';
// import { User } from './User';
import { User, Material, Dispute } from './Models'
import { JobMode, JobStatus, PaidFor, PayStatus } from '../enum';
// import { VoiceRecording } from './VoiceRecording';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }





@Table({ timestamps: true, tableName: 'jobs' })
export class Job extends Model {


    @AllowNull(true)
    @Column(DataType.STRING)
    description!: string

    @AllowNull(true)
    @Column(DataType.STRING)
    title!: string

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    accepted!: boolean


    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    approved!: boolean


    @Default(JobMode.VIRTUAL)
    @AllowNull(true)
    @Column(DataType.ENUM(JobMode.VIRTUAL, JobMode.PHYSICAL))
    mode!: string



    @AllowNull(true)
    @Column(DataType.STRING)
    state!: string



    @AllowNull(true)
    @Column(DataType.STRING)
    lga!: string


    @AllowNull(true)
    @Column(DataType.STRING)
    fullAddress!: string



    @AllowNull(true)
    @Column(DataType.DOUBLE)
    long!: number



    @AllowNull(true)
    @Column(DataType.INTEGER)
    total!: number



    @Default(0)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    departureDaysCount!: number



    @Default(0)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    arrivalDaysCount!: number



    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // ownerLocationDeparture!: any;


    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // currentOwnerLocationDeparture!: any;



    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // currentOwnerLocationArrival!: any;




    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // currentClientLocationArrival!: any;



    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // currentClientLocationDeparture!: any;



    // @Default(null)
    // @AllowNull(true)
    // @Column(DataType.JSON)
    // ownerLocationArrival!: any;


    @Default(null)
    @AllowNull(true)
    @Column(DataType.JSON)
    clientLocation!: any;




    @Default(null)
    @AllowNull(true)
    @Column(DataType.JSON)
    clientLocationArrival!: any;



    @Default(null)
    @AllowNull(true)
    @Column(DataType.JSON)
    clientLocationDeparture!: any;


    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    isLocationMatch!: string


    // @Default(false)
    // @AllowNull(true)
    // @Column(DataType.BOOLEAN)
    // ownerMatchArrival!: string



    // @Default(false)
    // @AllowNull(true)
    // @Column(DataType.BOOLEAN)
    // clientMatchArrival!: string



    // @Default(false)
    // @AllowNull(true)
    // @Column(DataType.BOOLEAN)
    // clientMatchDeparture!: string



    // @Default(false)
    // @AllowNull(true)
    // @Column(DataType.BOOLEAN)
    // ownerMatchDeparture!: string



    // @Default(false)
    // @AllowNull(true)
    // @Column(DataType.BOOLEAN)
    // processed!: string





    @Default(PayStatus.UNPAID)
    @AllowNull(true)
    @Column(DataType.ENUM(...Object.values(PayStatus)))
    payStatus!: string



    // @Default(PaidFor.WORKMANSHIP)
    // @AllowNull(false)
    // @Column(DataType.ENUM(PaidFor.WORKMANSHIP, PaidFor.MATERIAL, PaidFor.BOTH))
    // paidFor!: string


    @AllowNull(true)
    @Column(DataType.UUID)
    paymentRef!: string


    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    workmanship!: number



    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    materialsCost!: number


    @AllowNull(true)
    @Default(0)
    @Column(DataType.INTEGER)
    numOfJobs!: number


    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    isMaterial!: boolean



    @AllowNull(true)
    @Column(DataType.DOUBLE)
    lan!: number


    @AllowNull(true)
    @Column(DataType.STRING)
    durationUnit!: string


    @AllowNull(true)
    @Column(DataType.STRING)
    reason!: string


    @AllowNull(true)
    @Column(DataType.INTEGER)
    durationValue!: number

    @Default(JobStatus.PENDING)
    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(JobStatus)))
    status!: JobStatus;


    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    clientId!: string;


    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    professionalId!: string;


    @AllowNull(true)
    @Column(DataType.INTEGER)
    sectorId!: string;





    // @ForeignKey(() => Dispute)
    // @AllowNull(true)
    // @Column(DataType.INTEGER)
    // disputeId!: number;



    // relationships
    @BelongsTo(() => User, { foreignKey: 'clientId' })
    client!: User;

    @BelongsTo(() => User, { foreignKey: 'professionalId' })
    professional!: User;

    @HasMany(() => Dispute, { onDelete: 'CASCADE' })
    dispute!: Dispute[];


    // @HasMany(() => VoiceRecording, { onDelete: 'CASCADE' })
    // record!: VoiceRecording[];


    @HasMany(() => Material, { onDelete: 'CASCADE' })
    materials!: Material[];
}
