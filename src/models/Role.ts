import {
    Table, Model, Column, DataType, AllowNull, Default, ForeignKey,
    IsIn, BelongsTo,
    PrimaryKey,
    AutoIncrement
} from 'sequelize-typescript';


@Table({ timestamps: true, tableName: 'roles' })
export class Role extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;
}
