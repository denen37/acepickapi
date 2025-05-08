import { Table, Model, Column, DataType, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Profile } from './Profile';
import { User } from './User';

@Table({ timestamps: true, tableName: 'voicerecords' })
export class VoiceRecording extends Model {
    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    duration!: number;


    @ForeignKey(() => Profile)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    profileId!: number;


    @BelongsTo(() => Profile, { onDelete: 'CASCADE' })
    profile!: Profile;
}
