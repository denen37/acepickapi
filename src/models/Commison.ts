import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Accounts, CommissionScope, CommissionType } from '../utils/enum';


@Table({ timestamps: true, tableName: 'commissions' })
export class Commission extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(true)
    @Column(DataType.DECIMAL(5, 4))
    rate!: number;

    @AllowNull(false)
    @Default(CommissionType.PERCENTAGE)
    @Column(DataType.ENUM(...Object.values(CommissionType)))
    type!: CommissionType;


    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    fixedAmount!: number;

    @AllowNull(true)
    @Default(0)
    @Column(DataType.DECIMAL(10, 2))
    minAmount!: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(CommissionScope)))
    appliesTo!: CommissionScope;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    active!: boolean;

    @AllowNull(true)
    @Column(DataType.DATE)
    effectiveFrom!: Date

    @AllowNull(true)
    @Column(DataType.DATE)
    effectiveTo!: Date
}