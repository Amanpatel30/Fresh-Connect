import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import { catchAsync } from './utils/catchAsync.js';
import urgentSaleRoutes from './routes/urgentSaleRoutes.js';

console.log('All imports successful!');
console.log('User model:', User);
console.log('catchAsync:', catchAsync);
console.log('urgentSaleRoutes:', urgentSaleRoutes);

const app = express();
console.log('Express app created!'); 