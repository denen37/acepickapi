import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasOne, Model, Table, Unique } from "sequelize-typescript"
import { Allow } from "stream-chat"
import { Product, User, Transaction } from "./Models"

@Table({ timestamps: true, tableName: 'product_transactions' })
export class ProductTransaction extends Model {
    @AllowNull(false)
    @Column(DataType.INTEGER)
    @ForeignKey(() => Product)
    productId!: number



    @AllowNull(false)
    @Column(DataType.UUID)
    @ForeignKey(() => User)
    buyerId!: string



    @AllowNull(false)
    @Column(DataType.UUID)
    @ForeignKey(() => User)
    sellerId!: string


    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER)
    quantity!: number


    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    price!: number


    @AllowNull(false)
    @Column(DataType.DATE)
    date!: Date

    @BelongsTo(() => Product)
    product!: Product

    @BelongsTo(() => User, { foreignKey: 'buyerId' })
    buyer!: User

    @BelongsTo(() => User, { foreignKey: 'sellerId' })
    seller!: User

    @HasOne(() => Transaction)
    transaction!: Transaction
}