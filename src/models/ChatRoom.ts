
import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Message } from './Message';

@Table({ timestamps: true, tableName: 'chat_rooms' })
export class ChatRoom extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;



    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;



    @AllowNull(false)
    @Column(DataType.STRING)
    members!: string



    @HasMany(() => Message, { foreignKey: 'chatroomId' })
    messages!: Message[]
}
