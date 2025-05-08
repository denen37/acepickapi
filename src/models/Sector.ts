import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo } from 'sequelize-typescript';
import { Profession } from './Profession';



@Table({ timestamps: false, tableName: 'sectors' })
export class Sector extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    image!: string

    @HasMany(() => Profession, { onDelete: 'CASCADE' })
    profession!: Profession[];
}
