import { QueryInterface } from 'sequelize';

const userIds = [
    '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
    '2c785cab-e960-486f-b684-6cfc5e777fc2',
    '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
    '5b509520-9507-466c-b085-b6eac6c98a9f',
    '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
    '79b426ad-8846-4f4b-b3f7-679c44f82950',
    '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
    'a0a13da5-ee75-4954-a13e-32dbc7167dd3',
    'e69bb0bb-0bfd-417c-a64a-d501ce59c618',
    'f42f3fb5-646c-4743-afbd-de92e97ecf98',
];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('portfolio', userIds.map(userId => ({
            title: `Project ${getRandomInt(1, 100)}`,
            description: `Description for project ${getRandomInt(1, 100)}`,
            duration: getRandomInt(1, 12),
            date: new Date().toISOString().split('T')[0],
            file: JSON.stringify({ url: `https://example.com/file${getRandomInt(1, 100)}.pdf` }),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        })));
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('portfolio', {}, {});
    },
};