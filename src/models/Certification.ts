import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'certifications' })
export class Certification extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    title!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    filePath!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    companyIssue!: string;


    @AllowNull(false)
    @Column(DataType.STRING)
    date!: string;


    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column(DataType.INTEGER)
    profileId!: number;
}
