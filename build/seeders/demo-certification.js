"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkInsert('certification', [
            {
                title: 'AWS Certified Solutions Architect', companyIssue: 'Amazon', date: '2023-05-15', userId: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Google Cloud Professional Engineer', companyIssue: 'Google', date: '2022-10-20', userId: '2c785cab-e960-486f-b684-6cfc5e777fc2', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Certified Kubernetes Administrator', companyIssue: 'CNCF', date: '2023-08-01', userId: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Microsoft Azure Fundamentals', companyIssue: 'Microsoft', date: '2021-12-10', userId: '5b509520-9507-466c-b085-b6eac6c98a9f', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'CompTIA Security+', companyIssue: 'CompTIA', date: '2022-06-05', userId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Cisco Certified Network Associate', companyIssue: 'Cisco', date: '2023-03-18', userId: '79b426ad-8846-4f4b-b3f7-679c44f82950', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Certified Ethical Hacker', companyIssue: 'EC-Council', date: '2022-09-30', userId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Project Management Professional', companyIssue: 'PMI', date: '2023-07-22', userId: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'Scrum Master Certification', companyIssue: 'Scrum Alliance', date: '2022-04-15', userId: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618', createdAt: new Date(), updatedAt: new Date()
            },
            {
                title: 'ITIL Foundation Certification', companyIssue: 'AXELOS', date: '2021-11-05', userId: 'f42f3fb5-646c-4743-afbd-de92e97ecf98', createdAt: new Date(), updatedAt: new Date()
            }
        ]);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('certification', {}, {});
    }),
};
