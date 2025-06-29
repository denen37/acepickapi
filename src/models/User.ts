import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Profile, Wallet, Location, Review, OnlineUser, Transaction } from './Models';
import { UserRole, UserState, UserStatus } from '../utils/enum';


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


    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    agreed!: boolean;



    @HasOne(() => Wallet)
    wallet!: Wallet;

    @HasOne(() => Profile)
    profile!: Profile;



    @HasOne(() => Location)
    location!: Location;


    @HasMany(() => Review, { foreignKey: 'professionalUserId', as: 'professionalReviews' })
    professionalReviews!: Review[];



    @HasMany(() => Review, { foreignKey: 'clientUserId', as: 'clientReviews' })
    clientReviews!: Review[]; // Reviews given as a client

    @HasOne(() => OnlineUser)
    onlineUser!: OnlineUser;

    @HasMany(() => Transaction, { foreignKey: 'userId', as: 'transactions' })
    transactions!: Transaction[];



}
