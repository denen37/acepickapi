import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Sector } from './Sector';
import { User } from './User';
import { Professional } from './Professional';



@Table({ timestamps: false, tableName: 'professions' })
export class Profession extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;


    @Default("")
    @AllowNull(false)
    @Column(DataType.STRING)
    image!: string


    @ForeignKey(() => Sector)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    sectorId!: number;


    @BelongsTo(() => Sector, { onDelete: 'CASCADE' })
    sector!: Sector;


    @HasMany(() => Professional, { onDelete: 'CASCADE' })
    professional!: Professional[];
}
