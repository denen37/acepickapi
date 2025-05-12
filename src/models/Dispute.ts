import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
// import { Profile } from './Profile';
// import { Wallet } from './Wallet';
// import { LanLog } from './LanLog';
// import { User } from './User';
import { Job } from './Job';




export enum DisputeStatus {
    RESOLVED = 'RESOLVED',
    PENDING = 'PENDING',
    SUPERADMIN = "SUPERADMIN"
}





@Table({ timestamps: true, tableName: 'dispute' })
export class Dispute extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    reason!: string;


    @AllowNull(false)
    @Column(DataType.TEXT)
    description!: string;

    @Default(DisputeStatus.PENDING)
    @Column(DataType.ENUM(DisputeStatus.RESOLVED, DisputeStatus.PENDING, DisputeStatus.SUPERADMIN))
    status!: DisputeStatus;


    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;


    @ForeignKey(() => Job)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    jobId!: number;



    // @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    reporterId!: string;



    // @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    partnerId!: string;


    // relationships
    @BelongsTo(() => Job, { onDelete: 'CASCADE' })
    job!: Job;



    // @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: 'reporterId', as: 'reporter', })
    // reporter!: User;


    // @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: 'partnerId', as: 'partner', })
    // partner!: User;

}
