import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { User } from './User';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'experiences' })
export class Experience extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    postHeld!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    workPlace!: string;



    @AllowNull(false)
    @Column(DataType.STRING)
    startDate!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    endDate!: string;


    @AllowNull(true)
    @Default(false)
    @Column(DataType.BOOLEAN)
    isCurrent!: boolean;


    @AllowNull(true)
    @Column(DataType.TEXT)
    description!: string;


    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column(DataType.INTEGER)
    profileId!: number;
}
