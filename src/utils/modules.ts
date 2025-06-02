import { NextFunction, Request, Response } from 'express';
import config from '../config/configSetup';
import moment from 'moment';
// import { TransactionDateType } from '../models/Transaction';

export const saltRounds = 10;

export const removeEnd = (str: string, char: string) => {
	if (str.length > 1 && str.charAt(str.length - 1) === char) {
		return str.slice(0, -1);
	}
	return str;
}

export const handleResponse = (res: any, statusCode: number, status: boolean, message: string, data?: any) => {
	return res.status(statusCode).json({
		status,
		message,
		data,
	});
};

export const convertHttpToHttps = (url: string): string => {
	return url.replace(/^http:\/\//i, 'https://');
}

export const successResponse = (res: any, message: string = 'Operation successfull', data?: any) => {
	return res.status(200).json({
		status: true,
		message,
		data,
	});
};


export const successResponseFalse = (res: any, message: string = 'Operation successfull', data?: any) => {
	return res.status(200).json({
		status: false,
		message,
		data,
	});
};

export const errorResponse = (res: any, message: string = 'An error occured', data?: any) => {
	return res.status(500).json({
		status: false,
		message,
		data,
	});
};




export const randomId = (length: number) => {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}



export const validateEmail = (email: string) => {
	let emailCleaned = email.trim();
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCleaned);
};

export const validatePhone = (phone: string) => {
	const cleaned = phone.replace(/[\s()-]/g, '');
	const phoneRegex = /^\+?\d{10,15}$/;

	return phoneRegex.test(cleaned);
}


export const getRandom = (length: number) => Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));



export const createRandomRef = (length: number, initial: string) => {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return `${initial}_${result}`;
}



export function calculateDifferenceBetweenMinMax(numbers: any) {
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
	} else {
		value = false;
	}

	let percentage = ((largestNumber - smallestNumber) / smallestNumber) * 100
	return { rate: percentage.toFixed(1), status: value };
}


export function getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1);  // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2)
		;
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg: any) {
	return deg * (Math.PI / 180)
}


export const deleteKey = (obj: any, path: any, path2: any) => {
	const _obj = JSON.parse(JSON.stringify(obj));
	const keys = path.split('.');
	const key2 = path2.split('.');

	keys.reduce((acc: any, key: any, index: any) => {
		if (index === keys.length - 1) {
			delete acc[key];
			return true;
		}
		return acc[key];
	}, _obj);


	key2.reduce((acc: any, key: any, index: any) => {
		if (index === keys.length - 1) {
			delete acc[key];
			return true;
		}
		return acc[key];
	}, _obj);

	return _obj;
}

export function isGreaterByOne(num1: number, num2: number) {
	return Math.abs(num1 - num2) === 1;
}


export function isEqual(num1: number, num2: number) {
	return num1 === num2;
}



export function mergeDuplicates(inputList: any) {
	let mergedList: any[] = [];
	let seen = new Set();

	inputList.forEach((item: any) => {
		// Check if the item is not seen before
		if (!seen.has(item)) {
			mergedList.push(item);
			seen.add(item);
		} else {
			// Find the index of the existing item in the merged list
			let index = mergedList.findIndex(existingItem => isEqual(existingItem, item)); // Assuming isEqual is a function to compare objects
			// Merge logic depends on the structure of your objects
			// Here, I'm assuming simple objects where merging means addition
			// You may need to define custom merging logic for your specific objects
			mergedList[index] = item// Assuming mergeObjects is a function to merge objects
		}
	});

	return mergedList;
}

export function nestFlatKeys(flatObject: any) {
	const result: { [key: string]: any } = {};
	for (const [key, value] of Object.entries(flatObject)) {
		const keys = key.split('.');
		keys.reduce((acc: { [key: string]: any }, curr: string, idx: number) => {
			if (idx === keys.length - 1) {
				acc[curr] = value;
			} else {
				acc[curr] = acc[curr] || {};
			}
			return acc[curr];
		}, result);
	}
	return result;
}

