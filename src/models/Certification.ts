import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';



@Table({ timestamps: true, tableName: 'certification' })
export class Certification extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    companyIssue!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    date!: string;


    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;
}
