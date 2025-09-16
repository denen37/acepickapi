import {
    Table, Model, Column, DataType,
    AllowNull, Default, ForeignKey,
    IsIn, BelongsTo,
    PrimaryKey,
    AutoIncrement
} from 'sequelize-typescript';
import { User } from './User';
import { Role } from './Role';


@Table({ timestamps: true, tableName: 'user_roles' })
export class UserRole extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;


    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;


    @AllowNull(false)
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER)
    roleId!: number;


    @BelongsTo(() => User, { foreignKey: 'userId' })
    user!: User;

    @BelongsTo(() => Role, { foreignKey: 'roleId' })
    role!: Role;
}
