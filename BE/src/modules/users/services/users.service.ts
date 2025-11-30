import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from '../models/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
        username: createUserDto.username,
        password: createUserDto.password,
        email: createUserDto.email,
        phone: createUserDto.phone,
        address: createUserDto.address,
        });
        return this.userRepository.save(user);
    }
}
