import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('portfolios', [
            {
                title: 'Portfolio One',
                description: 'Description for Portfolio One',
                duration: '6 months',
                date: '2024-08-15',
                file: 'portfolio-one.pdf',
                profileId: 9,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Two',
                description: 'Description for Portfolio Two',
                duration: '8 months',
                date: '2024-10-10',
                file: 'portfolio-two.pdf',
                profileId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Three',
                description: 'Description for Portfolio Three',
                duration: '1 year',
                date: '2025-01-20',
                file: 'portfolio-three.pdf',
                profileId: 11,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Four',
                description: 'Description for Portfolio Four',
                duration: '3 months',
                date: '2025-03-18',
                file: 'portfolio-four.pdf',
                profileId: 12,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Five',
                description: 'Description for Portfolio Five',
                duration: '2 months',
                date: '2025-05-10',
                file: 'portfolio-five.pdf',
                profileId: 13,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Six',
                description: 'Description for Portfolio Six',
                duration: '5 months',
                date: '2025-06-22',
                file: 'portfolio-six.pdf',
                profileId: 14,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Seven',
                description: 'Description for Portfolio Seven',
                duration: '7 months',
                date: '2025-07-30',
                file: 'portfolio-seven.pdf',
                profileId: 15,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('portfolios', {}, {});
    },
};
