import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('experience', [
            {
                postHeld: 'Software Engineer',
                workPlace: 'Tech Corp',
                startDate: '2020-01-01',
                endDate: '2022-12-31',
                userId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Project Manager',
                workPlace: 'Innovate Ltd',
                startDate: '2018-06-01',
                endDate: '2021-05-31',
                userId: '2c785cab-e960-486f-b684-6cfc5e777fc2',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Data Analyst',
                workPlace: 'Data Solutions',
                startDate: '2019-03-15',
                endDate: '2023-02-28',
                userId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Network Administrator',
                workPlace: 'IT Secure',
                startDate: '2017-09-01',
                endDate: '2022-08-31',
                userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Marketing Executive',
                workPlace: 'Brand Hub',
                startDate: '2016-05-10',
                endDate: '2021-04-30',
                userId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('experience', {}, {});
    },
};
