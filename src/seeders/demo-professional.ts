import { QueryInterface } from 'sequelize';
import { WorkType } from '../models/Professional';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('professionals', [
            {
                file: 'file1.pdf', intro: 'Professional with extensive experience in project management.', chargeFrom: 50.00,
                language: 'English', available: true, workType: WorkType.IDLE, totalEarning: 5000,
                completedAmount: 4500.00, pendingAmount: 300.00, rejectedAmount: 200.00,
                availableWithdrawalAmount: 500.00, regNum: 'PR001', yearsOfExp: 5, online: true,
                profileId: 9, professionId: 1, createdAt: new Date(), updatedAt: new Date()
            },
            {
                file: 'file2.pdf', intro: 'Skilled developer with a passion for software architecture.', chargeFrom: 75.00,
                language: 'English', available: true, workType: WorkType.BUSY, totalEarning: 8000,
                completedAmount: 7000.00, pendingAmount: 500.00, rejectedAmount: 500.00,
                availableWithdrawalAmount: 1000.00, regNum: 'PR002', yearsOfExp: 7, online: true,
                profileId: 10, professionId: 2, createdAt: new Date(), updatedAt: new Date()
            },
            {
                file: 'file3.pdf', intro: 'Expert in financial analysis and consulting.', chargeFrom: 100.00,
                language: 'English', available: false, workType: WorkType.IDLE, totalEarning: 12000,
                completedAmount: 10000.00, pendingAmount: 1000.00, rejectedAmount: 1000.00,
                availableWithdrawalAmount: 2000.00, regNum: 'PR003', yearsOfExp: 10, online: false,
                profileId: 11, professionId: 3, createdAt: new Date(), updatedAt: new Date()
            },

            {
                file: 'file4.pdf', intro: 'Am simply good at what i do.', chargeFrom: 500.00,
                language: 'English', available: false, workType: WorkType.IDLE, totalEarning: 12000,
                completedAmount: 10000.00, pendingAmount: 1000.00, rejectedAmount: 1000.00,
                availableWithdrawalAmount: 2000.00, regNum: 'PR003', yearsOfExp: 10, online: false,
                profileId: 12, professionId: 3, createdAt: new Date(), updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('professionals', {}, {});
    },
};
