import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('cooperations', [
            {
                nameOfOrg: 'Cooperation One', phone: '1234567890', address: '123 First Avenue', state: 'State1', lga: 'LGA1', regNum: 'REG001', noOfEmployees: 50,
                professionId: 1, profileId: 13, createdAt: new Date(), updatedAt: new Date()
            },
            {
                nameOfOrg: 'Cooperation Two', phone: '0987654321', address: '456 Second Street', state: 'State2', lga: 'LGA2', regNum: 'REG002', noOfEmployees: 75,
                professionId: 2, profileId: 14, createdAt: new Date(), updatedAt: new Date()
            },
            {
                nameOfOrg: 'Cooperation Three', phone: '1112223333', address: '789 Third Road', state: 'State3', lga: 'LGA3', regNum: 'REG003', noOfEmployees: 120,
                professionId: 3, profileId: 15, createdAt: new Date(), updatedAt: new Date()
            },
            // {
            //     nameOfOrg: 'Cooperation Four', phone: '2223334444', address: '101 Fourth Lane', state: 'State4', lga: 'LGA4', regNum: 'REG004', noOfEmployees: 200,
            //     professionId: 4, profileId: 12, createdAt: new Date(), updatedAt: new Date()
            // }
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('cooperations', {}, {});
    },
};
