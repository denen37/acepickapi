import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Sector } from './Sector';
import { User, Job, Order } from './Models'
import { Professional } from './Professional';



@Table({ timestamps: true, tableName: 'rating' })
export class Rating extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    value!: number;


    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    professionalUserId!: string;



    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    clientUserId!: string;


    @ForeignKey(() => Job)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    jobId!: number;


    @ForeignKey(() => Order)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    orderId!: number;


    @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: "professionalUserId", as: "professionalUser" })
    professionalUser!: User;


    @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: "clientUserId", as: "clientUser" })
    clientUser!: User;


    @BelongsTo(() => Job, { onDelete: 'CASCADE' })
    job!: Job;


    @BelongsTo(() => Order, { onDelete: 'CASCADE' })
    order!: Order;
}
