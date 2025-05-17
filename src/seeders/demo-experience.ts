import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('experiences', [
            {
                postHeld: 'Software Engineer',
                workPlace: 'Tech Corp',
                startDate: '2020-01-01',
                endDate: '2022-12-31',
                profileId: 9,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Project Manager',
                workPlace: 'Innovate Ltd',
                startDate: '2018-06-01',
                endDate: '2021-05-31',
                profileId: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Data Analyst',
                workPlace: 'Data Solutions',
                startDate: '2019-03-15',
                endDate: '2023-02-28',
                profileId: 11,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Network Administrator',
                workPlace: 'IT Secure',
                startDate: '2017-09-01',
                endDate: '2022-08-31',
                profileId: 12,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Marketing Executive',
                workPlace: 'Brand Hub',
                startDate: '2016-05-10',
                endDate: '2021-04-30',
                profileId: 13,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('experiences', {}, {});
    },
};
