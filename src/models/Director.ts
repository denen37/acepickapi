import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Profile } from './Profile';
import { Profession } from './Profession';
import { Cooperation } from './Cooperation';




@Table({ timestamps: true, tableName: 'directors' })
export class Director extends Model {

    @AllowNull(false)
    @Column(DataType.STRING(50))
    firstName!: string;



    @AllowNull(false)
    @Column(DataType.STRING(50))
    lastName!: string;


    @AllowNull(false)
    @Column(DataType.STRING(100))
    email!: string;


    @AllowNull(false)
    @Column(DataType.STRING(50))
    phone!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    address!: string;




    @AllowNull(true)
    @Column(DataType.STRING)
    state!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    lga!: string;



    @AllowNull(true)
    @Column(DataType.STRING(20))
    bvn!: string;


    @AllowNull(false)
    @Column(DataType.INTEGER)
    @ForeignKey(() => Cooperation)
    cooperateId!: string;


    @BelongsTo(() => Cooperation)
    cooperation!: Cooperation;
}
