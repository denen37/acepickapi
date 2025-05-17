import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'portfolios' })
export class Portfolio extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;



    @AllowNull(false)
    @Column(DataType.STRING)
    description!: string;


    @AllowNull(false)
    @Column(DataType.STRING(50))
    duration!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    date!: string;


    @AllowNull(true)
    @Column(DataType.STRING(500))
    file!: string;


    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column(DataType.INTEGER)
    profileId!: number;

}
