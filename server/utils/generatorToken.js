import jwt from 'jsonwebtoken';

export const generatorToken = (userId) =>{
    const token = jwt.sign({userId},process.env.JWT_SECRET);
    return token;
}