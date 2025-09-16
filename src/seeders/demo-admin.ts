// seeders/xxxx-seed-roles.ts
import { QueryInterface } from "sequelize";

export default {
    async up(queryInterface: QueryInterface) {
        await queryInterface.bulkInsert("user_roles", [
            { userId: '00a217b6-3f53-4993-b244-b4818ff37a12', roleId: 1, createdAt: new Date(), updatedAt: new Date() },
        ]);
    },

    async down(queryInterface: QueryInterface) {
        await queryInterface.bulkDelete("user_roles", {}, {});
    },
};
