import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';



@Table({ timestamps: true, tableName: 'portfolio' })
export class Portfolio extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;



    @AllowNull(false)
    @Column(DataType.STRING)
    description!: string;


    @AllowNull(false)
    @Column(DataType.INTEGER)
    duration!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    date!: string;

    @Default({})
    @AllowNull(false)
    @Column(DataType.JSON)
    file!: any;


    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;

}
