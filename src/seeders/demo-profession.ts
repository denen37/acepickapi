import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkInsert('professions', [
            { title: 'Software Engineer', image: 'software.jpg', sectorId: 1 },
            { title: 'Doctor', image: 'doctor.jpg', sectorId: 2 },
            { title: 'Teacher', image: 'teacher.jpg', sectorId: 3 },
            { title: 'Accountant', image: 'accountant.jpg', sectorId: 4 },
            { title: 'Architect', image: 'architect.jpg', sectorId: 5 },
            { title: 'Store Manager', image: 'store_manager.jpg', sectorId: 6 },
            { title: 'Truck Driver', image: 'truck_driver.jpg', sectorId: 7 },
            { title: 'Electrical Engineer', image: 'electrical.jpg', sectorId: 8 },
            { title: 'Factory Worker', image: 'factory_worker.jpg', sectorId: 9 },
            { title: 'Musician', image: 'musician.jpg', sectorId: 10 },
            { title: 'Cybersecurity Analyst', image: 'cybersecurity.jpg', sectorId: 1 },
            { title: 'Nurse', image: 'nurse.jpg', sectorId: 2 },
            { title: 'Professor', image: 'professor.jpg', sectorId: 3 },
            { title: 'Financial Analyst', image: 'financial_analyst.jpg', sectorId: 4 },
            { title: 'Civil Engineer', image: 'civil_engineer.jpg', sectorId: 5 },
            { title: 'Sales Associate', image: 'sales_associate.jpg', sectorId: 6 },
            { title: 'Pilot', image: 'pilot.jpg', sectorId: 7 },
            { title: 'Mechanical Engineer', image: 'mechanical.jpg', sectorId: 8 },
            { title: 'Production Supervisor', image: 'production_supervisor.jpg', sectorId: 9 },
            { title: 'Actor', image: 'actor.jpg', sectorId: 10 },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        return queryInterface.bulkDelete('profession', {}, {});
    },
};