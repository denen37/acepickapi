"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKey = exports.createRandomRef = exports.getRandom = exports.validatePhone = exports.validateEmail = exports.randomId = exports.errorResponse = exports.successResponseFalse = exports.successResponse = exports.convertHttpToHttps = exports.handleResponse = exports.removeEnd = exports.saltRounds = void 0;
exports.calculateDifferenceBetweenMinMax = calculateDifferenceBetweenMinMax;
exports.getDistanceFromLatLonInKm = getDistanceFromLatLonInKm;
exports.isGreaterByOne = isGreaterByOne;
exports.isEqual = isEqual;
exports.mergeDuplicates = mergeDuplicates;
exports.nestFlatKeys = nestFlatKeys;
// import { TransactionDateType } from '../models/Transaction';
exports.saltRounds = 10;
const removeEnd = (str, char) => {
    if (str.length > 1 && str.charAt(str.length - 1) === char) {
        return str.slice(0, -1);
    }
    return str;
};
exports.removeEnd = removeEnd;
const handleResponse = (res, statusCode, status, message, data) => {
    return res.status(statusCode).json({
        status,
        message,
        data,
    });
};
exports.handleResponse = handleResponse;
const convertHttpToHttps = (url) => {
    return url.replace(/^http:\/\//i, 'https://');
};
exports.convertHttpToHttps = convertHttpToHttps;
const successResponse = (res, message = 'Operation successfull', data) => {
    return res.status(200).json({
        status: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const successResponseFalse = (res, message = 'Operation successfull', data) => {
    return res.status(200).json({
        status: false,
        message,
        data,
    });
};
exports.successResponseFalse = successResponseFalse;
const errorResponse = (res, message = 'An error occured', data) => {
    return res.status(500).json({
        status: false,
        message,
        data,
    });
};
exports.errorResponse = errorResponse;
const randomId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};
exports.randomId = randomId;
const validateEmail = (email) => {
    let emailCleaned = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCleaned);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const cleaned = phone.replace(/[\s()-]/g, '');
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(cleaned);
};
exports.validatePhone = validatePhone;
const getRandom = (length) => Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
exports.getRandom = getRandom;
const createRandomRef = (length, initial) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${initial}_${result}`;
};
exports.createRandomRef = createRandomRef;
function calculateDifferenceBetweenMinMax(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return undefined;
    }
    let smallestNumber = numbers[0];
    let largestNumber = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < smallestNumber) {
            smallestNumber = numbers[i];
        }
        if (numbers[i] > largestNumber) {
            largestNumber = numbers[i];
        }
    }
    let value;
    const index = numbers.indexOf(largestNumber);
    if (index == 0) {
        value = true;
    }
    else {
        value = false;
    }
    let percentage = ((largestNumber - smallestNumber) / smallestNumber) * 100;
    return { rate: percentage.toFixed(1), status: value };
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    lat1 = toRad(lat1);
    lon1 = toRad(lon1);
    lat2 = toRad(lat2);
    lon2 = toRad(lon2);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadius * c * 100) / 100;
}
const deleteKey = (obj, path, path2) => {
    const _obj = JSON.parse(JSON.stringify(obj));
    const keys = path.split('.');
    const key2 = path2.split('.');
    keys.reduce((acc, key, index) => {
        if (index === keys.length - 1) {
            delete acc[key];
            return true;
        }
        return acc[key];
    }, _obj);
    key2.reduce((acc, key, index) => {
        if (index === keys.length - 1) {
            delete acc[key];
            return true;
        }
        return acc[key];
    }, _obj);
    return _obj;
};
exports.deleteKey = deleteKey;
function isGreaterByOne(num1, num2) {
    return Math.abs(num1 - num2) === 1;
}
function isEqual(num1, num2) {
    return num1 === num2;
}
function mergeDuplicates(inputList) {
    let mergedList = [];
    let seen = new Set();
    inputList.forEach((item) => {
        // Check if the item is not seen before
        if (!seen.has(item)) {
            mergedList.push(item);
            seen.add(item);
        }
        else {
            // Find the index of the existing item in the merged list
            let index = mergedList.findIndex(existingItem => isEqual(existingItem, item)); // Assuming isEqual is a function to compare objects
            // Merge logic depends on the structure of your objects
            // Here, I'm assuming simple objects where merging means addition
            // You may need to define custom merging logic for your specific objects
            mergedList[index] = item; // Assuming mergeObjects is a function to merge objects
        }
    });
    return mergedList;
}
function nestFlatKeys(flatObject) {
    const result = {};
    for (const [key, value] of Object.entries(flatObject)) {
        const keys = key.split('.');
        keys.reduce((acc, curr, idx) => {
            if (idx === keys.length - 1) {
                acc[curr] = value;
            }
            else {
                acc[curr] = acc[curr] || {};
            }
            return acc[curr];
        }, result);
    }
    return result;
}
