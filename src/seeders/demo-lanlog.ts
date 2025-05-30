import { QueryInterface } from 'sequelize';


module.exports = {
    async up(queryInterface: QueryInterface) {
        await queryInterface.bulkInsert('lanlog', [
            {
                address: '123 Market Street, Lagos',
                state: 'Lagos',
                lga: 'Lagos Mainland',
                latitude: 6.5244,
                longitude: 3.3792,
                userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Plot 11, Abuja Tech Hub',
                state: 'FCT',
                lga: 'Abuja Municipal',
                latitude: 9.0579,
                longitude: 7.4951,
                userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Main Road, Enugu',
                state: 'Enugu',
                lga: 'Enugu North',
                latitude: 6.4483,
                longitude: 7.5139,
                userId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Tech Valley, Port Harcourt',
                state: 'Rivers',
                lga: 'Port Harcourt',
                latitude: 4.8156,
                longitude: 7.0498,
                userId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'University Rd, Kano',
                state: 'Kano',
                lga: 'Kano Municipal',
                latitude: 12.0022,
                longitude: 8.5919,
                userId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Old Airport Rd, Kaduna',
                state: 'Kaduna',
                lga: 'Kaduna North',
                latitude: 10.5484,
                longitude: 7.4528,
                userId: '83df1fcd-7e93-4395-8b95-c4bac2b3e316',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Trade Fair Complex, Aba',
                state: 'Abia',
                lga: 'Aba South',
                latitude: 5.1126,
                longitude: 7.3667,
                userId: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Ring Road, Ibadan',
                state: 'Oyo',
                lga: 'Ibadan South-West',
                latitude: 7.3775,
                longitude: 3.947,
                userId: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: 'Tech Drive, Uyo',
                state: 'Akwa Ibom',
                lga: 'Uyo',
                latitude: 5.0375,
                longitude: 7.9128,
                userId: 'f42f3fb5-646c-4743-afbd-de92e97ecf98',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface: QueryInterface) {
        await queryInterface.bulkDelete('lanlog', {}, {});
    },
};
