import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { User } from './User';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'education' })
export class Education extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    school!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    degreeType!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    course!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    gradDate!: string;


    // @AllowNull(false)
    // @Column(DataType.STRING)
    // endDate!: string;

    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column(DataType.INTEGER)
    profileId!: number;

}
