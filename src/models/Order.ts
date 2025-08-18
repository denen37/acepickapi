import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasOne, Model, Table, Unique } from "sequelize-typescript"
import { Allow } from "stream-chat"
import { ProductTransaction } from "./ProductTransaction"
import { OrderStatus, PayStatus } from "../utils/enum"
import { User } from "./User"
import { Location } from "./Location"

@Table({ timestamps: true, tableName: 'orders' })
export class Order extends Model {
    @AllowNull(false)
    @Column(DataType.INTEGER)
    @ForeignKey(() => ProductTransaction)
    productTransactionId!: number



    @AllowNull(false)
    @Default(OrderStatus.PENDING)
    @Column(DataType.ENUM(...Object.values(OrderStatus)))
    status!: OrderStatus


    @AllowNull(false)
    @Default(0)
    @Column(DataType.DECIMAL(10, 2))
    cost!: number


    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    distance!: number


    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    weight!: number


    // @AllowNull(false)
    // @Default(PayStatus.UNPAID)
    // @Column(DataType.ENUM(...Object.values(PayStatus)))
    // payStatus!: string


    @AllowNull(false)
    @ForeignKey(() => Location)
    @Column(DataType.INTEGER)
    locationId!: number


    @AllowNull(true)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    riderId!: string


    @BelongsTo(() => User, { as: 'rider', foreignKey: 'riderId' })
    rider!: User


    @BelongsTo(() => Location, { as: 'dropoffLocation', foreignKey: 'locationId' })
    dropoffLocation!: Location


    @BelongsTo(() => ProductTransaction)
    productTransaction!: ProductTransaction
}