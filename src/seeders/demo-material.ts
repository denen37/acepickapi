import { QueryInterface } from 'sequelize';


module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('material', Array.from({ length: 10 }).map((_, index) => ({
            description: `Material ${index + 1}`,
            quantity: Math.floor(Math.random() * 10) + 1,
            subTotal: Math.floor(Math.random() * 100) + 50,
            price: Math.floor(Math.random() * 20) + 10,
            jobId: (index % 10) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        })));
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('material', {}, {});
    },
};