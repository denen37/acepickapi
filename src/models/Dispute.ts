import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
// import { Profile } from './Profile';
// import { Wallet } from './Wallet';
// import { LanLog } from './LanLog';
// import { User } from './User';
import { Job } from './Job';
import { ProductTransaction } from './ProductTransaction';
import { User } from './User';




export enum DisputeStatus {
    RESOLVED = 'RESOLVED',
    PENDING = 'PENDING',
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
    @Column(DataType.ENUM(DisputeStatus.RESOLVED, DisputeStatus.PENDING))
    status!: DisputeStatus;


    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;


    @ForeignKey(() => Job)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    jobId!: number;


    @ForeignKey(() => ProductTransaction)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    productTransactionId!: number;



    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    reporterId!: string;



    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    partnerId!: string;


    // relationships
    @BelongsTo(() => Job, { onDelete: 'CASCADE' })
    job!: Job;

    @BelongsTo(() => ProductTransaction, { onDelete: 'CASCADE' })
    productTransaction!: ProductTransaction;

    @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: 'reporterId', as: 'reporter', })
    reporter!: User;


    @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: 'partnerId', as: 'partner', })
    partner!: User;

}
