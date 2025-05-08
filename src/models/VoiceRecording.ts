import { Table, Model, Column, DataType, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Profile } from './Profile';
import { User } from './User';

@Table({ timestamps: true, tableName: 'voicerecord' })
export class VoiceRecording extends Model {
    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    duration!: number;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    userId!: string;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    recieverId!: string;

    @ForeignKey(() => Profile)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    profileId!: number;

    // Relationships
    @BelongsTo(() => User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' })
    user!: User;

    @BelongsTo(() => User, { foreignKey: 'recieverId', as: 'reciever', onDelete: 'CASCADE' })
    reciever!: User;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE' })
    profile!: Profile;
}
