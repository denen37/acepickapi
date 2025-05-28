import {
    Table, Model, Column, DataType, AllowNull, Default, ForeignKey,
    IsIn, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Profession } from './Profession';
import { Profile } from './Profile';
import { Cooperation } from './Cooperation';

export enum WorkType {
    BUSY = 'BUSY',
    IDLE = 'IDLE',
}

@Table({ timestamps: true, tableName: 'professionals' })
export class Professional extends Model {

    @AllowNull(true)
    @Column(DataType.STRING(500))
    file!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    intro!: string;

    @AllowNull(true)
    @Column(DataType.DECIMAL)
    chargeFrom!: number;

    @Default("English")
    @AllowNull(true)
    @Column(DataType.STRING(100))
    language!: string;

    @Default(true)
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    available!: boolean;  // Fixed spelling

    @Default(WorkType.IDLE)
    @IsIn([[WorkType.IDLE, WorkType.BUSY]])
    @Column(DataType.STRING)
    workType!: string;

    @Default(0)
    @Column(DataType.INTEGER)
    totalEarning!: number;

    @Default(0.0)
    @Column(DataType.DECIMAL(10, 2))
    completedAmount!: number;

    @Default(0.0)
    @Column(DataType.DECIMAL)
    pendingAmount!: number;

    @Default(0.0)
    @Column(DataType.DECIMAL)
    rejectedAmount!: number;

    @Default(0.0)
    @Column(DataType.DECIMAL)
    availableWithdrawalAmount!: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    regNum!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)  // Fixed to INTEGER if it is meant to be a number
    yearsOfExp!: number;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    online!: boolean;  // Fixed type

    @ForeignKey(() => Profile)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    profileId!: number;

    // @ForeignKey(() => User)
    // @AllowNull(false)
    // @Column(DataType.UUID)
    // userId!: string;

    @AllowNull(false)
    @ForeignKey(() => Profession)
    @Column(DataType.INTEGER)
    professionId!: number;


    @BelongsTo(() => Profession, { foreignKey: 'professionId' })
    profession!: Profession;

    @BelongsTo(() => Profile, { foreignKey: 'profileId' })
    profile!: Profile;
}
