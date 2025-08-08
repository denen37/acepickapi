import {
    Table, Model, Column, DataType, AllowNull, Default, ForeignKey,
    IsIn, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { RiderStatus, VehicleType } from '../utils/enum';


@Table({ timestamps: true, tableName: 'riders' })
export class Rider extends Model {
    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string



    @AllowNull(false)
    @Default(VehicleType.BIKE)
    @Column(DataType.ENUM(...Object.values(VehicleType)))
    vehicleType!: VehicleType



    @AllowNull(false)
    @Column(DataType.STRING)
    licenseNumber!: string



    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(RiderStatus)))
    status!: RiderStatus



    @BelongsTo(() => User)
    user!: User
}
