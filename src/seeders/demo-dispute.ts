import { QueryInterface } from 'sequelize';
import { Dispute, DisputeStatus } from '../models/Dispute';

const userIds = [
    "0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c",
    "2c785cab-e960-486f-b684-6cfc5e777fc2",
    "33bb5c54-fd64-4cfa-b90b-b0951d3f0564",
    "5b509520-9507-466c-b085-b6eac6c98a9f",
    "5e0cd8e5-1342-4577-82b4-935ffc18af8c",
    "79b426ad-8846-4f4b-b3f7-679c44f82950",
    "7d214fc6-6369-43af-be0b-aa1a0f5ee967",
    "a0a13da5-ee75-4954-a13e-32dbc7167dd3",
    "e69bb0bb-0bfd-417c-a64a-d501ce59c618",
    "f42f3fb5-646c-4743-afbd-de92e97ecf98"
];

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('dispute', Array.from({ length: 10 }).map((_, index) => ({
            cause: `Dispute cause ${index + 1}`,
            status: Object.values(DisputeStatus)[index % Object.values(DisputeStatus).length],
            url: `http://example.com/dispute${index + 1}`,
            jobId: index + 1,
            reporterId: userIds[index % userIds.length],
            partnerId: userIds[(index + 1) % userIds.length],
            createdAt: new Date(),
            updatedAt: new Date()
        })));
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('dispute', {}, {});
    },
};