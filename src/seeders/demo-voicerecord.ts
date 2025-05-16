import { QueryInterface } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface) {
        return queryInterface.bulkInsert('voicerecord', [
            {
                url: 'https://example.com/audio1.mp3',
                duration: 120,
                userId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                recieverId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                profileId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio2.mp3',
                duration: 90,
                userId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                recieverId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                profileId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio3.mp3',
                duration: 150,
                userId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                recieverId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                profileId: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio4.mp3',
                duration: 110,
                userId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                recieverId: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3',
                profileId: 4,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio5.mp3',
                duration: 80,
                userId: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618',
                recieverId: 'f42f3fb5-646c-4743-afbd-de92e97ecf98',
                profileId: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio6.mp3',
                duration: 140,
                userId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                recieverId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                profileId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio7.mp3',
                duration: 100,
                userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                recieverId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                profileId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio8.mp3',
                duration: 95,
                userId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                recieverId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                profileId: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio9.mp3',
                duration: 130,
                userId: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3',
                recieverId: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618',
                profileId: 4,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                url: 'https://example.com/audio10.mp3',
                duration: 160,
                userId: 'f42f3fb5-646c-4743-afbd-de92e97ecf98',
                recieverId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                profileId: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface: QueryInterface) {
        return queryInterface.bulkDelete('voicerecord', {}, {});
    },
};
