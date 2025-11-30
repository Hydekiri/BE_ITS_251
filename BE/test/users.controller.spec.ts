// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from '../src/modules/users/controllers/users.controller';
// import { UsersService } from "../src/modules/users/services/users.service";

// describe('UsersController', () => {
//     let usersController: UsersController;

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//         controllers: [UsersController],
//         providers: [UsersService],
//         }).compile();

//         usersController = module.get<UsersController>(UsersController);
//     });

//     it('should return an empty array initially', () => {
//         expect(usersController.findAll()).toEqual([]);
//     });

//     it('should create a user', () => {
//         const user = usersController.create({ name: 'Alice', email: 'alice@test.com' });
//         expect(user).toHaveProperty('id');
//         expect(user.name).toBe('Alice');
//     });
// });
