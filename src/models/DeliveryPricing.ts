import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasOne, Model, Table, Unique } from "sequelize-typescript"
import { Allow } from "stream-chat"
import { ProductTransaction } from "./ProductTransaction"
import { OrderStatus, PayStatus, VehicleType } from "../utils/enum"
import { User } from "./User"

@Table({ timestamps: true, tableName: 'delivery_pricing' })
export class DeliveryPricing extends Model {
    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(VehicleType)))
    vehicleType!: VehicleType


    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    baseCost!: number


    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    costPerKm!: number


    @AllowNull(true)
    @Default(0)
    @Column(DataType.DECIMAL(10, 2))
    costPerKg!: number
}