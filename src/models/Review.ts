import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Sector } from './Sector';
import { User, Job } from './Models'
import { Professional } from './Professional';



@Table({ timestamps: true, tableName: 'review' })
export class Review extends Model {
	@AllowNull(false)
	@Column(DataType.STRING)
	review!: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	rating!: number


	// @ForeignKey(() => User)
	// @AllowNull(false)
	// @Column(DataType.UUID)
	// userId!: string;


	@ForeignKey(() => User)
	@AllowNull(true)
	@Column(DataType.UUID)
	professionalUserId!: string;



	@ForeignKey(() => User)
	@AllowNull(true)
	@Column(DataType.UUID)
	clientUserId!: string;



	// @AllowNull(true)
	// @ForeignKey(() => Professional)
	// @Column(DataType.INTEGER)
	// proffesionalId!: number;



	@ForeignKey(() => Job)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	jobId!: number;



	// @BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: "userId", as: "user" })
	// user!: User;


	@BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: "professionalUserId", as: "proffesionalUser" })
	professionalUser!: User;


	@BelongsTo(() => User, { onDelete: 'CASCADE', foreignKey: "clientUserId", as: "clientUser" })
	clientUser!: User;


	// @BelongsTo(() => Professional, { onDelete: 'CASCADE' })
	// proffesional!: Professional;



	@BelongsTo(() => Job, { onDelete: 'CASCADE' })
	job!: Job;
}
