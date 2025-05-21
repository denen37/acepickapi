import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index } from 'sequelize-typescript';
import { VerificationType } from '../enum';

@Table({ updatedAt: false, tableName: 'verify' })
export class Verify extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    contact!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    code!: string;


    // @AllowNull(true)
    // @Column(DataType.STRING)
    // secret_key!: string;


    // @AllowNull(true)
    // @Column(DataType.STRING)
    // client!: string;


    @Default(false)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    verified!: boolean;




    @Default(VerificationType.EMAIL)
    @Column(DataType.ENUM(VerificationType.EMAIL, VerificationType.SMS))
    type!: VerificationType;
}
