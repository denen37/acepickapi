import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';



@Table({ timestamps: true, tableName: 'lanlog' })
export class LanLog extends Model {
    @AllowNull(true)
    @Column(DataType.STRING)
    address!: string;

    @AllowNull(true)
    @Column(DataType.FLOAT)
    latitude!: number


    @AllowNull(true)
    @Column(DataType.FLOAT)
    longitude!: number



    @AllowNull(true)
    @Column(DataType.GEOMETRY("POINT"))
    coordinates!: any




    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;


    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;


}
