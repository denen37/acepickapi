import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Profile } from './Profile';
import { Profession } from './Profession';
import { Director } from './Director';




@Table({ timestamps: true, tableName: 'cooperations' })
export class Cooperation extends Model {

    @AllowNull(true)
    @Column(DataType.STRING)
    nameOfOrg!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
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
    @Column(DataType.STRING)
    regNum!: string;



    @AllowNull(true)
    @Column(DataType.STRING)
    noOfEmployees!: number;



    @AllowNull(false)
    @ForeignKey(() => Profession)
    @Column(DataType.INTEGER)
    professionId!: number;




    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column(DataType.INTEGER)
    profileId!: number;



    @BelongsTo(() => Profile, { onDelete: 'CASCADE' })
    profile!: Profile;


    @BelongsTo(() => Profession, { onDelete: 'CASCADE' })
    profession!: Profession;


    @HasOne(() => Director)
    director!: Director;
}
