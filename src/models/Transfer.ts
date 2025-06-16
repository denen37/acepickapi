import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
// import { User } from './Models'
import { TransferStatus } from '../utils/enum';


@Table({ timestamps: true, tableName: 'transfers' })
export class Transfer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;



    @AllowNull(false)
    @Column(DataType.DECIMAL)
    amount!: number



    @AllowNull(false)
    @Default(TransferStatus.PENDING)
    @Column(DataType.ENUM(TransferStatus.SUCCESS, TransferStatus.FAILED, TransferStatus.PENDING))
    status!: string




    @AllowNull(false)
    @Default('NGN')
    @Column(DataType.STRING)
    currency!: string


    @AllowNull(false)
    @Column(DataType.DATE)
    timestamp!: Date


    @AllowNull(false)
    @Column(DataType.STRING)
    reason!: string


    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(200))
    reference!: string



    @AllowNull(false)
    @Column(DataType.STRING(200))
    recipientCode!: string




    // @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;


    // @BelongsTo(() => User, { onDelete: 'CASCADE' })
    // user!: User
}