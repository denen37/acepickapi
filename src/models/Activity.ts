import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './User';
// import { User } from './Models';



@Table({ timestamps: true, tableName: 'activities' })
export class Activity extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    type!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    action!: string;

    @AllowNull(false)
    @Default('success')
    @Column(DataType.ENUM('success', 'failed', 'pending'))
    status!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;

    @BelongsTo(() => User)
    user!: User;
}