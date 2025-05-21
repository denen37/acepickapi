import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Profile, Wallet, LanLog, Review } from './Models';
import { UserRole, UserState, UserStatus } from '../enum';



@Table({ timestamps: true, tableName: 'users' })
export class User extends Model {


    @PrimaryKey
    @Default(uuidv4())
    @Column(DataType.UUID)
    id!: string;

    @Index({ name: 'email-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string | null;


    @AllowNull(true)
    @Column(DataType.STRING)
    fcmToken!: string;


    @Index({ name: 'phone-index', type: 'UNIQUE', unique: true })
    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;


    @Default(UserStatus.ACTIVE)
    @Column(DataType.ENUM(...Object.values(UserStatus)))
    status!: UserStatus;


    @Default(UserRole.CLIENT)
    @Column(DataType.ENUM(...Object.values(UserRole)))
    role!: UserRole;



    @HasOne(() => Wallet)
    wallet!: Wallet;

    @HasOne(() => Profile)
    profile!: Profile;


    @ForeignKey(() => LanLog)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    locationId!: number;



    @HasOne(() => LanLog)
    location!: LanLog;


    @HasMany(() => Review)
    review!: Review[];



    // @HasOne(() => Profile)
    // profile!: Profile;


    // @HasOne(() => Professional)
    // professional!: Professional;


    // @HasOne(() => MarketPlace)
    // marketPlace!: MarketPlace;



    // // relationships
    // @HasMany(() => Jobs, { onDelete: 'CASCADE' })
    // job!: Jobs[];




    // @HasMany(() => Dispute, { onDelete: 'CASCADE' })
    // dispute!: Dispute[];


    // @HasMany(() => ProfessionalSector, { onDelete: 'CASCADE' })
    // professionalSector!: ProfessionalSector[];
}
