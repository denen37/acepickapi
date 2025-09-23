import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Accounts, TransactionStatus, TransactionType } from '../utils/enum';
import { Transaction, User } from './Models';
// import { User } from './Models';


@Table({ timestamps: true, tableName: 'ledger_entries' })
export class LedgerEntry extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    @ForeignKey(() => Transaction)
    @AllowNull(false)
    @Column(DataType.BIGINT)
    transactionId!: number;


    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    userId!: string;


    @AllowNull(false)
    @Column(DataType.DECIMAL)
    amount!: number


    @AllowNull(false)
    @Default(TransactionType.CREDIT)
    @Column(DataType.ENUM(TransactionType.CREDIT, TransactionType.DEBIT))
    type!: string


    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Accounts)))
    account!: string;

    @BelongsTo(() => Transaction)
    transaction!: Transaction;

    @BelongsTo(() => User)
    user!: User;
}