// seeders/xxxx-seed-roles.ts
import { QueryInterface } from "sequelize";

export default {
    async up(queryInterface: QueryInterface) {
        await queryInterface.bulkInsert("roles", [
            { name: "superadmin", createdAt: new Date(), updatedAt: new Date() },
            { name: "admin", createdAt: new Date(), updatedAt: new Date() },
            { name: "client", createdAt: new Date(), updatedAt: new Date() },
            { name: "professional", createdAt: new Date(), updatedAt: new Date() },
            { name: "corperate", createdAt: new Date(), updatedAt: new Date() },
            { name: "delivery", createdAt: new Date(), updatedAt: new Date() },
        ]);
    },

    async down(queryInterface: QueryInterface) {
        await queryInterface.bulkDelete("roles", {}, {});
    },
};
