import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './Models'


// export enum WalletType {
//     CLIENT = 'CLIENT',
//     PROFESSIONAL = 'PROFESSIONAL'
// }


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
    balance!: number;



    @AllowNull(false)
    @Default('NGN')
    @Column(DataType.STRING(50))
    currency!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    pin!: string | null;
}
