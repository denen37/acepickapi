import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasOne, Model, Table, Unique } from "sequelize-typescript"
import { Allow } from "stream-chat"
import { Product, User, Transaction, Order } from "./Models"
import { OrderMethod, ProductTransactionStatus } from "../utils/enum"

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
    @Default(ProductTransactionStatus.PENDING)
    @Column(DataType.ENUM(...Object.values(ProductTransactionStatus)))
    status!: string


    @AllowNull(false)
    @Default(OrderMethod.SELF_PICKUP)
    @Column(DataType.ENUM(...Object.values(OrderMethod)))
    orderMethod!: string


    @AllowNull(false)
    @Column(DataType.DATE)
    date!: Date

    @BelongsTo(() => Product)
    product!: Product

    @BelongsTo(() => User, { foreignKey: 'buyerId' })
    buyer!: User

    @BelongsTo(() => User, { foreignKey: 'sellerId' })
    seller!: User

    @HasOne(() => Order)
    order!: Order

    @HasOne(() => Transaction)
    transaction!: Transaction
}