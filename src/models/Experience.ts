import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { User } from './User';



@Table({ timestamps: true, tableName: 'experience' })
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



    @AllowNull(false)
    @Column(DataType.STRING)
    endDate!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;

}
