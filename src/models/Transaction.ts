import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { TransactionStatus, TransactionType } from '../utils/enum';
import { User } from './User';
// import { User } from './Models';


@Table({ timestamps: true, tableName: 'transactions' })
export class Transaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;



    @AllowNull(false)
    @Column(DataType.DECIMAL)
    amount!: number



    @AllowNull(false)
    @Default(TransactionType.CREDIT)
    @Column(DataType.ENUM(TransactionType.CREDIT, TransactionType.DEBIT))
    type!: string


    @AllowNull(false)
    @Column(DataType.ENUM(TransactionStatus.SUCCESS, TransactionStatus.FAILED))
    status!: string



    @AllowNull(false)
    @Column(DataType.STRING)
    channel!: string



    @AllowNull(false)
    @Default('NGN')
    @Column(DataType.STRING)
    currency!: string



    @AllowNull(false)
    @Column(DataType.DATE)
    timestamp!: Date



    @AllowNull(true)
    @Column(DataType.STRING)
    description!: string



    @AllowNull(true)
    @Unique
    @Column(DataType.STRING(200))
    reference!: string



    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;


    // @BelongsTo(() => User, { onDelete: 'CASCADE' })
    // user!: User
}