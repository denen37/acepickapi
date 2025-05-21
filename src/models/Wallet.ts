import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './Models'


export enum WalletStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DISABLED = 'disabled'
}


@Table({ timestamps: true, tableName: 'wallets' })
export class Wallet extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;



    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.DECIMAL)
    previousBalance!: number;


    @AllowNull(false)
    @Default(0)
    @Column(DataType.DECIMAL)
    currentBalance!: number;



    @AllowNull(false)
    @Default('NGN')
    @Column(DataType.STRING(50))
    currency!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    pin!: string | null;


    @AllowNull(false)
    @Default(WalletStatus.ACTIVE)
    @Column(DataType.ENUM(...Object.values(WalletStatus)))
    status!: WalletStatus;
}
