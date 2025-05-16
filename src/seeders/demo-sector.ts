import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('sectors', [
            { title: 'Technology', image: 'tech.jpg' },
            { title: 'Healthcare', image: 'healthcare.jpg' },
            { title: 'Education', image: 'education.jpg' },
            { title: 'Finance', image: 'finance.jpg' },
            { title: 'Construction', image: 'construction.jpg' },
            { title: 'Retail', image: 'retail.jpg' },
            { title: 'Transportation', image: 'transportation.jpg' },
            { title: 'Energy', image: 'energy.jpg' },
            { title: 'Manufacturing', image: 'manufacturing.jpg' },
            { title: 'Entertainment', image: 'entertainment.jpg' },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('sector', {}, {});
    },
};