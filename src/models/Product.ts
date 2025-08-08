import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Category, Location, User } from './Models';
import { Allow } from 'stream-chat';



@Table({ timestamps: false, tableName: 'products' })
export class Product extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;


    @AllowNull(true)
    @Column(DataType.TEXT)
    description!: string;


    // @AllowNull(false)
    // @Default(true)
    // @Column(DataType.BOOLEAN)
    // available!: boolean;


    @AllowNull(true)
    @Column(DataType.TEXT)
    images!: string;


    @AllowNull(false)
    @ForeignKey(() => Category)
    @Column(DataType.INTEGER)
    categoryId!: number;


    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    weightPerUnit!: number;


    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER)
    quantity!: number;


    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    price!: number;


    @AllowNull(true)
    @Column(DataType.FLOAT)
    discount!: number;


    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string


    @AllowNull(true)
    @ForeignKey(() => Location)
    @Column(DataType.INTEGER)
    locationId!: number;


    @BelongsTo(() => Location, { as: 'pickupLocation', foreignKey: 'locationId' })
    pickupLocation!: Location;


    @BelongsTo(() => Category, { onDelete: 'CASCADE' })
    category!: Category;


    @BelongsTo(() => User)
    user!: User

    // @HasMany(() => ProductImage, { onDelete: 'CASCADE' })
    // images!: ProductImage[];
}
