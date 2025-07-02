import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Models';


@Table({ timestamps: false, tableName: 'categories' })
export class Category extends Model {
   @AllowNull(false)
   @Column(DataType.STRING)
   name!: string;

   @AllowNull(true)
   @Column(DataType.TEXT)
   description!: string;

   @HasMany(() => Product, { onDelete: 'CASCADE' })
   products!: Product[];
}
