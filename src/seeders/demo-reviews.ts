import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('review', [
            {
                review: 'Excellent job, very professional.',
                rating: 5,
                professionalUserId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                clientUserId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                jobId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Good work, but there is room for improvement.',
                rating: 3,
                professionalUserId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                clientUserId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                jobId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Not satisfied with the service.',
                rating: 2,
                professionalUserId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                clientUserId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                jobId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Very professional and timely delivery.',
                rating: 4,
                professionalUserId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                clientUserId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                jobId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Amazing work, exceeded expectations!',
                rating: 5,
                professionalUserId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                clientUserId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                jobId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Satisfactory service, good communication.',
                rating: 4,
                professionalUserId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                clientUserId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                jobId: 6,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Exceptional service, highly recommended.',
                rating: 5,
                professionalUserId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                clientUserId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                jobId: 7,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Project was delayed but quality was good.',
                rating: 3,
                professionalUserId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                clientUserId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                jobId: 8,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'The work exceeded my expectations, brilliant!',
                rating: 5,
                professionalUserId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                clientUserId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                jobId: 9,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                review: 'Poor quality, would not recommend.',
                rating: 1,
                professionalUserId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                clientUserId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                jobId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('review', {}, {});
    },
};

